D67 rollback patch
==================

This restores the D67 versions of:
- product-viewer.js
- styles.css

Use this to roll back the D68/D69 hero distortion experiments.

Installation:
1. Extract into the root of the existing website project.
2. Overwrite product-viewer.js and styles.css.
3. Do not replace any models, image assets, index.html, or script.js.

Restored state:
- D67 product arrow click fix.
- D66 section backgrounds, product transition, and grain settings.
- D63 dynamic render synchronisation.
- D62 bag angle.
- D61 anti-aliasing and 3D optics.
- D60 corrected coffee bag and D57 cube-free cup are not included in this patch
  and remain untouched.
