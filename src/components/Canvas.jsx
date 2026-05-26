import { useState, useRef } from 'react';
import ObjectNode from './ObjectNode.jsx';
import '../styles/Canvas.css';

export default function Canvas({
  canvas,
  layoutDirection,
  onCreateObject,
  onUpdateObject,
  onDeleteObject,
  onAddConnector,
  onRemoveConnector,
  selectedObject,
  onSelectedObjectChange,
}) {
  const [draggingObject, setDraggingObject] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      onSelectedObjectChange(null);
    }
  };

  const handleObjectMouseDown = (e, objectId) => {
    if (e.button !== 0) return; // Left click only
    e.preventDefault();

    const object = canvas.objects.find((o) => o.id === objectId);
    if (!object) return;

    onSelectedObjectChange(objectId);
    setDraggingObject(objectId);
    setDragOffset({
      x: e.clientX - object.position.x,
      y: e.clientY - object.position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingObject || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);

    onUpdateObject(draggingObject, { position: { x, y } });
  };

  const handleMouseUp = () => {
    setDraggingObject(null);
  };

  const handleDuplicate = (objectId) => {
    const obj = canvas.objects.find((o) => o.id === objectId);
    if (obj) {
      onCreateObject(obj.type, obj.position.x + 20, obj.position.y + 20, {
        ...obj.properties,
      });
    }
  };

  const handleStartConnection = (sourceObjectId, sourcePortId, event) => {
    // TODO: Implement connection drag logic
    console.log('Start connection from:', sourceObjectId, sourcePortId);
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg className="canvas-connections">
        {canvas.connectors.map((conn) => {
          const source = canvas.objects.find((o) => o.id === conn.source);
          const target = canvas.objects.find((o) => o.id === conn.target);

          if (!source || !target) return null;

          const x1 = source.position.x + source.size.width / 2;
          const y1 = source.position.y + source.size.height;
          const x2 = target.position.x + target.size.width / 2;
          const y2 = target.position.y;

          return (
            <g key={conn.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="connector"
                stroke={conn.properties.stroke || '#4a9eff'}
                strokeWidth={conn.properties.strokeWidth || 2}
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#4a9eff" />
          </marker>
        </defs>
      </svg>

      {canvas.objects.map((object) => (
        <ObjectNode
          key={object.id}
          object={object}
          layoutDirection={layoutDirection}
          isSelected={selectedObject === object.id}
          onMouseDown={(e) => handleObjectMouseDown(e, object.id)}
          onDelete={() => onDeleteObject(object.id)}
          onDuplicate={() => handleDuplicate(object.id)}
          onStartConnection={handleStartConnection}
          onUpdateProperties={(props) =>
            onUpdateObject(object.id, { properties: props })
          }
        />
      ))}
    </div>
  );
}
