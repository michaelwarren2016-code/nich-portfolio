D58 incremental update — apply over D57
========================================

Replace these files in the root of the existing project:

1. styles.css
   - Grain overlay increased from 0.5 to 1.0 opacity (2x).
   - Existing stacking order is unchanged.

2. assets/nich-aurora-4k-clean.png
   - Aurora shifted 12 degrees toward warmer pine/green.
   - Image luminance reduced by a further 15%; the existing CSS dark tint remains.

3. product-viewer.js
   - The hero now always runs through a post-processing composer.
   - Adds subtle barrel distortion and visible red/cyan chromatic separation.
   - This fixes the previous implementation gap: the old optical treatment was
     not present, and the prior SMAA fallback only ran on systems without native
     antialiasing, so there was no reliable place for the effect to appear.

No cup or bag GLB files are changed in D58. Keep the D57 cube-free cup model.
