# Phase 2: Canvas Skill — CRUD Wrapper

**Status**: Planning  
**Target**: Implement Claude Code skill wrapping canvas CLI for programmatic CRUD operations  
**Milestone**: Enable Claude to manipulate canvas files directly, foundation for future automation

---

## Overview

**Goal**: Build a reusable Claude Code skill that wraps canvas CLI commands, allowing Claude (or users via skill invocation) to programmatically create, read, update, and delete canvas objects.

**Use Cases**:
- Claude generates a canvas diagram from data (CSV, JSON, code structure)
- User invokes skill: `/canvas create-diagram mydata.csv` → Claude builds canvas
- Claude analyzes existing canvas and modifies it
- Programmatic canvas manipulation from Claude Code skills
- Foundation for future skills (web parser, code analyzer, etc.)

**Key Constraint**: Skill operates on the canvas JSON format from Phase 1 via CLI. All operations go through core engine and file I/O.

---

## Architecture

### System Design

```
Claude / User
     ↓
┌────────────────────────────┐
│ Skill: canvas              │
├────────────────────────────┤
│ Wraps CLI commands:        │
│ - object:add               │
│ - object:update            │
│ - object:delete            │
│ - connector:add            │
│ - connector:delete         │
│ - config:set               │
│ - init, validate           │
└────────────────────────────┘
     ↓
~/code/canvas/cli/
(Existing CLI commands)
     ↓
Canvas JSON Files
(Stored on disk)
```

### Skill Interface

```javascript
// Skill provides these functions:

// Canvas management
createCanvas(file, name?)           // canvas init <file>
loadCanvas(file)                    // Read and parse canvas.json
validateCanvas(file)                // canvas validate <file>

// Object CRUD
addObject(file, type, x, y, props)  // canvas object:add <file> <type> -x <x> -y <y>
listObjects(file)                   // canvas object:list <file>
getObject(file, id)                 // canvas object:get <file> <id>
updateObject(file, id, updates)     // canvas object:update <file> <id>
deleteObject(file, id)              // canvas object:delete <file> <id>

// Connector CRUD
addConnector(file, source, target)  // canvas connector:add <file> <source> <target>
listConnectors(file)                // canvas connector:list <file>
deleteConnector(file, id)           // canvas connector:delete <file> <id>

// Config
setLayoutDirection(file, dir)       // canvas config:set <file> layoutDirection <dir>
getMetadata(file)                   // canvas config:get <file>
```


---

## Implementation Plan

### Skill Structure

```
~/code/canvas/skills/canvas/
├── SKILL.md                     # Skill documentation
├── index.js                     # Skill entry point (exported functions)
└── __pycache__/ (optional)      # If using Python helpers
```

**Simple approach**: Wrap existing CLI commands as skill functions. No additional logic.

### Skill Functions

All functions are thin wrappers around CLI commands via `child_process.exec()` or direct core engine calls:

```javascript
// skills/canvas/index.js

export async function createCanvas(file, name = 'Untitled') {
  // Calls: canvas init <file> --name <name>
  // Returns: { success, message, file }
}

export async function addObject(file, type, x, y, properties = {}) {
  // Calls: canvas object:add <file> <type> -x <x> -y <y>
  // Returns: { success, objectId, message }
}

export async function listObjects(file) {
  // Calls: canvas object:list <file>
  // Returns: { objects: [...] }
}

export async function deleteObject(file, id) {
  // Calls: canvas object:delete <file> <id>
  // Returns: { success, message }
}

// ... and so on for all CRUD operations
```

### How It Works

1. Skill exposes functions matching canvas CLI commands
2. Each function calls the CLI or uses core engine directly
3. Returns structured data (objects, metadata, etc.)
4. Claude can invoke via: `/canvas create --file myfile.json --name "My Diagram"`
5. Or Claude can use skill functions directly within scripts

---

## Design Decisions & Tradeoffs

### Decision 1: Wrapper vs. Reimplementation

**Choice**: Thin wrapper around existing CLI commands  
**Why**: CLI already works, tested, and has file I/O; no duplication; leverages core engine  
**Tradeoff**: Slight indirection (subprocess calls), but simple and maintainable

---

### Decision 2: Part of Canvas Repo vs. Standalone

**Choice**: Part of canvas repo at `~/code/canvas/skills/canvas/`  
**Why**: Single source of truth; shared versioning; easier integration; users clone one repo  
**Tradeoff**: Canvas repo gets larger, but skills are logical subdivision

---

### Decision 3: Sync vs. Async Operations

**Choice**: All skill functions are async (to match potential subprocess I/O)  
**Why**: Future-proof; consistent with Node.js patterns; allows chaining  
**Tradeoff**: Requires await; but Claude handles this naturally

---

## Implementation Phases

### Phase 2: Canvas CRUD Skill (MVP)

**Goal**: Create a basic skill that wraps canvas CLI commands  
**Components**:
- [ ] Skill entry point: `~/code/canvas/skills/canvas/index.js`
- [ ] SKILL.md: Usage documentation and examples
- [ ] Wrapper functions: createCanvas, addObject, listObjects, deleteObject, addConnector, etc.
- [ ] Error handling: Graceful errors from CLI
- [ ] Tests: Basic smoke tests for each function

**Skill Functions** (11 total):
1. `createCanvas(file, name)` — canvas init
2. `addObject(file, type, x, y, properties)` — canvas object:add
3. `listObjects(file)` — canvas object:list
4. `getObject(file, id)` — canvas object:get
5. `updateObject(file, id, updates)` — canvas object:update
6. `deleteObject(file, id)` — canvas object:delete
7. `addConnector(file, source, target, properties)` — canvas connector:add
8. `listConnectors(file)` — canvas connector:list
9. `deleteConnector(file, id)` — canvas connector:delete
10. `setLayoutDirection(file, direction)` — canvas config:set
11. `getMetadata(file)` — canvas config:get

**Outcomes**: 
- Skill available in Claude Code: `/canvas create --file mydiagram.json`
- Claude can programmatically manipulate canvas files
- Foundation for future skills (web parser, code analyzer, etc.)

**Testing**:
- [ ] Each function executes correctly
- [ ] Error handling for missing files, invalid IDs
- [ ] Returned data matches expected format
- [ ] Round-trip: create → add objects → list → verify

---

## Data Models

### Skill Function Signatures

```javascript
// Canvas operations
createCanvas(file: string, name?: string): Promise<{ success: boolean, file: string }>
listObjects(file: string): Promise<{ objects: Array<{id, type, position, size}> }>
getObject(file: string, id: string): Promise<object>
addObject(file: string, type: string, x: number, y: number, properties?: object): Promise<{ success: boolean, objectId: string }>
updateObject(file: string, id: string, updates: object): Promise<{ success: boolean }>
deleteObject(file: string, id: string): Promise<{ success: boolean }>

// Connector operations
listConnectors(file: string): Promise<{ connectors: Array<{id, source, target}> }>
addConnector(file: string, source: string, target: string, properties?: object): Promise<{ success: boolean, connectorId: string }>
deleteConnector(file: string, id: string): Promise<{ success: boolean }>

// Config operations
setLayoutDirection(file: string, direction: 'top-to-bottom' | 'left-to-right'): Promise<{ success: boolean }>
getMetadata(file: string): Promise<metadata>
```

---

## Testing Strategy

### Unit Tests
- **createCanvas**: Creates valid canvas.json file
- **addObject**: Creates object, returns correct ID, object appears in list
- **updateObject**: Modifies object properties, reflected in getObject
- **deleteObject**: Removes object and its connectors
- **addConnector**: Creates connection between valid objects
- **deleteConnector**: Removes connector, not other connectors
- **setLayoutDirection**: Updates metadata, validates direction enum

### Integration Tests
- **Round-trip**: Create → add objects → list → delete → verify
- **File persistence**: Changes saved to disk, reload matches
- **Error handling**: Invalid file path, missing object ID, invalid type
- **CRUD chain**: Create canvas → add 3 objects → connect them → list all

### Smoke Tests
- Skill functions can be imported
- Each function executes without error
- Return values have expected structure

---

## Dependencies

**External Libraries**:
- None (uses existing canvas dependencies)

**Internal Dependencies**:
- `~/code/canvas/core`: Use for validation, object creation
- `~/code/canvas/cli`: Invoke CLI commands or reuse command implementations

---

## Success Criteria

1. ✅ All 11 skill functions work correctly
2. ✅ CRUD operations persist to JSON files
3. ✅ Error handling for edge cases (missing files, invalid IDs)
4. ✅ Skill can be invoked from Claude Code: `/canvas create --file test.json`
5. ✅ SKILL.md documents all functions with examples
6. ✅ Unit tests pass (all CRUD operations tested)
7. ✅ Round-trip test: create → modify → verify

---

## Future Enhancements (Phase 3+)

- **Web Parser Skill**: Generate diagrams from URLs (GitHub, web pages)
- **Code Analyzer Skill**: Generate diagrams from code structure
- **Data Importer Skill**: Import from CSV, JSON, databases
- **Export Formats**: PNG, SVG, PDF rendering
- **Template Library**: Pre-built diagram templates
- **Collaboration**: Multi-user editing, real-time sync
- **Advanced Layout**: Auto-layout algorithms, constraint solving

---

## Appendix: Example Usage

### Example 1: Create and Manipulate via Skill

```javascript
// Claude script using canvas skill
import { createCanvas, addObject, listObjects, addConnector } from '~/code/canvas/skills/canvas';

const file = 'mydiagram.json';

// Create canvas
await createCanvas(file, 'My Workflow');

// Add objects
const rect1 = await addObject(file, 'rectangle', 50, 50, { fill: '#e8f4f8' });
const rect2 = await addObject(file, 'rectangle', 250, 50, { fill: '#f0f0f0' });
const text1 = await addObject(file, 'text', 150, 200, { content: 'Process' });

// List what we created
const objects = await listObjects(file);
console.log(`Created ${objects.objects.length} objects`);

// Connect them
await addConnector(file, rect1.objectId, rect2.objectId);
```

### Example 2: CLI Invocation

```bash
# Create canvas
canvas init mydiagram.json --name "Architecture"

# Add objects
canvas object:add mydiagram.json rectangle -x 100 -y 100
canvas object:add mydiagram.json text -x 300 -y 100

# Set layout
canvas config:set mydiagram.json layoutDirection left-to-right

# Verify
canvas object:list mydiagram.json
```

---

## Questions & Decisions Still Open

1. **Error Format**: Should errors return { success: false, error: string } or throw?
2. **Return Format**: Consistent structure for all skill functions?
3. **File Path**: Relative or absolute paths? Default directory?
4. **Properties**: How to handle complex property objects via skill?
