D62 incremental update patch
=============================

Apply over the existing D61 website project.

Included:
- product-viewer.js

Change:
- Adjusts the hero bag's starting yaw by -3.5 degrees (from Math.PI to
  Math.PI - 3.5 degrees) to turn it slightly further left/away from the cup.
- Preserves the existing scroll-driven rotation, cup counter-rotation,
  D61 high-resolution rendering, silhouette-aware chromatic aberration,
  anti-aliasing, and all other styling.

Installation:
1. Extract into the root of the existing project.
2. Replace product-viewer.js only.
3. Keep both GLB files and all other assets unchanged.
