import { useCallback, useState } from 'react';
import * as engine from '../../core/index.js';

const STORAGE_KEY = 'canvas-state';
const MAX_HISTORY = 50;

export function useCanvasEngine(initialCanvas = null) {
  const [history, setHistory] = useState(() => {
    let initial = initialCanvas;
    if (!initial) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) initial = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load from localStorage:', e);
      }
      if (!initial) initial = engine.createCanvas({ name: 'New Canvas' });
    }
    return [initial];
  });

  const [historyIndex, setHistoryIndex] = useState(0);
  const canvas = history[historyIndex];

  // Helper to add new state to history
  const addToHistory = useCallback((newCanvas) => {
    setHistory((prev) => {
      // If we're in the middle of history, discard future states
      const trimmed = prev.slice(0, historyIndex + 1);
      // Add new state
      const updated = [...trimmed, newCanvas];
      // Keep only last MAX_HISTORY states
      if (updated.length > MAX_HISTORY) {
        return updated.slice(updated.length - MAX_HISTORY);
      }
      return updated;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [historyIndex]);

  // Auto-save to localStorage
  const autoSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canvas));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [canvas]);

  // CRUD operations with history tracking
  const createObject = useCallback(
    (type, x, y, properties = {}) => {
      const updated = JSON.parse(JSON.stringify(canvas));
      engine.createObject(updated, type, x, y, properties);
      addToHistory(updated);
    },
    [canvas, addToHistory]
  );

  const updateObject = useCallback((id, updates) => {
    const updated = JSON.parse(JSON.stringify(canvas));
    engine.updateObject(updated, id, updates);
    addToHistory(updated);
  }, [canvas, addToHistory]);

  const deleteObject = useCallback((id) => {
    const updated = JSON.parse(JSON.stringify(canvas));
    engine.deleteObject(updated, id);
    addToHistory(updated);
  }, [canvas, addToHistory]);

  const addConnector = useCallback((source, target, properties = {}) => {
    const updated = JSON.parse(JSON.stringify(canvas));
    engine.addConnector(updated, source, target, properties);
    addToHistory(updated);
  }, [canvas, addToHistory]);

  const removeConnector = useCallback((id) => {
    const updated = JSON.parse(JSON.stringify(canvas));
    engine.removeConnector(updated, id);
    addToHistory(updated);
  }, [canvas, addToHistory]);

  const setLayoutDirection = useCallback((direction) => {
    const updated = JSON.parse(JSON.stringify(canvas));
    engine.setLayoutDirection(updated, direction);
    addToHistory(updated);
  }, [canvas, addToHistory]);

  const exportCanvas = useCallback(() => {
    return JSON.stringify(canvas, null, 2);
  }, [canvas]);

  const importCanvas = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      if (engine.validateCanvas(imported)) {
        setHistory([imported]);
        setHistoryIndex(0);
        return true;
      }
    } catch (e) {
      console.error('Invalid canvas JSON:', e);
    }
    return false;
  }, []);

  const undo = useCallback(() => {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
