import * as engine from '../../core/index.js';
import { readCanvas, writeCanvas } from '../utils.js';

function parseProperties(propArray) {
  const properties = {};

  if (!propArray) return properties;
  if (typeof propArray === 'string') propArray = [propArray];

  propArray.forEach((prop) => {
    const [key, value] = prop.split('=');
    if (!key || !value) return;

    try {
      properties[key] = JSON.parse(value);
    } catch {
      properties[key] = value;
    }
  });

  return properties;
}

export async function add(file, source, target, options) {
  const canvas = await readCanvas(file);
  const properties = parseProperties(options.property);

  const conn = engine.addConnector(canvas, source, target, properties);
  await writeCanvas(file, canvas);

  console.log(`Created connector: ${conn.id} (${source} → ${target})`);
}

export async function list(file) {
  const canvas = await readCanvas(file);
  const connectors = engine.listConnectors(canvas);

  if (connectors.length === 0) {
    console.log('No connectors');
    return;
  }

  console.log(`Connectors (${connectors.length}):`);
  connectors.forEach((conn) => {
    console.log(`  ${conn.id}: ${conn.source} → ${conn.target}`);
  });
}

export async function delete_(file, id) {
  const canvas = await readCanvas(file);
  const conn = engine.getConnector(canvas, id);

  if (!conn) {
    console.error(`Connector not found: ${id}`);
    process.exit(1);
  }

  engine.removeConnector(canvas, id);
  await writeCanvas(file, canvas);

  console.log(`Deleted connector: ${id}`);
}

export { delete_ as delete };
