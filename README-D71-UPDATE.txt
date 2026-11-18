D71 — The Usual teal bag replacement
=====================================

Apply this incremental patch over the existing D70 project.

Included:
- models/the-usual.glb

Change:
- Replaces the forest-green The Usual bag model with the supplied
  "The Usual 3 teal.glb".

This single model path is used by:
- The homepage hero foreground coffee bag.
- The Usual product state in the Products carousel.

The Early Doors product state continues to use models/early-doors.glb.
The homepage takeaway cup continues to use the teal models/coffee-cup.glb.

Installation:
1. Extract this patch into the root of the existing D70 project.
2. Overwrite models/the-usual.glb.
3. Leave product-viewer.js, models/early-doors.glb, and models/coffee-cup.glb
   unchanged.

No layout, camera, lighting, positioning, animation, copy, or section styling
is changed.

Validation:
- Supplied GLB is GLB v2 with a valid declared file length.
- Expected Coffee_Bag node is present.
- ZIP archive integrity checked.
