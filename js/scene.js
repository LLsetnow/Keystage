(function (KB) {
  const UNIT = 1.0; // 1u = 1.0 world units
  const KEY_GAP = 0.08;
  const CAP_H = 0.44;
  const TILT_RAD = (6.5 * Math.PI) / 180;

  // Build high-detail sculpted Cherry/OEM keycap with rounded corners, top bevel & ergonomic dish
  function createSculptedKeycapGeo(wUnits, hUnits, rowIdx, isSpace) {
    const bw = wUnits * UNIT - KEY_GAP;
    const bd = hUnits * UNIT - KEY_GAP;
    const rowScale = rowIdx === 0 ? 1.12 : (rowIdx === 1 ? 1.04 : (rowIdx === 2 ? 0.96 : 1.0));
    const h = CAP_H * rowScale;

    const segX = Math.max(8, Math.min(20, Math.round(wUnits * 7)));
    const segY = 6;
    const segZ = Math.max(8, Math.round(hUnits * 7));
    const geo = new THREE.BoxGeometry(bw, h, bd, segX, segY, segZ);

    const pos = geo.attributes.position;
    const hw = bw / 2;
    const hh = h / 2;
    const hd = bd / 2;
    const insetX = Math.min(0.115, bw * 0.14);
    const insetZFront = 0.145;
    const insetZBack = 0.09;
    const cornerR = 0.09;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const nx = x / hw; // [-1, 1]
      const t = (y + hh) / h; // [0 bottom .. 1 top]
      const nz = z / hd; // [-1 back .. 1 front]

      // 1. Round the 4 vertical corners (XZ circular fillet)
      const ax = Math.abs(x);
      const az = Math.abs(z);
      const innerW = hw - cornerR;
      const innerD = hd - cornerR;
      if (ax > innerW && az > innerD) {
        const dx = ax - innerW;
        const dz = az - innerD;
        const dist = Math.hypot(dx, dz);
        if (dist > cornerR) {
          const s = cornerR / dist;
          x = Math.sign(x) * (innerW + dx * s);
          z = Math.sign(z) * (innerD + dz * s);
        }
      }

      // 2. Smooth sculpted Cherry/OEM frustum taper from bottom skirt to top
      const taperCurve = Math.pow(t, 0.92);
      const scaleX = (hw - insetX * taperCurve) / hw;
      x *= scaleX;

      // Asymmetric front/back slope (steeper front for side legends)
      const zShift = (insetZBack - insetZFront) * 0.5 * taperCurve;
      const scaleZ = (hd - (insetZFront + insetZBack) * 0.5 * taperCurve) / hd;
      z = z * scaleZ + zShift;

      // 3. Soft curved top-edge bevel / shoulder chamfer (t > 0.72)
      let yOut = y;
      if (t > 0.72) {
        const bt = (t - 0.72) / 0.28; // [0..1]
        const edgeDist = Math.max(Math.abs(nx), Math.abs(nz));
        const rimFactor = Math.max(0, (edgeDist - 0.72) / 0.28);
        // Pull shoulder gently inward and round down at rim
        const bevelIn = (1 - Math.sqrt(Math.max(0, 1 - bt * bt))) * 0.042;
        x -= Math.sign(x) * bevelIn * Math.min(1, Math.abs(nx));
        z -= Math.sign(z) * bevelIn * Math.min(1, Math.abs(nz));
        yOut -= rimFactor * rimFactor * bt * 0.032;
      }

      // 4. Subtle ergonomic top tilt + concave finger scoop (convex on spacebar)
      if (t > 0.88) {
        const topFactor = (t - 0.88) / 0.12;
        const tiltY = -nz * 0.018;
        const dishX = 1 - nx * nx;
        const dishZ = 1 - nz * nz;
        const dish = isSpace
          ? 0.024 * dishZ // gently convex spacebar thumb profile
          : -0.028 * Math.pow(Math.max(0, dishX), 0.7) * Math.pow(Math.max(0, dishZ), 0.8);
        yOut += (tiltY + dish) * topFactor;
      }

      pos.setXYZ(i, x, yOut, z);
    }

    geo.computeVertexNormals();

    // Keep separate top and front artwork and draw the four plain faces together.
    const faces = geo.groups.slice();
    const indices = geo.index.array;
    const groupedIndices = new indices.constructor(indices.length);
    let offset = 0;
    geo.clearGroups();
    [[0, 1, 3, 5], [2], [4]].forEach((slots, materialIndex) => {
      const start = offset;
      slots.forEach((slot) => {
        const face = faces[slot];
        groupedIndices.set(indices.subarray(face.start, face.start + face.count), offset);
        offset += face.count;
      });
      geo.addGroup(start, offset - start, materialIndex);
    });
    geo.setIndex(new THREE.BufferAttribute(groupedIndices, 1));
    return geo;
  }

  // Clean low-poly frustum outline for crisp selection highlight
  function createKeycapOutlineGeo(wUnits, hUnits, rowIdx) {
    const bw = wUnits * UNIT - KEY_GAP;
    const bd = hUnits * UNIT - KEY_GAP;
    const rowScale = rowIdx === 0 ? 1.12 : (rowIdx === 1 ? 1.04 : (rowIdx === 2 ? 0.96 : 1.0));
    const h = CAP_H * rowScale;
    const geo = new THREE.BoxGeometry(bw, h, bd, 1, 1, 1);
    const pos = geo.attributes.position;
    const insetX = Math.min(0.115, bw * 0.14);
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > 0) {
        pos.setX(i, pos.getX(i) > 0 ? pos.getX(i) - insetX : pos.getX(i) + insetX);
        pos.setZ(i, pos.getZ(i) > 0 ? pos.getZ(i) - 0.145 : pos.getZ(i) + 0.09);
      }
    }
    const edges = new THREE.EdgesGeometry(geo, 22);
    geo.dispose();
    return edges;
  }

  // Audio engine is provided by js/audio.js (KB.createAudioEngine)

  KB.createStudio = function (container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151821);
    const keycapShapes = new Map();

    function getKeycapShape(def) {
      const isSpace = def.role === "space";
      const profileRow = Math.min(def.row, 3);
      const key = `${def.w}/${def.h}/${profileRow}/${isSpace}`;
      if (!keycapShapes.has(key)) {
        keycapShapes.set(key, {
          cap: createSculptedKeycapGeo(def.w, def.h, profileRow, isSpace),
          outline: createKeycapOutlineGeo(def.w, def.h, profileRow)
        });
      }
      return keycapShapes.get(key);
    }

    const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 180);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Procedural Studio PMREM Environment for realistic metallic/anodized reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a1f2c);
    const softbox1 = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    softbox1.position.set(0, 8, 2); softbox1.rotation.x = Math.PI / 2;
    envScene.add(softbox1);
    const softbox2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ color: 0xa6c8ff, side: THREE.DoubleSide }));
    softbox2.position.set(-10, 4, -4); softbox2.lookAt(0, 0, 0);
    envScene.add(softbox2);
    const softbox3 = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ color: 0xffd2a6, side: THREE.DoubleSide }));
    softbox3.position.set(10, 4, 4); softbox3.lookAt(0, 0, 0);
    envScene.add(softbox3);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();

    // Studio Floor & Complete 3D Desk Environment
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c202c, roughness: 0.9, metalness: 0.04 });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -18.0;
    floorMesh.receiveShadow = false;
    scene.add(floorMesh);

    const deskEnv = KB.createDeskEnvironment ? KB.createDeskEnvironment(scene) : null;
    let lastCaseDims = { w: 18, d: 8 };

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe6eefc, 0x262936, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.55);
    keyLight.position.set(9, 15, 11);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 45;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb9d4ff, 0.65);
    fillLight.position.set(-12, 8, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xdce8ff, 0.85);
    rimLight.position.set(0, 7, -14);
    scene.add(rimLight);

    // Keyboard Root Group (tilted for ergonomic typing angle)
    const kbPivot = new THREE.Group();
    kbPivot.rotation.x = TILT_RAD;
    scene.add(kbPivot);

    const walnutTex = KB.createWalnutTexture();
    const audio = KB.createAudioEngine();

    // Camera Controller State
    const cam = {
      theta: 0.0,
      phi: 0.86,
      radius: 17.5,
      target: new THREE.Vector3(0, 0.55, 0),
      goalTheta: 0.0,
      goalPhi: 0.86,
      goalRadius: 17.5,
      goalTarget: new THREE.Vector3(0, 0.55, 0),
      dragging: false,
      panning: false,
      moved: false,
      lastX: 0,
      lastY: 0,
      externalControl: false // true during video camera path playback
    };

    // Runtime state
    let currentLayout = null;
    let keyEntries = []; // { def, cfg, group, mesh, outline, baseY, pressOffset, textures }
    let keyById = {};
    let keyByCode = {};
    let caseGroup = null;
    let caseMeshes = [];
    let rgbMeshes = [];
    let knobGroup = null;
    let knobMatRef = null;
    let knobNotchMatRef = null;
    let caseMorph = null;
    let knobGrow = null;
    let retiringEntries = [];

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInCubic(t) { return t * t * t; }
    function easeOutBack(t) {
      const c1 = 1.55;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    let selectedIds = new Set();
    let hoveredKey = null;
    let envIntensity = 1.0;
    let lightAngleDeg = 38;
    let caseMaterialType = "aluminum";
    let caseColorHex = "#242731";
    let rgbEnabled = true;
    let rgbColorHex = "#7aa2ff";
    let onSelectionChange = null;
    let onHoverChange = null;

    function buildCaseMaterial() {
      const color = new THREE.Color(caseColorHex);
      if (caseMaterialType === "aluminum") {
        return new THREE.MeshStandardMaterial({
          color, roughness: 0.34, metalness: 0.78, envMapIntensity: envIntensity
        });
      }
      if (caseMaterialType === "acrylic") {
        return new THREE.MeshPhysicalMaterial({
          color, roughness: 0.38, metalness: 0.03,
          transparent: true, opacity: 0.80, depthWrite: true,
          clearcoat: 0.25, clearcoatRoughness: 0.4,
          envMapIntensity: envIntensity * 0.6
        });
      }
      if (caseMaterialType === "walnut") {
        return new THREE.MeshStandardMaterial({
          color: color.clone().lerp(new THREE.Color(0x9a6d4b), 0.5),
          map: walnutTex, roughness: 0.68, metalness: 0.04, envMapIntensity: envIntensity * 0.7
        });
      }
      // ceramic
      return new THREE.MeshStandardMaterial({
        color, roughness: 0.16, metalness: 0.08, envMapIntensity: envIntensity * 1.1
      });
    }

    function disposeKeyEntry(entry) {
      if (entry.textures) {
        entry.textures.topTex.dispose();
        entry.textures.frontTex.dispose();
      }
      if (entry.mesh) {
        if (Array.isArray(entry.mesh.material)) {
          entry.mesh.material.forEach((m) => m.dispose());
        }
      }
      if (entry.outline) {
        entry.outline.material.dispose();
      }
    }

    function clearRetiring() {
      retiringEntries.forEach((r) => {
        kbPivot.remove(r.entry.group);
        disposeKeyEntry(r.entry);
      });
      retiringEntries = [];
    }

    function clearKeyboard(keepCodes) {
      clearRetiring();
      const removed = [];
      keyEntries.forEach((entry) => {
        if (keepCodes && entry.def.code && !keepCodes.has(entry.def.code)) {
          removed.push(entry);
        } else {
          disposeKeyEntry(entry);
        }
      });
      keyEntries = [];
      keyById = {};
      keyByCode = {};
      caseGroup = null;
      caseMeshes = [];
      rgbMeshes = [];
      knobGroup = null;
      knobMatRef = null;
      knobNotchMatRef = null;
      knobGrow = null;
      caseMorph = null;
      selectedIds.clear();
      while (kbPivot.children.length > 0) {
        kbPivot.remove(kbPivot.children[0]);
      }
      removed.forEach((entry, idx) => {
        entry.outline.visible = false;
        kbPivot.add(entry.group);
        retiringEntries.push({
          entry,
          elapsed: 0,
          delay: Math.min(0.03, idx * 0.0012),
          duration: 0.13,
          startY: entry.group.position.y
        });
      });
    }

    function preservePrintedContrast(shader) {
      // Retain some scene shading while keeping the printed colors legible under bright lights.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <tonemapping_fragment>",
        `#include <tonemapping_fragment>
         vec3 printColor = pow(clamp(diffuseColor.rgb, 0.0, 1.0), vec3(1.16));
         gl_FragColor.rgb = mix(gl_FragColor.rgb, printColor, 0.82);`
      );
    }

    function updateKeycapVisual(entry) {
      if (entry.def.isKnob) return;
      if (entry.textures) {
        entry.textures.topTex.dispose();
        entry.textures.frontTex.dispose();
      }
      const texs = KB.createKeycapTextures(entry.cfg, entry.def.w, entry.def.h);
      entry.textures = texs;

      const sideColor = new THREE.Color(entry.cfg.bgColor).multiplyScalar(0.93);
      const [shell, top, front] = entry.mesh.material;
      shell.color.copy(sideColor);
      shell.envMapIntensity = envIntensity * 0.18;
      top.map = texs.topTex;
      top.color.setHex(0xffffff);
      top.envMapIntensity = envIntensity * 0.14;
      const presetArtwork = KB.DAFEIYU_ASSETS?.[entry.def.code];
      const isDafeiyuPrint = entry.cfg.pixelTheme === "dafeiyu" && entry.cfg.customImage &&
        entry.cfg.customImageUrl === presetArtwork?.url;
      top.onBeforeCompile = isDafeiyuPrint ? preservePrintedContrast : THREE.Material.prototype.onBeforeCompile;
      top.needsUpdate = true;

      front.map = texs.frontTex;
      front.color.setHex(0xffffff);
      front.envMapIntensity = envIntensity * 0.16;
      front.needsUpdate = true;
    }

    function loadLayout(layoutId, theme) {
      const layout = KB.LAYOUTS[layoutId];
      if (!layout) return;

      const isSwitch = Boolean(currentLayout);
      const prevW = lastCaseDims.w;
      const prevD = lastCaseDims.d;
      const prevPivotY = kbPivot.position.y;
      const prevPosByCode = {};
      if (isSwitch) {
        keyEntries.forEach((e) => {
          if (e.def.code) prevPosByCode[e.def.code] = { x: e.group.position.x, z: e.group.position.z };
        });
      }
      const incomingCodes = isSwitch ? new Set(layout.keys.map((k) => k.code).filter(Boolean)) : null;

      clearKeyboard(incomingCodes);
      currentLayout = layout;

      const W = layout.widthU * UNIT;
      const H = layout.heightU * UNIT;
      const bezel = 0.56;
      const caseW = W + bezel * 2;
      const caseD = H + bezel * 2;
      const caseH = 0.76;

      const lowestOffset = Math.sin(TILT_RAD) * (caseD / 2) + Math.cos(TILT_RAD) * (caseH / 2);
      const targetPivotY = lowestOffset + 0.045;
      kbPivot.position.set(0, isSwitch ? prevPivotY : targetPivotY, 0);

      caseGroup = new THREE.Group();
      kbPivot.add(caseGroup);

      function makeRoundedRectShape(w, d, r) {
        const s = new THREE.Shape();
        const hw = w / 2, hd = d / 2;
        s.moveTo(-hw + r, -hd);
        s.lineTo(hw - r, -hd);
        s.quadraticCurveTo(hw, -hd, hw, -hd + r);
        s.lineTo(hw, hd - r);
        s.quadraticCurveTo(hw, hd, hw - r, hd);
        s.lineTo(-hw + r, hd);
        s.quadraticCurveTo(-hw, hd, -hw, hd - r);
        s.lineTo(-hw, -hd + r);
        s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
        return s;
      }

      const caseMat = buildCaseMaterial();
      const bevSize = 0.075;
      const bevThick = 0.075;
      const baseDepth = caseH * 0.34;
      const wallDepth = caseH * 0.36;
      const cornerR = 0.34;

      const baseShape = makeRoundedRectShape(caseW - bevSize * 2, caseD - bevSize * 2, cornerR);
      const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
        depth: baseDepth, bevelEnabled: true, bevelThickness: bevThick, bevelSize: bevSize, bevelSegments: 5, curveSegments: 16
      });
      baseGeo.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseGeo, caseMat);
      baseMesh.position.y = -caseH / 2 + baseDepth + bevThick;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      caseGroup.add(baseMesh);
      caseMeshes.push(baseMesh);

      const frameShape = makeRoundedRectShape(caseW - bevSize * 2, caseD - bevSize * 2, cornerR);
      const hole = new THREE.Path();
      const ihw = W / 2 + 0.09, ihd = H / 2 + 0.09;
      const ir = 0.14;
      hole.moveTo(-ihw + ir, -ihd);
      hole.lineTo(ihw - ir, -ihd);
      hole.quadraticCurveTo(ihw, -ihd, ihw, -ihd + ir);
      hole.lineTo(ihw, ihd - ir);
      hole.quadraticCurveTo(ihw, ihd, ihw - ir, ihd);
      hole.lineTo(-ihw + ir, ihd);
      hole.quadraticCurveTo(-ihw, ihd, -ihw, ihd - ir);
      hole.lineTo(-ihw, -ihd + ir);
      hole.quadraticCurveTo(-ihw, -ihd, -ihw + ir, -ihd);
      frameShape.holes.push(hole);

      const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
        depth: wallDepth, bevelEnabled: true, bevelThickness: bevThick, bevelSize: bevSize, bevelSegments: 5, curveSegments: 16
      });
      frameGeo.rotateX(Math.PI / 2);
      const frameMesh = new THREE.Mesh(frameGeo, caseMat);
      frameMesh.position.y = caseH / 2 - bevThick + 0.04;
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      caseGroup.add(frameMesh);
      caseMeshes.push(frameMesh);

      const footMat = new THREE.MeshStandardMaterial({ color: 0x222630, roughness: 0.6, metalness: 0.3 });
      [-caseW * 0.38, caseW * 0.38].forEach((fx) => {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 0.45), footMat);
        foot.position.set(fx, -caseH / 2 - 0.14, -caseD * 0.38);
        caseGroup.add(foot);
      });

      const plateMesh = new THREE.Mesh(
        new THREE.BoxGeometry(W + 0.04, 0.06, H + 0.04),
        new THREE.MeshStandardMaterial({ color: 0x161922, roughness: 0.45, metalness: 0.6 })
      );
      plateMesh.position.y = 0.19;
      plateMesh.receiveShadow = true;
      caseGroup.add(plateMesh);

      const rgbMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgbColorHex), transparent: true, opacity: rgbEnabled ? 0.58 : 0.0
      });
      const rgbPlate = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, H - 0.1), rgbMat);
      rgbPlate.rotation.x = -Math.PI / 2;
      rgbPlate.position.y = 0.225;
      caseGroup.add(rgbPlate);
      rgbMeshes.push(rgbPlate);

      const stripMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgbColorHex), transparent: true, opacity: rgbEnabled ? 0.9 : 0.0
      });
      const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.42, 0.055, 0.04), stripMat);
      frontStrip.position.set(0, -0.02, caseD / 2 + 0.01);
      caseGroup.add(frontStrip);
      rgbMeshes.push(frontStrip);

      if (isSwitch) {
        const startSX = prevW / caseW;
        const startSZ = prevD / caseD;
        caseGroup.scale.set(startSX, 1, startSZ);
        caseMorph = { elapsed: 0, duration: 0.52, startSX, startSZ, startY: prevPivotY, targetY: targetPivotY };
      }

      const offsetX = -W / 2;
      const offsetZ = -H / 2;
      const hasContextMenu = layout.keys.some((k) => k.code === "ContextMenu");
      let newKeyCount = 0;

      layout.keys.forEach((def) => {
        const cx = offsetX + (def.x + def.w / 2) * UNIT;
        const cz = offsetZ + (def.y + def.h / 2) * UNIT;
        const baseY = 0.44;

        if (def.isKnob) {
          const g = new THREE.Group();
          g.position.set(cx, 0.42, cz);
          const knobColor = theme.id === "dafeiyu" ? 0x5c8fd6 : (theme.id === "aries" ? 0x152550 : 0xd4a853);
          const notchColor = theme.id === "dafeiyu" ? 0xe5ad32 : (theme.id === "aries" ? 0x00d4ff : 0x16171c);
          const knobMat = new THREE.MeshStandardMaterial({ color: knobColor, roughness: 0.22, metalness: 0.88 });
          knobMatRef = knobMat;
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.39, 0.38, 36), knobMat);
          body.castShadow = true; body.receiveShadow = true;
          g.add(body);
          const bevelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.36, 0.07, 36), knobMat);
          bevelCap.position.y = 0.225; bevelCap.castShadow = true;
          g.add(bevelCap);
          for (let f = 0; f < 20; f++) {
            const ang = (f / 20) * Math.PI * 2;
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.34, 0.03), knobMat);
            flute.position.set(Math.cos(ang) * 0.365, 0, Math.sin(ang) * 0.365);
            flute.rotation.y = -ang;
            g.add(flute);
          }
          const notchMat = new THREE.MeshBasicMaterial({ color: notchColor });
          knobNotchMatRef = notchMat;
          const notch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.18), notchMat);
          notch.position.set(0, 0.262, -0.15);
          g.add(notch);
          kbPivot.add(g);
          knobGroup = g;
          if (isSwitch) {
            g.scale.setScalar(0.001);
            g.position.y = -0.1;
            knobGrow = { elapsed: 0, delay: 0.24, duration: 0.42, baseY: 0.42 };
          }
          return;
        }

        const cfg = buildKeyConfigForTheme(def, theme, hasContextMenu);
        const group = new THREE.Group();
        group.position.set(cx, baseY, cz);

        const shape = getKeycapShape(def);
        const mats = [];
        for (let m = 0; m < 3; m++) {
          mats.push(new THREE.MeshStandardMaterial({
            color: 0xffffff, roughness: 0.78, metalness: 0.02, envMapIntensity: envIntensity * 0.16, fog: false
          }));
        }
        const mesh = new THREE.Mesh(shape.cap, mats);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.keyId = def.id;
        group.add(mesh);

        const outline = new THREE.LineSegments(
          shape.outline,
          new THREE.LineBasicMaterial({ color: 0x7aa2ff, transparent: true, opacity: 0.95 })
        );
        outline.scale.setScalar(1.02);
        outline.visible = false;
        group.add(outline);
        kbPivot.add(group);

        const entry = {
          def, cfg, group, mesh, outline, baseY,
          targetX: cx, targetZ: cz,
          pressOffset: 0, targetPress: 0, isDown: false,
          glideAnim: null, growAnim: null,
          textures: null
        };

        if (isSwitch) {
          const prev = def.code && prevPosByCode[def.code];
          if (prev) {
            group.position.x = prev.x;
            group.position.z = prev.z;
            entry.glideAnim = { elapsed: 0, duration: 0.48, fromX: prev.x, fromZ: prev.z };
          } else {
            newKeyCount++;
            const waveDelay = 0.06 + (def.x / Math.max(1, layout.widthU)) * 0.24 + (def.y / Math.max(1, layout.heightU)) * 0.08;
            group.scale.setScalar(0.001);
            group.position.y = baseY - 0.52;
            entry.growAnim = { elapsed: 0, delay: waveDelay, duration: 0.40, startY: baseY - 0.52 };
          }
        }

        updateKeycapVisual(entry);
        keyEntries.push(entry);
        keyById[def.id] = entry;
        if (def.code) keyByCode[def.code] = entry;
      });

      if (isSwitch && newKeyCount > 0) {
        setTimeout(() => audio.playClick(0.95), 90);
        setTimeout(() => audio.playClick(1.08), 185);
        setTimeout(() => audio.playClick(1.18), 285);
      } else if (isSwitch) {
        setTimeout(() => audio.playClick(0.86), 80);
      }

      lastCaseDims = { w: caseW, d: caseD };
      if (deskEnv) deskEnv.updateForKeyboard(caseW, caseD, theme, !isSwitch);
      setCameraPreset("overview");
      if (onSelectionChange) onSelectionChange([]);
    }

    function buildKeyConfigForTheme(def, theme, hasContextMenu) {
      const r = def.role;
      const bg =
        r === "accent" ? theme.accentBg :
        r === "mod" ? theme.modBg :
        r === "arrow" ? theme.arrowBg :
        r === "space" ? theme.spaceBg : theme.alphaBg;
      const fg =
        r === "accent" ? theme.accentFg :
        r === "arrow" && theme.arrowFg ? theme.arrowFg :
        r === "mod" || r === "arrow" ? theme.modFg : theme.alphaFg;

      const cfg = {
        label: def.label,
        sub: def.sub,
        showLegend: true,
        legendPos: "top",
        fontScale: 100,
        fontStyle: "sans",
        pixelTheme: "",
        pixelSparkle: false,
        bgColor: bg,
        fgColor: fg,
        pattern: "none",
        customImage: null,
        customImageUrl: "",
        texFit: "cover",
        texScale: 100,
        texRot: 0,
        defaultBg: bg,
        defaultFg: fg,
        defaultLabel: def.label,
        defaultSub: def.sub
      };

      if (theme.id === "aries" || theme.id === "dafeiyu") {
        const isDafeiyu = theme.id === "dafeiyu";
        cfg.fontStyle = isDafeiyu ? "sans" : "pixel";
        cfg.pixelTheme = theme.id;
        const assets = (isDafeiyu ? KB.DAFEIYU_ASSETS : KB.ARIES_SPECIAL_ASSETS) || {};
        const cache = (isDafeiyu ? KB._dafeiyuImgCache : KB._ariesImgCache) || {};
        let assetKey = def.code;
        if (!isDafeiyu && !hasContextMenu && def.code === "Home" && assets.ContextMenu) {
          assetKey = "ContextMenu";
        }
        const artwork = assetKey && assets[assetKey];
        if (artwork && cache[assetKey]) {
          cfg.bgColor = artwork.bg;
          cfg.defaultBg = artwork.bg;
          cfg.customImage = cache[assetKey];
          cfg.customImageUrl = artwork.url;
          cfg.texFit = "contain";
          cfg.showLegend = false;
          return cfg;
        }

        const isF5to8 = /^F[5-8]$/.test(def.label);
        const isF1to12 = /^F([1-9]|1[0-2])$/.test(def.label);
        const isWASD = ["W", "A", "S", "D"].includes(def.label);
        const isNumRow = (/^Digit[0-9]$/.test(def.code || "") || ["Backquote", "Minus", "Equal"].includes(def.code || ""));
        const isNumOp = ["NumpadDivide", "NumpadMultiply", "NumpadSubtract"].includes(def.code);
        const isNavOrNumOp = ["PRT", "SCR", "PAU", "INS", "HOME", "PGUP", "END", "PGDN", "NUM", "/", "*", "-", "+"].includes(def.label) && r === "mod";
        if (isDafeiyu) {
          if (isNumRow || isF5to8 || isNumOp) {
            cfg.bgColor = "#5c8fd6";
            cfg.fgColor = "#fffdf5";
            cfg.dafeiyuStyle = "wave";
          } else if (isF1to12) {
            cfg.bgColor = "#edf1f7";
            cfg.fgColor = "#4d7ec7";
            cfg.dafeiyuStyle = "starburst";
          } else if (isWASD) {
            cfg.bgColor = "#edf1f7";
            cfg.fgColor = "#4d7ec7";
            cfg.dafeiyuStyle = "wasd";
          } else if (r === "mod" || r === "arrow" || r === "accent") {
            cfg.bgColor = "#5c8fd6";
            cfg.fgColor = "#fffdf5";
            cfg.dafeiyuStyle = "pastel_mod";
          } else if (r === "space") {
            cfg.bgColor = "#5c8fd6";
            cfg.fgColor = "#fffdf5";
            cfg.dafeiyuStyle = "wave";
          } else {
            cfg.bgColor = "#edf1f7";
            cfg.fgColor = "#4d7ec7";
            cfg.dafeiyuStyle = "starburst";
          }
        } else {
          if (r === "arrow" || isF5to8) {
            cfg.bgColor = "#152550";
            cfg.fgColor = "#f8fafd";
            cfg.pixelSparkle = true;
          } else if (isNavOrNumOp) {
            cfg.bgColor = "#e0f2ff";
            cfg.fgColor = "#0d1b6e";
            cfg.pixelSparkle = def.label === "HOME" || def.label === "END";
          } else {
            cfg.bgColor = "#f8fafd";
            cfg.fgColor = "#0d1b6e";
            cfg.pixelSparkle = isWASD;
          }
        }
        cfg.defaultBg = cfg.bgColor;
        cfg.defaultFg = cfg.fgColor;
      }

      return cfg;
    }

    function getRecommendedRadius() {
      if (!currentLayout) return 24;
      const aspect = Math.max(1.0, window.innerWidth / Math.max(1, window.innerHeight));
      const aspectBoost = aspect < 1.55 ? (1.55 / aspect) : 1.0;
      return Math.max(22.5, currentLayout.widthU * 1.48) * aspectBoost;
    }

    function setCameraPreset(preset) {
      const r = getRecommendedRadius();
      if (preset === "overview" || preset === "hero") {
        cam.goalTheta = 0.24;
        cam.goalPhi = 0.88;
        cam.goalRadius = r;
        cam.goalTarget.set(0, 0.5, 0);
      } else if (preset === "top") {
        cam.goalTheta = 0.0;
        cam.goalPhi = 0.14;
        cam.goalRadius = r * 1.05;
        cam.goalTarget.set(0, 0.4, 0);
      } else if (preset === "side") {
        cam.goalTheta = 0.12;
        cam.goalPhi = 1.24;
        cam.goalRadius = r * 0.72;
        cam.goalTarget.set(0, 0.52, 1.0);
      }
    }

    function focusSelectedKey() {
      if (selectedIds.size === 0) return;
      const firstId = Array.from(selectedIds)[0];
      const entry = keyById[firstId];
      if (!entry) return;
      const worldPos = new THREE.Vector3();
      entry.group.getWorldPosition(worldPos);
      cam.goalTarget.copy(worldPos);
      cam.goalRadius = 3.8;
      cam.goalPhi = entry.cfg.legendPos === "side" ? 1.18 : 0.72;
      cam.goalTheta = 0.25;
    }

    function applyTheme(theme) {
      caseColorHex = theme.caseColor;
      caseMaterialType = theme.caseMat;
      rgbColorHex = theme.rgbColor;
      refreshCaseMaterial();
      refreshRGB();
      if (knobMatRef) {
        knobMatRef.color.setHex(theme.id === "dafeiyu" ? 0x5c8fd6 : (theme.id === "aries" ? 0x152550 : 0xd4a853));
      }
      if (knobNotchMatRef) {
        knobNotchMatRef.color.setHex(theme.id === "dafeiyu" ? 0xe5ad32 : (theme.id === "aries" ? 0x00d4ff : 0x16171c));
      }
      const hasContextMenu = currentLayout ? currentLayout.keys.some((k) => k.code === "ContextMenu") : true;
      keyEntries.forEach((entry) => {
        entry.cfg = buildKeyConfigForTheme(entry.def, theme, hasContextMenu);
        updateKeycapVisual(entry);
      });
      if (deskEnv) deskEnv.updateForKeyboard(lastCaseDims.w, lastCaseDims.d, theme);
    }

    function refreshCaseMaterial() {
      const mat = buildCaseMaterial();
      caseMeshes.forEach((m) => {
        if (m.material) m.material.dispose();
        m.material = mat;
      });
    }

    function refreshRGB() {
      const c = new THREE.Color(rgbColorHex);
      rgbMeshes.forEach((m, i) => {
        m.material.color.copy(c);
        m.material.opacity = rgbEnabled ? (i === 0 ? 0.55 : 0.92) : 0.0;
      });
    }

    function applyLightingPreset(preset) {
      scene.background = new THREE.Color(preset.bg);
      scene.fog = new THREE.Fog(preset.bg, 52, 145);
      floorMat.color.setHex(preset.floor);
      keyLight.color.setHex(preset.keyColor);
      keyLight.intensity = preset.keyInt;
      fillLight.color.setHex(preset.fillColor);
      fillLight.intensity = preset.fillInt;
      rimLight.color.setHex(preset.rimColor);
      rimLight.intensity = preset.rimInt;
      hemiLight.color.setHex(preset.hemiSky);
      hemiLight.groundColor.setHex(preset.hemiGround);
      hemiLight.intensity = preset.hemiInt;
      renderer.toneMappingExposure = preset.exposure;
      if (deskEnv) deskEnv.applyScenePreset(preset);
    }

    function setLightAngle(deg) {
      lightAngleDeg = deg;
      const rad = (deg * Math.PI) / 180;
      keyLight.position.set(Math.sin(rad) * 14, 15, Math.cos(rad) * 14);
    }

    function setEnvIntensity(val) {
      envIntensity = val;
      caseMeshes.forEach((m) => {
        if (m.material) m.material.envMapIntensity = val;
      });
      keyEntries.forEach((e) => {
        e.mesh.material.forEach((m) => { m.envMapIntensity = val * 0.16; });
      });
    }

    function setSelection(ids) {
      selectedIds = new Set(ids);
      keyEntries.forEach((e) => {
        e.outline.visible = selectedIds.has(e.def.id);
      });
      if (onSelectionChange) {
        onSelectionChange(Array.from(selectedIds).map((id) => keyById[id]).filter(Boolean));
      }
    }

    function setOutlinesVisible(visible) {
      keyEntries.forEach((e) => {
        e.outline.visible = visible && selectedIds.has(e.def.id);
      });
    }

    function pressKeyById(id, down = true) {
      const entry = keyById[id];
      if (!entry) return;
      entry.targetPress = down ? -0.14 : 0;
      if (down) {
        if (!entry.isDown) {
          entry.isDown = true;
          audio.playPress(entry.def);
        }
      } else if (entry.isDown) {
        entry.isDown = false;
        audio.playRelease(entry.def);
      }
    }

    function pressKeyByCode(code, down = true) {
      const entry = keyByCode[code];
      if (!entry) return;
      pressKeyById(entry.def.id, down);
    }

    function triggerWaveAnimation(progress) {
      // Ripple wave across X axis based on 0..1 progress
      if (!currentLayout) return;
      const waveX = (progress * 1.4 - 0.2) * currentLayout.widthU;
      keyEntries.forEach((e) => {
        const dist = Math.abs(e.def.x - waveX);
        e.targetPress = dist < 1.35 ? -0.13 * Math.cos((dist / 1.35) * (Math.PI / 2)) : 0;
      });
    }

    function clearWaveAnimation() {
      keyEntries.forEach((e) => { e.targetPress = 0; });
    }

    // Pointer Interaction (Orbit, Right-drag Pan, Zoom, Click to Select)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

    renderer.domElement.addEventListener("pointerdown", (e) => {
      if (cam.externalControl) return;
      cam.dragging = true;
      cam.panning = e.button === 2 || e.shiftKey && e.button === 1;
      cam.moved = false;
      cam.lastX = e.clientX;
      cam.lastY = e.clientY;
    });

    window.addEventListener("pointermove", (e) => {
      if (cam.dragging && !cam.externalControl) {
        const dx = e.clientX - cam.lastX;
        const dy = e.clientY - cam.lastY;
        if (Math.abs(dx) + Math.abs(dy) > 3) cam.moved = true;
        if (cam.panning) {
          const panSpeed = cam.radius * 0.0014;
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
          const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
          cam.goalTarget.addScaledVector(right, -dx * panSpeed);
          cam.goalTarget.addScaledVector(up, dy * panSpeed);
        } else {
          cam.goalTheta -= dx * 0.007;
          cam.goalPhi = Math.max(0.12, Math.min(1.48, cam.goalPhi - dy * 0.006));
        }
        cam.lastX = e.clientX;
        cam.lastY = e.clientY;
        if (onHoverChange) onHoverChange(null, e.clientX, e.clientY);
        return;
      }

      // Hover raycast
      const rect = renderer.domElement.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const meshes = keyEntries.map((k) => k.mesh);
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        const hitEntry = keyById[hits[0].object.userData.keyId];
        hoveredKey = hitEntry;
        renderer.domElement.style.cursor = "pointer";
        if (onHoverChange) onHoverChange(hitEntry, e.clientX, e.clientY);
      } else {
        hoveredKey = null;
        renderer.domElement.style.cursor = "grab";
        if (onHoverChange) onHoverChange(null, e.clientX, e.clientY);
      }
    });

    window.addEventListener("pointerup", (e) => {
      const wasClick = cam.dragging && !cam.moved && e.button === 0;
      cam.dragging = false;
      cam.panning = false;
      if (!wasClick || cam.externalControl) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(keyEntries.map((k) => k.mesh), false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.keyId;
        pressKeyById(id, true);
        setTimeout(() => pressKeyById(id, false), 120);
        if (e.shiftKey) {
          const next = new Set(selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setSelection(Array.from(next));
        } else {
          setSelection([id]);
        }
      }
    });

    renderer.domElement.addEventListener("wheel", (e) => {
      if (cam.externalControl) return;
      e.preventDefault();
      cam.goalRadius = Math.max(2.8, Math.min(48, cam.goalRadius + e.deltaY * 0.012));
    }, { passive: false });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Main Render Loop
    const clock = new THREE.Clock();
    let frameCallback = null;
    let lastFrameTime = 0;
    let lastInteraction = performance.now();
    ["pointerdown", "wheel", "keydown", "input"].forEach((event) => {
      window.addEventListener(event, () => { lastInteraction = performance.now(); }, { passive: true });
    });

    function updateCameraTransform() {
      camera.position.set(
        cam.target.x + cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta),
        cam.target.y + cam.radius * Math.cos(cam.phi),
        cam.target.z + cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta)
      );
      camera.lookAt(cam.target);
    }

    function animate(now) {
      requestAnimationFrame(animate);
      const active = cam.externalControl || cam.dragging || caseMorph || retiringEntries.length ||
        now - lastInteraction < 900;
      if (!active && now - lastFrameTime < 1000 / 30 - 2) return;
      lastFrameTime = now;
      const dt = Math.min(clock.getDelta(), 0.05);

      if (frameCallback) frameCallback(dt);
      if (deskEnv) deskEnv.animate(dt, clock.elapsedTime);

      if (!cam.externalControl) {
        const k = 1 - Math.exp(-8 * dt);
        cam.theta += (cam.goalTheta - cam.theta) * k;
        cam.phi += (cam.goalPhi - cam.phi) * k;
        cam.radius += (cam.goalRadius - cam.radius) * k;
        cam.target.lerp(cam.goalTarget, k);
      }
      updateCameraTransform();

      // 1. Keyboard case morphing animation (grow/shrink elasticity)
      if (caseMorph && caseGroup) {
        caseMorph.elapsed += dt;
        const u = Math.min(1, caseMorph.elapsed / caseMorph.duration);
        const eScale = easeOutBack(u);
        const eY = easeOutCubic(u);
        caseGroup.scale.set(
          caseMorph.startSX + (1 - caseMorph.startSX) * eScale,
          1,
          caseMorph.startSZ + (1 - caseMorph.startSZ) * eScale
        );
        kbPivot.position.y = caseMorph.startY + (caseMorph.targetY - caseMorph.startY) * eY;
        if (u >= 1) {
          caseGroup.scale.set(1, 1, 1);
          kbPivot.position.y = caseMorph.targetY;
          caseMorph = null;
        }
      }

      // 2. Retiring removed keys shrink & sink downward cleanly
      if (retiringEntries.length > 0) {
        for (let i = retiringEntries.length - 1; i >= 0; i--) {
          const r = retiringEntries[i];
          r.elapsed += dt;
          if (r.elapsed < r.delay) continue;
          const u = Math.min(1, (r.elapsed - r.delay) / r.duration);
          const e = easeOutCubic(u);
          const sc = Math.max(0.001, 1 - e);
          r.entry.group.scale.setScalar(sc);
          r.entry.group.position.y = r.startY - e * 0.55;
          if (u >= 1) {
            kbPivot.remove(r.entry.group);
            disposeKeyEntry(r.entry);
            retiringEntries.splice(i, 1);
          }
        }
      }

      // 3. Keycap glide, staggered pop-up growth & typing depression animation
      const pk = 1 - Math.exp(-24 * dt);
      for (let i = 0; i < keyEntries.length; i++) {
        const e = keyEntries[i];
        e.pressOffset += (e.targetPress - e.pressOffset) * pk;

        if (e.glideAnim) {
          e.glideAnim.elapsed += dt;
          const u = Math.min(1, e.glideAnim.elapsed / e.glideAnim.duration);
          const k = easeOutCubic(u);
          e.group.position.x = e.glideAnim.fromX + (e.targetX - e.glideAnim.fromX) * k;
          e.group.position.z = e.glideAnim.fromZ + (e.targetZ - e.glideAnim.fromZ) * k;
          if (u >= 1) e.glideAnim = null;
        }

        if (e.growAnim) {
          e.growAnim.elapsed += dt;
          if (e.growAnim.elapsed < e.growAnim.delay) {
            e.group.scale.setScalar(0.001);
            e.group.position.y = e.growAnim.startY;
          } else {
            const u = Math.min(1, (e.growAnim.elapsed - e.growAnim.delay) / e.growAnim.duration);
            const k = easeOutBack(u);
            const sc = Math.max(0.001, k);
            e.group.scale.set(sc, sc, sc);
            e.group.position.y = e.growAnim.startY + (e.baseY - e.growAnim.startY) * Math.min(1.06, k) + e.pressOffset;
            if (u >= 1) {
              e.group.scale.set(1, 1, 1);
              e.growAnim = null;
            }
          }
        } else {
          e.group.position.y = e.baseY + e.pressOffset;
        }
      }

      // 4. Rotary knob pop-up growth + idle shimmer
      if (knobGroup) {
        if (knobGrow) {
          knobGrow.elapsed += dt;
          if (knobGrow.elapsed >= knobGrow.delay) {
            const u = Math.min(1, (knobGrow.elapsed - knobGrow.delay) / knobGrow.duration);
            const k = easeOutBack(u);
            const sc = Math.max(0.001, k);
            knobGroup.scale.setScalar(sc);
            knobGroup.position.y = -0.1 + (knobGrow.baseY + 0.1) * Math.min(1.05, k);
            knobGroup.rotation.y = (1 - easeOutCubic(u)) * Math.PI * 1.2;
            if (u >= 1) {
              knobGroup.scale.set(1, 1, 1);
              knobGroup.position.y = knobGrow.baseY;
              knobGrow = null;
            }
          }
        } else if (hoveredKey === null) {
          knobGroup.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.15;
        }
      }

      // Subtle RGB breathing
      if (rgbEnabled && rgbMeshes.length > 0) {
        const pulse = 0.5 + 0.08 * Math.sin(clock.elapsedTime * 2.2);
        rgbMeshes[0].material.opacity = pulse;
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    return {
      scene,
      camera,
      renderer,
      cam,
      audio,
      loadLayout,
      applyTheme,
      applyLightingPreset,
      setCameraPreset,
      focusSelectedKey,
      setLightAngle,
      setEnvIntensity,
      setExposure(v) { renderer.toneMappingExposure = v; },
      setCaseMaterial(type) { caseMaterialType = type; refreshCaseMaterial(); },
      setCaseColor(hex) { caseColorHex = hex; refreshCaseMaterial(); },
      setRGBEnabled(v) { rgbEnabled = v; refreshRGB(); },
      setDeskMatVisible(v) { if (deskEnv) deskEnv.setVisible(v); },
      getSceneSettings() {
        return {
          caseMaterial: caseMaterialType,
          caseColor: caseColorHex,
          rgbEnabled,
          deskVisible: deskEnv ? deskEnv.group.visible : true,
          exposure: renderer.toneMappingExposure,
          lightAngle: lightAngleDeg,
          envIntensity,
          switchType: audio.getSwitchType()
        };
      },
      applyKeyConfigs(savedKeys) {
        if (!Array.isArray(savedKeys)) return Promise.resolve();
        const tasks = [];
        savedKeys.forEach((sk) => {
          const entry = (sk.id && keyById[sk.id]) || (sk.code && keyByCode[sk.code]);
          if (!entry) return;
          const fields = [
            "label", "sub", "showLegend", "legendPos", "fontScale",
            "fontStyle", "pixelSparkle", "bgColor", "fgColor", "pattern",
            "texFit", "texScale", "texRot"
          ];
          fields.forEach((k) => {
            if (sk[k] !== undefined) entry.cfg[k] = sk[k];
          });
          if (sk.customImageUrl) {
            entry.cfg.customImageUrl = sk.customImageUrl;
            tasks.push(new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                entry.cfg.customImage = img;
                updateKeycapVisual(entry);
                resolve();
              };
              img.onerror = () => { updateKeycapVisual(entry); resolve(); };
              img.src = sk.customImageUrl;
            }));
          } else {
            entry.cfg.customImage = null;
            entry.cfg.customImageUrl = "";
            updateKeycapVisual(entry);
          }
        });
        return Promise.all(tasks);
      },
      setSelection,
      setOutlinesVisible,
      getSelectedEntries() { return Array.from(selectedIds).map((id) => keyById[id]).filter(Boolean); },
      getAllEntries() { return keyEntries; },
      getLayout() { return currentLayout; },
      getRecommendedRadius,
      updateKeycapVisual,
      pressKeyByCode,
      triggerWaveAnimation,
      clearWaveAnimation,
      updateCameraTransform,
      setFrameCallback(fn) { frameCallback = fn; },
      setOnSelectionChange(fn) { onSelectionChange = fn; },
      setOnHoverChange(fn) { onHoverChange = fn; }
    };
  };
})(window.KB);
