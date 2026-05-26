# AI Canvas

A free-form diagramming tool with professional flow diagram support. Create visual diagrams with objects, connectors, and flexible configuration—via web UI, CLI, or Claude Code skills.

## Features

### 🎨 Visual Diagramming
- **Flow Diagram Shapes**: Rectangle, Circle, Diamond, Parallelogram, Text, Container
- **Professional Styling**: Dark theme with customizable colors (theme.json)
- **Connectors**: Link objects together with directional connections
- **Drag & Drop**: Intuitive mouse-based object placement
- **Responsive UI**: Built with React and Vite

### 🔧 Programmatic Access
- **CLI**: 25+ commands for object/connector/config operations
- **JavaScript SDK**: Core engine for building custom tools
- **Claude Code Skills**: Build automation and integrations
- **JSON Format**: Simple, version-controllable diagram files

### ⚙️ Configurable
- **Colors**: Customize via `src/theme.json` (CSS variables)
- **Layout Direction**: Top-to-bottom or left-to-right
- **Properties**: Flexible object properties (fill, stroke, position, size, custom)
- **Extensible**: Add new shapes and features without core changes

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone and install
git clone https://github.com/nathanielng/ai-canvas.git
cd ai-canvas
npm install
```

### Running

```bash
# Terminal 1: Start dev server
npm run dev
# Opens http://localhost:5173

# Terminal 2 (optional): Use CLI
node cli/index.js init mydiagram.json
node cli/index.js object:add mydiagram.json rectangle -x 100 -y 100
node cli/index.js object:list mydiagram.json
```

---

## Usage

### Web UI

1. **Create objects**: Click shape buttons in sidebar (Rectangle, Circle, Diamond, etc.)
2. **Edit objects**: Drag to move, click to select, use properties panel
3. **Connect objects**: Drag from one object to another
4. **Save/Load**: Use 💾 Save and 📂 Load buttons to persist diagrams

**Keyboard Shortcuts**:
- **Ctrl+Z** / **Cmd+Z**: Undo last action
- **Ctrl+Y** / **Cmd+Y**: Redo action
- **Ctrl+C** / **Cmd+C**: Copy selected object
- **Ctrl+V** / **Cmd+V**: Paste copied object (20px offset)
- **Delete**: Remove selected object
- **Click on canvas**: Deselect all objects

### CLI

```bash
# Initialize canvas
canvas init diagram.json --name "My Diagram"

# Object operations
canvas object:add diagram.json rectangle -x 50 -y 50
canvas object:add diagram.json circle -x 200 -y 50
canvas object:list diagram.json
canvas object:delete diagram.json <id>

# Connectors
canvas connector:add diagram.json <source-id> <target-id>
canvas connector:list diagram.json

# Configuration
canvas config:set diagram.json layoutDirection left-to-right
canvas config:get diagram.json
```

### JavaScript / Node.js

```javascript
import {
  createCanvas,
  addObject,
  addConnector,
  listObjects,
} from './skills/canvas/index.js';

// Create diagram
await createCanvas('diagram.json', 'My Diagram');

// Add shapes
const rect = await addObject('diagram.json', 'rectangle', 100, 100, {
  fill: '#e8f4f8',
});

const circle = await addObject('diagram.json', 'circle', 300, 100, {
  fill: '#90EE90',
});

// Connect them
await addConnector('diagram.json', rect.objectId, circle.objectId);

// List all objects
const objects = await listObjects('diagram.json');
console.log(`Created ${objects.objects.length} objects`);
```

---

## Project Structure

```
ai-canvas/
├── core/                        # Core engine (CRUD logic)
│   ├── canvas-engine.js         # Pure functions (no I/O)
│   ├── schema.js                # Validation & versioning
│   └── index.js                 # Exports
├── cli/                         # Command-line interface
│   ├── index.js                 # Commander.js CLI
│   ├── commands/                # add, update, delete, etc.
│   └── utils.js                 # File I/O helpers
├── skills/                      # Claude Code skills
│   └── canvas/                  # CRUD skill
│       ├── SKILL.md             # Skill documentation
│       ├── index.js             # Skill functions
│       └── test.js              # Tests (15/15 passing)
├── src/                         # React UI
│   ├── App.jsx                  # Main app
│   ├── theme.json               # Color configuration
│   ├── components/              # React components
│   ├── hooks/                   # useCanvasEngine, useTheme
│   ├── styles/                  # CSS with variables
│   ├── utils/                   # Icons, helpers
│   └── main.jsx                 # Entry point
├── tests/                       # Core engine tests
├── PLAN.md                      # Architecture & design
├── PLAN-PHASE2.md              # Phase 2 (CRUD skill)
├── PLAN-PHASE3.md              # Phase 3 (UI polish & shapes)
├── package.json
├── vite.config.js
└── README.md
```

---

## Canvas Format (JSON)

```json
{
  "version": "1.0",
  "metadata": {
    "name": "My Diagram",
    "layoutDirection": "top-to-bottom",
    "createdAt": "2026-05-26T...",
    "modifiedAt": "2026-05-26T..."
  },
  "objects": [
    {
      "id": "obj-1234",
      "type": "rectangle",
      "position": { "x": 100, "y": 100 },
      "size": { "width": 200, "height": 150 },
      "properties": {
        "fill": "#e8f4f8",
        "stroke": "#333",
        "strokeWidth": 2
      },
      "children": []
    }
  ],
  "connectors": [
    {
      "id": "conn-1",
      "source": "obj-1234",
      "target": "obj-5678",
      "properties": { "stroke": "#4a9eff" }
    }
  ]
}
```

---

## Customization

### Colors (Theme)

Edit `src/theme.json` to customize the color scheme:

```json
{
  "colors": {
    "background": "#1a1a2e",
    "accent": "#4a9eff",
    "success": "#4caf50",
    "error": "#ff6b6b"
  },
  "shapes": {
    "borderRadius": 8,
    "borderWidth": 2
  }
}
```

Colors are applied as CSS variables (--color-background, etc.) at runtime.

### Object Types

Add new shapes in `core/schema.js`:

```javascript
const OBJECT_TYPES = new Set([
  'rectangle', 'circle', 'diamond', 'parallelogram',
  'text', 'container',
  // Add custom types here
]);

const TYPE_DEFAULTS = {
  'my-shape': {
    size: { width: 150, height: 100 },
    properties: { fill: '#fff', stroke: '#000' },
  },
};
```

Then add rendering in `src/components/ObjectNode.jsx`:

```javascript
case 'my-shape':
  return (
    <div style={{ ...baseStyle, ...customShapeStyles }}>
      {/* Render custom shape */}
    </div>
  );
```

---

## Development

### Scripts

```bash
npm run dev       # Start dev server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm test          # Run core engine tests
npm run lint      # Lint code (if configured)
```

### Architecture

- **Core Engine** (`core/canvas-engine.js`): Pure CRUD functions, no I/O
- **Validation** (`core/schema.js`): Schema validation and versioning
- **CLI** (`cli/`): Command wrappers around core engine
- **UI** (`src/`): React components using core engine via `useCanvasEngine` hook
- **Skills** (`skills/`): Claude Code integrations

### Testing

```bash
# Core engine tests (15/15 passing)
npm test

# CLI smoke tests
node cli/index.js init test.json
node cli/index.js object:add test.json rectangle -x 0 -y 0
node cli/index.js object:list test.json
```

---

## Roadmap

### Phase 1 ✅
- Core engine (CRUD operations)
- CLI interface (25+ commands)
- React UI (basic styling)

### Phase 2 ✅
- Claude Code skill (CRUD wrapper)
- 11 skill functions
- 15/15 tests passing

### Phase 3 ✅ (Complete)
- **Phase 3A ✅**: Theme system, professional node styling
- **Phase 3B ✅**: Additional shapes (circle, diamond, parallelogram)
- **Phase 3C ✅**: Interaction polish
  - Undo/redo (Ctrl+Z/Y) with history tracking (50 states)
  - Copy/paste (Ctrl+C/V) with 20px offset
  - Delete key to remove selected objects
  - Keyboard shortcuts for all operations
  - Copy button on object controls
  - Disabled state for undo/redo buttons when unavailable
  - Future: Double-click text editing, snap-to-grid

### Phase 4 (Future)
- Double-click text editing (in-place editing)
- Snap-to-grid alignment
- Multi-select with Ctrl+A
- Undo/redo for all operations
- Advanced layout algorithms (auto-arrange, distribute)
- Multi-user collaboration
- Export formats (PNG, SVG, PDF)
- Skill gallery (web parser, code analyzer, etc.)

---

## API Reference

### Core Engine

```javascript
import * as engine from './core/index.js';

// Canvas
engine.createCanvas(metadata)
engine.validateCanvas(canvas)

// Objects
engine.createObject(canvas, type, x, y, properties)
engine.getObject(canvas, id)
engine.updateObject(canvas, id, updates)
engine.deleteObject(canvas, id)
engine.listObjects(canvas)

// Connectors
engine.addConnector(canvas, source, target, properties)
engine.removeConnector(canvas, id)
engine.listConnectors(canvas)

// Config
engine.setLayoutDirection(canvas, 'top-to-bottom')
engine.getLayoutDirection(canvas)
```

### CLI Commands

See `cli/index.js` and `cli/commands/` for complete list.

```bash
canvas init <file> --name <name>
canvas object:add <file> <type> -x <x> -y <y>
canvas object:list <file>
canvas object:get <file> <id>
canvas object:update <file> <id> --property <key=value>
canvas object:delete <file> <id>
canvas connector:add <file> <source> <target>
canvas connector:list <file>
canvas connector:delete <file> <id>
canvas config:set <file> <key> <value>
canvas config:get <file>
canvas validate <file>
```

### Skills

```javascript
import {
  createCanvas,
  addObject,
  updateObject,
  deleteObject,
  listObjects,
  addConnector,
  removeConnector,
  listConnectors,
  setLayoutDirection,
  getMetadata,
} from './skills/canvas/index.js';
```

---

## Contributing

Contributions welcome! Areas for help:

- **Phase 3C**: Text editing, copy/paste, undo/redo
- **Tests**: More comprehensive test coverage
- **Documentation**: Usage examples, API docs
- **Skills**: Build automation tools on top of canvas
- **UI**: Additional shapes, layout improvements

---

## License

MIT

---

## Support

- **Issues**: Report bugs on GitHub
- **Documentation**: See PLAN.md files for architecture details
- **Skills**: Customize behavior via Claude Code skills
- **Feedback**: Open issues or start discussions

---

## Status

**v0.1.0** - Active development

- ✅ Core engine: Stable
- ✅ CLI: Stable
- ✅ UI basics: Complete
- 🚀 UI polish: In progress (Phase 3)
- 📋 Interaction features: Planned
- 🔮 Advanced features: Future

---

**Built with ❤️ using React, Node.js, and Vite**
