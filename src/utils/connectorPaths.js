// Generate SVG paths for connectors based on style and port positions

export function getConnectorPath(sourcePos, targetPos, style = 'elbow') {
  const x1 = sourcePos.x;
  const y1 = sourcePos.y;
  const x2 = targetPos.x;
  const y2 = targetPos.y;

  switch (style) {
    case 'straight':
      return `M ${x1} ${y1} L ${x2} ${y2}`;

    case 'curved':
      return getCurvedPath(x1, y1, x2, y2);

    case 'elbow':
    default:
      return getElbowPath(x1, y1, x2, y2);
  }
}

function getCurvedPath(x1, y1, x2, y2) {
  // Bezier curve with control points at midpoint
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Control points offset perpendicular to line
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(dist * 0.3, 50);

  const cx1 = x1 + (x2 - x1) * 0.33;
  const cy1 = y1 + (y2 - y1) * 0.33;
  const cx2 = x1 + (x2 - x1) * 0.67;
  const cy2 = y1 + (y2 - y1) * 0.67;

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function getElbowPath(x1, y1, x2, y2) {
  // Simple single-elbow routing: clean L-shaped connectors
  // Route: 50% in one direction, then complete the other direction
  // Adapts to which direction has more distance

  const dx = x2 - x1;
  const dy = y2 - y1;

  // If more horizontal distance, route vertically first
  if (Math.abs(dx) > Math.abs(dy)) {
    const midY = y1 + dy * 0.5;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  } else {
    // Otherwise route horizontally first
    const midX = x1 + dx * 0.5;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }
}

export function getPortPosition(object, layoutDirection, portId) {
  const { position, size } = object;
  const centerX = position.x + size.width / 2;
  const centerY = position.y + size.height / 2;

  // Port positions based on type and layout
  const ports = {
    // Top/bottom ports (vertical layout)
    top: { x: centerX, y: position.y },
    bottom: { x: centerX, y: position.y + size.height },
    // Left/right ports (horizontal layout)
    left: { x: position.x, y: centerY },
    right: { x: position.x + size.width, y: centerY },
  };

  return ports[portId] || { x: centerX, y: centerY };
}
