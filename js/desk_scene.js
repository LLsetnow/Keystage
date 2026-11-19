(function (KB) {
  function makeRoundedRectShape(w, d, r) {
    const s = new THREE.Shape();
    const hw = w / 2, hd = d / 2;
    const cr = Math.min(r, hw * 0.45, hd * 0.45);
    s.moveTo(-hw + cr, -hd);
    s.lineTo(hw - cr, -hd);
    s.quadraticCurveTo(hw, -hd, hw, -hd + cr);
    s.lineTo(hw, hd - cr);
    s.quadraticCurveTo(hw, hd, hw - cr, hd);
    s.lineTo(-hw + cr, hd);
    s.quadraticCurveTo(-hw, hd, -hw, hd - cr);
    s.lineTo(-hw, -hd + cr);
    s.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);
    return s;
  }

  // Extruded rounded-box centered at (0, 0, 0) with smooth CNC bevels
  function makeRoundedBoxGeo(w, h, d, r, bevel = 0.06, segs = 3) {
    const b = Math.min(bevel, h * 0.35, w * 0.2, d * 0.2);
    const shape = makeRoundedRectShape(Math.max(0.05, w - b * 2), Math.max(0.05, d - b * 2), Math.max(0.02, r));
    const depth = Math.max(0.02, h - b * 2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: b > 0,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: segs,
      curveSegments: 10
    });
    geo.rotateX(Math.PI / 2);
    geo.center();
    return geo;
  }

  function makeWoodCanvas(baseHex, grainDark, grainLight) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 85; i++) {
      const y = (i / 85) * 512;
      ctx.strokeStyle = i % 3 === 0 ? grainDark : grainLight;
      ctx.lineWidth = 1.4 + (i % 4) * 0.9;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + Math.sin(i * 0.7) * 10, 340, y - Math.cos(i * 0.5) * 10, 512, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1.6);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makePhoneScreenTexture() {
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 320;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 160, 320);
    g.addColorStop(0, "#1d2b53");
    g.addColorStop(0.55, "#3a4d8f");
    g.addColorStop(1, "#7b5ea7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 160, 320);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "center";
    ctx.font = "700 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("20:00", 80, 96);
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("11月18日 星期三", 80, 122);
    // Subtle notification card
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(16, 168, 128, 46);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(26, 180, 74, 6);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(26, 194, 96, 5);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeClockTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 96;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#10131c";
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = "#7ce8ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 50px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText("20:00", 128, 50);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeMonitorWallpaper(styleId) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 224;
    const ctx = c.getContext("2d");

    if (styleId === "sunset") {
      const g = ctx.createLinearGradient(0, 0, 0, 224);
      g.addColorStop(0, "#241936");
      g.addColorStop(0.55, "#b85b52");
      g.addColorStop(1, "#f5b878");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 224);
      ctx.fillStyle = "rgba(255, 236, 186, 0.85)";
      ctx.beginPath(); ctx.arc(256, 118, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2b1c2e";
      ctx.beginPath(); ctx.moveTo(0, 165); ctx.quadraticCurveTo(130, 128, 260, 158);
      ctx.quadraticCurveTo(390, 132, 512, 162); ctx.lineTo(512, 224); ctx.lineTo(0, 224); ctx.fill();
    } else if (styleId === "cyber") {
      const g = ctx.createLinearGradient(0, 0, 512, 224);
      g.addColorStop(0, "#0b1026");
      g.addColorStop(0.5, "#19123a");
      g.addColorStop(1, "#2a0e38");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 224);
      ctx.strokeStyle = "rgba(0, 232, 255, 0.45)";
      ctx.lineWidth = 1.5;
      for (let y = 128; y <= 224; y += 16) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
      }
      for (let x = -120; x <= 632; x += 48) {
        ctx.beginPath(); ctx.moveTo(256 + (x - 256) * 0.25, 128); ctx.lineTo(x, 224); ctx.stroke();
      }
      ctx.fillStyle = "#ff2e88";
      ctx.fillRect(28, 28, 120, 8);
      ctx.fillStyle = "#00e8ff";
      ctx.fillRect(28, 44, 86, 6);
      ctx.fillRect(28, 56, 146, 6);
    } else if (styleId === "gallery") {
      const g = ctx.createLinearGradient(0, 0, 512, 224);
      g.addColorStop(0, "#f2f5fa");
      g.addColorStop(1, "#dbe4f2");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 224);
      ctx.fillStyle = "rgba(100, 135, 200, 0.16)";
      ctx.beginPath(); ctx.arc(360, 110, 85, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#33415c";
      ctx.font = "700 26px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("KEYSTAGE STUDIO", 36, 118);
    } else if (styleId === "dramatic") {
      ctx.fillStyle = "#0d1018";
      ctx.fillRect(0, 0, 512, 224);
      ctx.fillStyle = "#161b29";
      ctx.fillRect(18, 18, 220, 188);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i % 3 === 0 ? "#ffd08a" : (i % 2 === 0 ? "#6ea6ff" : "rgba(255,255,255,0.28)");
        ctx.fillRect(32, 34 + i * 18, 55 + ((i * 37) % 120), 6);
      }
      ctx.fillStyle = "#ffe2b0";
      ctx.font = "600 40px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText("22:45", 295, 124);
    } else {
      const g = ctx.createLinearGradient(0, 0, 512, 224);
      g.addColorStop(0, "#141c2f");
      g.addColorStop(0.6, "#1f2c48");
      g.addColorStop(1, "#25395e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 224);
      ctx.strokeStyle = "rgba(122, 178, 255, 0.42)";
      ctx.lineWidth = 2.5;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let x = 0; x <= 512; x += 16) {
          const y = 135 + Math.sin(x * 0.02 + k * 1.1) * (16 + k * 6);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(240, 246, 255, 0.88)";
      ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Keystage Workspace", 32, 54);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fillRect(166, 200, 180, 14);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function buildCoiledCable(cableMat, metalMat, plugX, plugZ, grommetX, grommetZ) {
    const group = new THREE.Group();
    const coilZ = plugZ - 1.55;
    const coilStartX = plugX + 0.58;
    const coilLen = 5.4;
    const coilEndX = coilStartX + coilLen;
    const r = 0.24;
    const coilCenterY = 0.30;

    // 1. Chamfered CNC USB-C housing + strain relief collar plugged cleanly into keyboard back
    const plug = new THREE.Mesh(makeRoundedBoxGeo(0.50, 0.24, 0.66, 0.06, 0.03, 2), metalMat);
    plug.position.set(plugX, 0.44, plugZ - 0.22);
    plug.castShadow = true;
    group.add(plug);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.24, 14), metalMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(plugX, 0.44, plugZ - 0.62);
    group.add(collar);

    // 2. Continuous device-side wire: USB-C collar -> coil -> aviator left entry (zero gap)
    const devicePts = [
      new THREE.Vector3(plugX, 0.44, plugZ - 0.68),
      new THREE.Vector3(plugX, 0.22, plugZ - 1.18),
      new THREE.Vector3(coilStartX - 0.28, 0.18, coilZ + r * 0.6)
    ];
    const turns = 20;
    for (let i = 0; i <= turns * 12; i++) {
      const t = i / (turns * 12);
      const ang = t * turns * Math.PI * 2;
      devicePts.push(new THREE.Vector3(
        coilStartX + t * coilLen,
        coilCenterY + Math.sin(ang) * r,
        coilZ + Math.cos(ang) * r
      ));
    }
    const avCenterX = coilEndX + 1.05;
    devicePts.push(
      new THREE.Vector3(coilEndX + 0.22, 0.24, coilZ + r * 0.35),
      new THREE.Vector3(avCenterX - 0.62, 0.24, coilZ)
    );
    const deviceMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(devicePts), 280, 0.064, 8, false), cableMat);
    deviceMesh.castShadow = true;
    group.add(deviceMesh);

    // 3. Multi-piece GX16 Metallic Aviator Coupler with strain-relief boots on both ends
    const avBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.18, 20), metalMat);
    avBody.rotation.z = Math.PI / 2;
    avBody.position.set(avCenterX, 0.24, coilZ);
    avBody.castShadow = true;
    group.add(avBody);

    const avNut = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.28, 12), metalMat);
    avNut.rotation.z = Math.PI / 2;
    avNut.position.set(avCenterX, 0.24, coilZ);
    group.add(avNut);

    [-0.64, 0.64].forEach((dx) => {
      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.22, 14), metalMat);
      boot.rotation.z = dx < 0 ? Math.PI / 2 : -Math.PI / 2;
      boot.position.set(avCenterX + dx, 0.24, coilZ);
      group.add(boot);
    });

    // 4. Host cable routing smoothly along the desk around the monitor stand into the cable grommet
    const hostCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(avCenterX + 0.68, 0.24, coilZ),
      new THREE.Vector3(Math.max(avCenterX + 1.6, grommetX - 0.3), 0.11, coilZ - 0.45),
      new THREE.Vector3(grommetX, 0.09, (coilZ + grommetZ) * 0.5),
      new THREE.Vector3(grommetX, 0.09, grommetZ + 0.42),
      new THREE.Vector3(grommetX, 0.04, grommetZ),
      new THREE.Vector3(grommetX, -0.35, grommetZ)
    ]);
    const hostMesh = new THREE.Mesh(new THREE.TubeGeometry(hostCurve, 44, 0.068, 10, false), cableMat);
    hostMesh.castShadow = true;
    group.add(hostMesh);

    return group;
  }

  function buildDetailedMouse(shellMat, darkMat, accentMat) {
    const g = new THREE.Group();

    // Base PTFE glide skirt
    const skirt = new THREE.Mesh(makeRoundedBoxGeo(2.05, 0.16, 3.45, 0.78, 0.04, 3), darkMat);
    skirt.position.y = 0.09;
    skirt.castShadow = true;
    skirt.receiveShadow = true;
    g.add(skirt);

    // Sculpted palm shell
    const bodyGeo = new THREE.SphereGeometry(1.18, 28, 20);
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (y < 0) y *= 0.25;
      // Slightly fuller palm toward back (+z), sleeker front buttons (-z)
      const zNorm = z / 1.18;
      x *= 0.94 - zNorm * 0.06;
      y *= 0.62 + Math.max(0, zNorm) * 0.12;
      z *= 1.54;
      pos.setXYZ(i, x, y, z);
    }
    bodyGeo.computeVertexNormals();
    const shell = new THREE.Mesh(bodyGeo, shellMat);
    shell.position.y = 0.36;
    shell.castShadow = true;
    shell.receiveShadow = true;
    g.add(shell);

    // Central button split seam + scroll wheel housing
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 1.35), darkMat);
    seam.position.set(0, 0.86, -0.95);
    seam.rotation.x = 0.18;
    g.add(seam);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.22, 20), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.94, -0.92);
    g.add(wheel);

    // Side thumb buttons (left side of mouse)
    [-0.25, 0.32].forEach((dz) => {
      const sb = new THREE.Mesh(makeRoundedBoxGeo(0.1, 0.14, 0.44, 0.03, 0.02, 2), darkMat);
      sb.position.set(-1.05, 0.56, dz - 0.15);
      g.add(sb);
    });

    // Subtle DPI LED bar
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.22), accentMat);
    led.position.set(0, 1.03, -0.32);
    g.add(led);

    return g;
  }

  function buildCeramicMug(mugMat, metalMat) {
    const g = new THREE.Group();

    // Cork coaster with beveled edge
    const coaster = new THREE.Mesh(
      new THREE.CylinderGeometry(1.24, 1.28, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0x6c4c34, roughness: 0.88 })
    );
    coaster.position.y = 0.06;
    coaster.receiveShadow = true;
    g.add(coaster);

    // LatheGeometry thick-walled hollow ceramic mug with rounded lip
    const pts = [
      new THREE.Vector2(0.0, 0.12),
      new THREE.Vector2(0.84, 0.12),
      new THREE.Vector2(0.92, 0.24),
      new THREE.Vector2(0.96, 1.98),
      new THREE.Vector2(0.92, 2.08),
      new THREE.Vector2(0.84, 2.08),
      new THREE.Vector2(0.81, 1.96),
      new THREE.Vector2(0.76, 0.34),
      new THREE.Vector2(0.0, 0.34)
    ];
    const mugMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mugMat);
    mugMesh.castShadow = true;
    mugMesh.receiveShadow = true;
    g.add(mugMesh);

    // Glossy coffee surface
    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.81, 28),
      new THREE.MeshStandardMaterial({ color: 0x3b2214, roughness: 0.15, metalness: 0.05 })
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 1.76;
    g.add(coffee);

    // Curved ceramic handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.11, 12, 24, Math.PI), mugMat);
    handle.position.set(0.9, 1.12, 0);
    handle.rotation.z = -Math.PI / 2;
    handle.castShadow = true;
    g.add(handle);

    // Metallic stir spoon resting diagonally inside mug
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 2.35, 10), metalMat);
    spoon.position.set(-0.24, 1.52, 0.1);
    spoon.rotation.z = 0.34;
    g.add(spoon);

    // Rising steam puffs
    const steamPuffs = [];
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
      );
      puff.userData.phase = i * 0.65;
      g.add(puff);
      steamPuffs.push(puff);
    }

    return { group: g, steamPuffs };
  }

  function buildDesktopDAC(darkMetal, silverMetal, accentMat) {
    const g = new THREE.Group();
    const chassis = new THREE.Mesh(makeRoundedBoxGeo(4.8, 1.15, 3.2, 0.16, 0.06, 3), darkMetal);
    chassis.position.y = 0.62;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    g.add(chassis);

    // Rubber feet
    [[-1.9, -1.2], [1.9, -1.2], [-1.9, 1.2], [1.9, 1.2]].forEach(([fx, fz]) => {
      const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), darkMetal);
      ft.position.set(fx, 0.05, fz);
      g.add(ft);
    });

    // Big knurled volume dial on right front
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.45, 28), silverMetal);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(1.5, 0.62, 1.72);
    g.add(dial);

    // 6.35mm & 4.4mm headphone jacks on left front
    [-1.55, -0.85].forEach((jx) => {
      const jack = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 18), silverMetal);
      jack.position.set(jx, 0.62, 1.61);
      g.add(jack);
    });

    // Mini glowing OLED meter screen
    const oled = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.48), accentMat);
    oled.position.set(0.05, 0.65, 1.61);
    g.add(oled);

    return g;
  }

  function buildPhoneStand(metalMat) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(makeRoundedBoxGeo(2.4, 0.16, 2.6, 0.22, 0.04, 3), metalMat);
    base.position.y = 0.08;
    base.castShadow = true;
    g.add(base);

    const neck = new THREE.Mesh(makeRoundedBoxGeo(1.1, 2.1, 0.16, 0.1, 0.03, 2), metalMat);
    neck.position.set(0, 1.05, -0.35);
    neck.rotation.x = -0.35;
    neck.castShadow = true;
    g.add(neck);

    // Smartphone body tilted on stand
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0, 2.05, 0.05);
    phoneGroup.rotation.x = -0.35;

    const frame = new THREE.Mesh(
      makeRoundedBoxGeo(2.15, 4.2, 0.24, 0.28, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x1d212b, roughness: 0.28, metalness: 0.78 })
    );
    frame.castShadow = true;
    phoneGroup.add(frame);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.94, 3.92),
      new THREE.MeshBasicMaterial({ map: makePhoneScreenTexture() })
    );
    screen.position.z = 0.125;
    phoneGroup.add(screen);

    g.add(phoneGroup);
    return g;
  }

  function buildSwitchTester() {
    const g = new THREE.Group();
    const acrylic = new THREE.MeshPhysicalMaterial({
      color: 0xeaf2ff, roughness: 0.22, metalness: 0.04, transparent: true, opacity: 0.72
    });
    const block = new THREE.Mesh(makeRoundedBoxGeo(2.45, 0.56, 2.45, 0.18, 0.05, 3), acrylic);
    block.position.y = 0.28;
    block.castShadow = true;
    block.receiveShadow = true;
    g.add(block);

    const switchColors = [0x4cc9f0, 0xf72585, 0xffbe0b, 0x52b788];
    const coords = [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]];
    coords.forEach(([sx, sz], idx) => {
      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.28, 0.45),
        new THREE.MeshStandardMaterial({ color: switchColors[idx], roughness: 0.35 })
      );
      stem.position.set(sx, 0.68, sz);
      g.add(stem);

      const clearCap = new THREE.Mesh(makeRoundedBoxGeo(0.76, 0.34, 0.76, 0.08, 0.04, 2), acrylic);
      clearCap.position.set(sx, 0.92, sz);
      g.add(clearCap);
    });
    return g;
  }

  function buildValetTray(trayMat, metalMat) {
    const g = new THREE.Group();
    // Outer beveled tray base + raised rim
    const base = new THREE.Mesh(makeRoundedBoxGeo(4.8, 0.22, 3.1, 0.32, 0.05, 3), trayMat);
    base.position.y = 0.11;
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);

    const rimShape = makeRoundedRectShape(4.7, 3.0, 0.3);
    const hole = makeRoundedRectShape(4.25, 2.55, 0.2);
    rimShape.holes.push(hole);
    const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
      depth: 0.28, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 10
    });
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, trayMat);
    rim.position.y = 0.48;
    rim.castShadow = true;
    g.add(rim);

    // Fountain pen inside tray
    const penBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.09, 3.4, 14),
      new THREE.MeshStandardMaterial({ color: 0x1b2336, roughness: 0.22, metalness: 0.5 })
    );
    penBody.rotation.z = Math.PI / 2;
    penBody.rotation.y = 0.12;
    penBody.position.set(-0.1, 0.32, -0.45);
    g.add(penBody);

    const penRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 14), metalMat);
    penRing.rotation.z = Math.PI / 2;
    penRing.rotation.y = 0.12;
    penRing.position.set(0.3, 0.32, -0.5);
    g.add(penRing);

    // Wire keycap puller next to pen
    const pullerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.45, 14), metalMat);
    pullerHandle.rotation.z = Math.PI / 2;
    pullerHandle.rotation.y = -0.08;
    pullerHandle.position.set(-0.9, 0.34, 0.55);
    g.add(pullerHandle);

    const wireLoop = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 8, 20), metalMat);
    wireLoop.rotation.x = Math.PI / 2;
    wireLoop.scale.set(2.1, 0.68, 1);
    wireLoop.position.set(0.55, 0.3, 0.45);
    g.add(wireLoop);

    return g;
  }

  KB.createDeskEnvironment = function (scene) {
    const envGroup = new THREE.Group();
    scene.add(envGroup);

    const woodTexWarm = makeWoodCanvas("#6b4a33", "rgba(32,18,8,0.28)", "rgba(165,116,78,0.16)");
    const woodTexDark = makeWoodCanvas("#242731", "rgba(10,12,18,0.35)", "rgba(255,255,255,0.04)");
    const woodTexLight = makeWoodCanvas("#d9d0c3", "rgba(120,104,88,0.16)", "rgba(255,255,255,0.25)");

    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x222631, roughness: 0.32, metalness: 0.78 });
    const silverMetal = new THREE.MeshStandardMaterial({ color: 0xd4dae4, roughness: 0.24, metalness: 0.88 });
    const brassMetal = new THREE.MeshStandardMaterial({ color: 0xd4a853, roughness: 0.28, metalness: 0.86 });

    // ---- 1. CHAMFERED SOLID DESK TABLETOP & ARCHITECTURAL LEGS ----
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, map: woodTexDark, roughness: 0.72, metalness: 0.05
    });
    const deskTop = new THREE.Mesh(makeRoundedBoxGeo(64, 1.15, 31, 0.45, 0.1, 4), deskMat);
    deskTop.position.set(0, -0.58, -2.0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    envGroup.add(deskTop);

    // Metallic cable grommet ring + dark pass-through hole cleanly outside the monitor stand base
    const GROMMET_X = 5.4;
    const GROMMET_Z = -10.4;
    const grommetGroup = new THREE.Group();
    grommetGroup.position.set(GROMMET_X, 0.015, GROMMET_Z);
    const grommetRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.09, 12, 28), darkMetal);
    grommetRing.rotation.x = Math.PI / 2;
    grommetGroup.add(grommetRing);
    const grommetHole = new THREE.Mesh(
      new THREE.CircleGeometry(0.52, 24),
      new THREE.MeshBasicMaterial({ color: 0x06070a })
    );
    grommetHole.rotation.x = -Math.PI / 2;
    grommetHole.position.y = 0.005;
    grommetGroup.add(grommetHole);
    envGroup.add(grommetGroup);

    [[-27, -9.5, -13.5], [27, -9.5, -13.5], [-27, -9.5, 9.5], [27, -9.5, 9.5]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(makeRoundedBoxGeo(1.15, 17, 1.15, 0.14, 0.05, 2), darkMetal);
      leg.position.set(x, y, z);
      envGroup.add(leg);
    });

    // ---- 2. ROUNDED EXTENDED DESK MAT ----
    const deskPadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, map: KB.createDeskMatTexture(), roughness: 0.94, metalness: 0.02
    });
    const deskPad = new THREE.Mesh(makeRoundedBoxGeo(32, 0.07, 13.4, 0.5, 0.02, 2), deskPadMat);
    deskPad.position.set(1.2, 0.025, 0.55);
    deskPad.receiveShadow = true;
    envGroup.add(deskPad);

    // ---- 3. ERGONOMIC WALNUT/WOOD WRIST REST (dynamically scaled to keyboard width!) ----
    const wristMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, map: woodTexWarm, roughness: 0.62, metalness: 0.04
    });
    const wristRest = new THREE.Mesh(makeRoundedBoxGeo(17.1, 0.52, 2.35, 0.24, 0.08, 4), wristMat);
    wristRest.position.set(0, 0.28, 5.4);
    wristRest.rotation.x = 0.08;
    wristRest.castShadow = true;
    wristRest.receiveShadow = true;
    envGroup.add(wristRest);

    // ---- 4. COILED AVIATOR CABLE (dynamically routed cleanly around monitor stand into grommet) ----
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x4f78c8, roughness: 0.58, metalness: 0.08 });
    let cableGroup = null;
    function rebuildCable(plugX, plugZ) {
      if (cableGroup) {
        cableGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
        envGroup.remove(cableGroup);
      }
      cableGroup = buildCoiledCable(cableMat, silverMetal, plugX, plugZ, GROMMET_X, GROMMET_Z);
      envGroup.add(cableGroup);
    }
    rebuildCable(-5.1, -3.7);

    // ---- 5. SCULPTED WIRELESS GAMING MOUSE ----
    const mouseShellMat = new THREE.MeshStandardMaterial({ color: 0xf1f4f8, roughness: 0.34, metalness: 0.05 });
    const mouseLedMat = new THREE.MeshBasicMaterial({ color: 0x19c8ff });
    const mouseGroup = buildDetailedMouse(mouseShellMat, darkMetal, mouseLedMat);
    mouseGroup.position.set(13.2, 0.05, 0.8);
    envGroup.add(mouseGroup);

    // ---- 6. ULTRAWIDE MONITOR + SCREEN LIGHTBAR + WIRELESS CONTROL PUCK ----
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, 0, -10.8);

    const standBase = new THREE.Mesh(makeRoundedBoxGeo(7.6, 0.24, 4.6, 0.35, 0.06, 3), darkMetal);
    standBase.position.set(0, 0.12, 0.6);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    monitorGroup.add(standBase);

    const standNeck = new THREE.Mesh(makeRoundedBoxGeo(1.15, 5.6, 0.48, 0.14, 0.05, 2), darkMetal);
    standNeck.position.set(0, 2.9, -0.35);
    standNeck.rotation.x = 0.1;
    standNeck.castShadow = true;
    monitorGroup.add(standNeck);

    const bezelMesh = new THREE.Mesh(makeRoundedBoxGeo(23.0, 9.8, 0.62, 0.32, 0.09, 4), darkMetal);
    bezelMesh.position.set(0, 7.7, 0.25);
    bezelMesh.castShadow = true;
    monitorGroup.add(bezelMesh);

    const screenMat = new THREE.MeshBasicMaterial({ map: makeMonitorWallpaper("studio") });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(21.9, 8.85), screenMat);
    screenMesh.position.set(0, 7.7, 0.57);
    monitorGroup.add(screenMesh);

    // Lightbar clamp + bar + optical glow
    const lbClamp = new THREE.Mesh(makeRoundedBoxGeo(1.4, 0.65, 1.35, 0.12, 0.04, 2), darkMetal);
    lbClamp.position.set(0, 12.75, 0.28);
    monitorGroup.add(lbClamp);

    const lightbarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 11.2, 20), darkMetal);
    lightbarBody.rotation.z = Math.PI / 2;
    lightbarBody.position.set(0, 12.75, 0.92);
    monitorGroup.add(lightbarBody);

    const lightbarGlowMat = new THREE.MeshBasicMaterial({ color: 0xfff0d4 });
    const lightbarGlow = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 0.2), lightbarGlowMat);
    lightbarGlow.rotation.x = Math.PI / 2;
    lightbarGlow.position.set(0, 12.54, 0.94);
    monitorGroup.add(lightbarGlow);

    const biasMat = new THREE.MeshBasicMaterial({ color: 0x6ea6ff });
    const biasStrip = new THREE.Mesh(new THREE.PlaneGeometry(18.8, 0.48), biasMat);
    biasStrip.position.set(0, 7.7, -0.07);
    biasStrip.rotation.y = Math.PI;
    monitorGroup.add(biasStrip);
    envGroup.add(monitorGroup);

    // Wireless lightbar control puck on desk right-rear
    const puckGroup = new THREE.Group();
    puckGroup.position.set(11.6, 0.06, -4.6);
    const puckBase = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.28, 28), darkMetal);
    puckBase.position.y = 0.14;
    puckBase.castShadow = true;
    puckGroup.add(puckBase);
    const puckRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 28), brassMetal);
    puckRing.rotation.x = Math.PI / 2;
    puckRing.position.y = 0.29;
    puckGroup.add(puckRing);
    envGroup.add(puckGroup);

    // ---- 7. DESKTOP DAC / AMP + SMARTPHONE STAND ----
    const dacOledMat = new THREE.MeshBasicMaterial({ color: 0x62e8ff });
    const dacGroup = buildDesktopDAC(darkMetal, silverMetal, dacOledMat);
    dacGroup.position.set(-7.6, 0.0, -7.2);
    dacGroup.rotation.y = 0.12;
    envGroup.add(dacGroup);

    const phoneStand = buildPhoneStand(silverMetal);
    phoneStand.position.set(8.6, 0.0, -6.8);
    phoneStand.rotation.y = -0.26;
    envGroup.add(phoneStand);

    // ---- 8. HI-FI BEVELED STUDIO MONITOR SPEAKERS ----
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x1d2029, roughness: 0.52, metalness: 0.22 });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x2f3544, roughness: 0.42, metalness: 0.35 });

    [-15.2, 15.2].forEach((sx) => {
      const spk = new THREE.Group();
      spk.position.set(sx, 0, -9.4);
      spk.rotation.y = sx < 0 ? 0.24 : -0.24;

      // Angled isolation foam pad under speaker
      const isoPad = new THREE.Mesh(makeRoundedBoxGeo(3.5, 0.28, 3.7, 0.14, 0.03, 2), darkMetal);
      isoPad.position.y = 0.14;
      spk.add(isoPad);

      const box = new THREE.Mesh(makeRoundedBoxGeo(3.55, 5.4, 3.75, 0.24, 0.09, 4), speakerMat);
      box.position.y = 2.95;
      box.castShadow = true;
      box.receiveShadow = true;
      spk.add(box);

      // Woofer cone + phase plug + brass trim ring
      const woofer = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.65, 0.26, 28), coneMat);
      woofer.rotation.x = Math.PI / 2;
      woofer.position.set(0, 2.15, 1.82);
      spk.add(woofer);
      const plug = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), brassMetal);
      plug.position.set(0, 2.15, 1.9);
      spk.add(plug);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.065, 10, 28), brassMetal);
      ring.position.set(0, 2.15, 1.9);
      spk.add(ring);

      // Silk-dome tweeter + waveguide
      const twWave = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 8, 22), darkMetal);
      twWave.position.set(0, 4.15, 1.88);
      spk.add(twWave);
      const twDome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), coneMat);
      twDome.scale.set(1, 1, 0.45);
      twDome.position.set(0, 4.15, 1.86);
      spk.add(twDome);

      // Bass-reflex slot port
      const port = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 0.1), new THREE.MeshBasicMaterial({ color: 0x090b10 }));
      port.position.set(0, 0.82, 1.86);
      spk.add(port);

      envGroup.add(spk);
    });

    // ---- 9. LEFT DESK PROPS: MUG + SWITCH TESTER + VALET TRAY + GLAZED PLANTER ----
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xf2ece2, roughness: 0.3 });
    const mugObj = buildCeramicMug(mugMat, silverMetal);
    const mugGroup = mugObj.group;
    const steamPuffs = mugObj.steamPuffs;
    mugGroup.position.set(-14.8, 0, -2.6);
    envGroup.add(mugGroup);

    const switchTester = buildSwitchTester();
    switchTester.position.set(-14.0, 0, 2.2);
    switchTester.rotation.y = 0.18;
    envGroup.add(switchTester);

    const trayMat = new THREE.MeshStandardMaterial({ color: 0x4d3728, roughness: 0.72, metalness: 0.04 });
    const valetTray = buildValetTray(trayMat, brassMetal);
    valetTray.position.set(-18.8, 0, 0.8);
    valetTray.rotation.y = 0.1;
    envGroup.add(valetTray);

    // Glazed Lathe Ceramic Planter with Arched Stems & Leaves
    const plantGroup = new THREE.Group();
    plantGroup.position.set(-19.2, 0, -6.2);
    const potPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.08, 0.0),
      new THREE.Vector2(1.42, 1.1),
      new THREE.Vector2(1.52, 2.2),
      new THREE.Vector2(1.46, 2.48),
      new THREE.Vector2(1.30, 2.48),
      new THREE.Vector2(1.26, 2.22),
      new THREE.Vector2(0.0, 2.22)
    ];
    const pot = new THREE.Mesh(
      new THREE.LatheGeometry(potPts, 28),
      new THREE.MeshStandardMaterial({ color: 0xe3dbd0, roughness: 0.42, metalness: 0.04 })
    );
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CircleGeometry(1.28, 22),
      new THREE.MeshStandardMaterial({ color: 0x36261a, roughness: 0.96 })
    );
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 2.24;
    plantGroup.add(soil);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f6e4b, roughness: 0.55 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2f5438, roughness: 0.7 });
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + (i % 2) * 0.2;
      const dist = 0.85 + (i % 3) * 0.35;
      const h = 3.2 + (i % 3) * 0.85;
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.2, 0),
        new THREE.Vector3(Math.cos(ang) * dist * 0.45, h * 0.82, Math.sin(ang) * dist * 0.45),
        new THREE.Vector3(Math.cos(ang) * dist, h, Math.sin(ang) * dist)
      ]);
      const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 10, 0.055, 6, false), stemMat);
      plantGroup.add(stem);

      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.86, 14, 12), leafMat);
      leaf.scale.set(0.68, 1.32, 0.16);
      leaf.position.set(Math.cos(ang) * (dist + 0.25), h + 0.25, Math.sin(ang) * (dist + 0.25));
      leaf.rotation.y = -ang + Math.PI / 2;
      leaf.rotation.x = 0.55;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }
    envGroup.add(plantGroup);

    // ---- 10. ARCHITECTURAL ARTICULATED DESK LAMP ----
    const lampGroup = new THREE.Group();
    lampGroup.position.set(19.6, 0, -4.4);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.68, 0.34, 32), darkMetal);
    lampBase.position.y = 0.17;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    const lampSwitch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), brassMetal);
    lampSwitch.position.set(-0.7, 0.36, 0.55);
    lampGroup.add(lampSwitch);

    // Dual parallel lower arms + brass elbow joint
    [-0.14, 0.14].forEach((dz) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 12), darkMetal);
      arm.position.set(0.42, 3.15, dz - 0.15);
      arm.rotation.z = -0.14;
      arm.castShadow = true;
      lampGroup.add(arm);
    });

    const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.55, 18), brassMetal);
    elbow.rotation.x = Math.PI / 2;
    elbow.position.set(0.84, 6.1, -0.15);
    lampGroup.add(elbow);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 5.4, 14), darkMetal);
    upperArm.position.set(-1.1, 7.35, 0.38);
    upperArm.rotation.z = 0.96;
    upperArm.castShadow = true;
    lampGroup.add(upperArm);

    // Lathe spun-metal domed lamp shade
    const shadePts = [
      new THREE.Vector2(0.0, 0.9),
      new THREE.Vector2(0.42, 0.88),
      new THREE.Vector2(0.68, 0.55),
      new THREE.Vector2(1.48, -0.65),
      new THREE.Vector2(1.52, -0.72),
      new THREE.Vector2(1.44, -0.72),
      new THREE.Vector2(0.6, 0.45)
    ];
    const shade = new THREE.Mesh(new THREE.LatheGeometry(shadePts, 28), darkMetal);
    shade.position.set(-3.15, 8.2, 0.85);
    shade.rotation.z = 0.32;
    shade.castShadow = true;
    lampGroup.add(shade);

    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe4b5 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 16), bulbMat);
    bulb.position.set(-3.0, 7.55, 0.85);
    lampGroup.add(bulb);

    const deskLampLight = new THREE.PointLight(0xffcb88, 1.3, 24, 1.4);
    deskLampLight.position.set(-3.0, 7.0, 1.0);
    lampGroup.add(deskLampLight);
    envGroup.add(lampGroup);

    // ---- 11. BACK WALL + ACOUSTIC WOOD SLATS + ENRICHED FLOATING SHELF ----
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b1f2b, roughness: 0.9, side: THREE.FrontSide });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(78, 38), wallMat);
    backWall.position.set(0, 12.8, -14.8);
    backWall.receiveShadow = true;
    envGroup.add(backWall);

    const slatMat = new THREE.MeshStandardMaterial({ color: 0x5c3e2b, roughness: 0.7, metalness: 0.05 });
    for (let i = 0; i < 11; i++) {
      const sL = new THREE.Mesh(makeRoundedBoxGeo(0.56, 29, 0.42, 0.06, 0.03, 2), slatMat);
      sL.position.set(-29 + i * 1.15, 12.2, -14.52);
      envGroup.add(sL);
      const sR = new THREE.Mesh(makeRoundedBoxGeo(0.56, 29, 0.42, 0.06, 0.03, 2), slatMat);
      sR.position.set(17.5 + i * 1.15, 12.2, -14.52);
      envGroup.add(sR);
    }

    // Floating shelf with beveled edge + warm under-shelf LED strip
    const shelfBoard = new THREE.Mesh(makeRoundedBoxGeo(23.5, 0.5, 3.0, 0.14, 0.06, 3), deskMat);
    shelfBoard.position.set(0, 15.8, -13.2);
    shelfBoard.castShadow = true;
    envGroup.add(shelfBoard);

    const shelfLedMat = new THREE.MeshBasicMaterial({ color: 0xffdca8 });
    const shelfLed = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.08, 0.14), shelfLedMat);
    shelfLed.position.set(0, 15.52, -14.1);
    envGroup.add(shelfLed);

    // Books on left of shelf
    const shelfBookColors = [0x4c6ef5, 0xe8e4dc, 0x2c3e50, 0xd97a63, 0x588157];
    for (let i = 0; i < 5; i++) {
      const bh = 2.0 + (i % 3) * 0.34;
      const bk = new THREE.Mesh(
        makeRoundedBoxGeo(0.52, bh, 1.85, 0.05, 0.02, 2),
        new THREE.MeshStandardMaterial({ color: shelfBookColors[i], roughness: 0.82 })
      );
      bk.position.set(-9.2 + i * 0.62, 16.05 + bh / 2, -13.1);
      envGroup.add(bk);
    }

    // Digital Desk Clock in center-left of shelf
    const clockBody = new THREE.Mesh(makeRoundedBoxGeo(3.6, 1.45, 1.0, 0.18, 0.05, 3), darkMetal);
    clockBody.position.set(-2.2, 16.78, -13.0);
    envGroup.add(clockBody);
    const clockFace = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.12),
      new THREE.MeshBasicMaterial({ map: makeClockTexture() })
    );
    clockFace.position.set(-2.2, 16.78, -12.48);
    envGroup.add(clockFace);

    // Acrylic Display Cube (mini keycap / collectible showcase) on center-right of shelf
    const cubeBase = new THREE.Mesh(makeRoundedBoxGeo(2.8, 0.24, 2.4, 0.12, 0.03, 2), darkMetal);
    cubeBase.position.set(3.4, 16.17, -13.1);
    envGroup.add(cubeBase);
    const cubeGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.5, 2.1),
      new THREE.MeshPhysicalMaterial({ color: 0xeaf4ff, transparent: true, opacity: 0.22, roughness: 0.1 })
    );
    cubeGlass.position.set(3.4, 17.52, -13.1);
    envGroup.add(cubeGlass);
    const miniSculpt = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.68, 0),
      new THREE.MeshStandardMaterial({ color: 0x38c8ff, roughness: 0.2, metalness: 0.6 })
    );
    miniSculpt.position.set(3.4, 17.35, -13.1);
    envGroup.add(miniSculpt);

    // Trailing Mini Shelf Plant on right edge
    const miniPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.68, 1.3, 20),
      new THREE.MeshStandardMaterial({ color: 0xe6dfd3, roughness: 0.55 })
    );
    miniPot.position.set(9.4, 16.7, -13.0);
    envGroup.add(miniPot);
    for (let v = 0; v < 7; v++) {
      const vl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), leafMat);
      vl.scale.set(0.85, 0.45, 1.1);
      vl.position.set(9.4 + Math.sin(v * 1.1) * 0.65, 17.45 - v * 0.42, -12.25 + (v % 2) * 0.25);
      envGroup.add(vl);
    }

    const wallBiasLight = new THREE.PointLight(0x5b8cff, 1.15, 28, 1.5);
    wallBiasLight.position.set(0, 7.7, -11.8);
    envGroup.add(wallBiasLight);

    // Smoothly interpolated desk targets for layout growth/shrink transitions
    let deskTargets = null;

    // ---- API ----
    function updateForKeyboard(caseW, caseD, theme, instant) {
      const padW = Math.max(30, caseW + 11.2);
      const next = {
        padScaleX: padW / 32,
        wristScaleX: caseW / 17.1,
        wristZ: caseD / 2 + 1.65,
        mouseX: Math.max(12.8, caseW / 2 + 3.6),
        mugX: -Math.max(13.8, caseW / 2 + 4.0),
        testerX: -Math.max(13.2, caseW / 2 + 3.5),
        trayX: -Math.max(18.2, caseW / 2 + 7.8)
      };

      if (instant || !deskTargets) {
        deskPad.scale.x = next.padScaleX;
        deskPad.position.x = 1.6;
        wristRest.scale.x = next.wristScaleX;
        wristRest.position.z = next.wristZ;
        mouseGroup.position.x = next.mouseX;
        mugGroup.position.x = next.mugX;
        switchTester.position.x = next.testerX;
        valetTray.position.x = next.trayX;
      }
      deskTargets = next;

      rebuildCable(-caseW * 0.32, -(caseD / 2) - 0.02);

      if (theme) {
        cableMat.color.set(theme.id === "dafeiyu" ? "#5c8fd6" : (theme.id === "aries" ? "#28a8ff" : theme.accentBg));
        mouseLedMat.color.set(theme.rgbColor || "#19c8ff");
        dacOledMat.color.set(theme.rgbColor || "#62e8ff");
      }
    }

    function applyScenePreset(preset) {
      if (preset.id === "sunset") {
        deskMat.map = woodTexWarm;
        deskMat.color.setHex(0xffffff);
        wallMat.color.setHex(0x3a2a2c);
        slatMat.color.setHex(0x6e4730);
        deskPadMat.color.setHex(0x342c30);
        deskLampLight.color.setHex(0xffb463);
        deskLampLight.intensity = 2.4;
        bulbMat.color.setHex(0xffe1a8);
        wallBiasLight.color.setHex(0xff9254);
        wallBiasLight.intensity = 1.4;
        biasMat.color.setHex(0xffa062);
        lightbarGlowMat.color.setHex(0xffdca8);
        shelfLedMat.color.setHex(0xffc784);
      } else if (preset.id === "cyber") {
        deskMat.map = woodTexDark;
        deskMat.color.setHex(0x161926);
        wallMat.color.setHex(0x0c0e1c);
        slatMat.color.setHex(0x1d2238);
        deskPadMat.color.setHex(0x151828);
        deskLampLight.color.setHex(0xff3b9a);
        deskLampLight.intensity = 2.0;
        bulbMat.color.setHex(0xff5cb3);
        wallBiasLight.color.setHex(0x00e5ff);
        wallBiasLight.intensity = 2.4;
        biasMat.color.setHex(0x00e8ff);
        lightbarGlowMat.color.setHex(0x88f0ff);
        shelfLedMat.color.setHex(0xff3b9a);
      } else if (preset.id === "gallery") {
        deskMat.map = woodTexLight;
        deskMat.color.setHex(0xf8f6f2);
        wallMat.color.setHex(0xe5eaf2);
        slatMat.color.setHex(0xcab9a3);
        deskPadMat.color.setHex(0xcfd6e2);
        deskLampLight.color.setHex(0xffffff);
        deskLampLight.intensity = 0.6;
        bulbMat.color.setHex(0xf5f8ff);
        wallBiasLight.color.setHex(0xd6e6ff);
        wallBiasLight.intensity = 0.5;
        biasMat.color.setHex(0xffffff);
        lightbarGlowMat.color.setHex(0xffffff);
        shelfLedMat.color.setHex(0xf4f8ff);
      } else if (preset.id === "dramatic") {
        deskMat.map = woodTexWarm;
        deskMat.color.setHex(0x665042);
        wallMat.color.setHex(0x0e1017);
        slatMat.color.setHex(0x3a281d);
        deskPadMat.color.setHex(0x1b1d24);
        deskLampLight.color.setHex(0xffd088);
        deskLampLight.intensity = 3.0;
        bulbMat.color.setHex(0xffe7b8);
        wallBiasLight.color.setHex(0xffc978);
        wallBiasLight.intensity = 0.9;
        biasMat.color.setHex(0xffcf82);
        lightbarGlowMat.color.setHex(0xffe6ba);
        shelfLedMat.color.setHex(0xffd088);
      } else {
        deskMat.map = woodTexDark;
        deskMat.color.setHex(0x3c414f);
        wallMat.color.setHex(0x1b202e);
        slatMat.color.setHex(0x523b2c);
        deskPadMat.color.setHex(0x232836);
        deskLampLight.color.setHex(0xffe0b5);
        deskLampLight.intensity = 1.3;
        bulbMat.color.setHex(0xfff0d4);
        wallBiasLight.color.setHex(0x6e9eff);
        wallBiasLight.intensity = 1.25;
        biasMat.color.setHex(0x7aa6ff);
        lightbarGlowMat.color.setHex(0xf4f8ff);
        shelfLedMat.color.setHex(0xffdca8);
      }
      deskMat.needsUpdate = true;

      if (screenMat.map) screenMat.map.dispose();
      screenMat.map = makeMonitorWallpaper(preset.id);
      screenMat.needsUpdate = true;
    }

    function animate(dt, elapsed) {
      if (deskTargets) {
        const k = 1 - Math.exp(-8.5 * dt);
        deskPad.scale.x += (deskTargets.padScaleX - deskPad.scale.x) * k;
        wristRest.scale.x += (deskTargets.wristScaleX - wristRest.scale.x) * k;
        wristRest.position.z += (deskTargets.wristZ - wristRest.position.z) * k;
        mouseGroup.position.x += (deskTargets.mouseX - mouseGroup.position.x) * k;
        mugGroup.position.x += (deskTargets.mugX - mugGroup.position.x) * k;
        switchTester.position.x += (deskTargets.testerX - switchTester.position.x) * k;
        valetTray.position.x += (deskTargets.trayX - valetTray.position.x) * k;
      }
      for (let i = 0; i < steamPuffs.length; i++) {
        const p = steamPuffs[i];
        const cyc = ((elapsed * 0.35 + p.userData.phase) % 2.2) / 2.2;
        p.position.set(
          Math.sin(elapsed * 1.5 + p.userData.phase) * 0.22,
          2.05 + cyc * 2.1,
          Math.cos(elapsed * 1.2 + p.userData.phase) * 0.16
        );
        p.scale.setScalar(0.55 + cyc * 1.05);
        p.material.opacity = Math.sin(cyc * Math.PI) * 0.15;
      }
      // Subtle slow float/rotation on collectible crystal inside shelf display box
      miniSculpt.rotation.y = elapsed * 0.45;
      miniSculpt.position.y = 17.35 + Math.sin(elapsed * 1.6) * 0.08;
    }

    return {
      group: envGroup,
      setVisible(v) { envGroup.visible = v; },
      updateForKeyboard,
      applyScenePreset,
      animate
    };
  };
})(window.KB);
