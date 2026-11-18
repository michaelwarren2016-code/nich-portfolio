D67 incremental update patch
=============================

Apply over the existing D66 website project.

Included:
- product-viewer.js
- styles.css

Fix:
The product-next arrow is nested inside the interactive 3D viewer. The viewer
was treating pointer presses on the arrow as drag gestures and capturing the
pointer, which can prevent the button's click from firing.

The viewer now ignores pointerdown events originating from #product-next.
The arrow is explicitly kept above the canvas with pointer-events enabled,
a higher stacking order, and touch-action: manipulation.

The product carousel transition and all D66 product copy/model behaviour are
otherwise unchanged.

Installation:
1. Extract over the existing D66 project.
2. Replace product-viewer.js and styles.css only.
3. Keep the forest background, other gradients, and both GLB files unchanged.
