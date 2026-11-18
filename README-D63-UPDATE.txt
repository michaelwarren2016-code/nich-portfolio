D63 incremental update patch
=============================

Apply over the existing D62 website project.

Included:
- product-viewer.js

Purpose:
Keep the hero WebGL renderer, EffectComposer render targets, optics shader
resolution, and SMAA sampling dimensions synchronised when browser zoom or
display scaling changes devicePixelRatio.

Changes:
- Re-reads devicePixelRatio during hero resize instead of fixing it once at
  page load.
- Updates both WebGLRenderer and EffectComposer pixel ratios together when
  DPR changes (still capped at 3x).
- Resizes renderer and composer targets together.
- Updates the optics shader's resolution uniform using the actual rounded
  internal render dimensions.
- Responds to ResizeObserver, window resize, and visualViewport resize so
  browser zoom changes are picked up.

Preserved:
- D62's 3.5-degree bag angle adjustment.
- D61 silhouette-aware chromatic aberration, barrel distortion, and SMAA.
- All bag/cup models, background, grain, headline, and other styling.

Installation:
1. Extract over the existing D62 project.
2. Replace product-viewer.js only.
3. Do not replace any model or asset files.

Validation:
- JavaScript source checked for balanced syntax structure.
- ZIP integrity checked.
