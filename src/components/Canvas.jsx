import { useState, useRef } from 'react';
import ObjectNode from './ObjectNode.jsx';
import { getConnectorPath, getPortPosition } from '../utils/connectorPaths.js';
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
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [previewEnd, setPreviewEnd] = useState({ x: 0, y: 0 });
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
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (connectionDrag) {
      // Update preview line endpoint
      setPreviewEnd({ x: mouseX, y: mouseY });
    } else if (draggingObject) {
      const x = Math.max(0, mouseX - dragOffset.x);
      const y = Math.max(0, mouseY - dragOffset.y);
      onUpdateObject(draggingObject, { position: { x, y } });
    }
  };

  const handleMouseUp = () => {
    setDraggingObject(null);
    setConnectionDrag(null);
  };

  const handleConnectionDropOnPort = (targetObjectId, targetPortId) => {
    if (!connectionDrag) return;

    // Don't connect to self
    if (connectionDrag.sourceObjectId === targetObjectId) {
      setConnectionDrag(null);
      return;
    }

    // Create the connector
    onAddConnector(connectionDrag.sourceObjectId, targetObjectId);
    setConnectionDrag(null);
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
    event.stopPropagation();
    const sourceObject = canvas.objects.find((o) => o.id === sourceObjectId);
    if (!sourceObject) return;

    // Calculate port position
    let portX, portY;
    if (layoutDirection === 'top-to-bottom') {
      portX = sourceObject.position.x + sourceObject.size.width / 2;
      portY = sourcePortId === 'top' ? sourceObject.position.y : sourceObject.position.y + sourceObject.size.height;
    } else {
      portY = sourceObject.position.y + sourceObject.size.height / 2;
      portX = sourcePortId === 'left' ? sourceObject.position.x : sourceObject.position.x + sourceObject.size.width;
    }

    setConnectionDrag({
      sourceObjectId,
      sourcePortId,
      startX: portX,
      startY: portY,
    });
    setPreviewEnd({ x: portX, y: portY });
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

          // Get source port position (use bottom for top-to-bottom, right for left-to-right)
          const sourcePortId = layoutDirection === 'top-to-bottom' ? 'bottom' : 'right';
          const targetPortId = layoutDirection === 'top-to-bottom' ? 'top' : 'left';

          const sourcePos = getPortPosition(source, layoutDirection, sourcePortId);
          const targetPos = getPortPosition(target, layoutDirection, targetPortId);

          const connectorStyle = canvas.metadata.connectorStyle || 'elbow';
          const pathD = getConnectorPath(sourcePos, targetPos, connectorStyle);

          return (
            <g key={conn.id}>
              <path
                d={pathD}
                className="connector"
                fill="none"
                stroke={conn.properties.stroke || '#4a9eff'}
                strokeWidth={conn.properties.strokeWidth || 2}
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {connectionDrag && (() => {
          const connectorStyle = canvas.metadata.connectorStyle || 'elbow';
          const pathD = getConnectorPath(
            { x: connectionDrag.startX, y: connectionDrag.startY },
            previewEnd,
            connectorStyle
          );
          return (
            <path
              d={pathD}
              className="connector-preview"
              fill="none"
              stroke="#6fb3ff"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          );
        })()}

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
          onConnectionDropOnPort={handleConnectionDropOnPort}
          isConnectionActive={!!connectionDrag}
          onUpdateProperties={(props) =>
            onUpdateObject(object.id, { properties: props })
          }
        />
      ))}
    </div>
  );
}
