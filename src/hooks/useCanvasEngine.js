import { useCallback, useState } from 'react';
import * as engine from '../../core/index.js';

const STORAGE_KEY = 'canvas-state';

export function useCanvasEngine(initialCanvas = null) {
  const [canvas, setCanvas] = useState(() => {
    if (initialCanvas) return initialCanvas;

    // Try loading from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }

    // Create new canvas
    return engine.createCanvas({ name: 'New Canvas' });
  });

  // Auto-save to localStorage
  const autoSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canvas));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [canvas]);

  // CRUD operations
  const createObject = useCallback(
    (type, x, y, properties = {}) => {
      setCanvas((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        const obj = engine.createObject(updated, type, x, y, properties);
        return updated;
      });
    },
    []
  );

  const updateObject = useCallback((id, updates) => {
    setCanvas((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      engine.updateObject(updated, id, updates);
      return updated;
    });
  }, []);

  const deleteObject = useCallback((id) => {
    setCanvas((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      engine.deleteObject(updated, id);
      return updated;
    });
  }, []);

  const addConnector = useCallback((source, target, properties = {}) => {
    setCanvas((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      engine.addConnector(updated, source, target, properties);
      return updated;
    });
  }, []);

  const removeConnector = useCallback((id) => {
    setCanvas((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      engine.removeConnector(updated, id);
      return updated;
    });
  }, []);

  const setLayoutDirection = useCallback((direction) => {
    setCanvas((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      engine.setLayoutDirection(updated, direction);
      return updated;
    });
  }, []);

  const exportCanvas = useCallback(() => {
    return JSON.stringify(canvas, null, 2);
  }, [canvas]);

  const importCanvas = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      if (engine.validateCanvas(imported)) {
        setCanvas(imported);
        return true;
      }
    } catch (e) {
      console.error('Invalid canvas JSON:', e);
    }
    return false;
  }, []);

  return {
    canvas,
    autoSave,
    createObject,
    updateObject,
    deleteObject,
    addConnector,
    removeConnector,
    setLayoutDirection,
    exportCanvas,
    importCanvas,
  };
}
