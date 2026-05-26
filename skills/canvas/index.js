// Canvas skill: CRUD operations for canvas diagrams
// Wraps core engine for programmatic access

import * as engine from '../../core/index.js';
import { readCanvas, writeCanvas } from '../../cli/utils.js';

// Canvas management

export async function createCanvas(file, name = 'Untitled Canvas') {
  try {
    const canvas = engine.createCanvas({ name });
    await writeCanvas(file, canvas);
    return {
      success: true,
      file,
      message: `Created canvas: ${file}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getMetadata(file) {
  try {
    const canvas = await readCanvas(file);
    return {
      success: true,
      metadata: canvas.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Object CRUD

export async function addObject(file, type, x, y, properties = {}) {
  try {
    const canvas = await readCanvas(file);
    const obj = engine.createObject(canvas, type, x, y, properties);
    await writeCanvas(file, canvas);

    return {
      success: true,
      objectId: obj.id,
      object: obj,
      message: `Created ${type}: ${obj.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function listObjects(file) {
  try {
    const canvas = await readCanvas(file);
    const objects = engine.listObjects(canvas);

    return {
      success: true,
      objects: objects.map((obj) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        size: obj.size,
        properties: obj.properties,
        children: obj.children,
      })),
      count: objects.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getObject(file, id) {
  try {
    const canvas = await readCanvas(file);
    const obj = engine.getObject(canvas, id);

    if (!obj) {
      return {
        success: false,
        error: `Object not found: ${id}`,
      };
    }

    return {
      success: true,
      object: obj,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateObject(file, id, updates) {
  try {
    const canvas = await readCanvas(file);

    // Parse updates if they're strings
    const parsedUpdates = {};
    if (updates.position && typeof updates.position === 'string') {
      const [x, y] = updates.position.split(',').map(Number);
      parsedUpdates.position = { x, y };
    } else if (updates.position) {
      parsedUpdates.position = updates.position;
    }

    if (updates.size && typeof updates.size === 'string') {
      const [w, h] = updates.size.split(',').map(Number);
      parsedUpdates.size = { width: w, height: h };
    } else if (updates.size) {
      parsedUpdates.size = updates.size;
    }

    if (updates.properties) {
      parsedUpdates.properties = updates.properties;
    }

    const obj = engine.updateObject(canvas, id, parsedUpdates);
    await writeCanvas(file, canvas);

    return {
      success: true,
      object: obj,
      message: `Updated object: ${id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteObject(file, id) {
  try {
    const canvas = await readCanvas(file);
    const deleted = engine.deleteObject(canvas, id);
    await writeCanvas(file, canvas);

    return {
      success: true,
      objectId: id,
      message: `Deleted object: ${id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Connector CRUD

export async function addConnector(file, source, target, properties = {}) {
  try {
    const canvas = await readCanvas(file);
    const conn = engine.addConnector(canvas, source, target, properties);
    await writeCanvas(file, canvas);

    return {
      success: true,
      connectorId: conn.id,
      connector: conn,
      message: `Created connector: ${source} → ${target}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function listConnectors(file) {
  try {
    const canvas = await readCanvas(file);
    const connectors = engine.listConnectors(canvas);

    return {
      success: true,
      connectors: connectors.map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        properties: conn.properties,
      })),
      count: connectors.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteConnector(file, id) {
  try {
    const canvas = await readCanvas(file);
    engine.removeConnector(canvas, id);
    await writeCanvas(file, canvas);

    return {
      success: true,
      connectorId: id,
      message: `Deleted connector: ${id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Config

export async function setLayoutDirection(file, direction) {
  try {
    if (!['top-to-bottom', 'left-to-right'].includes(direction)) {
      return {
        success: false,
        error: `Invalid layout direction: ${direction} (must be 'top-to-bottom' or 'left-to-right')`,
      };
    }

    const canvas = await readCanvas(file);
    engine.setLayoutDirection(canvas, direction);
    await writeCanvas(file, canvas);

    return {
      success: true,
      layoutDirection: direction,
      message: `Set layout direction: ${direction}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getLayoutDirection(file) {
  try {
    const canvas = await readCanvas(file);
    const direction = engine.getLayoutDirection(canvas);

    return {
      success: true,
      layoutDirection: direction,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
