import * as engine from '../../core/index.js';
import { readCanvas, writeCanvas } from '../utils.js';

export async function add(file, type, options) {
  const canvas = await readCanvas(file);
  const x = parseInt(options.x) || 0;
  const y = parseInt(options.y) || 0;
  const properties = parseProperties(options.property);

  const obj = engine.createObject(canvas, type, x, y, properties);
  await writeCanvas(file, canvas);

  console.log(`Created object: ${obj.id}`);
}

export async function list(file) {
  const canvas = await readCanvas(file);
  const objects = engine.listObjects(canvas);

  if (objects.length === 0) {
    console.log('No objects');
    return;
  }

  console.log(`Objects (${objects.length}):`);
  objects.forEach((obj) => {
    console.log(
      `  ${obj.id}: ${obj.type} @ (${obj.position.x}, ${obj.position.y}) ` +
        `${obj.size.width}x${obj.size.height}`
    );
  });
}

export async function get(file, id) {
  const canvas = await readCanvas(file);
  const obj = engine.getObject(canvas, id);

  if (!obj) {
    console.error(`Object not found: ${id}`);
    process.exit(1);
  }

  console.log(JSON.stringify(obj, null, 2));
}

export async function update(file, id, options) {
  const canvas = await readCanvas(file);
  const updates = {};

  if (options.position) {
    const [x, y] = options.position.split(',').map(Number);
    updates.position = { x, y };
  }

  if (options.size) {
    const [width, height] = options.size.split(',').map(Number);
    updates.size = { width, height };
  }

  if (options.property) {
    updates.properties = parseProperties(options.property);
  }

  const obj = engine.updateObject(canvas, id, updates);
  await writeCanvas(file, canvas);

  console.log(`Updated object: ${obj.id}`);
}

export async function delete_(file, id) {
  const canvas = await readCanvas(file);
  engine.deleteObject(canvas, id);
  await writeCanvas(file, canvas);

  console.log(`Deleted object: ${id}`);
}

// Alias for delete since it's a reserved word
export { delete_ as delete };

function parseProperties(propArray) {
  const properties = {};

  if (!propArray) return properties;
  if (typeof propArray === 'string') propArray = [propArray];

  propArray.forEach((prop) => {
    const [key, value] = prop.split('=');
    if (!key || !value) return;

    // Try to parse as JSON, otherwise treat as string
    try {
      properties[key] = JSON.parse(value);
    } catch {
      properties[key] = value;
    }
  });

  return properties;
}
