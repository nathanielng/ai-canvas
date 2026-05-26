import * as engine from '../../core/index.js';
import { readCanvas, writeCanvas } from '../utils.js';

export async function get(file, options) {
  const canvas = await readCanvas(file);

  if (options.key) {
    const value = canvas.metadata[options.key];
    if (value === undefined) {
      console.error(`Config key not found: ${options.key}`);
      process.exit(1);
    }
    console.log(JSON.stringify(value));
  } else {
    console.log(JSON.stringify(canvas.metadata, null, 2));
  }
}

export async function set(file, key, value) {
  const canvas = await readCanvas(file);

  // Special handling for layoutDirection
  if (key === 'layoutDirection') {
    engine.setLayoutDirection(canvas, value);
  } else {
    // Try to parse as JSON, otherwise treat as string
    try {
      canvas.metadata[key] = JSON.parse(value);
    } catch {
      canvas.metadata[key] = value;
    }
  }

  await writeCanvas(file, canvas);
  console.log(`Set ${key} = ${canvas.metadata[key]}`);
}
