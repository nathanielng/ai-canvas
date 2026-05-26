// Pure CRUD logic for canvas operations — no I/O, no side effects
import { validateCanvas, validateObject, validateConnector, SCHEMA } from './schema.js';

const OBJECT_TYPES = new Set(SCHEMA.objectTypes);

export function createCanvas(metadata = {}) {
  return {
    version: '1.0',
    metadata: {
      name: 'Untitled Canvas',
      layoutDirection: 'top-to-bottom',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      ...metadata,
    },
    objects: [],
    connectors: [],
  };
}

export function createObject(canvas, type, x, y, properties = {}) {
  if (!OBJECT_TYPES.has(type)) {
    throw new Error(`Invalid object type: ${type}`);
  }

  const id = generateId();
  const object = {
    id,
    type,
    position: { x, y },
    size: { width: 100, height: 100 },
    children: [],
    properties,
  };

  canvas.objects.push(object);
  canvas.metadata.modifiedAt = new Date().toISOString();
  return object;
}

export function updateObject(canvas, id, updates) {
  const object = getObject(canvas, id);
  if (!object) throw new Error(`Object not found: ${id}`);

  if (updates.position) object.position = { ...object.position, ...updates.position };
  if (updates.size) object.size = { ...object.size, ...updates.size };
  if (updates.properties) object.properties = { ...object.properties, ...updates.properties };
  if (updates.children !== undefined) object.children = updates.children;

  canvas.metadata.modifiedAt = new Date().toISOString();
  return object;
}

export function deleteObject(canvas, id) {
  const index = canvas.objects.findIndex((obj) => obj.id === id);
  if (index === -1) throw new Error(`Object not found: ${id}`);

  const deleted = canvas.objects.splice(index, 1)[0];

  // Remove connectors referencing this object
  canvas.connectors = canvas.connectors.filter(
    (conn) => conn.source !== id && conn.target !== id
  );

  // Remove from parent's children
  canvas.objects.forEach((obj) => {
    if (obj.children.includes(id)) {
      obj.children = obj.children.filter((child) => child !== id);
    }
  });

  canvas.metadata.modifiedAt = new Date().toISOString();
  return deleted;
}

export function getObject(canvas, id) {
  return canvas.objects.find((obj) => obj.id === id);
}

export function listObjects(canvas) {
  return [...canvas.objects];
}

export function addConnector(canvas, sourceId, targetId, properties = {}) {
  const source = getObject(canvas, sourceId);
  const target = getObject(canvas, targetId);

  if (!source) throw new Error(`Source object not found: ${sourceId}`);
  if (!target) throw new Error(`Target object not found: ${targetId}`);

  const id = generateId();
  const connector = {
    id,
    source: sourceId,
    target: targetId,
    properties,
  };

  if (!validateConnector(connector)) {
    throw new Error(`Invalid connector: ${sourceId} → ${targetId}`);
  }

  canvas.connectors.push(connector);
  canvas.metadata.modifiedAt = new Date().toISOString();
  return connector;
}

export function removeConnector(canvas, id) {
  const index = canvas.connectors.findIndex((conn) => conn.id === id);
  if (index === -1) throw new Error(`Connector not found: ${id}`);

  const deleted = canvas.connectors.splice(index, 1)[0];
  canvas.metadata.modifiedAt = new Date().toISOString();
  return deleted;
}

export function getConnector(canvas, id) {
  return canvas.connectors.find((conn) => conn.id === id);
}

export function listConnectors(canvas) {
  return [...canvas.connectors];
}

export function setLayoutDirection(canvas, direction) {
  if (!['top-to-bottom', 'left-to-right'].includes(direction)) {
    throw new Error(`Invalid layout direction: ${direction}`);
  }
  canvas.metadata.layoutDirection = direction;
  canvas.metadata.modifiedAt = new Date().toISOString();
}

export function getLayoutDirection(canvas) {
  return canvas.metadata.layoutDirection || 'top-to-bottom';
}

// Check for cycles in container relationships
export function hasCycle(canvas, parentId, childId, visited = new Set()) {
  if (visited.has(parentId)) return true;
  visited.add(parentId);

  const parent = getObject(canvas, parentId);
  if (!parent || !parent.children.includes(childId)) return false;

  for (const child of parent.children) {
    if (child === childId) return true;
    if (hasCycle(canvas, child, childId, visited)) return true;
  }

  return false;
}

// Add child to container, with cycle detection
export function addChild(canvas, containerId, childId) {
  const container = getObject(canvas, containerId);
  const child = getObject(canvas, childId);

  if (!container) throw new Error(`Container not found: ${containerId}`);
  if (!child) throw new Error(`Child object not found: ${childId}`);
  if (hasCycle(canvas, childId, containerId)) {
    throw new Error(`Cycle detected: cannot add ${containerId} as child of ${childId}`);
  }

  if (!container.children.includes(childId)) {
    container.children.push(childId);
    canvas.metadata.modifiedAt = new Date().toISOString();
  }

  return container;
}

export function removeChild(canvas, containerId, childId) {
  const container = getObject(canvas, containerId);
  if (!container) throw new Error(`Container not found: ${containerId}`);

  container.children = container.children.filter((id) => id !== childId);
  canvas.metadata.modifiedAt = new Date().toISOString();
  return container;
}

// Utility to generate unique IDs
function generateId() {
  return `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export { generateId };
