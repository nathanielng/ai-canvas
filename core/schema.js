// Schema validation and versioning

const SCHEMA_VERSION = '1.0';

const OBJECT_TYPES = new Set(['rectangle', 'text', 'container']);

const KNOWN_PROPERTIES = {
  // Common properties
  fill: 'string',
  stroke: 'string',
  strokeWidth: 'number',
  borderRadius: 'number',
  opacity: 'number',

  // Text-specific
  content: 'string',
  fontSize: 'number',
  fontFamily: 'string',
  fontWeight: 'string',
  textColor: 'string',
  textAlign: 'string',

  // Container-specific
  children: 'array',
};

const TYPE_DEFAULTS = {
  rectangle: {
    size: { width: 200, height: 150 },
    properties: { fill: '#e8f4f8', stroke: '#333', strokeWidth: 2, opacity: 1 },
  },
  text: {
    size: { width: 200, height: 50 },
    properties: { content: '', fontSize: 14, textColor: '#000', textAlign: 'left' },
  },
  container: {
    size: { width: 300, height: 200 },
    properties: { fill: '#f0f0f0', stroke: '#999', strokeWidth: 1, opacity: 1 },
  },
};

export function validateCanvas(canvas) {
  if (!canvas || typeof canvas !== 'object') return false;
  if (!canvas.version) return false;
  if (!Array.isArray(canvas.objects)) return false;
  if (!Array.isArray(canvas.connectors)) return false;
  if (!canvas.metadata || typeof canvas.metadata !== 'object') return false;

  // Validate all objects
  if (!canvas.objects.every((obj) => validateObject(obj))) return false;

  // Validate all connectors
  if (!canvas.connectors.every((conn) => validateConnector(conn))) return false;

  return true;
}

export function validateObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'string' || !obj.id) return false;
  if (!OBJECT_TYPES.has(obj.type)) return false;
  if (!obj.position || typeof obj.position.x !== 'number' || typeof obj.position.y !== 'number') {
    return false;
  }
  if (!obj.size || typeof obj.size.width !== 'number' || typeof obj.size.height !== 'number') {
    return false;
  }
  if (!obj.properties || typeof obj.properties !== 'object') return false;
  if (obj.children && !Array.isArray(obj.children)) return false;

  return true;
}

export function validateConnector(conn) {
  if (!conn || typeof conn !== 'object') return false;
  if (typeof conn.id !== 'string' || !conn.id) return false;
  if (typeof conn.source !== 'string' || !conn.source) return false;
  if (typeof conn.target !== 'string' || !conn.target) return false;
  if (!conn.properties || typeof conn.properties !== 'object') return false;

  return true;
}

export function getTypeDefaults(type) {
  return TYPE_DEFAULTS[type] || { size: { width: 100, height: 100 }, properties: {} };
}

export function getKnownProperties() {
  return { ...KNOWN_PROPERTIES };
}

export function isKnownProperty(prop) {
  return prop in KNOWN_PROPERTIES;
}

// Future: implement schema migrations here
export function migrateSchema(fromVersion, toVersion, data) {
  if (fromVersion === toVersion) return data;
  // Add migration logic as schema evolves
  throw new Error(`Migration from ${fromVersion} to ${toVersion} not implemented`);
}

export const SCHEMA = {
  version: SCHEMA_VERSION,
  objectTypes: Array.from(OBJECT_TYPES),
  knownProperties: KNOWN_PROPERTIES,
  typeDefaults: TYPE_DEFAULTS,
};
