D59 incremental update patch
=============================

Apply this patch over the existing D58 project, replacing the matching files.

Changes:
- Fixed the hero chromatic-aberration shader to preserve the warped base alpha and avoid RGB sampling from transparent pixels, which caused dark outlines around the 3D model.
- Reduced chromatic channel separation slightly while retaining the visible lens effect.
- Reduced the hero headline “Good Coffee, Good Company” by approximately 35% across desktop and mobile breakpoints.
- Changed the hero headline from lowercase to title case.

Files included: index.html, styles.css, product-viewer.js, and the D58 aurora image (retained unchanged so this patch is self-contained relative to the D58 visual update).
The cube-free cup GLB from D57 is not included and should remain untouched.
