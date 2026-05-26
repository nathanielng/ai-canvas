import test from 'node:test';
import assert from 'node:assert';
import * as engine from '../core/canvas-engine.js';

test('createCanvas creates a valid canvas', () => {
  const canvas = engine.createCanvas({ name: 'Test Canvas' });

  assert.equal(canvas.version, '1.0');
  assert.equal(canvas.metadata.name, 'Test Canvas');
  assert.equal(canvas.metadata.layoutDirection, 'top-to-bottom');
  assert.deepEqual(canvas.objects, []);
  assert.deepEqual(canvas.connectors, []);
});

test('createObject adds object to canvas', () => {
  const canvas = engine.createCanvas();
  const obj = engine.createObject(canvas, 'rectangle', 100, 200, { fill: '#fff' });

  assert.equal(obj.type, 'rectangle');
  assert.equal(obj.position.x, 100);
  assert.equal(obj.position.y, 200);
  assert.equal(obj.properties.fill, '#fff');
  assert.equal(canvas.objects.length, 1);
});

test('getObject retrieves object by id', () => {
  const canvas = engine.createCanvas();
  const obj = engine.createObject(canvas, 'text', 0, 0, { content: 'Hello' });

  const retrieved = engine.getObject(canvas, obj.id);
  assert.equal(retrieved.id, obj.id);
  assert.equal(retrieved.properties.content, 'Hello');
});

test('updateObject modifies object properties', () => {
  const canvas = engine.createCanvas();
  const obj = engine.createObject(canvas, 'rectangle', 0, 0);

  engine.updateObject(canvas, obj.id, {
    position: { x: 50, y: 100 },
    properties: { fill: '#ff0000' },
  });

  const updated = engine.getObject(canvas, obj.id);
  assert.equal(updated.position.x, 50);
  assert.equal(updated.position.y, 100);
  assert.equal(updated.properties.fill, '#ff0000');
});

test('deleteObject removes object and its connectors', () => {
  const canvas = engine.createCanvas();
  const obj1 = engine.createObject(canvas, 'rectangle', 0, 0);
  const obj2 = engine.createObject(canvas, 'rectangle', 200, 0);

  engine.addConnector(canvas, obj1.id, obj2.id);
  assert.equal(canvas.connectors.length, 1);

  engine.deleteObject(canvas, obj1.id);
  assert.equal(canvas.objects.length, 1);
  assert.equal(canvas.connectors.length, 0);
});

test('addConnector creates connection between objects', () => {
  const canvas = engine.createCanvas();
  const obj1 = engine.createObject(canvas, 'rectangle', 0, 0);
  const obj2 = engine.createObject(canvas, 'rectangle', 200, 0);

  const conn = engine.addConnector(canvas, obj1.id, obj2.id, { stroke: '#4a9eff' });

  assert.equal(conn.source, obj1.id);
  assert.equal(conn.target, obj2.id);
  assert.equal(conn.properties.stroke, '#4a9eff');
  assert.equal(canvas.connectors.length, 1);
});

test('setLayoutDirection updates canvas layout', () => {
  const canvas = engine.createCanvas();
  engine.setLayoutDirection(canvas, 'left-to-right');

  assert.equal(canvas.metadata.layoutDirection, 'left-to-right');
});

test('hasCycle detects circular container relationships', () => {
  const canvas = engine.createCanvas();
  const obj1 = engine.createObject(canvas, 'container', 0, 0);
  const obj2 = engine.createObject(canvas, 'container', 200, 0);

  engine.addChild(canvas, obj1.id, obj2.id);

  // obj2 cannot be added as parent of obj1 (would create cycle)
  assert.throws(() => {
    engine.addChild(canvas, obj2.id, obj1.id);
  });
});

test('listObjects returns all objects', () => {
  const canvas = engine.createCanvas();
  engine.createObject(canvas, 'rectangle', 0, 0);
  engine.createObject(canvas, 'text', 100, 100);
  engine.createObject(canvas, 'container', 200, 200);

  const objects = engine.listObjects(canvas);
  assert.equal(objects.length, 3);
});

test('listConnectors returns all connectors', () => {
  const canvas = engine.createCanvas();
  const obj1 = engine.createObject(canvas, 'rectangle', 0, 0);
  const obj2 = engine.createObject(canvas, 'rectangle', 200, 0);
  const obj3 = engine.createObject(canvas, 'rectangle', 400, 0);

  engine.addConnector(canvas, obj1.id, obj2.id);
  engine.addConnector(canvas, obj2.id, obj3.id);

  const connectors = engine.listConnectors(canvas);
  assert.equal(connectors.length, 2);
});
