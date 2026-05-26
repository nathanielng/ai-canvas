# canvas

Claude Code skill for programmatic canvas diagram manipulation — CRUD operations on canvas files.

## Features

- **Create canvases** — Initialize new diagram files
- **Objects** — Add, list, update, delete rectangles, text boxes, containers
- **Connectors** — Link objects together with directional connections
- **Config** — Control layout direction (top-to-bottom, left-to-right)
- **Validation** — Built-in schema validation for all operations

## Usage

### Invoke the Skill

```bash
/canvas create --file mydiagram.json --name "My Diagram"
/canvas add-object --file mydiagram.json --type rectangle --x 100 --y 100
/canvas list-objects --file mydiagram.json
```

Or use directly in Claude scripts via exported functions.

## Function Reference

### Canvas Operations

```javascript
import {
  createCanvas,
  listObjects,
  getObject,
  addObject,
  updateObject,
  deleteObject,
  listConnectors,
  addConnector,
  deleteConnector,
  setLayoutDirection,
  getMetadata,
} from '~/code/canvas/skills/canvas';

// Create a new canvas
await createCanvas('diagram.json', 'My Project');

// Add objects
const obj = await addObject('diagram.json', 'rectangle', 100, 100, {
  fill: '#e8f4f8',
  stroke: '#333',
});

// List and inspect
const objects = await listObjects('diagram.json');
const single = await getObject('diagram.json', obj.objectId);

// Update
await updateObject('diagram.json', obj.objectId, {
  position: { x: 150, y: 150 },
  properties: { fill: '#fff' },
});

// Delete
await deleteObject('diagram.json', obj.objectId);

// Connectors
const connector = await addConnector('diagram.json', objId1, objId2);
const connectors = await listConnectors('diagram.json');
await deleteConnector('diagram.json', connector.connectorId);

// Config
await setLayoutDirection('diagram.json', 'left-to-right');
const metadata = await getMetadata('diagram.json');
```

## Object Types

- `rectangle` — Rectangular shape
- `text` — Text content
- `container` — Group/parent for other objects

## Layout Directions

- `top-to-bottom` — Vertical flow (default)
- `left-to-right` — Horizontal flow

## Properties (Flexible)

Objects support arbitrary properties. Known properties include:

**Common**:
- `fill` — Background color (hex, e.g., `#fff`)
- `stroke` — Border color
- `strokeWidth` — Border thickness (px)
- `borderRadius` — Corner radius (px)
- `opacity` — Transparency (0-1)

**Text-specific**:
- `content` — Text content
- `fontSize` — Size in pixels
- `fontFamily` — Font name
- `textColor` — Text color
- `textAlign` — Alignment (left, center, right)

Unknown properties are preserved but not rendered by the UI.

## Return Values

All functions return `{ success: boolean, ...data }`:

```javascript
// Success
{ success: true, objectId: 'obj-123...', message: 'Created object' }

// Error
{ success: false, error: 'File not found: diagram.json' }
```

## Examples

### Create a Simple Diagram

```javascript
const file = 'process.json';

// Initialize
await createCanvas(file, 'Process Flow');

// Add steps
const start = await addObject(file, 'rectangle', 50, 50, {
  fill: '#90EE90',
  content: 'Start',
});

const process = await addObject(file, 'rectangle', 200, 50, {
  fill: '#87CEEB',
  content: 'Process',
});

const end = await addObject(file, 'rectangle', 350, 50, {
  fill: '#FFB6C6',
  content: 'End',
});

// Connect them
await addConnector(file, start.objectId, process.objectId);
await addConnector(file, process.objectId, end.objectId);

// Verify
const objects = await listObjects(file);
console.log(`Created ${objects.objects.length} objects`);
```

### Set Layout and Update

```javascript
// Change layout direction
await setLayoutDirection('diagram.json', 'left-to-right');

// Get current config
const meta = await getMetadata('diagram.json');
console.log(`Layout: ${meta.layoutDirection}`);
console.log(`Created: ${meta.createdAt}`);
```

## Notes

- Files are stored in current directory (pwd)
- All operations validate against canvas schema
- Unknown properties preserved in JSON but ignored by UI
- Cycle detection prevents container loops
- Deleting an object removes its connectors automatically

## Limitations

- No transaction support (each operation is atomic)
- No undo/redo (handled by UI)
- File locking not supported (concurrent access not safe)
- No built-in templates (can be added in future)
