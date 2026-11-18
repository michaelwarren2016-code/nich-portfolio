New Islington Coffee House — D15

D15 adds an interactive 3D product feature for The Usual to the Products section.

What changed:
- Replaced the Products placeholder with a product feature layout.
- Added a Three.js GLB viewer using the supplied the-usual.glb.
- The viewer excludes the Blender studio floor and backdrop from the exported scene.
- Drag horizontally to rotate the bag; release returns it to the front-facing hero position.
- Added responsive layout and reduced-motion handling.

Run locally:
- Open this folder in VS Code.
- Start the site with Live Server (do not open index.html directly as a file).
- The viewer loads Three.js from jsDelivr, so an internet connection is needed.
- The 3D model is in models/the-usual.glb.

Files:
- index.html / styles.css / script.js: existing site and D14 behaviour.
- product-viewer.js: new 3D viewer.
- models/the-usual.glb: supplied Blender export.
