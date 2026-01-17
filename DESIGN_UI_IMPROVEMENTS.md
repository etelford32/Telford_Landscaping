# Design Tool UI Improvements

## Overview

Comprehensive UI enhancements for the 3D design tool, embodying the Kantian principle:
**"Maximum utility with minimum footprint"** - Make Kant proud! 🎯

## New Components

### 1. DraggablePanel 🎨
**Location:** `components/design/DraggablePanel.tsx`

A universal wrapper component for creating draggable, resizable, and minimizable panels.

**Features:**
- ✅ Fully draggable with grip handle
- ✅ Resizable from all edges and corners
- ✅ Minimizable to header only
- ✅ Maximizable to full screen
- ✅ ESC key to close
- ✅ Saves position/size to localStorage
- ✅ Configurable colors, sizes, and z-index

**Usage:**
```tsx
<DraggablePanel
  title="My Panel"
  icon={<Icon />}
  defaultPosition={{ x: 100, y: 100 }}
  defaultSize={{ width: 320, height: 400 }}
  resizable={true}
  minimizable={true}
  closable={true}
  onClose={() => {}}
  id="unique-panel-id"
>
  {/* Your content */}
</DraggablePanel>
```

---

### 2. TutorialPanel 📚
**Location:** `components/design/TutorialPanel.tsx`

An interactive, dismissable tutorial system that guides users through the design tool.

**Features:**
- ✅ Step-by-step tutorial with progress bar
- ✅ Dismissable with "Don't show again" option
- ✅ Expandable/collapsible
- ✅ ESC key to hide, F1 to show
- ✅ Keyboard shortcut hints
- ✅ Remembers dismissal state in localStorage

**Usage:**
```tsx
<TutorialPanel onClose={() => setShowTutorial(false)} />

{/* Or use the compact help button */}
<HelpButton onClick={() => setShowTutorial(true)} />
```

---

### 3. GridClickEditor 🎯
**Location:** `components/design/GridClickEditor.tsx`

Interactive 3D grid layer for click-based object placement with visual feedback.

**Features:**
- ✅ Visible hover preview on grid
- ✅ Coordinate display
- ✅ Automatic grid snapping
- ✅ X/Z axis guides
- ✅ Bounds checking
- ✅ Glowing placement indicator
- ✅ Optional grid point visualization

**Usage:**
```tsx
<GridClickEditor
  gridSize={30}
  cellSize={1}
  onGridClick={(pos) => placePlant(pos)}
  enabled={true}
  showPreview={true}
/>

{/* Optional: Show grid intersection points */}
<GridPointsVisualizer
  gridSize={30}
  cellSize={1}
  enabled={showGridPoints}
/>
```

---

### 4. DesignHub 🛠️
**Location:** `components/design/DesignHub.tsx`

Comprehensive bottom toolbar serving as the central command center for all design operations.

**Features:**
- ✅ Edit modes: Select, Move, Rotate, Scale
- ✅ Undo/Redo with visual state
- ✅ Quick actions (Copy, Delete, Reset Camera)
- ✅ File operations (Save, Load, Export)
- ✅ Grid controls (size, snap, visibility)
- ✅ Timeline slider (30-year growth)
- ✅ Panel toggles (Precision, Properties, Help)
- ✅ Collapsible/expandable
- ✅ Selection count display

**Usage:**
```tsx
<DesignHub
  selectedCount={selectedPlants.length}
  editMode={editMode}
  onEditModeChange={setEditMode}
  showGrid={showGrid}
  onToggleGrid={() => setShowGrid(!showGrid)}
  gridSize={gridSize}
  onGridSizeChange={setGridSize}
  snapToGrid={snapToGrid}
  onToggleSnap={() => setSnapToGrid(!snapToGrid)}
  age={age}
  onAgeChange={setAge}
  onUndo={handleUndo}
  onRedo={handleRedo}
  canUndo={canUndo}
  canRedo={canRedo}
  onSave={handleSave}
  onLoad={handleLoad}
  onExport={handleExport}
  onCopy={handleCopy}
  onDelete={handleDelete}
  canCopy={selectedCount > 0}
  canDelete={selectedCount > 0}
  onResetCamera={resetCamera}
  onFocusSelected={focusOnSelected}
  onTogglePrecision={() => setShowPrecision(!showPrecision)}
  onToggleProperties={() => setShowProperties(!showProperties)}
  onToggleHelp={() => setShowHelp(!showHelp)}
/>
```

---

### 5. EnhancedPlantToolbox 🌿
**Location:** `components/design/EnhancedPlantToolbox.tsx`

Draggable, resizable plant library with improved UX.

**Features:**
- ✅ Fully draggable and resizable
- ✅ Minimizable to save screen space
- ✅ ESC key to close
- ✅ Search functionality
- ✅ Category filtering
- ✅ Native plant filter
- ✅ Compact, information-dense cards
- ✅ Drag-and-drop support

**Usage:**
```tsx
<EnhancedPlantToolbox
  onPlantSelect={handlePlantSelect}
  selectedPlantId={selectedPlantId}
  visible={showPlantToolbox}
  onClose={() => setShowPlantToolbox(false)}
/>
```

---

### 6. EnhancedPrecisionEdit 📐
**Location:** `components/design/EnhancedPrecisionEdit.tsx`

Draggable, resizable precision editing panel.

**Features:**
- ✅ Fully draggable and resizable
- ✅ Minimizable and maximizable
- ✅ ESC key to close
- ✅ Wraps existing PrecisionEditPanel
- ✅ Saves position to localStorage

**Usage:**
```tsx
<EnhancedPrecisionEdit
  data={precisionData}
  onChange={setPrecisionData}
  onClose={() => setShowPrecision(false)}
  visible={showPrecision}
  snapToGrid={snapToGrid}
  gridSize={gridSize}
/>
```

---

### 7. SelectionBox ✨
**Location:** `components/design/SelectionBox.tsx`

Enhanced visual selection feedback for selected objects.

**Features:**
- ✅ Bounding box visualization
- ✅ Corner markers
- ✅ Center point indicator
- ✅ Dimension labels (W×H×D)
- ✅ Selection count badge
- ✅ Multi-select support
- ✅ Individual object highlights

**Usage:**
```tsx
<SelectionBox
  selectedObjects={selectedPlants}
  showBounds={true}
  showCenter={true}
  showDimensions={true}
  color="#4ade80"
/>

{/* Individual object highlight */}
<ObjectHighlight
  position={[plant.position.x, plant.position.y, plant.position.z]}
  size={1}
  color="#4ade80"
  isActive={plant.selected}
/>
```

---

## Design Principles Applied

### 1. Kant's Categorical Imperative in UI
"Act only according to that maxim whereby you can at the same time will that it should become a universal law."

**Translation to UI:**
- Every component should be universally reusable
- No component should depend on specific context
- All panels follow the same interaction patterns

### 2. Maximum Utility, Minimum Footprint
- Panels start small but can expand
- Minimize to save space
- Collapse toolbars when not needed
- ESC key universally closes panels
- Remember user preferences

### 3. Progressive Disclosure
- Show basic controls by default
- Advanced features available on demand
- Tutorial for newcomers, hidden for experts
- Context-sensitive help

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `ESC` | Close active panel |
| `F1` | Show/hide tutorial |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save design |
| `Ctrl+C` | Copy selected |
| `Del` | Delete selected |
| `G` | Toggle grid snap |

---

## Integration Guide

### Step 1: Add to your design canvas

```tsx
import { useState } from 'react';
import DraggablePanel from '@/components/design/DraggablePanel';
import TutorialPanel from '@/components/design/TutorialPanel';
import GridClickEditor from '@/components/design/GridClickEditor';
import DesignHub from '@/components/design/DesignHub';
import EnhancedPlantToolbox from '@/components/design/EnhancedPlantToolbox';
import SelectionBox from '@/components/design/SelectionBox';

function DesignCanvas() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPlantToolbox, setShowPlantToolbox] = useState(true);
  const [showPrecision, setShowPrecision] = useState(false);

  return (
    <>
      <Canvas>
        <GridClickEditor
          onGridClick={handleGridClick}
          enabled={editMode === 'place'}
        />

        <SelectionBox
          selectedObjects={selectedPlants}
        />

        {/* Your scene */}
      </Canvas>

      {showTutorial && <TutorialPanel onClose={() => setShowTutorial(false)} />}

      {showPlantToolbox && (
        <EnhancedPlantToolbox
          onPlantSelect={handlePlantSelect}
          onClose={() => setShowPlantToolbox(false)}
        />
      )}

      <DesignHub
        {/* ... all props */}
      />
    </>
  );
}
```

### Step 2: Handle grid clicks

```tsx
const handleGridClick = (position: { x: number; y: number; z: number }) => {
  if (selectedPlantSpecies) {
    const newPlant = {
      id: `plant-${Date.now()}`,
      speciesId: selectedPlantSpecies.id,
      position,
      rotation: 0,
      scale: 1,
      age: 5,
    };

    setPlants([...plants, newPlant]);
  }
};
```

### Step 3: Wire up DesignHub actions

```tsx
const handleUndo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1);
    setPlants(history[historyIndex - 1]);
  }
};

const handleSave = () => {
  const data = { plants, structures, age };
  localStorage.setItem('design', JSON.stringify(data));
};
```

---

## Performance Considerations

### Minimizing Renders
- Panels save state to localStorage (not React state)
- Drag operations are throttled
- Selection updates are batched
- Grid preview uses `useFrame` for efficiency

### Memory Management
- Panels remove event listeners on unmount
- LocalStorage keys are scoped per panel
- Resize handles are conditionally rendered

---

## Customization

### Custom Panel Colors

```tsx
<DraggablePanel
  headerColor="from-blue-600 to-blue-700"
  {/* other props */}
/>
```

### Custom Grid Colors

```tsx
<GridClickEditor
  previewColor="#ff6b6b"
  {/* other props */}
/>
```

### Custom Selection Colors

```tsx
<SelectionBox
  color="#ff6b6b"
  {/* other props */}
/>
```

---

## Accessibility

- ✅ Keyboard navigation (Tab, ESC, Enter)
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators
- ✅ High contrast mode compatible
- ✅ Screen reader friendly
- ✅ Keyboard shortcuts documented

---

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (limited drag/resize)

---

## Future Enhancements

- [ ] Multi-monitor support
- [ ] Touch gesture support
- [ ] Panel docking/snapping
- [ ] Workspace layouts
- [ ] Panel groups/tabs
- [ ] Customizable shortcuts
- [ ] Theme customization
- [ ] Panel animation preferences

---

## Troubleshooting

### Panel not saving position
- Check if `id` prop is provided
- Verify localStorage is enabled
- Clear localStorage and retry

### Drag not working
- Ensure pointer events are not disabled
- Check z-index conflicts
- Verify event handlers are bound

### Grid clicks not registering
- Check if `enabled` is true
- Verify raycaster is working
- Check mesh visibility

---

## Contributing

When adding new draggable panels:

1. Use `DraggablePanel` wrapper
2. Provide unique `id` for persistence
3. Support ESC key closure
4. Add keyboard shortcuts documentation
5. Follow the minimal design aesthetic
6. Test on different screen sizes

---

**Built with the spirit of Kantian efficiency** ⚡
*Maximum utility. Minimum footprint. Pure function.*
