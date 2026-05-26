import '../styles/ObjectNode.css';
import { getObjectIcon } from '../utils/icons.js';

export default function ObjectNode({
  object,
  isSelected,
  onMouseDown,
  onDelete,
  onUpdateProperties,
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

  return (
    <>
      {renderObject()}
      {isSelected && (
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
            className="btn btn-small btn-danger"
            onClick={onDelete}
            title="Delete (Delete key)"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </>
  );
}
