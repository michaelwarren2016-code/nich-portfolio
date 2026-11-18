D60 incremental update patch
=============================

Apply this patch over the existing D59 website project.

Included:
- models/the-usual.glb

Change:
- Replaces the coffee bag GLB with the user's corrected model from
  "The Usual 3.glb". This retains the existing Coffee_Bag node name and
  transform, so the site's current hero loader and camera/rotation setup
  remain compatible.
- The Coffee_Bag mesh now contains three primitives instead of two, retaining
  the updated material assignments from the corrected Blender export.

Installation:
1. Extract this patch into the root of the existing website project.
2. Allow models/the-usual.glb to be overwritten.
3. Do not replace product-viewer.js, styles.css, index.html, or
   models/coffee-cup.glb. D59's optics, headline, and D57's cube-free cup
   remain unchanged.

Validation:
- GLB v2 container and declared file length checked.
- Coffee_Bag node name and transform match the previous site model.
- ZIP archive integrity checked.
