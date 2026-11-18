D61 incremental update patch
=============================

Apply over the existing D60 website project.

Included:
- product-viewer.js

Changes:
- Raises the hero renderer's pixel-ratio cap from 2x to 3x on high-density
  displays, with the composer using the same pixel ratio.
- Reduces chromatic aberration from 0.0015 to 0.0008.
- Reduces barrel distortion from 0.018 to 0.012.
- Adds alpha-edge detection to the optics shader and attenuates chromatic
  separation to 8% near the transparent silhouette, retaining the effect
  across the body of the bag.
- Updates the shader resolution uniform when the hero container resizes.
- Keeps the existing SMAA pass after the optical shader.

Installation:
1. Extract into the root of the existing D60 project.
2. Replace product-viewer.js.
3. Keep index.html, styles.css, models/the-usual.glb, and
   models/coffee-cup.glb unchanged.

Notes:
The higher pixel ratio is capped at 3x and may increase GPU load. On displays
with devicePixelRatio below 3, the renderer uses the device's native ratio.
