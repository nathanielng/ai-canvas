// Test suite for canvas skill

import test from 'node:test';
import assert from 'node:assert';
import { unlink } from 'fs/promises';
import {
  createCanvas,
  addObject,
  listObjects,
  getObject,
  updateObject,
  deleteObject,
  addConnector,
  listConnectors,
  deleteConnector,
  setLayoutDirection,
  getMetadata,
  getLayoutDirection,
} from './index.js';

const testFile = '/tmp/test-skill.json';

// Cleanup after tests
async function cleanup() {
  try {
    await unlink(testFile);
  } catch {}
}

test('Canvas Skill - CRUD Operations', async (t) => {
  await cleanup();

  await t.test('createCanvas creates a new canvas file', async () => {
    const result = await createCanvas(testFile, 'Test Canvas');
    assert.equal(result.success, true);
    assert.equal(result.file, testFile);
  });

  let obj1Id, obj2Id, connectorId;

  await t.test('addObject creates objects', async () => {
    const result1 = await addObject(testFile, 'rectangle', 100, 100, {
      fill: '#e8f4f8',
    });
    assert.equal(result1.success, true);
    assert.ok(result1.objectId);
    obj1Id = result1.objectId;

    const result2 = await addObject(testFile, 'text', 250, 100, {
      content: 'Hello',
    });
    assert.equal(result2.success, true);
    assert.ok(result2.objectId);
    obj2Id = result2.objectId;
  });

  await t.test('listObjects returns all objects', async () => {
    const result = await listObjects(testFile);
    assert.equal(result.success, true);
    assert.equal(result.objects.length, 2);
    assert.equal(result.count, 2);
  });

  await t.test('getObject retrieves specific object', async () => {
    const result = await getObject(testFile, obj1Id);
    assert.equal(result.success, true);
    assert.equal(result.object.id, obj1Id);
    assert.equal(result.object.type, 'rectangle');
  });

  await t.test('updateObject modifies object properties', async () => {
    const result = await updateObject(testFile, obj1Id, {
      position: { x: 150, y: 150 },
      properties: { fill: '#fff' },
    });
    assert.equal(result.success, true);

    const verify = await getObject(testFile, obj1Id);
    assert.equal(verify.object.position.x, 150);
    assert.equal(verify.object.properties.fill, '#fff');
  });

  await t.test('addConnector creates connection between objects', async () => {
    const result = await addConnector(testFile, obj1Id, obj2Id, {
      stroke: '#4a9eff',
    });
    assert.equal(result.success, true);
    assert.ok(result.connectorId);
    connectorId = result.connectorId;
  });

  await t.test('listConnectors returns all connectors', async () => {
    const result = await listConnectors(testFile);
    assert.equal(result.success, true);
    assert.equal(result.connectors.length, 1);
    assert.equal(result.count, 1);
  });

  await t.test('deleteConnector removes connector', async () => {
    const result = await deleteConnector(testFile, connectorId);
    assert.equal(result.success, true);

    const verify = await listConnectors(testFile);
    assert.equal(verify.connectors.length, 0);
  });

  await t.test('deleteObject removes object and its connectors', async () => {
    // Add new connector
    const conn = await addConnector(testFile, obj1Id, obj2Id);
    assert.equal(conn.success, true);

    // Delete object
    const result = await deleteObject(testFile, obj1Id);
    assert.equal(result.success, true);

    // Verify object is gone
    const verify = await listObjects(testFile);
    assert.equal(verify.objects.length, 1);

    // Verify connector is gone
    const connVerify = await listConnectors(testFile);
    assert.equal(connVerify.connectors.length, 0);
  });

  await t.test('setLayoutDirection updates canvas config', async () => {
    const result = await setLayoutDirection(testFile, 'left-to-right');
    assert.equal(result.success, true);

    const verify = await getLayoutDirection(testFile);
    assert.equal(verify.layoutDirection, 'left-to-right');
  });

  await t.test('getMetadata returns canvas metadata', async () => {
    const result = await getMetadata(testFile);
    assert.equal(result.success, true);
    assert.ok(result.metadata.name);
    assert.ok(result.metadata.createdAt);
  });

  await t.test('Error handling - file not found', async () => {
    const result = await getObject('/tmp/nonexistent.json', 'id');
    assert.equal(result.success, false);
    assert.ok(result.error);
  });

  await t.test('Error handling - invalid object ID', async () => {
    const result = await getObject(testFile, 'fake-id');
    assert.equal(result.success, false);
  });

  await t.test('Error handling - invalid layout direction', async () => {
    const result = await setLayoutDirection(testFile, 'invalid');
    assert.equal(result.success, false);
  });

  await cleanup();
});
