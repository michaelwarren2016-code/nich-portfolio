import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Prefer native WebGL multisample anti-aliasing (typically 4x where supported).
// Fall back to SMAA only when the browser/GPU cannot provide an antialiased context.
function createSmaaFallback(renderer, scene, camera) {
  const attributes = renderer.getContext().getContextAttributes();
  if (attributes?.antialias) return null;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new SMAAPass());
  composer.addPass(new OutputPass());
  console.info('Native MSAA unavailable; using SMAA post-processing fallback.');
  return composer;
}

const container = document.querySelector('#usual-viewer');
const canvas = document.querySelector('#usual-canvas');
const loading = document.querySelector('#viewer-loading');

if (container && canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  camera.position.set(0, 0.05, 5.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.setClearColor(0x000000, 0);
  const smaaComposer = createSmaaFallback(renderer, scene, camera);

  // CINEMATIC STUDIO RIG -------------------------------------------------
  // A broad three-quarter key, restrained fill and two rear sources create
  // shape and a luminous foil edge without washing out the printed face.
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const studioEnvironment = new RoomEnvironment(renderer);
  const environmentMap = pmremGenerator.fromScene(studioEnvironment, 0.04).texture;
  scene.environment = environmentMap;
  scene.environmentIntensity = 0.18;
  studioEnvironment.dispose();
  pmremGenerator.dispose();

  scene.add(new THREE.HemisphereLight(0xf5f2ed, 0x273629, 0.14));
  RectAreaLightUniformsLib.init();

  // Key: deliberately off-axis, slightly above and to camera-left.
  const keySoftbox = new THREE.RectAreaLight(0xffead2, 1.05, 5.2, 6.4);
  keySoftbox.position.set(-4.2, 3.0, 2.7);
  keySoftbox.lookAt(0, 0, 0);
  scene.add(keySoftbox);

  // A very restrained frontal lift keeps the deep green print legible.
  const fillSoftbox = new THREE.RectAreaLight(0xc7dba8, 0.34, 5.4, 6.0);
  fillSoftbox.position.set(3.8, 0.25, 4.4);
  fillSoftbox.lookAt(0, 0, 0);
  scene.add(fillSoftbox);

  // Narrow right-side catchlight: a slim vertical source that grazes only
  // the outer edge/gusset instead of washing across the printed front.
  const rightCatchlight = new THREE.RectAreaLight(0xe8f0d8, 2.8, 0.20, 5.2);
  rightCatchlight.position.set(4.25, 0.15, 2.0);
  rightCatchlight.lookAt(0, 0, 0);
  scene.add(rightCatchlight);

  // Strong, warm rear edge source. Its broad emitter gives a soft halo-like
  // outline and bright foil reflections rather than a hard spotlight edge.
  const rimSoftbox = new THREE.RectAreaLight(0xfff3e4, 3.2, 8.0, 9.0);
  rimSoftbox.position.set(-2.8, 3.1, -5.4);
  rimSoftbox.lookAt(0, 0, 0);
  scene.add(rimSoftbox);

  // Opposite-side cool kicker separates the far edge from the sage backdrop.
  const edgeKicker = new THREE.RectAreaLight(0xe8f0ed, 1.4, 5.0, 7.0);
  edgeKicker.position.set(3.8, 1.2, -4.2);
  edgeKicker.lookAt(0, 0, 0);
  scene.add(edgeKicker);

  // Render directly to preserve the transparent canvas over the page design.

  const productPivot = new THREE.Group();
  scene.add(productPivot);

  let modelReady = false;
  let pointerDown = false;
  let lastX = 0;
  let startX = 0;
  // Product models can have different forward axes; The Usual keeps its
  // half-turn correction while Aurora Blend matches the hero's front angle.
  let productFrontRotation = Math.PI;
  let productStartingTilt = 0;
  let productAutoRotate = true;
  let targetRotation = 0;
  let currentRotation = 0;
  const clock = new THREE.Clock();
  const loader = new GLTFLoader();
  loader.setResourcePath('./');

  function loadProductBag(modelPath, frontRotation = Math.PI, startingTilt = 0, autoRotate = true, onLoaded = null) {
    productFrontRotation = frontRotation;
    productStartingTilt = startingTilt;
    productAutoRotate = autoRotate;
    loader.load(
      modelPath,
    (gltf) => {
      console.info('Product model loaded from:', modelPath);
      const source = gltf.scene;
      source.updateMatrixWorld(true);
      // The Aurora Blend artwork is embedded in the GLB; treat its base
      // colour image as sRGB in this viewer just as it is in the hero.
      source.traverse((object) => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material.map) {
            material.map.colorSpace = THREE.SRGBColorSpace;
            material.map.needsUpdate = true;
          }
        });
      });

      // In this GLB, Coffee_Bag is the parent node; its two renderable
      // mesh children are named from the underlying Blender mesh instead.
      // Find the parent node first, then collect all mesh descendants.
      const bagNode = source.getObjectByName('Coffee_Bag');
      const bagMeshes = [];
      if (bagNode) {
        bagNode.updateMatrixWorld(true);
        bagNode.traverse((object) => {
          if (object.isMesh) bagMeshes.push(object);
        });
      }

      if (!bagMeshes.length) {
        const available = [];
        source.traverse((object) => {
          if (object.isMesh) available.push(object.name || '(unnamed mesh)');
        });
        console.error('Coffee_Bag node or mesh descendants not found. Available mesh names:', available);
        if (loading) loading.textContent = 'COFFEE BAG MESH NOT FOUND';
        onLoaded?.(false);
        return;
      }

      const bagOnly = new THREE.Group();
      bagMeshes.forEach((sourceMesh) => {
        const mesh = sourceMesh.clone();
        mesh.geometry = sourceMesh.geometry;
        mesh.material = sourceMesh.material;
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(sourceMesh.matrixWorld);
        bagOnly.add(mesh);
      });

      // Replace only the product bag; the viewer, lighting, camera and drag state stay intact.
      productPivot.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value?.isTexture) value.dispose();
          });
          material.dispose();
        });
      });
      productPivot.clear();
      let bounds = new THREE.Box3().setFromObject(bagOnly);
      const size = bounds.getSize(new THREE.Vector3());
      const centre = bounds.getCenter(new THREE.Vector3());
      bagOnly.position.sub(centre);

      // The exported GLB is Y-up. Fit the bag to the viewer height while
      // preserving its proportions and keeping the origin at its centre.
      const targetHeight = 3.45;
      const fitScale = targetHeight / Math.max(size.y, 0.001);
      bagOnly.scale.setScalar(fitScale);
      productPivot.add(bagOnly);

      // Calculate a comfortable camera distance from the actual bag bounds.
      const fittedHeight = size.y * fitScale;
      const viewHeight = fittedHeight / 0.78;
      const fovRadians = THREE.MathUtils.degToRad(camera.fov);
      camera.position.z = viewHeight / (2 * Math.tan(fovRadians / 2));
      camera.position.y = 0.04;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      modelReady = true;
      loading?.classList.add('is-hidden');
      onLoaded?.(true);
    },
    undefined,
    (error) => {
      console.error(`Could not load product GLB (${modelPath}):`, error);
      if (loading) loading.textContent = 'THE 3D MODEL COULD NOT LOAD';
      onLoaded?.(false);
    }
    );
  }

  const initialProductObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (!window.nichProductSelectionStarted) {
      loadProductBag('./models/aurora-blend-product.glb', Math.PI, 0, false);
    }
  }, { rootMargin: '600px 0px', threshold: 0.01 });
  initialProductObserver.observe(container);
  window.nichLoadProductBag = loadProductBag;

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    smaaComposer?.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  container.addEventListener('pointerdown', (event) => {
    // The product-next control sits inside the viewer. Do not interpret its
    // press as a drag gesture or capture its pointer; it must remain clickable.
    if (event.target.closest?.('#product-next')) return;
    pointerDown = true;
    startX = lastX = event.clientX;
    container.setPointerCapture(event.pointerId);
  });
  container.addEventListener('pointermove', (event) => {
    if (!pointerDown) return;
    const delta = event.clientX - lastX;
    targetRotation = THREE.MathUtils.clamp(targetRotation + delta * 0.012, -1.25, 1.25);
    lastX = event.clientX;
  });
  const releasePointer = () => {
    pointerDown = false;
    targetRotation = 0;
  };
  container.addEventListener('pointerup', releasePointer);
  container.addEventListener('pointercancel', releasePointer);
  container.addEventListener('lostpointercapture', releasePointer);

  let productFrame = 0;
  let productVisible = false;
  function animate() {
    productFrame = 0;
    if (!productVisible || document.hidden) return;
    productFrame = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    if (modelReady) {
      currentRotation = THREE.MathUtils.lerp(currentRotation, targetRotation, pointerDown ? 0.12 : 0.045);
      productPivot.rotation.y = productFrontRotation + currentRotation + (!pointerDown && productAutoRotate && !reducedMotion ? Math.sin(elapsed * 0.55) * 0.035 : 0);
      productPivot.rotation.z = productStartingTilt + (!pointerDown && productAutoRotate && !reducedMotion ? Math.sin(elapsed * 0.42) * 0.008 : 0);
    }
    if (smaaComposer) smaaComposer.render();
    else renderer.render(scene, camera);
  }
  const productVisibilityObserver = new IntersectionObserver(([entry]) => {
    productVisible = entry.isIntersecting;
    if (productVisible && !productFrame && !document.hidden) animate();
    else if (!productVisible && productFrame) {
      cancelAnimationFrame(productFrame);
      productFrame = 0;
    }
  }, { threshold: 0.01 });
  productVisibilityObserver.observe(container);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && productVisible && !productFrame) animate();
    else if (document.hidden && productFrame) {
      cancelAnimationFrame(productFrame);
      productFrame = 0;
    }
  });
}

// Editorial home hero: a second instance of the same bag, driven by page scroll.

// D72 — seamless, periodic aurora animation using the approved 4K hero gradient.
// The original raster remains the colour/tonality reference; only its UVs move.
// A 48-second periodic shader loop returns to the exact same state at 0/48s.
(() => {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  const auroraCanvas = document.createElement('canvas');
  auroraCanvas.className = 'hero-aurora-canvas';
  auroraCanvas.setAttribute('aria-hidden', 'true');
  heroSection.insertBefore(auroraCanvas, heroSection.firstChild);

  const auroraRenderer = new THREE.WebGLRenderer({
    canvas: auroraCanvas,
    alpha: false,
    antialias: false,
    powerPreference: 'low-power'
  });
  auroraRenderer.outputColorSpace = THREE.SRGBColorSpace;
  auroraRenderer.setClearColor(0x101713, 1);

  const auroraScene = new THREE.Scene();
  const auroraCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const auroraTextureLoader = new THREE.TextureLoader();
  const auroraMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uGradient: { value: null },
      uPhase: { value: 0 },
      uDarken: { value: 0.85 },
      uViewportAspect: { value: 16.0 / 9.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uGradient;
      uniform float uPhase;
      uniform float uDarken;
      uniform float uViewportAspect;
      varying vec2 vUv;

      void main() {
        float p = uPhase;
        // Match CSS background-size: cover for non-16:9 viewport shapes.
        vec2 baseUv = vUv;
        const float imageAspect = 1.7777778;
        if (uViewportAspect > imageAspect) {
          baseUv.y = (baseUv.y - 0.5) * (uViewportAspect / imageAspect) + 0.5;
        } else {
          baseUv.x = (baseUv.x - 0.5) * (imageAspect / uViewportAspect) + 0.5;
        }
        // Low-amplitude, multi-scale flow. Every term is periodic in p,
        // with an exact 2π return to the original sampling coordinates.
        float dx = 0.0234 * sin(6.2831853 * (baseUv.y * 1.15) + p)
                 + 0.0117 * sin(6.2831853 * (baseUv.x * 0.62 - baseUv.y * 0.48) - 2.0 * p);
        float dy = 0.0156 * cos(6.2831853 * (baseUv.x * 0.82 + baseUv.y * 0.36) + p)
                 + 0.00845 * sin(6.2831853 * (baseUv.x * 0.34 + baseUv.y * 0.76) - 2.0 * p);
        vec2 uv = clamp(baseUv + vec2(dx, dy), vec2(0.001), vec2(0.999));
        vec3 colour = texture2D(uGradient, uv).rgb * uDarken;
        // Lift the deepest pixels by a subtle 3.5% so they read as charcoal,
        // leaving the CSS grain layer visible over the aurora.
        colour = min(colour + vec3(0.035), vec3(1.0));
        float breathing = 1.0 + 0.018 * sin(p) * (0.35 + 0.65 * smoothstep(0.18, 0.82, colour.g));
        colour *= breathing;
        gl_FragColor = vec4(colour, 1.0);
      }
    `
  });
  const auroraQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), auroraMaterial);
  auroraScene.add(auroraQuad);

  const auroraReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const auroraDuration = 32;
  let auroraReady = false;
  let auroraFrame = 0;
  let auroraStart = performance.now();

  function resizeAurora() {
    const rect = heroSection.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    auroraRenderer.setPixelRatio(ratio);
    auroraRenderer.setSize(Math.round(rect.width), Math.round(rect.height), false);
    auroraMaterial.uniforms.uViewportAspect.value = rect.width / rect.height;
    auroraRenderer.render(auroraScene, auroraCamera);
  }

  auroraTextureLoader.load(
    './assets/nich-aurora-4k-clean.png',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      auroraMaterial.uniforms.uGradient.value = texture;
      auroraReady = true;
      resizeAurora();
    },
    undefined,
    (error) => console.warn('Aurora texture could not be loaded; retaining static CSS background.', error)
  );

  let auroraInView = false;
  function renderAurora(now) {
    auroraFrame = 0;
    if (!auroraInView || document.hidden) return;
    auroraFrame = requestAnimationFrame(renderAurora);
    if (!auroraReady) return;
    const elapsed = auroraReducedMotion ? 0 : ((now - auroraStart) / 1000) % auroraDuration;
    auroraMaterial.uniforms.uPhase.value = (elapsed / auroraDuration) * Math.PI * 2;
    auroraRenderer.render(auroraScene, auroraCamera);
  }

  const auroraResizeObserver = new ResizeObserver(resizeAurora);
  auroraResizeObserver.observe(heroSection);
  window.addEventListener('resize', resizeAurora, { passive: true });
  const auroraVisibilityObserver = new IntersectionObserver(([entry]) => {
    auroraInView = entry.isIntersecting;
    if (auroraInView && !document.hidden && !auroraFrame) {
      auroraFrame = requestAnimationFrame(renderAurora);
    } else if (!auroraInView && auroraFrame) {
      cancelAnimationFrame(auroraFrame);
      auroraFrame = 0;
    }
  }, { threshold: 0.01 });
  auroraVisibilityObserver.observe(heroSection);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      auroraStart = performance.now() - (auroraMaterial.uniforms.uPhase.value / (Math.PI * 2)) * auroraDuration * 1000;
      resizeAurora();
      if (auroraInView && !auroraFrame) auroraFrame = requestAnimationFrame(renderAurora);
    } else if (auroraFrame) {
      cancelAnimationFrame(auroraFrame);
      auroraFrame = 0;
    }
  });
  resizeAurora();
  if (!document.hidden) auroraFrame = requestAnimationFrame(renderAurora);
})();

const heroContainer = document.querySelector('#hero-bag-viewer');
const heroCanvas = document.querySelector('#hero-bag-canvas');
if (heroContainer && heroCanvas) {
  const heroScene = new THREE.Scene();
  const heroCamera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  // Render the large hero product at a higher internal resolution to reduce
  // visible silhouette stepping on high-density displays. Re-read DPR on
  // every resize because browser zoom can change devicePixelRatio at runtime.
  const getHeroPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);
  let heroPixelRatio = getHeroPixelRatio();
  heroRenderer.setPixelRatio(heroPixelRatio);
  heroRenderer.outputColorSpace = THREE.SRGBColorSpace;
  heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  heroRenderer.toneMappingExposure = 1.08;
  heroRenderer.setClearColor(0x000000, 0);
  // Always post-process the hero render: the earlier SMAA-only fallback meant
  // the optical treatment was skipped on most machines with native MSAA.
  // This pass preserves the transparent canvas while adding restrained barrel
  // distortion and visible red/cyan channel separation around object edges.
  const heroComposer = new EffectComposer(heroRenderer);
  heroComposer.setPixelRatio(heroPixelRatio);
  heroComposer.addPass(new RenderPass(heroScene, heroCamera));
  const heroOpticsPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uAberration: { value: 0.0012 },
      uDistortion: { value: 0.012 },
      uResolution: { value: new THREE.Vector2(1, 1) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uAberration;
      uniform float uDistortion;
      uniform vec2 uResolution;
      varying vec2 vUv;
      void main() {
        vec2 centred = vUv - 0.5;
        float radius2 = dot(centred, centred);
        vec2 warpedUv = 0.5 + centred * (1.0 - uDistortion * radius2);
        vec2 safeUv = clamp(warpedUv, 0.001, 0.999);
        vec4 baseSample = texture2D(tDiffuse, safeUv);

        // Detect the transparent silhouette using neighbouring alpha samples.
        // Reduce colour separation near the silhouette so the lens effect
        // remains visible across the packaging without creating a jagged fringe.
        vec2 texel = 1.5 / max(uResolution, vec2(1.0));
        float aL = texture2D(tDiffuse, clamp(safeUv - vec2(texel.x, 0.0), 0.001, 0.999)).a;
        float aR = texture2D(tDiffuse, clamp(safeUv + vec2(texel.x, 0.0), 0.001, 0.999)).a;
        float aD = texture2D(tDiffuse, clamp(safeUv - vec2(0.0, texel.y), 0.001, 0.999)).a;
        float aU = texture2D(tDiffuse, clamp(safeUv + vec2(0.0, texel.y), 0.001, 0.999)).a;
        float alphaRange = max(max(aL, aR), max(aD, aU)) -
                           min(min(aL, aR), min(aD, aU));
        float silhouette = smoothstep(0.04, 0.32, alphaRange);
        float edgeAttenuation = mix(1.0, 0.08, silhouette);

        vec2 radial = normalize(centred + vec2(0.000001)) *
                      uAberration * (0.25 + 1.25 * radius2) * edgeAttenuation;
        vec2 redUv = clamp(warpedUv + radial, 0.001, 0.999);
        vec2 blueUv = clamp(warpedUv - radial, 0.001, 0.999);
        vec4 redSample = texture2D(tDiffuse, redUv);
        vec4 blueSample = texture2D(tDiffuse, blueUv);

        // Keep the base alpha and reject colour samples outside the model.
        float redWeight = smoothstep(0.02, 0.98, redSample.a);
        float blueWeight = smoothstep(0.02, 0.98, blueSample.a);
        float red = mix(baseSample.r, redSample.r, redWeight);
        float blue = mix(baseSample.b, blueSample.b, blueWeight);
        gl_FragColor = vec4(red, baseSample.g, blue, baseSample.a);
      }
    `
  });
  heroComposer.addPass(heroOpticsPass);
  heroComposer.addPass(new SMAAPass());
  heroComposer.addPass(new OutputPass());

  const heroPmrem = new THREE.PMREMGenerator(heroRenderer);
  const heroEnvironment = new RoomEnvironment(heroRenderer);
  heroScene.environment = heroPmrem.fromScene(heroEnvironment, 0.04).texture;
  heroScene.environmentIntensity = 0.12;
  heroEnvironment.dispose();
  heroPmrem.dispose();
  heroScene.add(new THREE.HemisphereLight(0xf5f2ed, 0x273629, 0.10));
  // Large, soft upper-left key creates the green-edged, low-key Blender look.
  const heroKey = new THREE.RectAreaLight(0xdaf2df, 1.5, 10.0, 10.0);
  heroKey.position.set(-4.2, 4.5, 3.0); heroKey.lookAt(0, 0, 0); heroScene.add(heroKey);
  const heroFill = new THREE.RectAreaLight(0xcbdcaf, 0.28, 6.5, 7.0);
  heroFill.position.set(3.6, 0.1, 3.8); heroFill.lookAt(0, 0, 0); heroScene.add(heroFill);
  // Broad, very low-power right-side fill softens contrast on the hero bag.
  const heroRightSoftFill = new THREE.RectAreaLight(0xdce7c9, 0.10, 10.0, 12.0);
  heroRightSoftFill.position.set(4.6, 0.35, 3.3); heroRightSoftFill.lookAt(0, 0, 0); heroScene.add(heroRightSoftFill);
  const heroLeftCatchlight = new THREE.RectAreaLight(0xe0f1e5, 1.1, 0.8, 6.0);
  heroLeftCatchlight.position.set(-4.1, 0.3, 1.7); heroLeftCatchlight.lookAt(0, 0, 0); heroScene.add(heroLeftCatchlight);
  const heroRim = new THREE.RectAreaLight(0xd9eddf, 1.5, 9.0, 10.0);
  heroRim.position.set(-2.8, 3.1, -5.4); heroRim.lookAt(0, 0, 0); heroScene.add(heroRim);
  const heroKicker = new THREE.RectAreaLight(0xe8f0ed, 0.55, 5.0, 7.0);
  heroKicker.position.set(3.8, 1.2, -4.2); heroKicker.lookAt(0, 0, 0); heroScene.add(heroKicker);
  // Direct rendering preserves canvas alpha; subtle film grain is layered in CSS.

  const heroPivot = new THREE.Group();
  heroScene.add(heroPivot);
  let heroLoaded = false;
  const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The model needs a half-turn to face forward; compensate for that flip so
  // the visible pose turns slightly clockwise and reveals the left gusset.
  const heroFrontRotation = Math.PI + THREE.MathUtils.degToRad(12);
  const heroStartingTilt = -THREE.MathUtils.degToRad(12);
  const heroLoader = new GLTFLoader();
  heroLoader.setResourcePath('./');
  let heroBagFade = null;
  let heroCupFade = null;
  function prepareHeroFadeIn(root) {
    if (heroReducedMotion) return null;
    const materials = [];
    root.traverse((object) => {
      if (!object.isMesh) return;
      const originalMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const fadingMaterials = originalMaterials.map((original) => {
        const material = original.clone();
        const state = {
          material,
          opacity: material.opacity,
          transparent: material.transparent,
          depthWrite: material.depthWrite
        };
        material.transparent = true;
        material.opacity = 0;
        // Keep the depth buffer active during the fade so overlapping cup
        // panels and its printed label do not bleed through one another.
        material.depthWrite = true;
        material.needsUpdate = true;
        materials.push(state);
        return material;
      });
      object.material = Array.isArray(object.material) ? fadingMaterials : fadingMaterials[0];
    });
    return { materials, elapsed: 0, duration: 0.85 };
  }
  function advanceHeroFadeIn(fade, deltaSeconds) {
    if (!fade) return null;
    fade.elapsed = Math.min(fade.elapsed + deltaSeconds, fade.duration);
    const progress = fade.elapsed / fade.duration;
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    fade.materials.forEach((state) => {
      state.material.opacity = state.opacity * easedProgress;
    });
    if (progress < 1) return fade;
    fade.materials.forEach((state) => {
      state.material.opacity = state.opacity;
      state.material.transparent = state.transparent;
      state.material.depthWrite = state.depthWrite;
      state.material.needsUpdate = true;
    });
    return null;
  }
  heroLoader.load('./models/aurora-blend-hero.glb', (gltf) => {
    const source = gltf.scene;
    source.updateMatrixWorld(true);
    const bagNode = source.getObjectByName('Coffee_Bag');
    const meshes = [];
    bagNode?.traverse(object => { if (object.isMesh) meshes.push(object); });
    if (!meshes.length) { console.error('Home hero could not find Coffee_Bag mesh.'); return; }
    const bag = new THREE.Group();
    meshes.forEach(sourceMesh => {
      const mesh = sourceMesh.clone();
      mesh.geometry = sourceMesh.geometry;
      mesh.material = sourceMesh.material;
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(sourceMesh.matrixWorld);
      bag.add(mesh);
    });
    const bounds = new THREE.Box3().setFromObject(bag);
    const dimensions = bounds.getSize(new THREE.Vector3());
    bag.position.sub(bounds.getCenter(new THREE.Vector3()));
    const fit = (4.45 * 1.15) / Math.max(dimensions.y, 0.001);
    bag.scale.setScalar(fit);
    heroBagFade = prepareHeroFadeIn(bag);
    heroPivot.add(bag);
    heroPivot.position.y = -0.89; // 20% of the fitted 4.45-unit bag height
    const fittedHeight = dimensions.y * fit;
    const viewHeight = fittedHeight / 0.80;
    heroCamera.position.set(0, -0.20, viewHeight / (2 * Math.tan(THREE.MathUtils.degToRad(heroCamera.fov / 2))));
    heroCamera.lookAt(0, -0.20, 0);
    heroCamera.updateProjectionMatrix();

    // Secondary takeaway cup: deliberately smaller and positioned behind
    // the foreground bag. Its local yaw counter-rotates against the bag so
    // the cup's printed face remains visible from the hero camera.
    const cupLoader = new GLTFLoader();
    cupLoader.setResourcePath('./');
    cupLoader.load('./models/coffee-cup.glb', (cupGltf) => {
      const cupModel = cupGltf.scene;
      cupModel.updateMatrixWorld(true);
      const cupBounds = new THREE.Box3().setFromObject(cupModel);
      const cupDimensions = cupBounds.getSize(new THREE.Vector3());
      const cupCentre = cupBounds.getCenter(new THREE.Vector3());
      const cupTargetHeight = fittedHeight * 0.58;
      const cupFit = cupTargetHeight / Math.max(cupDimensions.y, 0.001);

      const cupFrame = new THREE.Group();
      cupFrame.add(cupModel);
      cupFrame.position.set(
        -cupCentre.x * cupFit,
        -cupCentre.y * cupFit,
        -cupCentre.z * cupFit
      );
      cupFrame.scale.setScalar(cupFit);
      heroCupFade = prepareHeroFadeIn(cupFrame);

      // Separate the cup's fixed placement from its rotation. Its anchor is
      // a sibling of the rotating bag, so it cannot orbit sideways as the
      // bag turns. Transform the original D43 position through the bag's
      // initial orientation to preserve its starting screen position.
      const cupAnchor = new THREE.Group();
      const cupRotation = new THREE.Group();
      cupRotation.add(cupFrame);
      cupRotation.rotation.z = -THREE.MathUtils.degToRad(12);
      const cupLocalPosition = new THREE.Vector3(
        -2.75,
        (fittedHeight - cupTargetHeight) / 2,
        2.8
      );
      cupAnchor.position.copy(
        cupLocalPosition.applyEuler(new THREE.Euler(0, Math.PI, -0.065, 'XYZ'))
      );
      cupAnchor.add(cupRotation);
      heroScene.add(cupAnchor);
      cupAnchor.userData.cupRotation = cupRotation;
      console.info('Hero cup loaded behind bag.', {
        dimensions: cupDimensions.toArray(),
        fittedHeight: cupTargetHeight
      });
    }, undefined, error => console.error('Hero cup GLB failed to load:', error));

    heroLoaded = true;
  }, undefined, error => console.error('Home hero coffee bag failed to load:', error));

  function resizeHero() {
    const width = heroContainer.clientWidth;
    const height = heroContainer.clientHeight;
    if (!width || !height) return;

    // Browser zoom can change devicePixelRatio without changing the CSS size
    // of the hero container. Keep the renderer and every composer target in
    // lockstep so SMAA's texel-size uniforms match the actual render buffers.
    const nextPixelRatio = getHeroPixelRatio();
    if (Math.abs(nextPixelRatio - heroPixelRatio) > 0.001) {
      heroPixelRatio = nextPixelRatio;
      heroRenderer.setPixelRatio(heroPixelRatio);
      heroComposer.setPixelRatio(heroPixelRatio);
    }

    heroRenderer.setSize(width, height, false);
    heroComposer.setSize(width, height);
    heroOpticsPass.uniforms.uResolution.value.set(
      Math.round(width * heroPixelRatio),
      Math.round(height * heroPixelRatio)
    );
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
  }
  const heroResizeObserver = new ResizeObserver(resizeHero);
  heroResizeObserver.observe(heroContainer);
  // Browser zoom and display changes can alter DPR independently of layout.
  window.addEventListener('resize', resizeHero, { passive: true });
  window.visualViewport?.addEventListener('resize', resizeHero, { passive: true });
  resizeHero();

  let lastHeroScrollAt = -Infinity;
  window.addEventListener('scroll', () => {
    lastHeroScrollAt = performance.now();
  }, { passive: true });

  let lastHeroFrameAt = performance.now();
  let heroAutoPhase = 0;
  let cupAutoPhase = 0;
  let heroScrollBoost = 0;
  let heroFrame = 0;
  let heroVisible = false;
  function renderHero(now = performance.now()) {
    heroFrame = 0;
    if (!heroVisible || document.hidden) return;
    heroFrame = requestAnimationFrame(renderHero);
    if (heroLoaded) {
      const deltaSeconds = Math.min((now - lastHeroFrameAt) / 1000, 0.05);
      const scrollActive = now - lastHeroScrollAt < 180;
      const boostTarget = scrollActive ? 1 : 0;
      heroScrollBoost += (boostTarget - heroScrollBoost) * (1 - Math.exp(-deltaSeconds * (scrollActive ? 5 : 2.5)));
      lastHeroFrameAt = now;
      const autoSpeed = heroReducedMotion ? 0 : THREE.MathUtils.degToRad(1.575 + 14.155 * heroScrollBoost);
      heroAutoPhase = (heroAutoPhase + autoSpeed * deltaSeconds) % (Math.PI * 2);
      cupAutoPhase = (cupAutoPhase - autoSpeed * 0.85 * deltaSeconds + Math.PI * 2) % (Math.PI * 2);
      const rotationLimit = THREE.MathUtils.degToRad(30);
      const heroAutoRotation = rotationLimit * Math.sin(heroAutoPhase);
      const cupAutoRotation = rotationLimit * Math.sin(cupAutoPhase);
      heroBagFade = advanceHeroFadeIn(heroBagFade, deltaSeconds);
      heroCupFade = advanceHeroFadeIn(heroCupFade, deltaSeconds);
      heroPivot.rotation.y = heroFrontRotation + heroAutoRotation;
      // The cup is independently animated while remaining fixed in position.
      const cupAnchor = heroScene.children.find(child => child.userData.cupRotation);
      if (cupAnchor) {
        cupAnchor.userData.cupRotation.rotation.y = cupAutoRotation;
      }
      heroPivot.rotation.z = heroStartingTilt;
    }
    if (window.matchMedia('(max-width: 760px)').matches) heroRenderer.render(heroScene, heroCamera);
    else heroComposer.render();
  }
  const heroVisibilityObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible && !heroFrame && !document.hidden) renderHero();
    else if (!heroVisible && heroFrame) {
      cancelAnimationFrame(heroFrame);
      heroFrame = 0;
    }
  }, { threshold: 0.01 });
  heroVisibilityObserver.observe(heroContainer);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVisible && !heroFrame) renderHero();
    else if (document.hidden && heroFrame) {
      cancelAnimationFrame(heroFrame);
      heroFrame = 0;
    }
  });
}


// D72.4 — Aurora Blend leads the product carousel, followed by The Usual.
const productFeature = document.querySelector('#product-feature');
const productNext = document.querySelector('#product-next');
const productTitle = document.querySelector('#products-title');
const productHeadline = document.querySelector('.product-headline');
const productDescription = document.querySelector('.product-description');
const productNotes = document.querySelector('.product-notes');
const productWeight = document.querySelector('.product-weight');
const productViewer = document.querySelector('#usual-viewer');
if (productFeature && productNext && productTitle && productDescription && productNotes && productWeight && productViewer && productHeadline) {
  const productStates = [
    {
      headline: 'A brighter\nmorning ritual',
      title: 'Aurora Blend',
      description: 'The newest coffee in the NICH collection.',
      notes: [],
      weight: 'Whole bean, 250 g',
      label: 'Aurora Blend',
      model: './models/aurora-blend-product.glb',
      frontRotation: Math.PI,
      startingTilt: 0,
      autoRotate: false
    },
    {
      headline: 'The pour you\nknow and love',
      title: 'The Usual',
      description: 'A proper everyday coffee. Comforting, considered and always worth coming back to.',
      notes: [],
      weight: 'Whole bean, 250 g',
      label: 'The Usual',
      model: './models/the-usual.glb',
      frontRotation: Math.PI,
      startingTilt: 0,
      autoRotate: true
    }
  ];
  let activeProduct = 0;
  let productTransitioning = false;
  const initialState = productStates[activeProduct];
  productHeadline.textContent = initialState.headline;
  productTitle.textContent = initialState.title;
  productDescription.textContent = initialState.description;
  productNotes.replaceChildren(...initialState.notes.map(note => {
    const span = document.createElement('span');
    span.textContent = note;
    return span;
  }));
  productWeight.textContent = initialState.weight;
  productViewer.setAttribute('aria-label', `Interactive 3D view of the ${initialState.label} coffee bag. Drag to rotate.`);
  const initialViewerIndex = productViewer.querySelector('.viewer-index');
  if (initialViewerIndex) initialViewerIndex.textContent = 'NI / 01';
  productNext.setAttribute('aria-label', `Next coffee: ${productStates[1].label}`);
  productNext.addEventListener('click', () => {
    if (productTransitioning) return;
    window.nichProductSelectionStarted = true;
    productTransitioning = true;
    productNext.disabled = true;
    activeProduct = (activeProduct + 1) % productStates.length;
    productFeature.classList.remove('is-entering');
    productFeature.classList.add('is-transitioning');

    let copyReady = false;
    let modelReady = false;
    let entryStarted = false;
    const revealNextProduct = () => {
      if (!copyReady || !modelReady || entryStarted) return;
      entryStarted = true;
      // Reveal the incoming copy and the newly loaded 3D model together.
      productFeature.classList.remove('is-transitioning');
      productFeature.classList.add('is-entering');
      void productFeature.offsetWidth;
      requestAnimationFrame(() => productFeature.classList.remove('is-entering'));
      window.setTimeout(() => {
        productTransitioning = false;
        productNext.disabled = false;
      }, 460);
    };

    // Start loading during the outgoing fade. Keep the viewer hidden until the
    // new GLB and its textures are ready, then fade the incoming model in.
    const state = productStates[activeProduct];
    const loadNextProduct = window.nichLoadProductBag;
    if (loadNextProduct) {
      loadNextProduct(state.model, state.frontRotation, state.startingTilt, state.autoRotate, () => {
        modelReady = true;
        revealNextProduct();
      });
    } else {
      modelReady = true;
    }

    // Fade and slide both the copy and the existing 3D bag out together.
    window.setTimeout(() => {
      productHeadline.textContent = state.headline;
      productTitle.textContent = state.title;
      productDescription.textContent = state.description;
      productNotes.replaceChildren(...state.notes.flatMap((note, index) => {
        const nodes = [];
        if (index) {
          const separator = document.createElement('i');
          separator.setAttribute('aria-hidden', 'true');
          separator.textContent = '·';
          nodes.push(separator);
        }
        const span = document.createElement('span');
        span.textContent = note;
        nodes.push(span);
        return nodes;
      }));
      productWeight.textContent = state.weight;
      productViewer.setAttribute('aria-label', `Interactive 3D view of the ${state.label} coffee bag. Drag to rotate.`);
      const viewerIndex = productViewer.querySelector('.viewer-index');
      if (viewerIndex) viewerIndex.textContent = `NI / 0${activeProduct + 1}`;
      productNext.setAttribute('aria-label', `Next coffee: ${productStates[(activeProduct + 1) % productStates.length].label}`);
      copyReady = true;
      revealNextProduct();
    }, 240);
  });
}
