import { useState, useEffect, useRef } from 'react';
import { useCanvasEngine } from './hooks/useCanvasEngine.js';
import { useTheme } from './hooks/useTheme.js';
import Canvas from './components/Canvas.jsx';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

export default function App() {
  const fileInputRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  useTheme(); // Initialize theme system
  const {
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
  } = useCanvasEngine();

  // Auto-save on canvas change
  useEffect(() => {
    const timer = setTimeout(autoSave, 500);
    return () => clearTimeout(timer);
  }, [canvas, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        if (selectedObject) {
          const obj = canvas.objects.find((o) => o.id === selectedObject);
          if (obj) {
            setClipboard(JSON.parse(JSON.stringify(obj)));
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (clipboard) {
          createObject(clipboard.type, clipboard.position.x + 20, clipboard.position.y + 20, {
            ...clipboard.properties,
          });
        }
      } else if (e.key === 'Delete' && selectedObject) {
        e.preventDefault();
        deleteObject(selectedObject);
        setSelectedObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedObject, deleteObject, canvas.objects, clipboard, createObject]);

  const handleSaveToFile = () => {
    const data = exportCanvas();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = importCanvas(e.target.result);
      if (!success) {
        alert('Invalid canvas file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Canvas</h1>
        <div className="header-info">
          {canvas.metadata.name} • {canvas.objects.length} objects •{' '}
          {canvas.metadata.layoutDirection}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="btn btn-secondary"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
          <button className="btn btn-primary" onClick={handleSaveToFile}>
            💾 Save
          </button>
          <button className="btn btn-primary" onClick={handleLoadFromFile}>
            📂 Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <div className="workspace">
        <Canvas
          canvas={canvas}
          onCreateObject={createObject}
          onUpdateObject={updateObject}
          onDeleteObject={deleteObject}
          onAddConnector={addConnector}
          onRemoveConnector={removeConnector}
          selectedObject={selectedObject}
          onSelectedObjectChange={setSelectedObject}
        />
        <Sidebar
          canvas={canvas}
          onCreateObject={createObject}
          onSetLayoutDirection={setLayoutDirection}
        />
      </div>
    </div>
  );
}
