import { useState, useRef, useEffect } from 'react';
import ObjectNode from './ObjectNode.jsx';
import { getConnectorPath, getPortPosition } from '../utils/connectorPaths.js';
import { snapPosition } from '../utils/grid.js';
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
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [panningCanvas, setPanningCanvas] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [previewEnd, setPreviewEnd] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleCanvasMouseDown = (e) => {
    // Middle mouse button (button 1) or Space+Left click to pan
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      e.preventDefault();
      setPanningCanvas(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: canvasRef.current?.scrollLeft || 0,
        scrollTop: canvasRef.current?.scrollTop || 0,
      });
      return;
    }

    if (e.target === canvasRef.current) {
      onSelectedObjectChange(null);
    }
  };

  // Handle space key for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(false);
        setPanningCanvas(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

    if (panningCanvas) {
      // Pan canvas by scrolling
      const deltaX = panStart.x - e.clientX;
      const deltaY = panStart.y - e.clientY;
      canvasRef.current.scrollLeft = panStart.scrollLeft + deltaX;
      canvasRef.current.scrollTop = panStart.scrollTop + deltaY;
      return;
    }

    if (connectionDrag) {
      // Update preview line endpoint
      setPreviewEnd({ x: mouseX, y: mouseY });
    } else if (resizingObject) {
      // Handle resizing
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.objX;
      let newY = resizeStart.objY;

      const { corner } = resizingObject;

      // Resize from corner, maintaining minimum size
      if (corner.includes('right')) {
        newWidth = Math.max(50, resizeStart.width + deltaX);
      } else if (corner.includes('left')) {
        newWidth = Math.max(50, resizeStart.width - deltaX);
        newX = resizeStart.objX + deltaX;
      }

      if (corner.includes('bottom')) {
        newHeight = Math.max(50, resizeStart.height + deltaY);
      } else if (corner.includes('top')) {
        newHeight = Math.max(50, resizeStart.height - deltaY);
        newY = resizeStart.objY + deltaY;
      }

      // Snap to grid
      const snappedPos = snapPosition(newX, newY, 20);
      newWidth = snapPosition(newWidth, 0, 20).x;
      newHeight = snapPosition(newHeight, 0, 20).x;

      onUpdateObject(resizingObject.id, {
        position: snappedPos,
        size: { width: newWidth, height: newHeight },
      });
    } else if (draggingObject) {
      let x = Math.max(0, mouseX - dragOffset.x);
      let y = Math.max(0, mouseY - dragOffset.y);

      // Snap to grid (20px)
      const snapped = snapPosition(x, y, 20);
      onUpdateObject(draggingObject, { position: { x: snapped.x, y: snapped.y } });
    }
  };

  const handleMouseUp = () => {
    setDraggingObject(null);
    setResizingObject(null);
    setPanningCanvas(false);
    setConnectionDrag(null);
  };

  const handleConnectionDropOnPort = (targetObjectId, targetPortId) => {
    if (!connectionDrag) return;

    // Don't connect to self
    if (connectionDrag.sourceObjectId === targetObjectId) {
      setConnectionDrag(null);
      return;
    }

    // Create the connector with port information
    onAddConnector(
      connectionDrag.sourceObjectId,
      targetObjectId,
      {
        sourcePort: connectionDrag.sourcePortId,
        targetPort: targetPortId,
      }
    );
    setConnectionDrag(null);
  };

  const handleStartResize = (objectId, corner, event) => {
    event.stopPropagation();
    const object = canvas.objects.find((o) => o.id === objectId);
    if (!object) return;

    setResizingObject({ id: objectId, corner });
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      width: object.size.width,
      height: object.size.height,
      objX: object.position.x,
      objY: object.position.y,
    });
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

    const sourcePos = getPortPosition(sourceObject, layoutDirection, sourcePortId);

    setConnectionDrag({
      sourceObjectId,
      sourcePortId,
      startX: sourcePos.x,
      startY: sourcePos.y,
    });
    setPreviewEnd({ x: sourcePos.x, y: sourcePos.y });
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      style={spacePressed ? { cursor: 'grab' } : {}}
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

          // Use stored port info, or fallback to layout defaults
          const sourcePortId = conn.properties.sourcePort || (layoutDirection === 'top-to-bottom' ? 'bottom' : 'right');
          const targetPortId = conn.properties.targetPort || (layoutDirection === 'top-to-bottom' ? 'top' : 'left');

          const sourcePos = getPortPosition(source, layoutDirection, sourcePortId);
          const targetPos = getPortPosition(target, layoutDirection, targetPortId);

          const connectorStyle = canvas.metadata.connectorStyle || 'elbow';
          const pathD = getConnectorPath(
            sourcePos,
            targetPos,
            connectorStyle,
            sourcePortId,
            targetPortId
          );

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
            connectorStyle,
            connectionDrag.sourcePortId
            // targetPort is unknown during preview, use sourcePort to guide routing
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
          onStartResize={handleStartResize}
          isConnectionActive={!!connectionDrag}
          onUpdateProperties={(props) =>
            onUpdateObject(object.id, { properties: props })
          }
        />
      ))}
    </div>
  );
}
