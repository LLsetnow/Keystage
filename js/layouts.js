(function (KB) {
  // Helper to build a row of keys from compact definitions
  // item: string | { l, sub?, w?, h?, role?, code?, gap?, knob? }
  function buildRows(rowSpecs) {
    const keys = [];
    let maxW = 0;
    let maxH = 0;
    let yCursor = 0;
    let idCounter = 0;

    rowSpecs.forEach((rowSpec, rIdx) => {
      if (rowSpec.yGap) yCursor += rowSpec.yGap;
      let xCursor = 0;
      const items = Array.isArray(rowSpec) ? rowSpec : rowSpec.keys;
      items.forEach((item) => {
        if (typeof item === "number") {
          xCursor += item;
          return;
        }
        if (typeof item === "string") {
          const id = `k_${idCounter++}`;
          keys.push({
            id,
            label: item,
            sub: "",
            x: xCursor,
            y: yCursor,
            w: 1,
            h: 1,
            row: rIdx,
            role: "alpha",
            code: inferCode(item),
            isKnob: false
          });
          xCursor += 1;
        } else {
          if (item.gap) {
            xCursor += item.gap;
            return;
          }
          const w = item.w || 1;
          const h = item.h || 1;
          const id = `k_${idCounter++}`;
          keys.push({
            id,
            label: item.l || "",
            sub: item.sub || "",
            x: xCursor,
            y: yCursor,
            w,
            h,
            row: rIdx,
            role: item.role || "alpha",
            code: item.code || inferCode(item.l || ""),
            isKnob: Boolean(item.knob)
          });
          xCursor += w;
        }
        if (xCursor > maxW) maxW = xCursor;
      });
      yCursor += 1;
      if (yCursor > maxH) maxH = yCursor;
    });

    return { keys, widthU: maxW, heightU: maxH };
  }

  function inferCode(label) {
    if (!label) return "";
    if (/^[A-Z]$/.test(label)) return "Key" + label;
    if (/^[0-9]$/.test(label)) return "Digit" + label;
    if (/^F([1-9]|1[0-2])$/.test(label)) return label;
    const map = {
      ESC: "Escape", TAB: "Tab", CAPS: "CapsLock", ENTER: "Enter",
      BACK: "Backspace", SPACE: "Space", DEL: "Delete", INS: "Insert",
      HOME: "Home", END: "End", PGUP: "PageUp", PGDN: "PageDown",
      "↑": "ArrowUp", "↓": "ArrowDown", "←": "ArrowLeft", "→": "ArrowRight",
      "-": "Minus", "=": "Equal", "[": "BracketLeft", "]": "BracketRight",
      "\\": "Backslash", ";": "Semicolon", "'": "Quote", ",": "Comma",
      ".": "Period", "/": "Slash", "`": "Backquote"
    };
    return map[label.toUpperCase()] || "";
  }

  const numRowCore = [
    { l: "1", sub: "!" }, { l: "2", sub: "@" }, { l: "3", sub: "#" }, { l: "4", sub: "$" },
    { l: "5", sub: "%" }, { l: "6", sub: "^" }, { l: "7", sub: "&" }, { l: "8", sub: "*" },
    { l: "9", sub: "(" }, { l: "0", sub: ")" }, { l: "-", sub: "_" }, { l: "=", sub: "+" },
    { l: "BACK", w: 2, role: "mod", code: "Backspace" }
  ];

  const qRowCore = [
    { l: "TAB", w: 1.5, role: "mod", code: "Tab" },
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    { l: "[", sub: "{" }, { l: "]", sub: "}" },
    { l: "\\", sub: "|", w: 1.5, role: "mod", code: "Backslash" }
  ];

  const aRowCore = [
    { l: "CAPS", w: 1.75, role: "mod", code: "CapsLock" },
    "A", "S", "D", "F", "G", "H", "J", "K", "L",
    { l: ";", sub: ":" }, { l: "'", sub: '"' },
    { l: "ENTER", w: 2.25, role: "accent", code: "Enter" }
  ];

  const zRowStandard = [
    { l: "SHIFT", w: 2.25, role: "mod", code: "ShiftLeft" },
    "Z", "X", "C", "V", "B", "N", "M",
    { l: ",", sub: "<" }, { l: ".", sub: ">" }, { l: "/", sub: "?" },
    { l: "SHIFT", w: 2.75, role: "mod", code: "ShiftRight" }
  ];

  const bottomStandard = [
    { l: "CTRL", w: 1.25, role: "mod", code: "ControlLeft" },
    { l: "WIN", w: 1.25, role: "mod", code: "MetaLeft" },
    { l: "ALT", w: 1.25, role: "mod", code: "AltLeft" },
    { l: "", w: 6.25, role: "space", code: "Space" },
    { l: "ALT", w: 1.25, role: "mod", code: "AltRight" },
    { l: "FN", w: 1.25, role: "mod", code: "Fn" },
    { l: "MENU", w: 1.25, role: "mod", code: "ContextMenu" },
    { l: "CTRL", w: 1.25, role: "mod", code: "ControlRight" }
  ];

  const zRowCompact = [
    { l: "SHIFT", w: 2.25, role: "mod", code: "ShiftLeft" },
    "Z", "X", "C", "V", "B", "N", "M",
    { l: ",", sub: "<" }, { l: ".", sub: ">" }, { l: "/", sub: "?" },
    { l: "SHIFT", w: 1.75, role: "mod", code: "ShiftRight" },
    { l: "↑", role: "arrow", code: "ArrowUp" },
    { l: "END", role: "mod", code: "End" }
  ];

  const bottomCompact = [
    { l: "CTRL", w: 1.25, role: "mod", code: "ControlLeft" },
    { l: "WIN", w: 1.25, role: "mod", code: "MetaLeft" },
    { l: "ALT", w: 1.25, role: "mod", code: "AltLeft" },
    { l: "", w: 6.25, role: "space", code: "Space" },
    { l: "ALT", w: 1, role: "mod", code: "AltRight" },
    { l: "FN", w: 1, role: "mod", code: "Fn" },
    { l: "CTRL", w: 1, role: "mod", code: "ControlRight" },
    { l: "←", role: "arrow", code: "ArrowLeft" },
    { l: "↓", role: "arrow", code: "ArrowDown" },
    { l: "→", role: "arrow", code: "ArrowRight" }
  ];

  KB.LAYOUTS = {
    "60": {
      id: "60",
      name: "60% 紧凑布局",
      meta: "60% 布局 · 61 键 · 极简桌面",
      ...buildRows([
        [{ l: "ESC", role: "accent", code: "Escape" }, ...numRowCore],
        qRowCore,
        aRowCore,
        zRowStandard,
        bottomStandard
      ])
    },
    "65": {
      id: "65",
      name: "65% 实用布局",
      meta: "65% 布局 · 68 键 · 独立方向键",
      ...buildRows([
        [{ l: "ESC", role: "accent", code: "Escape" }, ...numRowCore, { l: "DEL", role: "mod", code: "Delete" }],
        [...qRowCore, { l: "PGUP", role: "mod", code: "PageUp" }],
        [...aRowCore, { l: "PGDN", role: "mod", code: "PageDown" }],
        zRowCompact,
        bottomCompact
      ])
    },
    "75": {
      id: "75",
      name: "75% 旋钮布局",
      meta: "75% 布局 · 82 键 + 金属旋钮",
      ...buildRows([
        [
          { l: "ESC", role: "accent", code: "Escape" }, 0.25,
          { l: "F1", role: "mod" }, { l: "F2", role: "mod" }, { l: "F3", role: "mod" }, { l: "F4", role: "mod" }, 0.25,
          { l: "F5", role: "mod" }, { l: "F6", role: "mod" }, { l: "F7", role: "mod" }, { l: "F8", role: "mod" }, 0.25,
          { l: "F9", role: "mod" }, { l: "F10", role: "mod" }, { l: "F11", role: "mod" }, { l: "F12", role: "mod" }, 0.25,
          { l: "DEL", role: "mod", code: "Delete" },
          { l: "VOL", role: "knob", knob: true }
        ],
        { yGap: 0.22, keys: [{ l: "`", sub: "~" }, ...numRowCore, { l: "HOME", role: "mod", code: "Home" }] },
        [...qRowCore, { l: "PGUP", role: "mod", code: "PageUp" }],
        [...aRowCore, { l: "PGDN", role: "mod", code: "PageDown" }],
        zRowCompact,
        bottomCompact
      ])
    },
    "80": {
      id: "80",
      name: "80% TKL 经典配列",
      meta: "80% TKL · 87 键 · 经典客制化配列",
      ...buildRows([
        [
          { l: "ESC", role: "accent", code: "Escape" }, 1,
          { l: "F1", role: "mod" }, { l: "F2", role: "mod" }, { l: "F3", role: "mod" }, { l: "F4", role: "mod" }, 0.5,
          { l: "F5", role: "mod" }, { l: "F6", role: "mod" }, { l: "F7", role: "mod" }, { l: "F8", role: "mod" }, 0.5,
          { l: "F9", role: "mod" }, { l: "F10", role: "mod" }, { l: "F11", role: "mod" }, { l: "F12", role: "mod" }, 0.25,
          { l: "PRT", role: "mod" }, { l: "SCR", role: "mod" }, { l: "PAU", role: "mod" }
        ],
        { yGap: 0.3, keys: [{ l: "`", sub: "~" }, ...numRowCore, 0.25, { l: "INS", role: "mod" }, { l: "HOME", role: "mod" }, { l: "PGUP", role: "mod" }] },
        [...qRowCore, 0.25, { l: "DEL", role: "mod" }, { l: "END", role: "mod" }, { l: "PGDN", role: "mod" }],
        aRowCore,
        [...zRowStandard, 1.25, { l: "↑", role: "arrow", code: "ArrowUp" }],
        [...bottomStandard, 0.25, { l: "←", role: "arrow", code: "ArrowLeft" }, { l: "↓", role: "arrow", code: "ArrowDown" }, { l: "→", role: "arrow", code: "ArrowRight" }]
      ])
    },
    "100": {
      id: "100",
      name: "100% 全尺寸配列",
      meta: "100% 全尺寸 · 104 键 · 含独立数字区",
      ...buildRows([
        [
          { l: "ESC", role: "accent", code: "Escape" }, 1,
          { l: "F1", role: "mod" }, { l: "F2", role: "mod" }, { l: "F3", role: "mod" }, { l: "F4", role: "mod" }, 0.5,
          { l: "F5", role: "mod" }, { l: "F6", role: "mod" }, { l: "F7", role: "mod" }, { l: "F8", role: "mod" }, 0.5,
          { l: "F9", role: "mod" }, { l: "F10", role: "mod" }, { l: "F11", role: "mod" }, { l: "F12", role: "mod" }, 0.25,
          { l: "PRT", role: "mod" }, { l: "SCR", role: "mod" }, { l: "PAU", role: "mod" }
        ],
        {
          yGap: 0.3,
          keys: [
            { l: "`", sub: "~" }, ...numRowCore, 0.25,
            { l: "INS", role: "mod" }, { l: "HOME", role: "mod" }, { l: "PGUP", role: "mod" }, 0.25,
            { l: "NUM", role: "mod" }, { l: "/", role: "mod" }, { l: "*", role: "mod" }, { l: "-", role: "mod" }
          ]
        },
        [
          ...qRowCore, 0.25,
          { l: "DEL", role: "mod" }, { l: "END", role: "mod" }, { l: "PGDN", role: "mod" }, 0.25,
          { l: "7", code: "Numpad7" }, { l: "8", code: "Numpad8" }, { l: "9", code: "Numpad9" },
          { l: "+", h: 2, role: "mod", code: "NumpadAdd" }
        ],
        [
          ...aRowCore, 3.5,
          { l: "4", code: "Numpad4" }, { l: "5", code: "Numpad5" }, { l: "6", code: "Numpad6" }
        ],
        [
          ...zRowStandard, 1.25,
          { l: "↑", role: "arrow", code: "ArrowUp" }, 1.25,
          { l: "1", code: "Numpad1" }, { l: "2", code: "Numpad2" }, { l: "3", code: "Numpad3" },
          { l: "ENT", h: 2, role: "accent", code: "NumpadEnter" }
        ],
        [
          ...bottomStandard, 0.25,
          { l: "←", role: "arrow", code: "ArrowLeft" }, { l: "↓", role: "arrow", code: "ArrowDown" }, { l: "→", role: "arrow", code: "ArrowRight" }, 0.25,
          { l: "0", w: 2, code: "Numpad0" }, { l: ".", code: "NumpadDecimal" }
        ]
      ])
    }
  };

  KB.THEMES = [
    {
      id: "dafeiyu",
      name: "大肥鱼 · DeepSeek",
      isFullSet: true,
      caseColor: "#e8eef8",
      caseMat: "ceramic",
      alphaBg: "#f7f8fc", alphaFg: "#1e2b4d",
      modBg: "#1e2b4d", modFg: "#e2b36b",
      accentBg: "#3a66a8", accentFg: "#ffffff",
      spaceBg: "#f7f8fc", arrowBg: "#66b8e8",
      arrowFg: "#1e2b4d",
      rgbColor: "#66b8e8"
    },
    {
      id: "chinatsu",
      name: "千夏像素 · Chinatsu",
      isFullSet: true,
      caseColor: "#eef6f1",
      caseMat: "ceramic",
      alphaBg: "#f9fcf9", alphaFg: "#2a2d38",
      modBg: "#dcf4e6", modFg: "#2a2d38",
      accentBg: "#2a2d35", accentFg: "#f9fcf9",
      spaceBg: "#f9fcf9", arrowBg: "#f274a3",
      arrowFg: "#f9fcf9",
      rgbColor: "#6ad4b6"
    },
    {
      id: "aries",
      name: "爱丽丝像素 · Aries",
      isFullSet: true,
      caseColor: "#e8eef7",
      caseMat: "ceramic",
      alphaBg: "#f8fafd", alphaFg: "#0d1b6e",
      modBg: "#e0f2ff", modFg: "#0d1b6e",
      accentBg: "#152550", accentFg: "#f8fafd",
      spaceBg: "#f8fafd", arrowBg: "#152550",
      arrowFg: "#f8fafd",
      rgbColor: "#19c8ff"
    },
    {
      id: "cream",
      name: "极简奶白",
      caseColor: "#e6e0d5",
      caseMat: "ceramic",
      alphaBg: "#f5f1e8", alphaFg: "#2a2d36",
      modBg: "#d8d1c4", modFg: "#2a2d36",
      accentBg: "#d96b52", accentFg: "#fffaf5",
      spaceBg: "#f5f1e8", arrowBg: "#d8d1c4",
      rgbColor: "#ffd6a5"
    },
    {
      id: "cyber",
      name: "赛博暗夜",
      caseColor: "#1b1e28",
      caseMat: "aluminum",
      alphaBg: "#242836", alphaFg: "#7ce8ff",
      modBg: "#1a1d28", modFg: "#c77dff",
      accentBg: "#ff2e88", accentFg: "#ffffff",
      spaceBg: "#1e2230", arrowBg: "#ff2e88",
      rgbColor: "#3ee8ff"
    },
    {
      id: "retro9009",
      name: "复古 9009",
      caseColor: "#cfc9bc",
      caseMat: "aluminum",
      alphaBg: "#ebe6da", alphaFg: "#333333",
      modBg: "#c4beb0", modFg: "#2c2c2c",
      accentBg: "#7fa887", accentFg: "#1f2b22",
      spaceBg: "#ebe6da", arrowBg: "#d68d89",
      rgbColor: "#ffe4b8"
    },
    {
      id: "matcha",
      name: "抹茶拿铁",
      caseColor: "#3f4a3c",
      caseMat: "walnut",
      alphaBg: "#f3f0e6", alphaFg: "#354233",
      modBg: "#9ab38f", modFg: "#243022",
      accentBg: "#5d7a54", accentFg: "#f7f5ee",
      spaceBg: "#9ab38f", arrowBg: "#5d7a54",
      rgbColor: "#b8f29c"
    },
    {
      id: "sakura",
      name: "樱花物语",
      caseColor: "#f2dce2",
      caseMat: "acrylic",
      alphaBg: "#fff7f9", alphaFg: "#8f4b61",
      modBg: "#f2b8c9", modFg: "#6e2e44",
      accentBg: "#e36c92", accentFg: "#ffffff",
      spaceBg: "#f7cad7", arrowBg: "#e36c92",
      rgbColor: "#ff9ec4"
    },
    {
      id: "obsidian",
      name: "黑金工业",
      caseColor: "#16171c",
      caseMat: "aluminum",
      alphaBg: "#22242c", alphaFg: "#e6c37a",
      modBg: "#181a20", modFg: "#d4a853",
      accentBg: "#d4a853", accentFg: "#16171c",
      spaceBg: "#1f2129", arrowBg: "#d4a853",
      rgbColor: "#ffbe55"
    }
  ];

  KB.LIGHTING_PRESETS = [
    {
      id: "studio",
      name: "柔光极简书桌",
      desc: "深灰木纹桌面、屏幕挂灯与均衡摄影棚光",
      orb: "linear-gradient(135deg, #ffffff, #9db4d8)",
      bg: 0x151821,
      floor: 0x1c202c,
      keyColor: 0xfff8f0, keyInt: 1.55,
      fillColor: 0xb9d4ff, fillInt: 0.65,
      rimColor: 0xdce8ff, rimInt: 0.85,
      hemiSky: 0xe6eefc, hemiGround: 0x262936, hemiInt: 0.72,
      exposure: 1.12
    },
    {
      id: "sunset",
      name: "暖调日落书房",
      desc: "胡桃木书桌、暖黄台灯与日落桌面壁纸",
      orb: "linear-gradient(135deg, #ffbd73, #b5544a)",
      bg: 0x1b151a,
      floor: 0x261d1f,
      keyColor: 0xffa65e, keyInt: 1.85,
      fillColor: 0xffd1b3, fillInt: 0.48,
      rimColor: 0x8fa4ff, rimInt: 0.65,
      hemiSky: 0xffcfa6, hemiGround: 0x2b1f26, hemiInt: 0.62,
      exposure: 1.15
    },
    {
      id: "cyber",
      name: "赛博霓虹电竞桌",
      desc: "碳黑桌面、青粉氛围灯墙与赛博网格屏",
      orb: "linear-gradient(135deg, #00f0ff, #ff2e88)",
      bg: 0x090b14,
      floor: 0x0e111f,
      keyColor: 0x62e8ff, keyInt: 1.35,
      fillColor: 0xff3b9a, fillInt: 1.05,
      rimColor: 0x9b5cff, rimInt: 1.25,
      hemiSky: 0x45689c, hemiGround: 0x160f24, hemiInt: 0.45,
      exposure: 1.18
    },
    {
      id: "gallery",
      name: "北欧纯白画廊桌",
      desc: "浅桦木桌面、明亮白墙与清透自然日光",
      orb: "linear-gradient(135deg, #f4f7fb, #c7d1e0)",
      bg: 0xd9e0ea,
      floor: 0xe7ecf2,
      keyColor: 0xffffff, keyInt: 1.6,
      fillColor: 0xdce8f8, fillInt: 0.85,
      rimColor: 0xffffff, rimInt: 0.7,
      hemiSky: 0xffffff, hemiGround: 0xaab4c4, hemiInt: 0.95,
      exposure: 1.08
    },
    {
      id: "dramatic",
      name: "深夜专注台灯",
      desc: "暗色实木桌、暖光建筑台灯与代码暗屏",
      orb: "linear-gradient(135deg, #ffe2a8, #1a1c24)",
      bg: 0x0a0b0f,
      floor: 0x101218,
      keyColor: 0xffe6ba, keyInt: 2.25,
      fillColor: 0x3b486b, fillInt: 0.25,
      rimColor: 0xfff0d4, rimInt: 1.1,
      hemiSky: 0x4e566e, hemiGround: 0x0c0d12, hemiInt: 0.28,
      exposure: 1.05
    }
  ];
})(window.KB);
