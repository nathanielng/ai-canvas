import '../styles/ObjectNode.css';

export default function ObjectNode({
  object,
  isSelected,
  onMouseDown,
  onDelete,
  onUpdateProperties,
}) {
  const renderObject = () => {
    const style = {
      position: 'absolute',
      left: `${object.position.x}px`,
      top: `${object.position.y}px`,
      width: `${object.size.width}px`,
      height: `${object.size.height}px`,
      backgroundColor: object.properties.fill || '#e8f4f8',
      border: `${object.properties.strokeWidth || 2}px solid ${
        object.properties.stroke || '#333'
      }`,
      borderRadius: `${object.properties.borderRadius || 0}px`,
      opacity: object.properties.opacity || 1,
      cursor: 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      boxShadow: isSelected ? '0 0 0 2px #0066ff' : 'none',
    };

    switch (object.type) {
      case 'text':
        return (
          <div
            className="object-node text-node"
            style={style}
            onMouseDown={onMouseDown}
          >
            <p
              style={{
                fontSize: `${object.properties.fontSize || 14}px`,
                color: object.properties.textColor || '#000',
                textAlign: object.properties.textAlign || 'left',
                margin: 0,
                padding: '8px',
              }}
            >
              {object.properties.content || 'Text'}
            </p>
          </div>
        );

      case 'container':
        return (
          <div
            className="object-node container-node"
            style={style}
            onMouseDown={onMouseDown}
          >
            <div className="container-label">
              {object.children.length} items
            </div>
          </div>
        );

      case 'rectangle':
      default:
        return (
          <div
            className="object-node rectangle-node"
            style={style}
            onMouseDown={onMouseDown}
          />
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
            top: `${object.position.y - 30}px`,
            display: 'flex',
            gap: '4px',
          }}
        >
          <button className="btn btn-small btn-danger" onClick={onDelete}>
            🗑
          </button>
        </div>
      )}
    </>
  );
}
