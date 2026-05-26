import fs from 'fs/promises';
import path from 'path';
import { validateCanvas } from '../core/index.js';

export async function readCanvas(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const canvas = JSON.parse(content);

    if (!validateCanvas(canvas)) {
      throw new Error('Invalid canvas schema');
    }

    return canvas;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read canvas: ${error.message}`);
  }
}

export async function writeCanvas(filePath, canvas) {
  try {
    if (!validateCanvas(canvas)) {
      throw new Error('Invalid canvas schema');
    }

    const dir = path.dirname(filePath);
    if (dir !== '.' && dir !== '') {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(filePath, JSON.stringify(canvas, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write canvas: ${error.message}`);
  }
}
