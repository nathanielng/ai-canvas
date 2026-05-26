import * as engine from '../../core/index.js';
import { readCanvas, writeCanvas } from '../utils.js';

export async function init(file, options) {
  const metadata = {};
  if (options.name) metadata.name = options.name;

  const canvas = engine.createCanvas(metadata);
  await writeCanvas(file, canvas);

  console.log(`Created canvas: ${file}`);
}

export async function validate(file) {
  try {
    const canvas = await readCanvas(file);

    if (!engine.validateCanvas(canvas)) {
      console.error('Canvas validation failed');
      process.exit(1);
    }

    console.log('✓ Canvas is valid');
    console.log(`  Version: ${canvas.version}`);
    console.log(`  Objects: ${canvas.objects.length}`);
    console.log(`  Connectors: ${canvas.connectors.length}`);
  } catch (error) {
    console.error(`Validation error: ${error.message}`);
    process.exit(1);
  }
}
