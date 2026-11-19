(function (KB) {
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ---- Zero-Dependency Standard ZIP (STORE) Builder with UTF-8 Support ----
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function buildZipBlob(files) {
    // files: Array<{ name: string, data: Uint8Array }>
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const data = file.data;
      const crc = crc32(data);

      // Local File Header (30 bytes + name)
      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
      lv.setUint16(8, 0, true);      // STORE (method 0)
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);

      localParts.push(lh, data);

      // Central Directory Header (46 bytes + name)
      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      centralParts.push(ch);

      offset += lh.length + data.length;
    });

    const centralOffset = offset;
    let centralSize = 0;
    centralParts.forEach((p) => { centralSize += p.length; });

    // End of Central Directory (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralOffset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], { type: "application/zip" });
  }

  function canvasToPngBytes(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const b64 = dataUrl.split(",")[1];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function sanitizeKeyName(entry) {
    const raw = entry.def.code || entry.cfg.label || entry.def.id;
    return String(raw).replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_") || entry.def.id;
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // Evaluate spherical camera state at normalized time u in [0, 1]
  function evalPresetPath(preset, u, baseRadius) {
    const e = easeInOutCubic(u);
    if (preset === "orbit360") {
      return {
        theta: 0.25 + u * Math.PI * 2,
        phi: 0.85 + Math.sin(u * Math.PI * 2) * 0.14,
        radius: baseRadius * (0.98 + Math.sin(u * Math.PI) * 0.08),
        target: new THREE.Vector3(0, 0.5, 0)
      };
    }
    if (preset === "heroReveal") {
      return {
        theta: lerp(-0.85, 0.55, e),
        phi: lerp(1.32, 0.62, e),
        radius: lerp(baseRadius * 0.62, baseRadius * 1.06, e),
        target: new THREE.Vector3(lerp(-2.5, 0, e), 0.5, lerp(0.8, 0, e))
      };
    }
    if (preset === "macroSweep") {
      return {
        theta: lerp(-0.52, 0.52, e),
        phi: lerp(1.08, 0.96, Math.sin(u * Math.PI)),
        radius: baseRadius * 0.48,
        target: new THREE.Vector3(lerp(-5.2, 5.2, e), 0.58, lerp(0.9, -0.5, e))
      };
    }
    // sideLegendTour
    if (u < 0.5) {
      const k = easeInOutCubic(u * 2);
      return {
        theta: lerp(0.0, 0.18, k),
        phi: lerp(0.24, 1.24, k),
        radius: lerp(baseRadius * 1.04, baseRadius * 0.64, k),
        target: new THREE.Vector3(0, lerp(0.45, 0.55, k), lerp(0, 1.1, k))
      };
    } else {
      const k = easeInOutCubic((u - 0.5) * 2);
      return {
        theta: lerp(0.18, -0.45, k),
        phi: lerp(1.24, 0.82, k),
        radius: lerp(baseRadius * 0.64, baseRadius * 0.96, k),
        target: new THREE.Vector3(0, 0.52, lerp(1.1, 0, k))
      };
    }
  }

  function evalCustomPath(keyframes, u) {
    if (keyframes.length === 1) return keyframes[0];
    const segCount = keyframes.length - 1;
    const scaled = u * segCount;
    const idx = Math.min(segCount - 1, Math.floor(scaled));
    const localT = easeInOutCubic(scaled - idx);
    const a = keyframes[idx];
    const b = keyframes[idx + 1];
    return {
      theta: lerp(a.theta, b.theta, localT),
      phi: lerp(a.phi, b.phi, localT),
      radius: lerp(a.radius, b.radius, localT),
      target: new THREE.Vector3().lerpVectors(a.target, b.target, localT)
    };
  }

  KB.createExporter = function (studio, showToast) {
    let customKeyframes = [];
    let animState = {
      active: false,
      recording: false,
      elapsed: 0,
      duration: 6,
      preset: "orbit360",
      waveAnim: true,
      recorder: null,
      chunks: [],
      savedCam: null
    };

    function snapshotCurrentCamera() {
      return {
        theta: studio.cam.theta,
        phi: studio.cam.phi,
        radius: studio.cam.radius,
        target: studio.cam.target.clone()
      };
    }

    function applyCamPose(pose) {
      studio.cam.theta = pose.theta;
      studio.cam.phi = pose.phi;
      studio.cam.radius = pose.radius;
      studio.cam.target.copy(pose.target);
      studio.cam.goalTheta = pose.theta;
      studio.cam.goalPhi = pose.phi;
      studio.cam.goalRadius = pose.radius;
      studio.cam.goalTarget.copy(pose.target);
      studio.updateCameraTransform();
    }

    // ---- 1. BUILD & EXPORT CONFIG JSON ----
    function buildConfigObject(meta) {
      const layout = studio.getLayout();
      const settings = studio.getSceneSettings();
      const entries = studio.getAllEntries();

      return {
        app: "Keystage",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        layoutId: layout ? layout.id : "75",
        layoutName: layout ? layout.name : "",
        themeId: meta.themeId || "aries",
        lightingId: meta.lightingId || "studio",
        scene: {
          caseMaterial: settings.caseMaterial,
          caseColor: settings.caseColor,
          rgbEnabled: settings.rgbEnabled,
          deskVisible: settings.deskVisible,
          exposure: settings.exposure,
          lightAngle: settings.lightAngle,
          envIntensity: settings.envIntensity,
          switchType: settings.switchType
        },
        keys: entries.map((e, idx) => ({
          index: idx + 1,
          id: e.def.id,
          code: e.def.code,
          x: e.def.x,
          y: e.def.y,
          w: e.def.w,
          h: e.def.h,
          role: e.def.role,
          label: e.cfg.label,
          sub: e.cfg.sub,
          showLegend: e.cfg.showLegend,
          legendPos: e.cfg.legendPos,
          fontScale: e.cfg.fontScale,
          fontStyle: e.cfg.fontStyle || "sans",
          pixelSparkle: Boolean(e.cfg.pixelSparkle),
          bgColor: e.cfg.bgColor,
          fgColor: e.cfg.fgColor,
          pattern: e.cfg.pattern || "none",
          texFit: e.cfg.texFit || "cover",
          texScale: e.cfg.texScale || 100,
          texRot: e.cfg.texRot || 0,
          customImageUrl: e.cfg.customImageUrl || ""
        }))
      };
    }

    function exportConfigJSON(meta) {
      const cfgObj = buildConfigObject(meta);
      const jsonStr = JSON.stringify(cfgObj, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      triggerBlobDownload(blob, `Keystage-${cfgObj.layoutId}-config.json`);
      showToast("已导出键盘配置文件 (.json)");
    }

    // ---- 2. BUILD KEYCAP IMAGE-TO-KEY MANIFEST (keycap_config.json) ----
    function buildKeycapManifestObject(meta, exportedFiles) {
      const layout = studio.getLayout();
      const settings = studio.getSceneSettings();
      const entries = studio.getAllEntries();
      const themeId = meta.themeId || "aries";
      const themeObj = (KB.THEMES || []).find((t) => t.id === themeId) || null;
      const presetAssets =
        themeId === "aries" ? (KB.ARIES_SPECIAL_ASSETS || {}) :
        themeId === "dafeiyu" ? (KB.DAFEIYU_ASSETS || {}) : {};

      const imageToKey = {};
      const keyToImage = {};
      let topImageKeys = 0;
      let sideImageKeys = 0;
      let customArtworkKeys = 0;

      const keys = entries.map((e, idx) => {
        const exp = exportedFiles[idx] || {};
        const keyCode = e.def.code || e.def.id;
        const presetInfo = e.def.code && presetAssets[e.def.code];
        const hasCustomImage = Boolean(e.cfg.customImage || e.cfg.customImageUrl);
        if (hasCustomImage) customArtworkKeys++;

        if (exp.topFile) {
          topImageKeys++;
          imageToKey[exp.topFile] = {
            code: keyCode,
            id: e.def.id,
            label: e.cfg.label || "",
            sub: e.cfg.sub || "",
            face: "top",
            w: e.def.w,
            h: e.def.h,
            role: e.def.role
          };
        }
        if (exp.sideFile) {
          sideImageKeys++;
          imageToKey[exp.sideFile] = {
            code: keyCode,
            id: e.def.id,
            label: e.cfg.label || "",
            sub: e.cfg.sub || "",
            face: "side",
            w: e.def.w,
            h: e.def.h,
            role: e.def.role
          };
        }

        const keyMapping = {
          topFile: exp.topFile || null,
          sideFile: exp.sideFile || null,
          label: e.cfg.label || "",
          sub: e.cfg.sub || "",
          w: e.def.w,
          h: e.def.h,
          role: e.def.role,
          bgColor: e.cfg.bgColor,
          fgColor: e.cfg.fgColor,
          showLegend: Boolean(e.cfg.showLegend),
          legendPos: e.cfg.legendPos || "top",
          hasCustomImage
        };
        if (presetInfo && presetInfo.source) {
          keyMapping.presetSourceFile = presetInfo.source;
        }
        keyToImage[keyCode] = keyMapping;

        return {
          index: idx + 1,
          id: e.def.id,
          code: keyCode,
          label: e.cfg.label || "",
          sub: e.cfg.sub || "",
          x: e.def.x,
          y: e.def.y,
          w: e.def.w,
          h: e.def.h,
          role: e.def.role,
          topImage: exp.topFile || null,
          sideImage: exp.sideFile || null,
          presetSourceFile: (presetInfo && presetInfo.source) || null,
          bgColor: e.cfg.bgColor,
          fgColor: e.cfg.fgColor,
          showLegend: Boolean(e.cfg.showLegend),
          legendPos: e.cfg.legendPos || "top",
          fontStyle: e.cfg.fontStyle || "sans",
          pattern: e.cfg.pattern || "none",
          texFit: e.cfg.texFit || "cover",
          hasCustomImage
        };
      });

      return {
        schema: "keystage.keycap-set/v1",
        app: "Keystage",
        exportedAt: new Date().toISOString(),
        id: themeId,
        name: themeObj ? themeObj.name : themeId,
        layoutId: layout ? layout.id : "75",
        layoutName: layout ? layout.name : "",
        case: {
          material: settings.caseMaterial,
          color: settings.caseColor,
          rgbEnabled: settings.rgbEnabled,
          rgbColor: themeObj ? themeObj.rgbColor : null
        },
        palette: themeObj ? {
          alphaBg: themeObj.alphaBg,
          alphaFg: themeObj.alphaFg,
          modBg: themeObj.modBg,
          modFg: themeObj.modFg,
          accentBg: themeObj.accentBg,
          accentFg: themeObj.accentFg,
          spaceBg: themeObj.spaceBg,
          arrowBg: themeObj.arrowBg,
          arrowFg: themeObj.arrowFg || themeObj.modFg
        } : null,
        summary: {
          totalKeys: entries.length,
          topImageKeys,
          sideImageKeys,
          customArtworkKeys
        },
        imageToKey,
        keyToImage,
        keys
      };
    }

    // ---- 3. EXPORT ALL KEYCAP PATTERNS + CONFIG (.ZIP) ----
    function buildPreviewSheetCanvas(entries, layout) {
      const unitPx = 112;
      const pad = 48;
      const W = Math.round(layout.widthU * unitPx + pad * 2);
      const H = Math.round(layout.heightU * unitPx + pad * 2 + 44);
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");

      ctx.fillStyle = "#151821";
      ctx.fillRect(0, 0, W, H);

      entries.forEach((e) => {
        if (!e.textures || !e.textures.topTex || !e.textures.topTex.image) return;
        const x = pad + e.def.x * unitPx + 3;
        const y = pad + e.def.y * unitPx + 3;
        const w = e.def.w * unitPx - 6;
        const h = e.def.h * unitPx - 6;
        ctx.fillStyle = e.cfg.bgColor || "#ffffff";
        ctx.fillRect(x, y, w, h);
        ctx.drawImage(e.textures.topTex.image, x, y, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      });

      ctx.fillStyle = "rgba(242, 244, 248, 0.82)";
      ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.fillText(`Keystage · ${layout.name} · 共 ${entries.length} 颗键帽贴图总览`, pad, H - 18);
      return c;
    }

    function exportAllKeycapsZIP(meta) {
      const layout = studio.getLayout();
      const entries = studio.getAllEntries();
      if (!layout || entries.length === 0) return;

      showToast("正在打包全部键帽图案与配置文件...");
      const files = [];
      const cfgObj = buildConfigObject(meta);
      const exportedFiles = [];
      let sideCount = 0;

      entries.forEach((e, idx) => {
        const num = String(idx + 1).padStart(3, "0");
        const safe = sanitizeKeyName(e);
        const baseName = `${num}_${safe}_${e.def.w}u`;
        const rec = { topFile: null, sideFile: null };
        if (e.textures && e.textures.topTex && e.textures.topTex.image) {
          const topPath = `keycaps/${baseName}_top.png`;
          files.push({ name: topPath, data: canvasToPngBytes(e.textures.topTex.image) });
          cfgObj.keys[idx].exportedTopFile = topPath;
          rec.topFile = topPath;
        }
        if (e.cfg.showLegend && e.cfg.legendPos === "side" && e.textures && e.textures.frontTex && e.textures.frontTex.image) {
          const sidePath = `keycaps/${baseName}_side.png`;
          files.push({ name: sidePath, data: canvasToPngBytes(e.textures.frontTex.image) });
          cfgObj.keys[idx].exportedSideFile = sidePath;
          rec.sideFile = sidePath;
          sideCount++;
        }
        exportedFiles.push(rec);
      });

      // Flat 2D preview contact sheet
      const sheetCanvas = buildPreviewSheetCanvas(entries, layout);
      files.push({ name: "preview_sheet.png", data: canvasToPngBytes(sheetCanvas) });

      // Dedicated keycap image-to-key mapping manifest (keycap_config.json)
      const manifestObj = buildKeycapManifestObject(meta, exportedFiles);
      const manifestBytes = new TextEncoder().encode(JSON.stringify(manifestObj, null, 2));
      files.push({ name: "keycap_config.json", data: manifestBytes });

      // Complete studio restore config.json inside the ZIP
      const cfgBytes = new TextEncoder().encode(JSON.stringify(cfgObj, null, 2));
      files.push({ name: "config.json", data: cfgBytes });

      const themeSlug = (meta.themeId || "custom").replace(/[^a-zA-Z0-9_-]/g, "_");
      const zipBlob = buildZipBlob(files);
      triggerBlobDownload(zipBlob, `Keystage-${themeSlug}-${layout.id}-keycaps.zip`);
      const sideMsg = sideCount > 0 ? ` + ${sideCount} 张侧刻图` : "";
      showToast(`已导出 ${entries.length} 张键帽图案${sideMsg}、keycap_config.json 与 config.json`);
    }

    // ---- 3. HIGH-RES OVERVIEW IMAGE EXPORT (PNG) ----
    function exportOverviewPNG(options) {
      const { angle, res, watermark, metaText } = options;
      const [wStr, hStr] = res.split("x");
      const outW = Number(wStr) || 2560;
      const outH = Number(hStr) || 1440;

      const savedCam = snapshotCurrentCamera();
      const origW = window.innerWidth;
      const origH = window.innerHeight;
      const origPR = studio.renderer.getPixelRatio();

      studio.setOutlinesVisible(false);

      const baseR = studio.getRecommendedRadius();
      if (angle === "hero") {
        applyCamPose({ theta: 0.24, phi: 0.86, radius: baseR, target: new THREE.Vector3(0, 0.5, 0) });
      } else if (angle === "top") {
        applyCamPose({ theta: 0.0, phi: 0.1, radius: baseR * 1.06, target: new THREE.Vector3(0, 0.4, 0) });
      } else if (angle === "side") {
        applyCamPose({ theta: 0.12, phi: 1.24, radius: baseR * 0.72, target: new THREE.Vector3(0, 0.52, 1.0) });
      }

      studio.renderer.setPixelRatio(1);
      studio.renderer.setSize(outW, outH, false);
      studio.camera.aspect = outW / outH;
      studio.camera.updateProjectionMatrix();
      studio.renderer.render(studio.scene, studio.camera);

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext("2d");
      ctx.drawImage(studio.renderer.domElement, 0, 0, outW, outH);

      if (watermark) {
        const pad = Math.round(outW * 0.025);
        const fontSize = Math.round(outW * 0.013);
        ctx.save();
        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        const label = `Keystage  ·  ${metaText}`;
        const tw = ctx.measureText(label).width;
        const boxW = tw + pad * 1.1;
        const boxH = fontSize * 2.2;
        const bx = outW - boxW - pad;
        const by = outH - boxH - pad;
        ctx.fillStyle = "rgba(15, 18, 26, 0.72)";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, boxW, boxH, 10) : ctx.rect(bx, by, boxW, boxH);
        ctx.fill();
        ctx.fillStyle = "rgba(244, 247, 255, 0.9)";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bx + pad * 0.55, by + boxH / 2);
        ctx.restore();
      }

      studio.renderer.setPixelRatio(origPR);
      studio.renderer.setSize(origW, origH, true);
      studio.camera.aspect = origW / origH;
      studio.camera.updateProjectionMatrix();
      applyCamPose(savedCam);
      studio.setOutlinesVisible(true);

      const link = document.createElement("a");
      const layoutId = studio.getLayout() ? studio.getLayout().id : "custom";
      link.download = `Keystage-${layoutId}-${angle}-${outW}x${outH}.png`;
      link.href = outCanvas.toDataURL("image/png");
      link.click();
      showToast(`已导出 ${outW}×${outH} 高清总览图`);
    }

    // ---- 4. CAMERA PATH PREVIEW & VIDEO EXPORT (WebM) ----
    function stopPathPlayback() {
      if (!animState.active) return;
      animState.active = false;
      studio.cam.externalControl = false;
      studio.clearWaveAnimation();
      studio.setOutlinesVisible(true);

      if (animState.recording && animState.recorder && animState.recorder.state !== "inactive") {
        animState.recorder.stop();
      }
      animState.recording = false;
      document.getElementById("rec-badge").classList.add("hidden");
      if (animState.savedCam) applyCamPose(animState.savedCam);
    }

    function startPath(options) {
      const { preset, duration, waveAnim, record } = options;
      if (preset === "custom" && customKeyframes.length < 2) {
        showToast("请先至少添加 2 个自定义关键帧");
        return false;
      }
      if (animState.active) stopPathPlayback();

      animState.active = true;
      animState.recording = Boolean(record);
      animState.elapsed = 0;
      animState.duration = duration;
      animState.preset = preset;
      animState.waveAnim = waveAnim;
      animState.savedCam = snapshotCurrentCamera();

      studio.cam.externalControl = true;
      studio.setOutlinesVisible(false);

      if (record) {
        if (typeof MediaRecorder === "undefined" || !studio.renderer.domElement.captureStream) {
          showToast("当前浏览器不支持画布视频录制，请使用 Chrome / Edge / Safari 最新版");
          stopPathPlayback();
          return false;
        }
        const stream = studio.renderer.domElement.captureStream(60);
        const mimeCandidates = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm"
        ];
        const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";
        animState.chunks = [];
        try {
          animState.recorder = new MediaRecorder(stream, {
            mimeType: mimeType || undefined,
            videoBitsPerSecond: 10000000
          });
        } catch (err) {
          showToast("视频录制初始化失败：" + err.message);
          stopPathPlayback();
          return false;
        }
        animState.recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) animState.chunks.push(e.data);
        };
        animState.recorder.onstop = () => {
          const blob = new Blob(animState.chunks, { type: mimeType || "video/webm" });
          const layoutId = studio.getLayout() ? studio.getLayout().id : "custom";
          triggerBlobDownload(blob, `Keystage-${layoutId}-${preset}-${duration}s.webm`);
          showToast("演示视频已导出 (.webm)");
        };
        animState.recorder.start();
        document.getElementById("rec-badge").classList.remove("hidden");
      } else {
        showToast("正在预览运镜路径...");
      }
      return true;
    }

    studio.setFrameCallback((dt) => {
      if (!animState.active) return;
      animState.elapsed += dt;
      const u = Math.min(1, animState.elapsed / animState.duration);
      const baseR = studio.getRecommendedRadius();
      const pose = animState.preset === "custom"
        ? evalCustomPath(customKeyframes, u)
        : evalPresetPath(animState.preset, u, baseR);

      studio.cam.theta = pose.theta;
      studio.cam.phi = pose.phi;
      studio.cam.radius = pose.radius;
      studio.cam.target.copy(pose.target);

      if (animState.waveAnim) {
        studio.triggerWaveAnimation(u);
      }

      if (animState.recording) {
        document.getElementById("rec-text").textContent =
          `正在录制演示视频 ${animState.elapsed.toFixed(1)}s / ${animState.duration.toFixed(1)}s`;
      }

      if (u >= 1) {
        stopPathPlayback();
      }
    });

    return {
      exportOverviewPNG,
      exportConfigJSON,
      exportAllKeycapsZIP,
      startPath,
      stopPathPlayback,
      addKeyframe() {
        customKeyframes.push(snapshotCurrentCamera());
        return customKeyframes;
      },
      removeKeyframe(idx) {
        customKeyframes.splice(idx, 1);
        return customKeyframes;
      },
      clearKeyframes() {
        customKeyframes = [];
        return customKeyframes;
      },
      getKeyframes() { return customKeyframes; },
      isPlaying() { return animState.active; }
    };
  };
})(window.KB);
