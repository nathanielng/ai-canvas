import { useEffect, useRef } from 'react';
import { useCanvasEngine } from './hooks/useCanvasEngine.js';
import Canvas from './components/Canvas.jsx';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

export default function App() {
  const fileInputRef = useRef(null);
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
  } = useCanvasEngine();

  // Auto-save on canvas change
  useEffect(() => {
    const timer = setTimeout(autoSave, 500);
    return () => clearTimeout(timer);
  }, [canvas, autoSave]);

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
