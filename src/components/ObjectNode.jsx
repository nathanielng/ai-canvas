import '../styles/ObjectNode.css';
import { getObjectIcon } from '../utils/icons.js';

export default function ObjectNode({
  object,
  layoutDirection = 'top-to-bottom',
  isSelected,
  onMouseDown,
  onDelete,
  onUpdateProperties,
  onDuplicate,
  onStartConnection,
  onConnectionDropOnPort,
  onStartResize,
  isConnectionActive,
}) {
  const headerStyle = {
    background: 'var(--color-surface)',
    padding: '8px 12px',
    borderRadius: 'calc(var(--border-radius) - 2px) calc(var(--border-radius) - 2px) 0 0',
    color: 'var(--color-text)',
    fontWeight: 600,
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
  };

  const bodyStyle = {
    padding: '12px',
    fontSize: '12px',
    overflow: 'hidden',
  };

  const baseStyle = {
    position: 'absolute',
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    minHeight: `${object.size.height}px`,
    backgroundColor: object.properties.fill || 'var(--color-surface-elevated)',
    border: `var(--border-width) solid ${object.properties.stroke || 'var(--color-accent)'}`,
    borderRadius: 'var(--border-radius)',
    opacity: object.properties.opacity || 1,
    cursor: 'move',
    userSelect: 'none',
    boxShadow: isSelected ? `0 0 0 3px var(--color-accent)` : 'var(--shadow-small)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s ease',
  };

  const renderConnectorPorts = () => {
    const ports = [];
    const portRadius = 6;
    const portColor = '#6fb3ff'; // Slightly lighter accent

    if (layoutDirection === 'top-to-bottom') {
      // Top port
      ports.push({
        id: 'top',
        x: object.position.x + object.size.width / 2,
        y: object.position.y - portRadius,
      });
      // Bottom port
      ports.push({
        id: 'bottom',
        x: object.position.x + object.size.width / 2,
        y: object.position.y + object.size.height + portRadius,
      });
    } else if (layoutDirection === 'left-to-right') {
      // Left port
      ports.push({
        id: 'left',
        x: object.position.x - portRadius,
        y: object.position.y + object.size.height / 2,
      });
      // Right port
      ports.push({
        id: 'right',
        x: object.position.x + object.size.width + portRadius,
        y: object.position.y + object.size.height / 2,
      });
    }

    const shouldShowPorts = isSelected || isConnectionActive; // Show on selection or when dragging connection

    return shouldShowPorts
      ? ports.map((port) => (
          <div
            key={`port-${port.id}`}
            className="connector-port"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (onStartConnection) {
                onStartConnection(object.id, port.id, e);
              }
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              if (onConnectionDropOnPort && isConnectionActive) {
                onConnectionDropOnPort(object.id, port.id);
              }
            }}
            style={{
              position: 'absolute',
              left: `${port.x}px`,
              top: `${port.y}px`,
              width: `${portRadius * 2}px`,
              height: `${portRadius * 2}px`,
              borderRadius: '50%',
              background: portColor,
              border: '2px solid var(--color-background)',
              cursor: 'crosshair',
              transform: 'translate(-50%, -50%)',
              zIndex: 999,
            }}
          />
        ))
      : null;
  };

  const renderObject = () => {
    switch (object.type) {
      case 'text':
        return (
          <div className="object-node text-node" style={baseStyle} onMouseDown={onMouseDown}>
            <div style={headerStyle}>
              <span>{getObjectIcon('text')} Text</span>
            </div>
            <div style={bodyStyle}>
              <p
                style={{
                  fontSize: `${object.properties.fontSize || 14}px`,
                  color: object.properties.textColor || 'var(--color-text)',
                  textAlign: object.properties.textAlign || 'left',
                  margin: 0,
                  wordWrap: 'break-word',
                }}
              >
                {object.properties.content || 'Click to edit...'}
              </p>
            </div>
          </div>
        );

      case 'container':
        return (
          <div className="object-node container-node" style={baseStyle} onMouseDown={onMouseDown}>
            <div style={headerStyle}>
              <span>{getObjectIcon('container')} Container</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                {object.children.length} items
              </span>
            </div>
            <div style={bodyStyle}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                Drop objects here to group them
              </div>
            </div>
          </div>
        );

      case 'circle':
        return (
          <div
            className="object-node circle-node"
            style={{ ...baseStyle, borderRadius: '50%' }}
            onMouseDown={onMouseDown}
          >
            <div style={{ ...headerStyle, borderRadius: 0 }}>
              <span>{getObjectIcon('circle')} Circle</span>
            </div>
            <div style={bodyStyle}>
              <div style={{ color: 'var(--color-text-muted)' }}>
                ⭕ Start/End
              </div>
            </div>
          </div>
        );

      case 'diamond':
        return (
          <div
            className="object-node diamond-node"
            style={{
              ...baseStyle,
              borderRadius: 0,
              transform: `rotate(45deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={onMouseDown}
          >
            <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
              <div style={{ ...headerStyle, border: 'none', background: 'transparent' }}>
                <span>{getObjectIcon('diamond')} Decision</span>
              </div>
            </div>
          </div>
        );

      case 'parallelogram':
        return (
          <div
            className="object-node parallelogram-node"
            style={{
              ...baseStyle,
              borderRadius: 0,
              transform: `skewX(-20deg)`,
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseDown={onMouseDown}
          >
            <div style={{ ...headerStyle, transform: `skewX(20deg)` }}>
              <span>{getObjectIcon('parallelogram')} I/O</span>
            </div>
            <div style={{ ...bodyStyle, transform: `skewX(20deg)` }}>
              <div style={{ color: 'var(--color-text-muted)' }}>
                Input/Output
              </div>
            </div>
          </div>
        );

      case 'rectangle':
      default:
        return (
          <div className="object-node rectangle-node" style={baseStyle} onMouseDown={onMouseDown}>
            <div style={headerStyle}>
              <span>{getObjectIcon('rectangle')} Rectangle</span>
            </div>
            <div style={bodyStyle}>
              <div style={{ color: 'var(--color-text-muted)' }}>
                {object.size.width} × {object.size.height}px
              </div>
            </div>
          </div>
        );
    }
  };

  const renderDragHandle = (position) => {
    return (
      <div
        key={`handle-${position}`}
        className="drag-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onStartResize) {
            onStartResize(object.id, position, e);
          }
        }}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          border: '2px solid var(--color-background)',
          cursor: position.includes('left') ? (position.includes('top') ? 'nwse-resize' : 'nesw-resize') : (position.includes('top') ? 'nesw-resize' : 'nwse-resize'),
          ...(() => {
            const handlePositions = {
              'top-left': { left: '-5px', top: '-5px' },
              'top-right': { right: '-5px', top: '-5px' },
              'bottom-left': { left: '-5px', bottom: '-5px' },
              'bottom-right': { right: '-5px', bottom: '-5px' },
            };
            return handlePositions[position] || {};
          })(),
        }}
      />
    );
  };

  return (
    <>
      {renderObject()}
      {renderConnectorPorts()}
      {isSelected && (
        <>
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) =>
            renderDragHandle(pos)
          )}
          <div
            className="object-controls"
            style={{
              position: 'absolute',
              left: `${object.position.x}px`,
              top: `${object.position.y - 35}px`,
              display: 'flex',
              gap: '6px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'calc(var(--border-radius) / 2)',
              padding: '4px 6px',
              boxShadow: 'var(--shadow-small)',
            }}
          >
            <button
              className="btn btn-small"
              onClick={onDuplicate}
              title="Duplicate (Ctrl+C then Ctrl+V)"
            >
              📋 Copy
            </button>
            <button
              className="btn btn-small btn-danger"
              onClick={onDelete}
              title="Delete (Delete key)"
            >
              🗑 Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}
