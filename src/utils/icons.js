// Icon mappings for object types
export function getObjectIcon(type) {
  const icons = {
    rectangle: '📦',
    text: '📝',
    container: '🗂️',
    circle: '⭕',
    diamond: '◊',
    parallelogram: '▶',
    line: '─',
  };
  return icons[type] || '◆';
}

export function getIconForAction(action) {
  const actionIcons = {
    add: '➕',
    delete: '🗑',
    edit: '✏️',
    copy: '📋',
    paste: '📄',
    undo: '↶',
    redo: '↷',
    save: '💾',
    load: '📂',
    settings: '⚙️',
  };
  return actionIcons[action] || '▸';
}
