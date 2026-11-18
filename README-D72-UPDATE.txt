D72.1 — More visible seamless hero aurora
=====================================

Incremental update for the existing D71 project.

Included:
- product-viewer.js
- styles.css
- assets/nich-aurora-4k-clean.png

What it does:
- Uses the approved 4K hero gradient as the exact colour/tonality reference.
- Adds a lightweight full-hero WebGL background canvas.
- Applies a restrained, multi-scale UV flow in a 32-second mathematically
  periodic loop. The phase is periodic, so the first and last animation states
  are identical; no crossfade or visible reset is used.
- Keeps grain separate in the existing CSS pseudo-element above the aurora.
- Leaves the hero headline, 3D bag/cup, scroll motion, and product models
  independent and sharp.
- Retains the static CSS background as a fallback if WebGL texture loading
  fails.
- Respects prefers-reduced-motion by showing the still gradient.

Performance:
- Background render pixel ratio capped at 1.5.
- Reuses one loaded 4K texture and one renderer.
- Pauses rendering while the document is hidden.
- Resizes with ResizeObserver and window resize; preserves the raster's 16:9
  composition using cover-style cropping on portrait and ultrawide viewports.

Installation:
1. Extract over the existing D71 project root.
2. Replace product-viewer.js and styles.css.
3. Add/overwrite assets/nich-aurora-4k-clean.png.
4. Keep all existing model files, including D71's models/the-usual.glb,
   models/early-doors.glb, and models/coffee-cup.glb.

Notes:
The loop duration is 32 seconds. Motion is intentionally low-amplitude so
the gradient feels alive without obvious travelling bands. The shader's
sin/cos phase terms are periodic, so the loop returns exactly to its starting
state.


D72.1 adjustment:
- Increased the UV flow amplitude approximately 3x so motion is perceptible
  without changing the source gradient's overall composition.
- Shortened the loop from 48 to 32 seconds.
- Added a very restrained periodic luminance breath to help the flowing
  regions read as moving light.
- Explicitly forces the animated canvas visible at z-index 1, above the
  static CSS background and below the existing grain/content layers.


D72.2 adjustment:
- Increased all aurora UV displacement amplitudes by 1.3x.
- The hero grain's opacity was already at 1.0 in D72.1, so it could not be
  multiplied further without clipping. Instead increased the grain contrast
  from 1.25 to 1.875 (1.5x) to make the texture more pronounced.
- Loop duration, colour, 4K source image, layout, and product models unchanged.
