# Canvas: Free-Form Diagramming Tool

**Status**: Planning Phase  
**Created**: 2026-05-26  
**Last Updated**: 2026-05-26

---

## Overview

**Canvas** is a free-form diagramming tool with dual interfaces: a web UI (drag-drop, click) and a CLI (programmatic CRUD). Users can create visual diagrams with arbitrary objects (rectangles, text, containers), connect them, and automate diagram generation via Claude Code skills.

**Key Constraints**:
- No backend initially (localStorage + file-based JSON)
- Objects can be nested (containers with children)
- Flexible object properties (key-value extensibility)
- Supports left-to-right or top-to-bottom layout direction

**High-Level Goals**:
1. Simple visual diagram creation in browser
2. Programmatic diagram generation via CLI
3. Skill integration: parse web pages / GitHub repos → diagrams
4. Extensible object model without over-engineering

---

## Design Decisions & Tradeoffs

### Decision 1: Storage Format — JSON over SQLite

**Choice**: Start with JSON files + browser localStorage  
**Why**: 
- No database infrastructure required for MVP
- Self-contained, git-friendly, easy to debug
- Works with file-based workflows + export/import
- Supports future skill automation without server

**Tradeoff**: 
- No multi-user real-time collaboration initially
- No server-side search/querying
- File conflicts if CLI and browser edit simultaneously (mitigated by sync strategy)

**Alternatives Considered**:
- SQLite: Overkill for MVP, adds complexity; migrate here if cloud/multi-user needed
- Cloud backend: Deferred; adds auth/infrastructure burden

**Migration Path**: When multi-user or cloud features are needed, add a backend API layer that reads/writes the same JSON schema to a database.

---

### Decision 2: Dual Interface — UI + CLI

**Choice**: React canvas + Node.js CLI, both using shared core engine  
**Why**:
- CLI enables programmatic diagram generation
- Supports Claude Code skill creation
- Separates UI concerns from business logic
- Unix philosophy: composable tools

**Tradeoff**:
- Two entry points to maintain (but via shared core)
- Need to manage file I/O carefully (see concurrency note below)

**How it Works**:
- `core/canvas-engine.js`: Pure CRUD logic, no I/O or UI
- `cli/`: Wraps engine for command-line operations
- `src/`: React UI wraps engine for interactive editing
- JSON file is single source of truth

---

### Decision 3: Flexible Object Properties (Extensibility Without Over-Engineering)

**Choice**: Fixed object structure with flexible `properties` object  
```javascript
{
  id, type, position, size,
  properties: { /* arbitrary key-value pairs */ }
}
```

**Why**:
- Avoids rigid schema that requires migrations
- UI renders "known" properties; unknown ones preserved
- Easy to add features over time (just define new property)
- Self-documenting: each object carries its own metadata

**Tradeoff**:
- No compile-time type safety for properties
- Requires discipline: document known properties per type

**Extensibility Strategy**:
- Phase 1: Define known properties (fill, stroke, fontSize, borderRadius)
- Phase N: Add new properties without breaking old files
- Unknown properties silently preserved and ignored by UI

---

### Decision 4: Concurrency Handling — Separate Concerns

**Choice**: localStorage is UI-only scratch space; CLI always reads/writes disk files  
**Why**:
- Prevents conflicts between concurrent editors
- localStorage is transient (browser-specific)
- CLI is authoritative for persistent storage

**How it Works**:
- Browser edits auto-save to localStorage (ephemeral)
- "Save" button writes to disk JSON file
- "Load" button reads from disk, offers sync resolution if localStorage has changes
- CLI always reads/writes disk files directly

**Rationale**: Aligns with single-user focus; when multi-user is added, sync becomes a backend responsibility.

---

### Decision 5: Layout Direction — Canvas-Level Metadata

**Choice**: Add `metadata.layoutDirection` to JSON schema  
**Why**:
- Skill uses this when auto-generating layouts
- Guides auto-positioning algorithms
- UI can display current direction; future auto-layout respects it

**Values**: `"top-to-bottom"` (default) or `"left-to-right"`

---

## Architecture

### System Structure

```
┌─────────────────────────────────────────┐
│         Browser UI (React)              │
│  - Drag/drop objects                    │
│  - Visual editing                       │
│  - localStorage auto-save               │
└──────────────┬──────────────────────────┘
               │ (load/save files)
               ▼
        ┌──────────────┐
        │ core/        │
        │ canvas-      │ (pure CRUD logic)
        │ engine.js    │ (no I/O, no UI)
        └──────────────┘
               ▲
               │ (CRUD operations)
               │
┌──────────────┴──────────────────────────┐
│         CLI (Node.js)                   │
│  - Object CRUD commands                 │
│  - Connector commands                   │
│  - File operations                      │
│  - Validation                           │
└─────────────────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Disk JSON    │
        │ files        │
        └──────────────┘
               ▲
               │
        ┌──────┴──────────┐
        ▼                 ▼
   ┌─────────┐      ┌──────────────┐
   │ Skill:  │      │ Claude Code  │
   │ Parse   │      │ Automation   │
   │ Web/GH  │      └──────────────┘
   └─────────┘
```

### Core Components

**`core/canvas-engine.js`** — Pure CRUD logic
- `createObject(canvas, type, x, y, properties)`
- `updateObject(canvas, id, properties)`
- `deleteObject(canvas, id)`
- `addConnector(canvas, sourceId, targetId, properties)`
- `removeConnector(canvas, id)`
- `getObject(canvas, id)`
- `listObjects(canvas)`
- Validation, mutation, no side effects

**`core/schema.js`** — Validation and versioning
- `validateCanvas(json)` — schema validation
- `validateObject(obj)` — per-object validation
- `migrateSchema(oldVersion, newVersion)` — future migrations
- Known properties per type definition

**`cli/index.js`** — Command dispatcher
- Wraps core engine
- File I/O: read JSON, apply mutations, write JSON
- Error handling and user feedback

**`cli/commands/*.js`** — Individual command handlers
- `object.js`: add, update, delete, list, get
- `connector.js`: add, remove, list
- `config.js`: get/set canvas metadata (layoutDirection, name)

**`src/App.jsx`** & hooks — React UI
- Wraps core engine for interactive editing
- localStorage integration
- File load/save
- Visual rendering of objects and connectors

---

## Data Schemas

### Canvas Root Schema

```json
{
  "version": "1.0",
  "metadata": {
    "name": "My Diagram",
    "layoutDirection": "top-to-bottom",
    "createdAt": "2026-05-26T00:00:00Z",
    "modifiedAt": "2026-05-26T00:00:00Z"
  },
  "objects": [],
  "connectors": []
}
```

**Rationale**:
- `version`: Allows schema migrations without breaking old files
- `metadata`: Canvas-level settings (layout, name, timestamps)
- `objects` & `connectors`: Flat lists; relationships via IDs

**Extensibility**: Add metadata fields as needed (author, tags, etc.); unknown fields are preserved.

---

### Object Schema

```json
{
  "id": "rect-1",
  "type": "rectangle",
  "position": {
    "x": 100,
    "y": 100
  },
  "size": {
    "width": 200,
    "height": 150
  },
  "children": [],
  "properties": {
    "fill": "#e8f4f8",
    "stroke": "#333",
    "strokeWidth": 2,
    "borderRadius": 4,
    "opacity": 1
  }
}
```

**Known Properties** (renderers understand these):
- `fill`: Background color (hex or RGB)
- `stroke`: Border color
- `strokeWidth`: Border thickness (px)
- `borderRadius`: Corner radius (px)
- `opacity`: 0–1

**Known Properties for Text Objects**:
- `content`: Text content
- `fontSize`: Font size (px)
- `fontFamily`: Font name
- `fontWeight`: bold, normal, etc.
- `textColor`: Text color
- `textAlign`: left, center, right

**Known Properties for Container Objects**:
- `children`: Array of child object IDs
- All above properties apply

**Unknown Properties**: Preserved in JSON but not rendered; useful for custom metadata or future features.

**Extensibility**: Add new known properties and update renderer; old files continue to work with defaults.

---

### Connector Schema

```json
{
  "id": "conn-1",
  "source": "rect-1",
  "target": "container-1",
  "properties": {
    "stroke": "#4a9eff",
    "strokeWidth": 2,
    "style": "solid",
    "label": ""
  }
}
```

**Known Properties**:
- `stroke`: Line color
- `strokeWidth`: Line thickness
- `style`: "solid", "dashed", "dotted"
- `label`: Optional text label on connector
- `startArrow`, `endArrow`: Arrow types (future)

---

## Implementation Phases

### Phase 1: Core Engine + CLI + Basic UI

**Goal**: Functional diagram creation with CRUD operations (mouse + CLI)

**Components**:
- [x] Design schemas and data model
- [ ] Build `core/canvas-engine.js` — CRUD functions
- [ ] Build `core/schema.js` — validation, versioning
- [ ] Build `cli/` — command handlers (object, connector, config CRUD)
- [ ] Integrate React UI with core engine
- [ ] File load/save (JSON from current directory)
- [ ] localStorage auto-save with sync resolution
- [ ] Add metadata (layoutDirection) to canvas

**CLI Commands Ready**:
```bash
canvas init <file>
canvas object add <file> rectangle --x 100 --y 100 --width 200 --height 150
canvas object add <file> text --x 110 --y 110 --content "Hello"
canvas object add <file> container --x 400 --y 100 --width 300 --height 200 --children id1,id2
canvas object list <file>
canvas object get <file> <id>
canvas object update <file> <id> --property fill --value "#fff"
canvas object delete <file> <id>
canvas connector add <file> <source-id> <target-id>
canvas connector list <file>
canvas connector delete <file> <id>
canvas config <file> --layoutDirection left-to-right
```

**UI Features Ready**:
- Drag objects onto canvas
- Click to select, properties panel to edit
- Drag to connect objects
- Auto-save to localStorage
- Save to disk (JSON)
- Load from disk
- Delete objects

**Outcomes**: Fully functional single-user diagramming tool; programmatic interface ready for skills.

---

### Phase 2: Skill — Parse Web / GitHub → Canvas

**Goal**: Generate diagrams from web pages or GitHub repositories

**Skill Features**:
- Fetch GitHub README or web page
- Parse HTML/Markdown → extract structure (headings, lists, code blocks)
- Generate canvas objects respecting `layoutDirection`
- Auto-position and add connectors
- Write to JSON file

**Example Workflow**:
1. User invokes skill: `"parse GitHub repo and create canvas diagram"`
2. Skill reads README.md
3. Extracts hierarchy: H1 → container, H2 → child containers, bullets → text objects
4. Respects `layoutDirection` when positioning
5. Outputs diagram.json

**Outcomes**: Users can auto-generate diagrams from documentation; useful for architecture planning, roadmap visualization.

---

### Phase 3: UI Polish & Extensions

**Goal**: Better UX and extensibility

**Components**:
- [ ] Property editor (colors, fonts, sizes via UI)
- [ ] Delete/copy/paste objects
- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Groups/layers (optional)
- [ ] Snap-to-grid, alignment tools
- [ ] New object types (circles, images, etc.) as needed
- [ ] Custom properties UI (extensible property editor)

---

### Phase 4: Backend & Multi-User (Future)

**Goal**: Cloud storage, multi-user, advanced features

**Considerations**:
- SQLite backend (keep JSON format, store in DB)
- API server (load/save via HTTP)
- Real-time collaboration (WebSocket or Operational Transformation)
- Authentication / permissions
- Search and versioning

**No work in Phase 1–3; deferred decision.**

---

## Rationale & Benefits

### Why This Approach

1. **Separation of Concerns**
   - Core engine is agnostic to storage/UI
   - Easy to test, extend, or swap implementations
   - CLI and UI are thin wrappers around engine

2. **Programmatic Access**
   - CLI enables automation and Claude skills
   - Diagrams can be generated from data, code, web pages
   - Fits naturally into workflows (scripts, CI/CD, notebooks)

3. **Simplicity**
   - No database, no server initially
   - JSON as human-readable format for debugging
   - Git-friendly (can version control diagrams)

4. **Extensibility**
   - Flexible properties object: add features without migrations
   - Clear migration path (versioning) if schema needs to change
   - Phase-based rollout avoids over-engineering

5. **Storage Flexibility**
   - Current directory approach: portable, no config
   - Easy to migrate to backend later (JSON format stays the same)
   - Skills can read/write local files or remote API

### Design Principles

- **Start minimal, extend gradually**: Phase 1 delivers MVP; later phases add polish
- **Avoid over-engineering**: Don't build for features you don't have
- **Extensibility by design**: Properties model allows new features without breaking old files
- **Single source of truth**: JSON file on disk; localStorage is transient
- **User control**: Manual save gives user agency (vs. auto-saving to disk)

---

## Implementation Notes

### Extensibility Strategy

**How to Add a New Object Type**:
1. Update `core/schema.js` to define known properties for new type
2. Add renderer in `src/` for new type
3. No CLI changes needed (CLI is generic)
4. Old files unaffected

**How to Add a New Property**:
1. Define it as "known" in `core/schema.js`
2. Implement UI editor or CLI support
3. Unknown properties silently preserved; no migration needed

**How to Add a Skill**:
1. Create skill that invokes CLI commands or reads/writes JSON directly
2. Skill operates on files in current directory
3. No changes to core canvas needed

---

### Potential Gotchas

**Concurrency**: If user edits in browser + runs CLI commands simultaneously, localStorage may diverge from disk. Mitigated by:
- localStorage is read-only by CLI
- Browser asks user to sync on load
- Phase 1 is single-user; multi-user syncing is Phase 4

**ID Uniqueness**: Objects have string IDs (e.g., `rect-1`). Must ensure no collisions:
- CLI: User provides IDs or they're auto-generated (UUID or timestamp)
- UI: Auto-generate IDs (Date.now() or UUID)
- Consider UUID for Phase 1 if ID collisions are a concern

**Nested Objects**: Containers can have children. Avoid cycles (container as child of itself):
- Add validation in `canvas-engine.js` to detect cycles
- Deleting parent should handle children (delete, orphan, or propagate?)

**Property Validation**: Unknown properties are preserved. Could lead to:
- Silent failures if user typos a known property name
- Phase 1: Trust users; Phase 3: Add property editor with autocomplete

### File/Directory Structure

```
canvas/
├── core/
│   ├── canvas-engine.js         # Pure CRUD, no I/O
│   ├── schema.js                # Validation, versioning
│   └── index.js                 # Exports
├── cli/
│   ├── index.js                 # CLI entry (commander.js or yargs)
│   ├── commands/
│   │   ├── object.js            # object add/update/delete/list/get
│   │   ├── connector.js         # connector add/remove/list
│   │   └── config.js            # canvas metadata (layoutDirection)
│   └── utils.js                 # File I/O helpers
├── src/
│   ├── App.jsx                  # React app with ReactFlow
│   ├── App.css
│   ├── main.jsx
│   ├── hooks/
│   │   └── useCanvasEngine.js    # Hook wrapping core engine
│   ├── components/
│   │   ├── Canvas.jsx
│   │   ├── ObjectEditor.jsx
│   │   └── Sidebar.jsx
│   └── nodes/
│       └── ObjectNode.jsx        # React Flow node component
├── skills/
│   └── canvas-from-web/
│       ├── SKILL.md
│       └── parser.js            # Parse web/GH → canvas
├── tests/
│   ├── canvas-engine.test.js
│   └── schema.test.js
├── package.json
├── vite.config.js
└── PLAN.md                      # This file
```

---

## Future Considerations

### Post-Phase 1

1. **Performance at Scale**: If diagrams get large (1000+ objects), consider:
   - Virtual scrolling in canvas
   - Indexing in core engine
   - Lazy loading for massive files

2. **Undo/Redo**: Needed for UX polish
   - Could be in core (transaction log) or UI (React state)
   - Recommend: Phase 3

3. **Custom Object Types**: Users may want domain-specific shapes
   - Allow "custom" type with renderer function in properties
   - Or: Plugin system (Phase 4)

4. **Search & Filter**: When diagram grows, find objects by name/type
   - CLI: `canvas search <file> --type rectangle`
   - UI: Search panel in sidebar

5. **Export Formats**: SVG, PNG, ASCII art
   - Phase 3 or later; JSON is primary format

6. **Real-Time Collaboration**: Share diagrams, multi-user editing
   - Requires backend (Phase 4)
   - Keep JSON format; add conflict resolution

7. **Skill Gallery**: Library of reusable skills
   - Skill: diagram from code structure
   - Skill: diagram from CSV
   - Skill: diagram from API spec

---

## Roadmap at a Glance

| Phase | Focus | Estimated Effort | Key Outcome |
|-------|-------|------------------|-------------|
| 1 | Core + CLI + UI | 2–3 weeks | Functional diagramming tool |
| 2 | Skill (Web/GH parsing) | 1–2 weeks | Auto-generate diagrams from URLs |
| 3 | Polish + Extensions | 2–3 weeks | Better UX, more object types |
| 4 | Backend + Collaboration | TBD | Multi-user, cloud storage |

---

## Questions & Decisions Still Open

- **ID Generation**: UUID vs. timestamp vs. user-provided?
- **Child Deletion**: When parent (container) is deleted, what happens to children?
- **Property Defaults**: Each known property needs a default value; define these?
- **CLI Error Handling**: How verbose should CLI output be?
- **Phase 2 Scope**: Just README parsing, or full code structure analysis (AST)?

---

## Appendix: Quick Reference

### Known Object Types (Phase 1)
- `rectangle`: Box shape
- `text`: Text object
- `container`: Group of objects

### Known Canvas Properties (Phase 1)
- `fill`, `stroke`, `strokeWidth`, `borderRadius`, `opacity`
- `content` (text objects)
- `fontSize`, `fontFamily`, `fontWeight`, `textColor`, `textAlign` (text objects)
- `children` (containers)

### JSON Version Strategy
- Current: `1.0`
- If schema needs breaking change, bump to `2.0`; add migration function in `schema.js`

### CLI Technology Stack
- **Node.js**: Consistency with React frontend
- **commander.js** or **yargs**: CLI framework
- **Built-in fs**: File I/O

### UI Technology Stack
- **React 19+**
- **React Flow** (from original canvas, or alternative canvas lib)
- **Vite**: Build tooling
