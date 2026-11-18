D66 incremental update patch
=============================

Apply over the existing D65 website project.

Included:
- styles.css
- product-viewer.js
- assets/section-4-forest-glow-4k.png

Forest Glow:
- Recreated from the original forest-glow reference composition.
- Removed the source's baked-in high-frequency texture using a broad smooth
  blur before upscaling to 3840 x 2160.
- Preserved the three diffuse chartreuse light pools and deep green negative
  space.
- Darkened only the deepest shadow regions slightly.
- The website's existing independent CSS grain remains separate.

Products carousel:
- The arrow now runs a coordinated exit and entrance for both the product
  copy and the 3D bag canvas.
- Outgoing content fades/slides left; incoming content fades/slides in from
  the right.
- The same existing 'The Usual' GLB is retained for both product states.
- The button is temporarily disabled during the transition to prevent
  overlapping animations.
- Reduced-motion preference is respected.

Installation:
1. Extract this patch into the root of the existing D65 project.
2. Replace styles.css and product-viewer.js.
3. Overwrite assets/section-4-forest-glow-4k.png.
4. Keep all other assets and models unchanged.
