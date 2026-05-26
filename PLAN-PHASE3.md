# Phase 3: Flow Diagram UI Polish & Configuration

**Status**: Planning  
**Target**: Professional flow diagram UI with polished styling and configurable colors  
**Milestone**: Production-ready diagramming tool with polished UX

---

## Overview

**Goal**: Transform Phase 1's minimal UI into a professional, polished flow diagram tool.

**Scope**:
- Phase 3A: Node styling, connectors, text editing (1 week)
- Phase 3B: Additional shapes (circles, diamonds) (3-4 days)
- Phase 3C: Interaction polish (copy/paste, undo/redo, shortcuts) (1 week)

**Key Insight**: Professional flow diagram design uses rounded rectangles, clear visual hierarchy, and dark theme with accent colors for better UX.

---

## Design Analysis: Professional Flow Diagram UI

### What Works Well

1. **Node Design**
   - Rounded rectangle containers (borderRadius: 8px)
   - Header with title/actions (dark background)
   - Distinct sections (code, input, output)
   - Clear visual hierarchy

2. **Color Scheme**
   - Background: #1a1a2e (very dark blue)
   - Secondary bg: #16213e (slightly lighter)
   - Accent: #4a9eff (cyan/teal)
   - Text: #fff with varied opacity
   - Highlights: #4caf50 (green for execute), #ffd580 (yellow for output)

3. **Connectors**
   - Clean strokes with arrows
   - Animated appearance
   - Clear source→target flow

4. **Interactions**
   - Hover effects on buttons
   - Cursor feedback (grab → grabbing)
   - Clear affordances (button states)

### What We'll Adapt

✅ Node styling (rounded rectangles)  
✅ Color scheme (dark + accent)  
✅ Header with title/actions  
✅ Section labels  
✅ Connector visualization  
❌ Python code editor (not needed for basic diagrams)  
❌ Manual input fields (replace with property editor)  

---

## Architecture: Configurable Colors

### Approach: JSON Theme + CSS Variables

**Why JSON over CSS**:
- ✅ Easy to load dynamically
- ✅ Version-controllable with diagrams
- ✅ Can be embedded in canvas metadata
- ✅ Can be switched at runtime
- ✅ Enables skill-based theming

**Why use CSS variables**:
- ✅ Efficient rendering
- ✅ No inline styles
- ✅ Easy to override in dev tools
- ✅ Works with existing CSS

**Structure**: 

```json
{
  "theme": "default",
  "colors": {
    "primary": "#1a1a2e",
    "secondary": "#16213e",
    "accent": "#4a9eff",
    "accent-light": "#6fb3ff",
    "success": "#4caf50",
    "warning": "#ffd580",
    "error": "#ff6b6b",
    "text": "#ffffff",
    "text-muted": "rgba(255, 255, 255, 0.6)",
    "border": "#333333"
  },
  "shapes": {
    "nodeRadius": 8,
    "borderWidth": 2,
    "spacing": 12
  }
}
```

**Implementation**:

1. Store theme in `src/theme.json` (default)
2. On app load, convert JSON to CSS variables
3. Apply to root element: `document.documentElement.style.setProperty('--color-primary', ...)`
4. CSS uses variables: `background: var(--color-primary)`
5. Users can override by loading different theme JSON

**User Control**:
- Global default: `src/theme.json`
- Per-canvas: stored in canvas metadata (`canvas.metadata.theme`)
- Via skill: `setTheme(file, 'dark')` or `setTheme(file, customThemeJSON)`

---

## Phase 3 Implementation Plan

### Phase 3A: Visual Polish (Week 1)

#### 1. Node Redesign
**Goal**: Professional rounded rectangle nodes

**Components**:
- [ ] Update ObjectNode.jsx styling
  - Border-radius: 8px
  - Better borders (2px, accent color on select)
  - Header section with title + icon
  - Section labels for properties
  - Better shadows on hover

**Before** (current):
```
┌─────────────────────┐
│ Rectangle @ (x, y)  │
└─────────────────────┘
```

**After** (Phase 3A):
```
┌──────────────────────────┐
│ 📦 Rectangle             │ (header with icon)
├──────────────────────────┤
│ Position: (100, 100)     │ (section labels + values)
│ Size: 200x150            │
│ Color: #e8f4f8           │
│ [Edit Properties] [Delete]
└──────────────────────────┘
```

#### 2. Connector Visualization
**Goal**: Curved/elbow connectors with arrows for clear data flow

**Changes**:
- [ ] Replace straight SVG lines with Bezier curves
- [ ] Add arrowheads (more polished)
- [ ] Hover effects (highlight connector)
- [ ] Delete button on hover

**Options**:
- Curved connectors (more organic, harder to read)
- Elbow connectors (L-shaped, clearer flow)
- Straight (current, simplest)

**Recommendation**: Start with elbow (top-to-bottom layout) or curved (organic look). Make it configurable.

#### 3. Theme System
**Goal**: Load colors from JSON, apply via CSS variables

**Components**:
- [ ] Create `src/theme.json` with default colors
- [ ] Create `src/hooks/useTheme.js` to load and apply theme
- [ ] Update all CSS to use CSS variables
- [ ] Add theme to canvas metadata

**Changes**:
```javascript
// src/App.jsx
const { theme } = useTheme(canvas.metadata.theme);

// src/hooks/useTheme.js
export function useTheme(themeName = 'default') {
  const [theme, setTheme] = useState(loadTheme(themeName));
  
  useEffect(() => {
    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);
  
  return { theme, setTheme };
}
```

#### 4. UI Components
**Goal**: Better button/input styling

**Components**:
- [ ] Update button styles (nice hover effects and visual feedback)
- [ ] Better selected state (blue glow, not just outline)
- [ ] Improved sidebar appearance
- [ ] Header bar redesign

**Colors to use**:
- Primary buttons: `--color-accent`
- Danger buttons: `--color-error`
- Hover: lighter shade
- Disabled: muted

---

### Phase 3B: Additional Shapes (3-4 days)

**Goal**: Add circle, diamond, parallelogram for flow diagram symbols

**Standard Flow Diagram Shapes**:
- Rectangle (process) ✅ existing
- Circle (terminator/start-end)
- Diamond (decision)
- Parallelogram (input/output)
- Rounded rectangle (alternative process)

**Implementation**:

```javascript
// core/schema.js - add to OBJECT_TYPES
const OBJECT_TYPES = new Set(['rectangle', 'circle', 'diamond', 'parallelogram', 'text', 'container']);

// src/components/ObjectNode.jsx - add renderer for each shape
const shapeRenderers = {
  rectangle: (obj, style) => <div style={{...style, borderRadius: 8}} />,
  circle: (obj, style) => <div style={{...style, borderRadius: '50%'}} />,
  diamond: (obj, style) => <div style={{...style, transform: 'rotate(45deg)'}} />,
  parallelogram: (obj, style) => <div style={{...style, transform: 'skewX(-20deg)'}} />,
};
```

**UI Changes**:
- [ ] Add shape selector to Sidebar
- [ ] Properties editor updates based on shape
- [ ] All shapes support same properties (color, size, position)

---

### Phase 3C: Interaction Polish (1 week)

#### 1. Text Editing
**Goal**: Double-click to edit text in place

**Components**:
- [ ] Detect double-click on object
- [ ] Show text input overlay
- [ ] Blur or Escape to save
- [ ] Keyboard focus management

```javascript
const [editingId, setEditingId] = useState(null);

<ObjectNode
  onDoubleClick={(id) => setEditingId(id)}
  isEditing={editingId === id}
/>
```

#### 2. Copy/Paste
**Goal**: Duplicate objects with Ctrl+C / Ctrl+V

**Components**:
- [ ] Clipboard state: `const [clipboard, setClipboard] = useState(null)`
- [ ] Keyboard listener: `onKeyDown={(e) => { if (e.ctrlKey && e.key === 'c') copy() }}`
- [ ] Paste offset: new objects slightly offset from original
- [ ] Works with connectors: preserve source/target relationships (with offset)

#### 3. Undo/Redo
**Goal**: Track state changes, allow undo/redo

**Options**:
- **Simple**: Keep array of canvas states, track pointer
- **Complex**: Command pattern with undoable operations

**Recommendation**: Simple array for Phase 3
```javascript
const [history, setHistory] = useState([initialCanvas]);
const [historyIndex, setHistoryIndex] = useState(0);

const undo = () => setHistoryIndex(Math.max(0, historyIndex - 1));
const redo = () => setHistoryIndex(Math.min(history.length - 1, historyIndex + 1));
```

**Size limit**: Keep last 50 states to avoid memory issues

#### 4. Keyboard Shortcuts
**Goal**: Delete, duplicate, select all

| Key | Action |
|-----|--------|
| Delete | Remove selected object |
| Ctrl+D | Duplicate selected |
| Ctrl+A | Select all |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Escape | Deselect |

#### 5. Alignment Tools
**Goal**: Snap-to-grid, distribute, align

**Phase 3C scope**: Basic snap-to-grid (optional, lower priority)

**Snap-to-grid**:
```javascript
const snapToGrid = (x, y, gridSize = 10) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
});
```

---

## File Structure

```
canvas/
├── src/
│   ├── App.jsx                    # Main app
│   ├── theme.json                 # Default theme (NEW)
│   ├── hooks/
│   │   ├── useCanvasEngine.js
│   │   └── useTheme.js            # Load/apply theme (NEW)
│   ├── components/
│   │   ├── Canvas.jsx
│   │   ├── ObjectNode.jsx         # Enhanced styling
│   │   ├── Sidebar.jsx            # Better UI
│   │   ├── Connectors.jsx         # NEW: Better visualization
│   │   └── PropertyEditor.jsx     # NEW: Edit object properties
│   ├── styles/
│   │   ├── App.css                # Updated with CSS variables
│   │   ├── ObjectNode.css
│   │   ├── Sidebar.css
│   │   └── theme.css              # CSS variable defaults
│   └── utils/
│       ├── clipboard.js           # Copy/paste helpers (NEW)
│       ├── history.js             # Undo/redo logic (NEW)
│       └── shortcuts.js           # Keyboard handling (NEW)
├── skills/
│   └── canvas/
│       └── index.js               # Add setTheme() function
├── PLAN-PHASE3.md
└── ...
```

---

## Color Theme Specification

### Default Theme

```json
{
  "name": "Canvas Default",
  "description": "Professional dark theme for flow diagrams",
  "colors": {
    "background": "#1a1a2e",
    "surface": "#16213e",
    "surface-elevated": "#2a2a3e",
    "border": "#333333",
    "text": "#ffffff",
    "text-secondary": "#b0b0b0",
    "text-muted": "rgba(255, 255, 255, 0.5)",
    "accent": "#4a9eff",
    "accent-light": "#6fb3ff",
    "accent-dark": "#2a7dd8",
    "success": "#4caf50",
    "warning": "#ffd580",
    "error": "#ff6b6b",
    "info": "#4a9eff"
  },
  "shapes": {
    "borderRadius": 8,
    "borderWidth": 2,
    "shadowSmall": "0 2px 4px rgba(0, 0, 0, 0.3)",
    "shadowLarge": "0 8px 16px rgba(0, 0, 0, 0.4)"
  }
}
```

### Alternative Themes (Future)

- **Light Theme**: Light background, dark text
- **High Contrast**: Accessibility-focused
- **Colorblind**: Safe color palette
- **Minimal**: Grayscale + accent

---

## Implementation Order

**Week 1 (Phase 3A)**:
1. Create theme system (`useTheme`, `theme.json`)
2. Update CSS to use variables
3. Redesign ObjectNode (rounded, headers, sections)
4. Update connector styling
5. Polish buttons and sidebar

**Week 2 (Phase 3B + C)**:
6. Add circle, diamond, parallelogram shapes
7. Implement text double-click editing
8. Add copy/paste with Ctrl+C/Ctrl+V
9. Add undo/redo
10. Implement keyboard shortcuts
11. Add snap-to-grid (optional)

---

## Design Mockups

### Node Before/After

**Before** (Phase 1):
```
┌──────────────────────┐
│ rectangle            │
│ @ (100, 100)         │
│ 100x100              │
│ [Delete]             │
└──────────────────────┘
```

**After** (Phase 3A):
```
╭──────────────────────────╮
│ 📦 Rectangle             │ ← Header with icon
├──────────────────────────┤
│ Position: (100, 100)     │ ← Organized sections
│ Size: 100 × 100          │
│ Color: #e8f4f8           │
│ ─────────────────────    │
│ [Edit] [Copy] [Delete] ✕ │ ← Action buttons
╰──────────────────────────╯
```

### Sidebar Shapes

```
┌──────────────────┐
│ Add Object       │
├──────────────────┤
│ ▭ Rectangle      │ (draggable)
│ ● Circle         │
│ ◊ Diamond        │
│ ▶ Parallelogram  │
│ ⊞ Container      │
│ T Text           │
└──────────────────┘
```

---

## Success Criteria

1. ✅ Nodes render with rounded corners and headers
2. ✅ Connectors are curved or elbow-style with arrows
3. ✅ Colors loaded from `theme.json` via CSS variables
4. ✅ Double-click to edit text in place
5. ✅ Copy/paste with Ctrl+C / Ctrl+V
6. ✅ Undo/redo works (Ctrl+Z / Ctrl+Y)
7. ✅ All keyboard shortcuts functional
8. ✅ Circle, diamond, parallelogram shapes render correctly
9. ✅ UI has professional, polished aesthetic
10. ✅ Theme can be customized and persisted

---

## Open Questions

1. **Connectors**: Curved or elbow? Animated?
2. **Grid snap**: Always enabled or toggle-able?
3. **Shape icons**: Use text symbols or custom SVG?
4. **Theme UI**: Show theme selector in sidebar or menu?
5. **History limit**: 50 states? 100? Configurable?
6. **Keyboard prefix**: Ctrl (Windows/Linux) or Cmd (Mac)?

---

## Future Enhancements (Phase 4+)

- **Smart connectors**: Auto-avoid overlaps
- **Grouping**: Multi-select and group objects
- **Locking**: Lock objects to prevent accidental moves
- **Layers panel**: Show/hide, reorder objects
- **Export**: Render to PNG, SVG, PDF
- **Comments**: Add notes to objects/connectors
- **Collaborative editing**: Multi-user real-time sync
- **Templates**: Pre-built diagram types (org chart, flowchart, etc.)

---

## Dependencies

**New npm packages** (optional):
- `react-hotkeys-hook`: Simpler keyboard handling
- `zustand`: State management (if history grows complex)

**No new packages required**: Can implement with React hooks alone.

---

## Effort Estimate

| Phase | Component | Effort | Timeline |
|-------|-----------|--------|----------|
| 3A | Theme system | 1-2 days | Mon-Tue |
| 3A | Node redesign | 2-3 days | Wed-Thu |
| 3A | Connectors | 1 day | Fri |
| 3B | Additional shapes | 2-3 days | Mon-Tue |
| 3C | Text editing | 1 day | Wed |
| 3C | Copy/paste | 1 day | Thu |
| 3C | Undo/redo | 1 day | Fri |
| 3C | Shortcuts + polish | 1-2 days | Mon-Tue |

**Total**: ~3 weeks for full Phase 3

---

## Recommendation

**Start with Phase 3A** (theme + visual polish). This gets you:
- Professional, polished appearance
- Customizable colors (opens up theming for future)
- Better UX (headers, sections, icons)

Then **Phase 3B/C** adds interaction polish (copy/paste, undo/redo) that users will love.

By end of Phase 3, you'll have a professional, polished flow diagram tool ready for users.
