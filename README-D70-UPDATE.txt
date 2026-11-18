D70 — Early Doors model integration
=====================================

Apply this incremental patch over the D67 website project.

Included:
- product-viewer.js
- models/early-doors.glb
- models/coffee-cup.glb

Changes:
1. The homepage hero takeaway cup now uses the newly supplied teal cup model.
   It replaces models/coffee-cup.glb.
2. The Products carousel now uses a distinct GLB for each product:
   - The Usual: models/the-usual.glb (existing D60 corrected bag; keep it)
   - Early Doors: models/early-doors.glb (new teal bag supplied for this update)
3. The existing D67 slide/fade transition and arrow click fix are retained.
   When the arrow switches product, the product viewer fades with the copy and
   loads the corresponding GLB. The camera fit is recalculated from the loaded
   model's bounds, and drag-to-rotate remains enabled.

Installation:
1. Extract this patch over the root of your existing D67 project.
2. Replace product-viewer.js.
3. Add models/early-doors.glb.
4. Overwrite models/coffee-cup.glb with the supplied teal cup.
5. Keep models/the-usual.glb unchanged.

No changes are made to index.html, styles.css, section backgrounds, grain,
hero bag, lighting, or camera/scroll composition beyond using the new cup GLB.

Validation:
- Both supplied GLBs are valid GLB v2 containers and have been inspected.
- Early Doors bag contains a Coffee_Bag node, matching the site's model loader.
- ZIP archive integrity checked.
