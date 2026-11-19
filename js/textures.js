(function (KB) {
  // Compact 5x7 8-bit pixel font matching the Aries Pixel keycap set
  const PIXEL_FONT = {
    A:["01110","10001","10001","11111","10001","10001","10001"],
    B:["11110","10001","10001","11110","10001","10001","11110"],
    C:["01110","10001","10000","10000","10000","10001","01110"],
    D:["11110","10001","10001","10001","10001","10001","11110"],
    E:["11111","10000","10000","11110","10000","10000","11111"],
    F:["11111","10000","10000","11110","10000","10000","10000"],
    G:["01110","10001","10000","10111","10001","10001","01110"],
    H:["10001","10001","10001","11111","10001","10001","10001"],
    I:["01110","00100","00100","00100","00100","00100","01110"],
    J:["00111","00010","00010","00010","10010","10010","01100"],
    K:["10001","10010","10100","11000","10100","10010","10001"],
    L:["10000","10000","10000","10000","10000","10000","11111"],
    M:["10001","11011","10101","10101","10001","10001","10001"],
    N:["10001","11001","10101","10011","10001","10001","10001"],
    O:["01110","10001","10001","10001","10001","10001","01110"],
    P:["11110","10001","10001","11110","10000","10000","10000"],
    Q:["01110","10001","10001","10001","10101","10010","01101"],
    R:["11110","10001","10001","11110","10100","10010","10001"],
    S:["01111","10000","10000","01110","00001","00001","11110"],
    T:["11111","00100","00100","00100","00100","00100","00100"],
    U:["10001","10001","10001","10001","10001","10001","01110"],
    V:["10001","10001","10001","10001","10001","01010","00100"],
    W:["10001","10001","10001","10101","10101","11011","10001"],
    X:["10001","10001","01010","00100","01010","10001","10001"],
    Y:["10001","10001","01010","00100","00100","00100","00100"],
    Z:["11111","00001","00010","00100","01000","10000","11111"],
    "0":["01110","10011","10101","10101","11001","10001","01110"],
    "1":["00100","01100","00100","00100","00100","00100","01110"],
    "2":["01110","10001","00001","00110","01000","10000","11111"],
    "3":["11110","00001","00001","01110","00001","00001","11110"],
    "4":["00010","00110","01010","10010","11111","00010","00010"],
    "5":["11111","10000","11110","00001","00001","10001","01110"],
    "6":["01110","10000","11110","10001","10001","10001","01110"],
    "7":["11111","00001","00010","00100","01000","01000","01000"],
    "8":["01110","10001","10001","01110","10001","10001","01110"],
    "9":["01110","10001","10001","01111","00001","00010","01100"],
    "`":["01000","00100","00000","00000","00000","00000","00000"],
    "~":["00000","01001","10110","00000","00000","00000","00000"],
    "!":["00100","00100","00100","00100","00100","00000","00100"],
    "@":["01110","10001","10111","10101","10110","10000","01110"],
    "#":["01010","11111","01010","01010","11111","01010","00000"],
    "$":["00100","01111","10100","01110","00101","11110","00100"],
    "%":["11001","11010","00100","01000","10110","00110","00000"],
    "^":["00100","01010","10001","00000","00000","00000","00000"],
    "&":["01100","10010","01100","10101","10010","01101","00000"],
    "*":["00100","10101","01110","10101","00100","00000","00000"],
    "(":["00010","00100","01000","01000","01000","00100","00010"],
    ")":["01000","00100","00010","00010","00010","00100","01000"],
    "-":["00000","00000","00000","11111","00000","00000","00000"],
    "_":["00000","00000","00000","00000","00000","00000","11111"],
    "=":["00000","00000","11111","00000","11111","00000","00000"],
    "+":["00000","00100","00100","11111","00100","00100","00000"],
    "[":["01110","01000","01000","01000","01000","01000","01110"],
    "{":["00110","00100","00100","01000","00100","00100","00110"],
    "]":["01110","00010","00010","00010","00010","00010","01110"],
    "}":["01100","00100","00100","00010","00100","00100","01100"],
    "\\":["10000","10000","01000","00100","00010","00001","00001"],
    "|":["00100","00100","00100","00100","00100","00100","00100"],
    ";":["00000","00100","00000","00000","00100","00100","01000"],
    ":":["00000","00100","00000","00000","00100","00000","00000"],
    "'":["00100","00100","00000","00000","00000","00000","00000"],
    '"':["01010","01010","00000","00000","00000","00000","00000"],
    ",":["00000","00000","00000","00000","00100","00100","01000"],
    "<":["00010","00100","01000","10000","01000","00100","00010"],
    ".":["00000","00000","00000","00000","00000","01100","01100"],
    ">":["01000","00100","00010","00001","00010","00100","01000"],
    "/":["00001","00010","00100","00100","01000","10000","00000"],
    "?":["01110","10001","00010","00100","00100","00000","00100"],
    "↑":["00100","01110","10101","00100","00100","00100","00100"],
    "↓":["00100","00100","00100","00100","10101","01110","00100"],
    "←":["00100","01000","11111","01000","00100","00000","00000"],
    "→":["00100","00010","11111","00010","00100","00000","00000"]
  };

  function drawPixelText(ctx, text, cx, cy, pxScale, color) {
    const str = String(text || "");
    if (!str) return;
    // Fallback to normal bold sans if string contains non-ASCII/emoji characters not in bitmap
    for (let i = 0; i < str.length; i++) {
      const ch = str[i].toUpperCase();
      if (ch !== " " && !PIXEL_FONT[ch]) {
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${Math.round(pxScale * 7.5)}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        ctx.fillText(str, cx, cy);
        return;
      }
    }
    const step = 6 * pxScale;
    const totalW = str.length * step - pxScale;
    const totalH = 7 * pxScale;
    const ox = Math.round(cx - totalW / 2);
    const oy = Math.round(cy - totalH / 2);
    ctx.fillStyle = color;
    for (let ci = 0; ci < str.length; ci++) {
      const glyph = PIXEL_FONT[str[ci].toUpperCase()];
      if (!glyph) continue;
      const gx = ox + ci * step;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (glyph[r][c] === "1") {
            ctx.fillRect(gx + c * pxScale, oy + r * pxScale, pxScale, pxScale);
          }
        }
      }
    }
  }

  function drawPixelSparkle(ctx, cx, cy, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - s, cy - 3 * s, 2 * s, 6 * s);
    ctx.fillRect(cx - 3 * s, cy - s, 6 * s, 2 * s);
  }

  function drawPattern(ctx, w, h, pattern, bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    if (pattern === "carbon") {
      const cell = Math.max(12, Math.round(Math.min(w, h) / 14));
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          const odd = ((x / cell) + (y / cell)) % 2 === 0;
          const grad = ctx.createLinearGradient(x, y, x + cell, y + cell);
          if (odd) {
            grad.addColorStop(0, "rgba(255,255,255,0.14)");
            grad.addColorStop(1, "rgba(0,0,0,0.22)");
          } else {
            grad.addColorStop(0, "rgba(0,0,0,0.25)");
            grad.addColorStop(1, "rgba(255,255,255,0.10)");
          }
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, cell, cell);
        }
      }
    } else if (pattern === "marble") {
      ctx.save();
      ctx.globalAlpha = 0.24;
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : "#111622";
        ctx.lineWidth = 2 + (i % 4) * 2.5;
        ctx.beginPath();
        const sy = (h / 9) * i;
        ctx.moveTo(0, sy);
        ctx.bezierCurveTo(
          w * 0.3, sy + Math.sin(i * 1.9) * h * 0.22,
          w * 0.7, sy + Math.cos(i * 1.3) * h * 0.22,
          w, sy + Math.sin(i * 0.8) * h * 0.14
        );
        ctx.stroke();
      }
      ctx.restore();
    } else if (pattern === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#5b8cff");
      grad.addColorStop(0.5, "#a66bff");
      grad.addColorStop(1, "#ff4d94");
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    } else if (pattern === "wave") {
      ctx.save();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#1d3557");
      grad.addColorStop(1, "#457b9d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      const r = Math.min(w, h) * 0.22;
      ctx.strokeStyle = "rgba(241, 250, 238, 0.55)";
      ctx.lineWidth = 3;
      for (let row = 0; row < 6; row++) {
        for (let col = -1; col < Math.ceil(w / r) + 1; col++) {
          const cx = col * r * 1.6 + (row % 2 ? r * 0.8 : 0);
          const cy = row * r * 0.85 + r * 0.5;
          for (let k = 1; k <= 3; k++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (r * 0.8 * k) / 3, Math.PI, 0);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    } else if (pattern === "pixel") {
      const step = Math.max(18, Math.round(Math.min(w, h) / 10));
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          ctx.fillStyle = hash > 0.65 ? "rgba(255,255,255,0.16)" : (hash < 0.3 ? "rgba(0,0,0,0.16)" : "transparent");
          ctx.fillRect(x, y, step - 2, step - 2);
        }
      }
    }
  }

  function drawCustomImage(ctx, w, h, img, scalePct, rotDeg, fitMode) {
    if (!img) return;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(((rotDeg || 0) * Math.PI) / 180);
    const scale = (scalePct || 100) / 100;
    const imgAspect = img.width / img.height;
    const boxAspect = w / h;
    let drawW, drawH;
    if (fitMode === "contain") {
      if (imgAspect > boxAspect) {
        drawW = w * scale;
        drawH = drawW / imgAspect;
      } else {
        drawH = h * scale;
        drawW = drawH * imgAspect;
      }
    } else {
      if (imgAspect > boxAspect) {
        drawH = h * scale;
        drawW = drawH * imgAspect;
      } else {
        drawW = w * scale;
        drawH = drawW / imgAspect;
      }
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  function drawSubtleGrain(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (let i = 0; i < 180; i++) {
      const x = (i * 73) % w;
      const y = (i * 137) % h;
      ctx.fillRect(x, y, 2, 2);
    }
    const rad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.1, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
    rad.addColorStop(0, "rgba(0,0,0,0.035)");
    rad.addColorStop(0.75, "rgba(0,0,0,0)");
    rad.addColorStop(1, "rgba(255,255,255,0.05)");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  KB.createKeycapTextures = function (cfg, widthU, heightU) {
    const baseSize = 224;
    const topW = Math.round(baseSize * widthU);
    const topH = Math.round(baseSize * heightU);

    // ---- 1. TOP FACE TEXTURE ----
    const topCanvas = document.createElement("canvas");
    topCanvas.width = topW;
    topCanvas.height = topH;
    const tctx = topCanvas.getContext("2d");

    drawPattern(tctx, topW, topH, cfg.pattern || "none", cfg.bgColor);
    if (cfg.customImage) {
      drawCustomImage(tctx, topW, topH, cfg.customImage, cfg.texScale, cfg.texRot, cfg.texFit || "cover");
    }
    drawSubtleGrain(tctx, topW, topH);

    // Special procedural styling for Dafeiyu pastel baby-blue + milky-white gold-starburst set
    // Colors are calibrated for Three.js ACESFilmicToneMapping + 1.55 studio key light so they don't wash out
    if (cfg.pixelTheme === "dafeiyu" && !cfg.customImage) {
      const style = cfg.dafeiyuStyle || "starburst";
      tctx.save();
      if (style === "wave") {
        // Dreamy baby-blue & milky-white swirled cloud wave (matching number row & F5-F8)
        tctx.fillStyle = "#5c8fd6";
        tctx.fillRect(0, 0, topW, topH);
        tctx.fillStyle = "rgba(226, 238, 252, 0.72)";
        tctx.beginPath();
        tctx.moveTo(0, topH * 0.60);
        tctx.bezierCurveTo(topW * 0.28, topH * 0.30, topW * 0.56, topH * 0.88, topW, topH * 0.46);
        tctx.lineTo(topW, topH);
        tctx.lineTo(0, topH);
        tctx.closePath();
        tctx.fill();
        tctx.fillStyle = "rgba(226, 238, 252, 0.48)";
        tctx.beginPath();
        tctx.moveTo(0, topH * 0.26);
        tctx.bezierCurveTo(topW * 0.35, topH * 0.04, topW * 0.72, topH * 0.44, topW, topH * 0.16);
        tctx.lineTo(topW, 0);
        tctx.lineTo(0, 0);
        tctx.closePath();
        tctx.fill();
      } else if (style === "starburst") {
        // Warm golden 4-point starburst halo centered behind milky-white alpha legends
        const cx = topW / 2, cy = topH / 2;
        const rOuter = Math.min(topW, topH) * 0.40;
        const rInner = rOuter * 0.42;
        const grad = tctx.createRadialGradient(cx, cy, rInner * 0.25, cx, cy, rOuter);
        grad.addColorStop(0, "rgba(235, 186, 62, 0.72)");
        grad.addColorStop(0.65, "rgba(224, 168, 42, 0.38)");
        grad.addColorStop(1, "rgba(224, 168, 42, 0)");
        tctx.fillStyle = grad;
        tctx.beginPath();
        tctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        tctx.fill();

        tctx.fillStyle = "rgba(218, 158, 32, 0.92)";
        for (let a = 0; a < 4; a++) {
          const ang = (a * Math.PI) / 2 + Math.PI / 4;
          const sx = cx + Math.cos(ang) * rOuter * 0.92;
          const sy = cy + Math.sin(ang) * rOuter * 0.92;
          const px = cx + Math.cos(ang + 0.22) * rInner;
          const py = cy + Math.sin(ang + 0.22) * rInner;
          const qx = cx + Math.cos(ang - 0.22) * rInner;
          const qy = cy + Math.sin(ang - 0.22) * rInner;
          tctx.beginPath();
          tctx.moveTo(sx, sy);
          tctx.lineTo(px, py);
          tctx.lineTo(qx, qy);
          tctx.closePath();
          tctx.fill();
        }
      } else if (style === "wasd") {
        // Gaming WASD accent: crisp baby-blue brackets < > and warm golden ribbon underline
        const cx = topW / 2, cy = topH / 2;
        tctx.strokeStyle = "#4d7ec7";
        tctx.lineWidth = 7;
        tctx.lineCap = "round";
        tctx.lineJoin = "round";
        tctx.beginPath();
        tctx.moveTo(cx - 56, cy - 13);
        tctx.lineTo(cx - 70, cy);
        tctx.lineTo(cx - 56, cy + 13);
        tctx.moveTo(cx + 56, cy - 13);
        tctx.lineTo(cx + 70, cy);
        tctx.lineTo(cx + 56, cy + 13);
        tctx.stroke();

        tctx.fillStyle = "#d99b26";
        tctx.beginPath();
        tctx.roundRect ? tctx.roundRect(cx - 46, cy + 52, 92, 13, 6) : tctx.fillRect(cx - 46, cy + 52, 92, 13);
        tctx.fill();
      } else if (style === "pastel_mod") {
        // Subtle soft gloss gradient on baby-blue modifiers
        const g = tctx.createLinearGradient(0, 0, 0, topH);
        g.addColorStop(0, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(35,70,130,0.14)");
        tctx.fillStyle = g;
        tctx.fillRect(0, 0, topW, topH);
      }
      tctx.restore();
    } else if (cfg.pixelSparkle && !cfg.customImage) {
      const bgLow = cfg.bgColor.toLowerCase();
      if (cfg.fontStyle === "sunna") {
        tctx.save();
        tctx.fillStyle = bgLow === "#fffbfd" ? "#9ce6c8" : "#fffbfd";
        tctx.beginPath();
        tctx.arc(topW - 34, 34, 6, 0, Math.PI * 2);
        tctx.fill();
        tctx.fillStyle = bgLow === "#fffbfd" ? "#f6b2cb" : "#ffe17d";
        tctx.beginPath();
        tctx.arc(34, topH - 34, 5, 0, Math.PI * 2);
        tctx.fill();
        tctx.restore();
      } else {
        const isDark = bgLow === "#152550";
        drawPixelSparkle(tctx, topW - 36, 36, 4, "#00d4ff");
        drawPixelSparkle(tctx, 36, topH - 36, 3, isDark ? "#00d4ff" : "#ff78b4");
      }
    }

    if (cfg.showLegend && cfg.legendPos === "top" && (cfg.label || cfg.sub)) {
      tctx.save();
      const scale = (cfg.fontScale || 100) / 100;
      if (cfg.pixelTheme === "dafeiyu" && !cfg.customImage) {
        const style = cfg.dafeiyuStyle || "starburst";
        const combined = cfg.sub ? `${cfg.label}${cfg.sub}` : (cfg.label || "");
        const len = combined.length;
        const baseSz = len <= 1 ? 90 : (len === 2 ? 72 : (len === 3 ? 54 : 44));
        const fontSize = Math.round(baseSz * scale);
        tctx.font = `900 ${fontSize}px "SF Pro Rounded", "Arial Rounded MT Bold", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        tctx.textAlign = "center";
        tctx.textBaseline = "middle";
        if (style === "wave" || style === "pastel_mod") {
          // Chunky cream-white letters with rich warm golden outline
          tctx.lineJoin = "round";
          tctx.lineWidth = Math.max(10, Math.round(fontSize * 0.22));
          tctx.strokeStyle = "#c78818";
          tctx.strokeText(combined, topW / 2, topH / 2 + 2);
          tctx.fillStyle = "#fffdf5";
          tctx.fillText(combined, topW / 2, topH / 2 + 2);
        } else {
          // Milky-white alpha keys: crisp baby-blue letters
          tctx.fillStyle = cfg.fgColor;
          tctx.fillText(combined, topW / 2, topH / 2 + 2);
        }
      } else if (cfg.fontStyle === "sunna") {
        tctx.fillStyle = cfg.fgColor;
        tctx.textBaseline = "middle";
        const isLong = (cfg.label || "").length >= 3;
        if (cfg.hiragana) {
          tctx.textAlign = "left";
          tctx.font = `800 ${Math.round(68 * scale)}px "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
          tctx.fillText(cfg.label, topW * 0.17, topH * 0.38);
          tctx.textAlign = "right";
          tctx.globalAlpha = 0.78;
          tctx.font = `700 ${Math.round(34 * scale)}px "Hiragino Maru Gothic ProN", "PingFang SC", sans-serif`;
          tctx.fillText(cfg.hiragana, topW * 0.84, topH * 0.74);
          tctx.globalAlpha = 1;
        } else if (cfg.sub) {
          tctx.textAlign = "left";
          const padX = Math.round(topW * 0.16);
          tctx.font = `700 ${Math.round(38 * scale)}px "SF Pro Rounded", -apple-system, sans-serif`;
          tctx.globalAlpha = 0.86;
          tctx.fillText(cfg.sub, padX, topH * 0.28);
          tctx.globalAlpha = 1;
          tctx.font = `800 ${Math.round(62 * scale)}px "SF Pro Rounded", -apple-system, sans-serif`;
          tctx.fillText(cfg.label, padX, topH * 0.66);
        } else {
          tctx.textAlign = "center";
          const mainSize = Math.round((isLong ? 46 : 78) * scale);
          tctx.font = `800 ${mainSize}px "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
          tctx.fillText(cfg.label, topW / 2, topH / 2 + 2);
        }
      } else if (cfg.fontStyle === "pixel") {
        const bgLow = cfg.bgColor.toLowerCase();
        const isDark = bgLow === "#152550";
        if (cfg.sub) {
          const subCol = isDark ? "#72e8ff" : "#288ceb";
          drawPixelText(tctx, cfg.sub, topW * 0.34, topH * 0.30, Math.max(4, Math.round(7 * scale)), subCol);
          drawPixelText(tctx, cfg.label, topW * 0.56, topH * 0.64, Math.max(5, Math.round(10 * scale)), cfg.fgColor);
        } else {
          const len = (cfg.label || "").length;
          const basePx = len <= 1 ? 11 : (len === 2 ? 8 : (len === 3 ? 6 : 5));
          drawPixelText(tctx, cfg.label, topW / 2, topH / 2, Math.max(4, Math.round(basePx * scale)), cfg.fgColor);
        }
      } else {
        tctx.fillStyle = cfg.fgColor;
        tctx.textBaseline = "middle";
        const isLong = (cfg.label || "").length >= 3;
        const mainSize = Math.round((isLong ? 46 : 80) * scale);
        tctx.font = `700 ${mainSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif`;

        if (cfg.sub) {
          tctx.textAlign = "left";
          const padX = Math.round(topW * 0.14);
          tctx.font = `600 ${Math.round(42 * scale)}px -apple-system, BlinkMacSystemFont, sans-serif`;
          tctx.globalAlpha = 0.82;
          tctx.fillText(cfg.sub, padX, topH * 0.28);
          tctx.globalAlpha = 1;
          tctx.font = `700 ${Math.round(62 * scale)}px -apple-system, BlinkMacSystemFont, sans-serif`;
          tctx.fillText(cfg.label, padX, topH * 0.66);
        } else {
          tctx.textAlign = "center";
          tctx.fillText(cfg.label, topW / 2, topH / 2 + 2);
        }
      }
      tctx.restore();
    }

    const topTex = new THREE.CanvasTexture(topCanvas);
    topTex.anisotropy = 16;
    topTex.generateMipmaps = false;
    topTex.minFilter = THREE.LinearFilter;
    topTex.magFilter = THREE.LinearFilter;
    topTex.encoding = THREE.sRGBEncoding;

    // ---- 2. FRONT-SIDE FACE TEXTURE (for Side-Printed Legends 侧刻) ----
    const frontW = Math.min(topW, 1024);
    const frontH = 128;
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = frontW;
    frontCanvas.height = frontH;
    const fctx = frontCanvas.getContext("2d");

    drawPattern(fctx, frontW, frontH, cfg.pattern === "none" ? "none" : cfg.pattern, cfg.bgColor);
    fctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    fctx.fillRect(0, 0, frontW, frontH);

    if (cfg.showLegend && cfg.legendPos === "side" && (cfg.label || cfg.sub)) {
      fctx.save();
      const scale = (cfg.fontScale || 100) / 100;
      const sideText = cfg.sub ? `${cfg.label} ${cfg.sub}` : cfg.label;
      if (cfg.fontStyle === "pixel") {
        const px = sideText.length >= 4 ? 5 : 7;
        drawPixelText(fctx, sideText, frontW / 2, frontH * 0.56, Math.max(3, Math.round(px * scale)), cfg.fgColor);
      } else {
        fctx.fillStyle = cfg.fgColor;
        fctx.textAlign = "center";
        fctx.textBaseline = "middle";
        const isLong = (cfg.label || "").length >= 3;
        const fontSize = Math.round((isLong ? 38 : 52) * scale);
        fctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif`;
        fctx.fillText(sideText, frontW / 2, frontH * 0.56);
      }
      fctx.restore();
    }

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    frontTex.anisotropy = 16;
    frontTex.generateMipmaps = false;
    frontTex.minFilter = THREE.LinearFilter;
    frontTex.magFilter = THREE.LinearFilter;
    frontTex.encoding = THREE.sRGBEncoding;

    return { topTex, frontTex };
  };

  KB.createWalnutTexture = function () {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#4b3325";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 65; i++) {
      const y = (i / 65) * 512;
      ctx.strokeStyle = i % 3 === 0 ? "rgba(25,14,8,0.28)" : "rgba(130,88,58,0.16)";
      ctx.lineWidth = 2 + (i % 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + Math.sin(i) * 14, 340, y - Math.cos(i) * 14, 512, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  };

  KB.createDeskMatTexture = function () {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#1d212c";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 8) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 3);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  };
})(window.KB);
