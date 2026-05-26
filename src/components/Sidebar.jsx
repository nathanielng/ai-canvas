import { useState } from 'react';
import '../styles/Sidebar.css';

export default function Sidebar({ canvas, onCreateObject, onSetLayoutDirection }) {
  const [selectedType, setSelectedType] = useState('rectangle');

  const handleAddObject = (type) => {
    const x = Math.random() * 400;
    const y = Math.random() * 300;
    onCreateObject(type, x, y);
  };

  return (
    <aside className="sidebar">
      <h2>Tools</h2>

      <section className="sidebar-section">
        <h3>Add Object</h3>
        <div className="object-palette">
          <button
            className="btn btn-block"
            onClick={() => handleAddObject('rectangle')}
          >
            Rectangle
          </button>
          <button
            className="btn btn-block"
            onClick={() => handleAddObject('text')}
          >
            Text
          </button>
          <button
            className="btn btn-block"
            onClick={() => handleAddObject('container')}
          >
            Container
          </button>
        </div>
      </section>

      <section className="sidebar-section">
        <h3>Layout</h3>
        <div className="layout-selector">
          <label>
            <input
              type="radio"
              name="layout"
              value="top-to-bottom"
              defaultChecked={canvas.metadata.layoutDirection === 'top-to-bottom'}
              onChange={(e) => onSetLayoutDirection(e.target.value)}
            />
            Top to Bottom
          </label>
          <label>
            <input
              type="radio"
              name="layout"
              value="left-to-right"
              defaultChecked={canvas.metadata.layoutDirection === 'left-to-right'}
              onChange={(e) => onSetLayoutDirection(e.target.value)}
            />
            Left to Right
          </label>
        </div>
      </section>

      <section className="sidebar-section">
        <h3>Canvas Info</h3>
        <ul className="info-list">
          <li>
            <span>Objects</span>
            <strong>{canvas.objects.length}</strong>
          </li>
          <li>
            <span>Connectors</span>
            <strong>{canvas.connectors.length}</strong>
          </li>
          <li>
            <span>Layout</span>
            <strong>{canvas.metadata.layoutDirection === 'top-to-bottom' ? '↓' : '→'}</strong>
          </li>
        </ul>
      </section>
    </aside>
  );
}
