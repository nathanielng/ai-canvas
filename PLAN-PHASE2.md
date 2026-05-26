# Phase 2: Canvas Skill — Parse Web / GitHub → Diagram

**Status**: Planning  
**Target**: Implement standalone Claude Code skill to generate canvas diagrams from URLs  
**Milestone**: Auto-generate structured diagrams from web pages and GitHub repositories

---

## Overview

**Goal**: Build a reusable Claude Code skill that reads a URL (GitHub README, web page, or API spec) and generates a canvas diagram representing the document structure.

**Use Cases**:
- Parse GitHub README → create a diagram showing project structure, features, installation steps
- Parse web article → outline diagram with sections and subsections
- Parse API documentation → create objects for endpoints, with connectors showing relationships
- Parse roadmap/plan → visualize timeline or dependency structure

**Key Constraint**: Skill operates on the canvas JSON format from Phase 1. Outputs are valid canvas.json files that can be loaded into the UI or modified via CLI.

---

## Architecture

### System Design

```
User Input (URL)
     ↓
┌────────────────────────────┐
│ Skill: canvas-from-web     │
├────────────────────────────┤
│ 1. Fetch URL content       │
│ 2. Parse (HTML/Markdown)   │
│ 3. Extract structure       │
│ 4. Layout & position       │
│ 5. Generate canvas.json    │
└────────────────────────────┘
     ↓
Canvas JSON File (can load in UI)
     ↓
┌────────────────────────────┐
│ User can:                  │
│ - Edit in UI               │
│ - Modify via CLI           │
│ - Export/share             │
└────────────────────────────┘
```

### Data Extraction Pipeline

```
Input: URL (GitHub README or web page)
  ↓
1. Fetch & Parse
  - Fetch HTML/Markdown content
  - Parse into AST or structured format
  - Extract headings, lists, code blocks, paragraphs
  ↓
2. Structure Recognition
  - Build hierarchy (H1 → sections, H2 → subsections, etc.)
  - Identify content blocks (text, lists, code)
  - Recognize patterns (features, steps, API endpoints)
  ↓
3. Object Mapping
  - H1 → large container (title)
  - H2 → medium container (section)
  - H3/text → text object
  - Lists → rows of connected objects
  - Code blocks → code object
  ↓
4. Layout & Positioning
  - Respect layoutDirection (top-to-bottom or left-to-right)
  - Calculate object positions based on hierarchy depth
  - Add connectors showing parent-child relationships
  ↓
5. Canvas Generation
  - Create valid canvas.json using core engine
  - Assign IDs, positions, sizes, properties
  - Write to file or return as JSON
```

---

## Implementation Plan

### Skill Structure

```
~/code/canvas-skill/ (standalone repo)
├── SKILL.md                     # Skill documentation
├── package.json
├── index.js                     # Skill entry point (invoked by Claude Code)
├── src/
│   ├── parser.js                # Parse HTML/Markdown → structure
│   ├── extractor.js             # Extract heading/content hierarchy
│   ├── layouter.js              # Position objects (top-to-bottom, left-to-right)
│   └── generator.js             # Generate canvas JSON using core engine
├── fetchers/
│   ├── github.js                # Fetch GitHub README
│   ├── web.js                   # Fetch generic web page
│   └── utils.js                 # Common fetch utilities
├── tests/
│   ├── parser.test.js
│   ├── extractor.test.js
│   └── generator.test.js
└── examples/
    ├── github-readme.canvas.json    # Sample output
    └── web-article.canvas.json      # Sample output
```

### Key Modules

#### 1. Parser (`src/parser.js`)
**Purpose**: Convert HTML or Markdown into a structured tree  
**Input**: HTML/Markdown string  
**Output**: Array of content blocks with hierarchy information

```javascript
interface ContentBlock {
  type: 'heading' | 'text' | 'list' | 'code' | 'image',
  level: number,              // heading level (1-6)
  content: string,
  children: ContentBlock[],
  metadata: {
    class?: string,
    id?: string,
  }
}
```

**Approach**:
- Use `cheerio` for HTML parsing (fast, jQuery-like API)
- Use `markdown-it` for Markdown parsing (AST output)
- Normalize both to common ContentBlock format

---

#### 2. Extractor (`src/extractor.js`)
**Purpose**: Recognize patterns and build a hierarchy  
**Input**: Array of content blocks  
**Output**: Logical structure (e.g., sections, subsections, features)

**Patterns to recognize**:
- GitHub README: title (H1), sections (H2), features, installation, usage
- API docs: endpoints (H2), parameters (H3), responses (code blocks)
- Article: sections with subsections and body text
- Roadmap: timeline or milestone structure

**Example recognition**:
```javascript
// Input
H1 "My Project"
H2 "Features"
  - Feature 1
  - Feature 2
H2 "Installation"
  code block
H2 "Usage"
  text

// Output
{
  title: "My Project",
  sections: [
    { title: "Features", items: ["Feature 1", "Feature 2"], type: "list" },
    { title: "Installation", content: [code], type: "code" },
    { title: "Usage", content: [text], type: "text" }
  ]
}
```

---

#### 3. Layouter (`src/layouter.js`)
**Purpose**: Position objects on canvas based on layout direction  
**Input**: Logical structure + layoutDirection  
**Output**: Positioned objects with x, y, width, height

**Layout Algorithms**:

**Top-to-Bottom**:
```
Title (centered, top)
  ↓
Section 1 (full width)
  ↓
  Content items (stacked)
  ↓
Section 2
  ...
```

**Left-to-Right**:
```
Title (left, top)
Section 1 (next column)
  Content items (stacked below)
Section 2 (next column)
  ...
```

**Sizing**:
- H1 (title): large, 500px wide, 100px tall
- H2 (section): medium, 300px wide, 80px tall
- Text/list items: small, 250px wide, 50px tall
- Code blocks: full-width, variable height

**Spacing**:
- Vertical gap: 20px (top-to-bottom) or 10px (left-to-right between items)
- Horizontal gap: 30px (left-to-right between columns)

---

#### 4. Generator (`src/generator.js`)
**Purpose**: Create valid canvas.json using core engine  
**Input**: Positioned objects, layout direction  
**Output**: Canvas JSON string

**Process**:
1. Import core engine from ~/code/canvas/core
2. Create canvas with appropriate metadata
3. For each positioned object, call `engine.createObject(...)`
4. For parent-child relationships, call `engine.addChild(...)`
5. For logical flow, add connectors via `engine.addConnector(...)`
6. Validate canvas with `engine.validateCanvas()`
7. Return JSON

---

### Fetchers

#### GitHub Fetcher
**Purpose**: Fetch README.md from a GitHub repository  
**Input**: `https://github.com/owner/repo` or `https://github.com/owner/repo/blob/main/README.md`  
**Output**: Markdown content

**Approach**:
- Extract owner/repo from URL
- Fetch raw content from `https://raw.githubusercontent.com/owner/repo/main/README.md`
- Handle common branch names (main, master)
- Cache to avoid rate limits

#### Web Fetcher
**Purpose**: Fetch and extract content from any web page  
**Input**: Any URL  
**Output**: HTML content

**Approach**:
- Use `node-fetch` to GET URL
- Extract main content (remove nav, footer, ads)
- Use `cheerio` to parse HTML
- Handle redirects and errors

#### Utils
- Validate URL format
- Handle network errors gracefully
- Rate limiting / caching
- User-Agent headers to avoid blocking

---

## Skill Invocation

### How It Works

User in Claude Code invokes the skill:
```
/canvas-from-web "https://github.com/anthropics/anthropic-sdk-python"
```

Or:
```
/canvas-from-web "https://example.com/documentation"
```

### Skill Entry Point (`index.js`)

```javascript
export async function generateDiagramFromUrl(url, options = {}) {
  // 1. Determine source type (GitHub, web)
  const source = identifySource(url);
  
  // 2. Fetch content
  const content = await fetch(url, source);
  
  // 3. Parse to structure
  const parsed = await parser.parse(content, source);
  
  // 4. Extract hierarchy
  const structure = await extractor.extract(parsed);
  
  // 5. Layout objects
  const positioned = await layouter.layout(
    structure, 
    options.layoutDirection || 'top-to-bottom'
  );
  
  // 6. Generate canvas
  const canvas = await generator.generate(positioned);
  
  // 7. Save to file
  const outputPath = `${url.split('/').pop()}.canvas.json`;
  await fs.writeFile(outputPath, JSON.stringify(canvas, null, 2));
  
  return outputPath;
}
```

---

## Design Decisions & Tradeoffs

### Decision 1: Standalone Repository vs. Part of Canvas

**Choice**: Standalone `~/code/canvas-skill/` repository  
**Why**: Skill is independent of canvas UI; can be used separately; has its own versioning/releases  
**Tradeoff**: More repos to manage, but cleaner separation

---

### Decision 2: Content Parsing Strategy

**Choice**: Separate HTML and Markdown parsers, normalize to ContentBlock  
**Why**: Different sources (GitHub README = Markdown, web pages = HTML); unified format easier to work with  
**Tradeoff**: Two parsers instead of one generic solution

---

### Decision 3: Pattern Recognition vs. Heuristics

**Choice**: Start with heuristics (heading levels, list detection), allow expansion to pattern libraries  
**Why**: Simple to implement, works for 80% of cases (README files, articles, API docs)  
**Tradeoff**: May miss complex structures; future enhancement: ML-based layout or template library

---

### Decision 4: Layout Algorithms

**Choice**: Two simple algorithms (top-to-bottom, left-to-right) without overlap  
**Why**: Predictable, easy to debug, respects user's layoutDirection setting  
**Tradeoff**: May not be optimal for all content; future enhancement: auto-layout / constraint solver

---

### Decision 5: Connector Strategy

**Choice**: Auto-add connectors for parent→child relationships; optional connectors for sibling flow  
**Why**: Makes hierarchy visual; helps users understand structure  
**Tradeoff**: Can create visual clutter if too many connectors; user can delete via CLI/UI

---

## Implementation Phases

### Phase 2.1: MVP Parser + GitHub

**Goal**: Parse GitHub README and generate basic canvas  
**Components**:
- [ ] Fetcher: GitHub README (raw.githubusercontent.com)
- [ ] Parser: Markdown → ContentBlock tree
- [ ] Layouter: Top-to-bottom layout
- [ ] Generator: Create canvas JSON
- [ ] CLI entry point: `canvas-from-web <url>`

**Outcomes**: 
- Users can run: `canvas-from-web https://github.com/user/repo`
- Generates canvas.json with H1/H2 structure visible
- Can load in Canvas UI or edit via CLI

**Testing**:
- [ ] Test with 3 real GitHub repos (large, medium, small)
- [ ] Test with various README structures
- [ ] Validate output canvas JSON

---

### Phase 2.2: Web Page Parser + Layout Variants

**Goal**: Parse generic web pages; support left-to-right layout  
**Components**:
- [ ] Fetcher: Generic web pages with content extraction
- [ ] Parser: HTML → ContentBlock tree
- [ ] Layouter: Left-to-right variant
- [ ] Options: Accept `--layoutDirection` flag

**Testing**:
- [ ] Test with blog articles, documentation sites
- [ ] Compare output quality
- [ ] Benchmark parsing speed

---

### Phase 2.3: Pattern Recognition & Enrichment

**Goal**: Recognize and enhance common patterns  
**Components**:
- [ ] Recognize API endpoints, features, timeline patterns
- [ ] Add custom connectors for relationships
- [ ] Property annotations (e.g., "feature", "endpoint", "section")
- [ ] Better sizing based on content type

**Testing**:
- [ ] Test with API docs (OpenAPI specs)
- [ ] Test with roadmap/timeline pages
- [ ] Visual quality assessment

---

### Phase 2.4: Polish & Documentation

**Goal**: Production-ready skill  
**Components**:
- [ ] Error handling and edge cases
- [ ] Caching to avoid rate limits
- [ ] SKILL.md documentation
- [ ] Example outputs and use cases
- [ ] Integration tests

---

## Data Models

### ContentBlock (Internal)
```javascript
{
  type: 'heading' | 'text' | 'list' | 'code' | 'image',
  level: 1-6,
  content: string,
  children: ContentBlock[],
  metadata: { class?, id?, lang? }
}
```

### LogicalStructure (Extracted)
```javascript
{
  title: string,
  type: 'document' | 'api' | 'article' | 'roadmap',
  sections: Array<{
    title: string,
    level: number,
    content: string | ContentBlock[],
    type: 'heading' | 'text' | 'list' | 'code',
    items?: string[]  // for lists
  }>
}
```

### PositionedObject (Layouted)
```javascript
{
  id: string,
  type: 'rectangle' | 'text' | 'container',
  position: { x, y },
  size: { width, height },
  properties: {
    content?: string,
    fill?: string,
    stroke?: string
  },
  children?: string[],
  parentId?: string
}
```

---

## Testing Strategy

### Unit Tests
- **Parser**: Input HTML/Markdown → Correct ContentBlock tree
- **Extractor**: ContentBlock tree → Correct LogicalStructure
- **Layouter**: LogicalStructure → Correct positions (no overlaps, correct gaps)
- **Generator**: PositionedObject → Valid canvas JSON (passes `validateCanvas()`)

### Integration Tests
- **End-to-end**: URL → JSON file with expected structure
- **Real URLs**: Test with actual GitHub repos and web pages
- **Output validation**: Generated canvas loads in UI without errors

### Property Tests
- No object overlaps in output
- All connectors reference valid objects
- Canvas validates against schema
- Object positions respect canvas bounds

---

## Dependencies

**External Libraries**:
- `node-fetch`: Fetch URLs
- `cheerio`: Parse HTML
- `markdown-it`: Parse Markdown
- `jsdom` (optional): DOM simulation if needed

**Internal Dependencies**:
- `~/code/canvas/core`: Use createObject, addConnector, etc.
- `~/code/canvas/cli/utils`: Use readCanvas/writeCanvas if needed

---

## Success Criteria

1. ✅ Generate valid canvas JSON from GitHub README
2. ✅ Generate valid canvas JSON from web page
3. ✅ Layout respects top-to-bottom and left-to-right directions
4. ✅ Output loads in Canvas UI without errors
5. ✅ Output can be edited via CLI commands
6. ✅ Handles errors gracefully (network, invalid URLs, etc.)
7. ✅ SKILL.md documents usage and examples
8. ✅ Unit tests pass (>80% coverage)

---

## Future Enhancements (Post-Phase 2)

### Phase 3+
- **Smart Layout**: Constraint-based layout engine for optimal positioning
- **Template Library**: Recognize and apply templates (API docs, roadmap, etc.)
- **Two-way Sync**: Update diagram → regenerate when source changes
- **Collaboration**: Multi-user editing, version control integration
- **Export**: Generate diagrams in other formats (PNG, SVG, PDF)
- **Code Analysis**: Parse code repos and generate architecture diagrams
- **AI Enhancement**: Use Claude to improve descriptions and group related items

---

## Appendix: Example Workflows

### Example 1: GitHub README

**Input**: `https://github.com/anthropics/anthropic-sdk-python`

**Generated Canvas**:
```
┌─────────────────────────────────────┐
│ anthropic-sdk-python (H1)           │
└─────────────────────────────────────┘
            ↓
┌──────────────────┬──────────────────┐
│ Installation     │ Quick Start      │
│ (H2 section)     │ (H2 section)     │
└──────────────────┴──────────────────┘
       ↓                    ↓
   [code]             [text content]
       ↓                    ↓
┌──────────────────────────────────────┐
│ Features (H2)                        │
├──────────────────────────────────────┤
│ • Async support                      │
│ • Type hints                         │
│ • Streaming                          │
└──────────────────────────────────────┘
```

---

### Example 2: API Documentation

**Input**: Web page with API endpoints

**Generated Canvas**:
```
┌──────────────────────────────────────┐
│ API Reference                        │
└──────────────────────────────────────┘
    ↓           ↓           ↓
┌────────┬──────────────┬──────────────┐
│ GET    │ POST         │ DELETE       │
│ /users │ /messages    │ /sessions    │
└────────┴──────────────┴──────────────┘
  ↓        ↓              ↓
[params] [body]      [response]
```

---

## Questions & Decisions Still Open

1. **Caching**: Should we cache fetched content? How long?
2. **Rate Limiting**: GitHub has API rate limits; should we warn users?
3. **Error Messages**: How detailed should error messages be?
4. **Customization**: Should users be able to tweak layout via options?
5. **Image Handling**: How to represent images in canvas (as objects, links, or skip)?
6. **Code Block Handling**: Show code inline or as references?
7. **Performance**: What's acceptable parsing time for large pages?
