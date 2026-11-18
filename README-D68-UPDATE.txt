D68 incremental update patch
=============================

Apply over the existing D67 website project.

Included:
- product-viewer.js

Change:
Adds a restrained radial barrel-distortion filter to the entire .hero section,
rather than only the 3D product canvas. The same warp therefore affects the
aurora background, hero headline, supporting text, and 3D bag/cup canvases.

Implementation:
- Generates a small radial displacement map at runtime.
- Uses an SVG feDisplacementMap filter with a 14px maximum channel scale.
- Displacement grows quadratically toward the edges and remains neutral at
  the centre, creating a subtle barrel profile.
- Does not alter the underlying artwork, GLB files, camera, or scroll rotation.

Installation:
1. Extract over the existing D67 project.
2. Replace product-viewer.js only.
3. Keep styles.css, all models, background assets, and HTML unchanged.

Notes:
SVG filter support varies slightly by browser/GPU. The effect is applied as a
single filter to the hero composition so all visible hero layers stay aligned.
If unsupported, the browser should leave the hero unwarped. Because this
filters the complete hero layer, check performance on mobile after applying.
