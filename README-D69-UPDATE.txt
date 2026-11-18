D69 incremental update patch
=============================

Apply over the existing D68 project.

Included:
- product-viewer.js
- styles.css

What this does:
- Removes D68's whole-hero SVG displacement filter. This eliminates the
  artificial border/clipping and avoids rasterising the HTML headline.
- Preserves the existing Three.js product optics, including the restrained
  barrel distortion and chromatic-aberration treatment on the 3D product.
- Adds a very subtle CSS perspective treatment to the hero copy. This keeps
  text rendered as normal browser typography, so it remains crisp.
- The aurora/background and grain remain unchanged and unfiltered.

Important:
This is a restrained perspective approximation for the DOM headline, not a
true unified barrel warp of the entire hero. A true shared warp would require
rendering the background, typography, and 3D models into a common high-
resolution composition. This patch prioritises crisp type and removes the
unwanted D68 border.

Installation:
1. Extract over the existing D68 project.
2. Replace product-viewer.js and styles.css.
3. Keep all models and image assets unchanged.

Rollback:
Reapply the D68 product-viewer.js if you want the previous state, though its
whole-hero SVG filter is the effect that produced the border and text
pixelation.
