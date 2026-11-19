(function (KB) {
  KB.boot = function () {
    const toastEl = document.getElementById("toast");
    let toastTimer = null;
    function showToast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
    }

    const studio = KB.createStudio(document.getElementById("canvas-wrap"));
    const exporter = KB.createExporter(studio, showToast);

    let activeLayoutId = "75";
    let activeTheme = KB.THEMES[0];
    let activeLight = KB.LIGHTING_PRESETS[0];

    // ---- 1. POPULATE THEME & LIGHTING CARDS ----
    const themeGrid = document.getElementById("theme-grid");
    KB.THEMES.forEach((th) => {
      const btn = document.createElement("button");
      btn.className = "theme-card" + (th.id === activeTheme.id ? " active" : "");
      btn.dataset.themeId = th.id;
      btn.innerHTML = `
        <div class="swatch-row">
          <span class="swatch-dot" style="background:${th.caseColor}"></span>
          <span class="swatch-dot" style="background:${th.alphaBg}"></span>
          <span class="swatch-dot" style="background:${th.modBg}"></span>
          <span class="swatch-dot" style="background:${th.accentBg}"></span>
        </div>
        <div class="theme-name">${th.name}</div>
      `;
      btn.addEventListener("click", () => {
        activeTheme = th;
        themeGrid.querySelectorAll(".theme-card").forEach((c) => c.classList.toggle("active", c.dataset.themeId === th.id));
        studio.applyTheme(th);
        syncCaseControlsFromTheme(th);
        syncInspector(studio.getSelectedEntries());
        showToast(`已切换配色：${th.name}`);
      });
      themeGrid.appendChild(btn);
    });

    const lightList = document.getElementById("light-list");
    KB.LIGHTING_PRESETS.forEach((lp) => {
      const btn = document.createElement("button");
      btn.className = "light-card" + (lp.id === activeLight.id ? " active" : "");
      btn.dataset.lightId = lp.id;
      btn.innerHTML = `
        <div class="light-orb" style="background:${lp.orb}"></div>
        <div>
          <div class="light-name">${lp.name}</div>
          <div class="light-desc">${lp.desc}</div>
        </div>
      `;
      btn.addEventListener("click", () => {
        activeLight = lp;
        lightList.querySelectorAll(".light-card").forEach((c) => c.classList.toggle("active", c.dataset.lightId === lp.id));
        studio.applyLightingPreset(lp);
        document.getElementById("rng-exposure").value = lp.exposure;
        document.getElementById("val-exposure").textContent = lp.exposure.toFixed(2);
        showToast(`已切换光照：${lp.name}`);
      });
      lightList.appendChild(btn);
    });

    function syncCaseControlsFromTheme(th) {
      document.getElementById("case-color").value = th.caseColor;
      document.getElementById("case-color-hex").textContent = th.caseColor.toUpperCase();
      document.querySelectorAll("#case-mat-grid .chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.casemat === th.caseMat);
      });
    }

    // ---- 2. LAYOUT SWITCHER ----
    function switchLayout(id) {
      activeLayoutId = id;
      studio.loadLayout(id, activeTheme);
      const layout = KB.LAYOUTS[id];
      document.getElementById("layout-meta").textContent = layout.meta;
      document.querySelectorAll("#layout-tabs .tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.layout === id);
      });
      syncCaseControlsFromTheme(activeTheme);
    }

    document.querySelectorAll("#layout-tabs .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchLayout(btn.dataset.layout));
    });

    // ---- 3. TOP BAR ACTIONS ----
    document.getElementById("btn-view-overview").addEventListener("click", () => studio.setCameraPreset("overview"));
    document.getElementById("btn-view-top").addEventListener("click", () => studio.setCameraPreset("top"));
    document.getElementById("btn-view-side").addEventListener("click", () => studio.setCameraPreset("side"));

    const btnSound = document.getElementById("btn-sound");
    const inpSettingSound = document.getElementById("setting-sound-enabled");
    const inpSettingUpstroke = document.getElementById("setting-upstroke-enabled");
    const inpSettingVolume = document.getElementById("setting-sound-volume");
    const valSoundVolume = document.getElementById("val-sound-volume");
    const switchListEl = document.getElementById("switch-list");

    function syncAudioUI() {
      const enabled = studio.audio.isEnabled();
      const profile = studio.audio.getSwitchProfile();
      const volPct = Math.round(studio.audio.getVolume() * 100);
      btnSound.textContent = enabled ? "音效: 开" : "音效: 关";
      btnSound.classList.toggle("active", enabled);
      btnSound.title = `当前轴体：${profile.name}（点击开关音效，可在右侧「设置」中切换轴体）`;
      if (inpSettingSound) inpSettingSound.checked = enabled;
      if (inpSettingUpstroke) inpSettingUpstroke.checked = studio.audio.isUpstrokeEnabled();
      if (inpSettingVolume) inpSettingVolume.value = String(volPct);
      if (valSoundVolume) valSoundVolume.textContent = `${volPct}%`;
      if (switchListEl) {
        switchListEl.querySelectorAll(".switch-card").forEach((c) => {
          c.classList.toggle("active", c.dataset.switchId === profile.id);
        });
      }
    }

    if (switchListEl) {
      studio.audio.getAllProfiles().forEach((sw) => {
        const btn = document.createElement("button");
        btn.className = "switch-card";
        btn.dataset.switchId = sw.id;
        btn.innerHTML = `
          <div class="switch-stem" style="--stem-color:${sw.color};--stem-glow:${sw.accentColor}66;"></div>
          <div class="switch-info">
            <div class="switch-top-row">
              <span class="switch-name">${sw.name}</span>
              <span class="switch-force">${sw.force}</span>
            </div>
            <div class="switch-meta-row">
              <span class="switch-tag ${sw.typeTag}">${sw.type}</span>
              <span class="switch-en">${sw.enName}</span>
            </div>
            <div class="switch-desc">${sw.desc}</div>
          </div>
        `;
        btn.addEventListener("click", () => {
          studio.audio.setSwitchType(sw.id);
          syncAudioUI();
          studio.audio.playSingleSample();
          showToast(`已切换轴体：${sw.name}`);
        });
        switchListEl.appendChild(btn);
      });
    }

    btnSound.addEventListener("click", () => {
      const next = !studio.audio.isEnabled();
      studio.audio.setEnabled(next);
      syncAudioUI();
    });

    if (inpSettingSound) {
      inpSettingSound.addEventListener("change", (e) => {
        studio.audio.setEnabled(e.target.checked);
        syncAudioUI();
      });
    }

    if (inpSettingUpstroke) {
      inpSettingUpstroke.addEventListener("change", (e) => {
        studio.audio.setUpstrokeEnabled(e.target.checked);
        syncAudioUI();
      });
    }

    if (inpSettingVolume) {
      inpSettingVolume.addEventListener("input", (e) => {
        const pct = Number(e.target.value);
        studio.audio.setVolume(pct / 100);
        valSoundVolume.textContent = `${pct}%`;
      });
    }

    const btnTestSwitch = document.getElementById("btn-test-switch");
    if (btnTestSwitch) {
      btnTestSwitch.addEventListener("click", () => {
        const profile = studio.audio.getSwitchProfile();
        studio.audio.playTypingDemo();
        showToast(`正在试听「${profile.name}」连打音效`);
      });
    }

    syncAudioUI();

    const btnZen = document.getElementById("btn-zen");
    btnZen.addEventListener("click", () => {
      document.body.classList.toggle("zen-mode");
      const zen = document.body.classList.contains("zen-mode");
      btnZen.textContent = zen ? "退出纯净" : "纯净预览";
      btnZen.classList.toggle("active", zen);
    });

    // ---- 4. UNIFIED RIGHT DRAWER: COLLAPSE & TABS ----
    const rightDrawer = document.getElementById("right-drawer");
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    const btnDrawerToggle = document.getElementById("btn-drawer-toggle");

    function setDrawerCollapsed(collapsed) {
      rightDrawer.classList.toggle("collapsed", collapsed);
      btnToggleSidebar.textContent = collapsed ? "展开侧栏" : "收起侧栏";
      btnToggleSidebar.classList.toggle("active", collapsed);
    }
    btnToggleSidebar.addEventListener("click", () => {
      setDrawerCollapsed(!rightDrawer.classList.contains("collapsed"));
    });
    btnDrawerToggle.addEventListener("click", () => {
      setDrawerCollapsed(!rightDrawer.classList.contains("collapsed"));
    });

    function switchRightTab(target) {
      document.querySelectorAll("#right-panel .ptab").forEach((t) => {
        t.classList.toggle("active", t.dataset.rtab === target);
      });
      document.querySelectorAll("#right-panel .ptab-body").forEach((b) => {
        b.classList.toggle("active", b.id === `rtab-${target}`);
      });
    }
    document.querySelectorAll("#right-panel .ptab").forEach((tab) => {
      tab.addEventListener("click", () => switchRightTab(tab.dataset.rtab));
    });

    document.querySelectorAll("#case-mat-grid .chip").forEach((c) => {
      c.addEventListener("click", () => {
        document.querySelectorAll("#case-mat-grid .chip").forEach((x) => x.classList.toggle("active", x === c));
        studio.setCaseMaterial(c.dataset.casemat);
      });
    });

    document.getElementById("case-color").addEventListener("input", (e) => {
      const val = e.target.value;
      document.getElementById("case-color-hex").textContent = val.toUpperCase();
      studio.setCaseColor(val);
    });

    document.querySelectorAll("#global-legend-pos .chip").forEach((c) => {
      c.addEventListener("click", () => {
        document.querySelectorAll("#global-legend-pos .chip").forEach((x) => x.classList.toggle("active", x === c));
        const mode = c.dataset.gpos;
        studio.getAllEntries().forEach((entry) => {
          // Preserve artwork-only keycaps (e.g. Aries/Chinatsu special keys or custom uploads) without stamping duplicate text on top
          if (entry.cfg.customImage) {
            entry.cfg.showLegend = false;
            studio.updateKeycapVisual(entry);
            return;
          }
          if (mode === "none") {
            entry.cfg.showLegend = false;
          } else {
            entry.cfg.showLegend = true;
            entry.cfg.legendPos = mode;
          }
          studio.updateKeycapVisual(entry);
        });
        syncInspector(studio.getSelectedEntries());
        showToast(mode === "top" ? "已切换文字键帽为正刻（图案键帽保持原样）" : mode === "side" ? "已切换文字键帽为侧刻（图案键帽保持原样）" : "已切换全键盘为无刻");
      });
    });

    document.getElementById("toggle-rgb").addEventListener("change", (e) => studio.setRGBEnabled(e.target.checked));
    document.getElementById("toggle-deskmat").addEventListener("change", (e) => studio.setDeskMatVisible(e.target.checked));

    document.querySelectorAll("[data-select-group]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = btn.dataset.selectGroup;
        const all = studio.getAllEntries();
        if (g === "clear") return studio.setSelection([]);
        if (g === "all") return studio.setSelection(all.map((e) => e.def.id));
        const ids = all.filter((e) => e.def.role === g).map((e) => e.def.id);
        studio.setSelection(ids);
      });
    });

    // Lighting fine-tune sliders
    document.getElementById("rng-exposure").addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-exposure").textContent = v.toFixed(2);
      studio.setExposure(v);
    });
    document.getElementById("rng-light-angle").addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-light-angle").textContent = `${v}°`;
      studio.setLightAngle(v);
    });
    document.getElementById("rng-env").addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-env").textContent = v.toFixed(2);
      studio.setEnvIntensity(v);
    });

    // ---- 5. RIGHT PANEL: PER-KEY INSPECTOR ----
    const selTitle = document.getElementById("sel-title");
    const selSub = document.getElementById("sel-sub");
    const btnFocusKey = document.getElementById("btn-focus-key");
    const emptyBox = document.getElementById("inspector-empty");
    const ctrlBox = document.getElementById("inspector-controls");

    const inpShowLegend = document.getElementById("key-show-legend");
    const inpLabel = document.getElementById("key-label-input");
    const inpSub = document.getElementById("key-sub-input");
    const inpFontScale = document.getElementById("key-font-scale");
    const inpBgColor = document.getElementById("key-bg-color");
    const inpFgColor = document.getElementById("key-fg-color");
    const inpTexScale = document.getElementById("key-tex-scale");
    const inpTexRot = document.getElementById("key-tex-rot");
    const texPreviewBar = document.getElementById("tex-preview-bar");
    const texThumb = document.getElementById("tex-thumb");

    function syncInspector(entries) {
      if (!entries || entries.length === 0) {
        selTitle.textContent = "逐键定制 · 未选中键帽";
        selSub.textContent = "点击 3D 键盘任意按键开始编辑（Shift 多选）";
        btnFocusKey.disabled = true;
        emptyBox.classList.remove("hidden");
        ctrlBox.classList.add("hidden");
        return;
      }

      emptyBox.classList.add("hidden");
      ctrlBox.classList.remove("hidden");
      btnFocusKey.disabled = false;

      const first = entries[0];
      const cfg = first.cfg;
      if (entries.length === 1) {
        selTitle.textContent = `当前键帽：${cfg.label || first.def.code || "空格键"}`;
        selSub.textContent = `宽度 ${first.def.w}u · ${cfg.showLegend ? (cfg.legendPos === "top" ? "正刻" : "侧刻") : "无刻"}`;
      } else {
        selTitle.textContent = `已多选 ${entries.length} 颗键帽`;
        selSub.textContent = "以下修改将同步应用到全部选中键帽";
      }

      inpShowLegend.checked = cfg.showLegend;
      document.querySelectorAll("#key-pos-grid .chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.kpos === cfg.legendPos);
      });
      inpLabel.value = cfg.label;
      inpSub.value = cfg.sub;
      inpLabel.disabled = entries.length > 1;
      inpSub.disabled = entries.length > 1;

      inpFontScale.value = cfg.fontScale;
      document.getElementById("val-font-scale").textContent = `${cfg.fontScale}%`;

      inpBgColor.value = cfg.bgColor;
      document.getElementById("key-bg-hex").textContent = cfg.bgColor.toUpperCase();
      inpFgColor.value = cfg.fgColor;
      document.getElementById("key-fg-hex").textContent = cfg.fgColor.toUpperCase();

      document.querySelectorAll("#pattern-grid .chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.pattern === cfg.pattern);
      });

      if (cfg.customImageUrl) {
        texThumb.src = cfg.customImageUrl;
        texPreviewBar.classList.remove("hidden");
        inpTexScale.value = cfg.texScale;
        document.getElementById("val-tex-scale").textContent = `${cfg.texScale}%`;
        inpTexRot.value = cfg.texRot;
        document.getElementById("val-tex-rot").textContent = `${cfg.texRot}°`;
      } else {
        texPreviewBar.classList.add("hidden");
      }
    }

    function mutateSelected(mutator) {
      const entries = studio.getSelectedEntries();
      if (entries.length === 0) return;
      entries.forEach((e) => {
        mutator(e.cfg, e);
        studio.updateKeycapVisual(e);
      });
      syncInspector(entries);
    }

    studio.setOnSelectionChange((entries) => {
      syncInspector(entries);
      if (entries && entries.length > 0) {
        switchRightTab("key");
      }
    });

    // Hover Tooltip
    const hoverTip = document.getElementById("hover-tip");
    studio.setOnHoverChange((entry, x, y) => {
      if (!entry) {
        hoverTip.classList.remove("show");
        return;
      }
      const modeStr = entry.cfg.showLegend ? (entry.cfg.legendPos === "top" ? "正刻" : "侧刻") : "无刻";
      hoverTip.textContent = `${entry.cfg.label || entry.def.code || "Space"} (${entry.def.w}u · ${modeStr})`;
      hoverTip.style.left = `${x}px`;
      hoverTip.style.top = `${y}px`;
      hoverTip.classList.add("show");
    });

    btnFocusKey.addEventListener("click", () => studio.focusSelectedKey());

    document.getElementById("btn-pick-sample").addEventListener("click", () => {
      const esc = studio.getAllEntries()[0];
      if (esc) {
        studio.setSelection([esc.def.id]);
        studio.focusSelectedKey();
      }
    });

    inpShowLegend.addEventListener("change", (e) => {
      mutateSelected((cfg) => { cfg.showLegend = e.target.checked; });
    });

    document.querySelectorAll("#key-pos-grid .chip").forEach((c) => {
      c.addEventListener("click", () => {
        const pos = c.dataset.kpos;
        mutateSelected((cfg) => {
          cfg.showLegend = true;
          cfg.legendPos = pos;
        });
      });
    });

    inpLabel.addEventListener("input", (e) => {
      mutateSelected((cfg) => { cfg.label = e.target.value; });
    });
    inpSub.addEventListener("input", (e) => {
      mutateSelected((cfg) => { cfg.sub = e.target.value; });
    });
    inpFontScale.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-font-scale").textContent = `${v}%`;
      mutateSelected((cfg) => { cfg.fontScale = v; });
    });

    inpBgColor.addEventListener("input", (e) => {
      const v = e.target.value;
      document.getElementById("key-bg-hex").textContent = v.toUpperCase();
      mutateSelected((cfg) => { cfg.bgColor = v; });
    });
    inpFgColor.addEventListener("input", (e) => {
      const v = e.target.value;
      document.getElementById("key-fg-hex").textContent = v.toUpperCase();
      mutateSelected((cfg) => { cfg.fgColor = v; });
    });

    document.querySelectorAll("#pattern-grid .chip").forEach((c) => {
      c.addEventListener("click", () => {
        const pat = c.dataset.pattern;
        mutateSelected((cfg) => { cfg.pattern = pat; });
      });
    });

    // Custom Image Upload for Keycap
    document.getElementById("key-tex-upload").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const img = new Image();
        img.onload = () => {
          mutateSelected((cfg) => {
            cfg.customImage = img;
            cfg.customImageUrl = dataUrl;
          });
          showToast("已应用自定义键帽贴图");
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });

    document.getElementById("btn-clear-tex").addEventListener("click", () => {
      mutateSelected((cfg) => {
        cfg.customImage = null;
        cfg.customImageUrl = "";
      });
      showToast("已清除自定义贴图");
    });

    inpTexScale.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-tex-scale").textContent = `${v}%`;
      mutateSelected((cfg) => { cfg.texScale = v; });
    });
    inpTexRot.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      document.getElementById("val-tex-rot").textContent = `${v}°`;
      mutateSelected((cfg) => { cfg.texRot = v; });
    });

    document.getElementById("btn-apply-all").addEventListener("click", () => {
      const sel = studio.getSelectedEntries();
      if (sel.length === 0) return;
      const src = sel[0].cfg;
      studio.getAllEntries().forEach((e) => {
        e.cfg.showLegend = src.showLegend;
        e.cfg.legendPos = src.legendPos;
        e.cfg.fontScale = src.fontScale;
        e.cfg.bgColor = src.bgColor;
        e.cfg.fgColor = src.fgColor;
        e.cfg.pattern = src.pattern;
        e.cfg.customImage = src.customImage;
        e.cfg.customImageUrl = src.customImageUrl;
        e.cfg.texScale = src.texScale;
        e.cfg.texRot = src.texRot;
        studio.updateKeycapVisual(e);
      });
      showToast("已将当前键帽样式应用到整把键盘");
    });

    document.getElementById("btn-reset-key").addEventListener("click", () => {
      mutateSelected((cfg) => {
        cfg.label = cfg.defaultLabel;
        cfg.sub = cfg.defaultSub;
        cfg.showLegend = true;
        cfg.legendPos = "top";
        cfg.fontScale = 100;
        cfg.bgColor = cfg.defaultBg;
        cfg.fgColor = cfg.defaultFg;
        cfg.pattern = "none";
        cfg.customImage = null;
        cfg.customImageUrl = "";
        cfg.texScale = 100;
        cfg.texRot = 0;
      });
      showToast("已恢复选中键帽默认样式");
    });

    // ---- 6. EXPORT KEYCAPS ZIP, CONFIG JSON, PNG & CAMERA VIDEO ----
    document.getElementById("btn-export-zip").addEventListener("click", () => {
      exporter.exportAllKeycapsZIP({
        themeId: activeTheme.id,
        lightingId: activeLight.id
      });
    });

    document.getElementById("btn-export-json").addEventListener("click", () => {
      exporter.exportConfigJSON({
        themeId: activeTheme.id,
        lightingId: activeLight.id
      });
    });

    document.getElementById("inp-import-json").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.themeId) {
            const foundTh = KB.THEMES.find((t) => t.id === data.themeId);
            if (foundTh) {
              activeTheme = foundTh;
              themeGrid.querySelectorAll(".theme-card").forEach((c) => {
                c.classList.toggle("active", c.dataset.themeId === foundTh.id);
              });
            }
          }
          if (data.lightingId) {
            const foundLp = KB.LIGHTING_PRESETS.find((l) => l.id === data.lightingId);
            if (foundLp) {
              activeLight = foundLp;
              lightList.querySelectorAll(".light-card").forEach((c) => {
                c.classList.toggle("active", c.dataset.lightId === foundLp.id);
              });
              studio.applyLightingPreset(foundLp);
            }
          }
          if (data.layoutId && KB.LAYOUTS[data.layoutId]) {
            switchLayout(data.layoutId);
          }
          if (data.scene) {
            const sc = data.scene;
            if (sc.caseMaterial) {
              studio.setCaseMaterial(sc.caseMaterial);
              document.querySelectorAll("#case-mat-grid .chip").forEach((c) => {
                c.classList.toggle("active", c.dataset.casemat === sc.caseMaterial);
              });
            }
            if (sc.caseColor) {
              studio.setCaseColor(sc.caseColor);
              document.getElementById("case-color").value = sc.caseColor;
              document.getElementById("case-color-hex").textContent = sc.caseColor.toUpperCase();
            }
            if (typeof sc.rgbEnabled === "boolean") {
              studio.setRGBEnabled(sc.rgbEnabled);
              document.getElementById("toggle-rgb").checked = sc.rgbEnabled;
            }
            if (typeof sc.deskVisible === "boolean") {
              studio.setDeskMatVisible(sc.deskVisible);
              document.getElementById("toggle-deskmat").checked = sc.deskVisible;
            }
            if (typeof sc.exposure === "number") {
              studio.setExposure(sc.exposure);
              document.getElementById("rng-exposure").value = sc.exposure;
              document.getElementById("val-exposure").textContent = sc.exposure.toFixed(2);
            }
            if (typeof sc.lightAngle === "number") {
              studio.setLightAngle(sc.lightAngle);
              document.getElementById("rng-light-angle").value = sc.lightAngle;
              document.getElementById("val-light-angle").textContent = `${sc.lightAngle}°`;
            }
            if (typeof sc.envIntensity === "number") {
              studio.setEnvIntensity(sc.envIntensity);
              document.getElementById("rng-env").value = sc.envIntensity;
              document.getElementById("val-env").textContent = sc.envIntensity.toFixed(2);
            }
            if (typeof sc.switchType === "string" && studio.audio.setSwitchType(sc.switchType)) {
              syncAudioUI();
            }
          }
          studio.applyKeyConfigs(data.keys).then(() => {
            syncInspector(studio.getSelectedEntries());
            showToast("已成功导入键盘配置文件");
          });
        } catch (err) {
          showToast("配置文件解析失败：" + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    document.getElementById("btn-export-png").addEventListener("click", () => {
      const layout = KB.LAYOUTS[activeLayoutId];
      exporter.exportOverviewPNG({
        angle: document.getElementById("img-angle").value,
        res: document.getElementById("img-res").value,
        watermark: document.getElementById("toggle-watermark").checked,
        metaText: `${layout.name} · ${activeTheme.name} · ${activeLight.name}`
      });
    });

    const camPresetSelect = document.getElementById("cam-preset-path");
    const customKfBox = document.getElementById("custom-kf-box");
    camPresetSelect.addEventListener("change", () => {
      customKfBox.classList.toggle("hidden", camPresetSelect.value !== "custom");
    });

    document.getElementById("rng-vid-dur").addEventListener("input", (e) => {
      document.getElementById("val-vid-dur").textContent = `${Number(e.target.value).toFixed(1)}s`;
    });

    function renderKeyframeList() {
      const kfs = exporter.getKeyframes();
      document.getElementById("kf-count").textContent = String(kfs.length);
      const list = document.getElementById("kf-list");
      list.innerHTML = "";
      kfs.forEach((kf, idx) => {
        const item = document.createElement("div");
        item.className = "kf-item";
        item.innerHTML = `
          <span>#${idx + 1} · 距 ${kf.radius.toFixed(1)} · 俯仰 ${Math.round((kf.phi * 180) / Math.PI)}°</span>
          <button class="kf-del" data-idx="${idx}">删除</button>
        `;
        item.querySelector(".kf-del").addEventListener("click", () => {
          exporter.removeKeyframe(idx);
          renderKeyframeList();
        });
        list.appendChild(item);
      });
    }

    document.getElementById("btn-add-kf").addEventListener("click", () => {
      exporter.addKeyframe();
      renderKeyframeList();
      showToast("已记录当前视角为关键帧");
    });
    document.getElementById("btn-clear-kf").addEventListener("click", () => {
      exporter.clearKeyframes();
      renderKeyframeList();
    });

    document.getElementById("btn-preview-path").addEventListener("click", () => {
      if (exporter.isPlaying()) {
        exporter.stopPathPlayback();
        return;
      }
      exporter.startPath({
        preset: camPresetSelect.value,
        duration: Number(document.getElementById("rng-vid-dur").value),
        waveAnim: document.getElementById("toggle-wave-anim").checked,
        record: false
      });
    });

    document.getElementById("btn-export-video").addEventListener("click", () => {
      exporter.startPath({
        preset: camPresetSelect.value,
        duration: Number(document.getElementById("rng-vid-dur").value),
        waveAnim: document.getElementById("toggle-wave-anim").checked,
        record: true
      });
    });

    // ---- 7. PHYSICAL KEYBOARD LIVE TYPING LINKAGE ----
    window.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.repeat) return;
      studio.pressKeyByCode(e.code, true);
    });
    window.addEventListener("keyup", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      studio.pressKeyByCode(e.code, false);
    });

    // ---- 8. PRELOAD FULL-SET PRESET ARTWORKS & INITIALIZE ----
    function preloadAssetPack(assets, cacheKey) {
      const pack = assets || {};
      KB[cacheKey] = KB[cacheKey] || {};
      const entries = Object.entries(pack);
      if (entries.length === 0) return Promise.resolve();
      return Promise.all(
        entries.map(([code, item]) => new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { KB[cacheKey][code] = img; resolve(); };
          img.onerror = () => resolve();
          img.src = item.url;
        }))
      );
    }

    function preloadFullSetAssets() {
      return Promise.all([
        preloadAssetPack(KB.ARIES_SPECIAL_ASSETS, "_ariesImgCache"),
        preloadAssetPack(KB.CHINATSU_SPECIAL_ASSETS, "_chinatsuImgCache"),
        preloadAssetPack(KB.DAFEIYU_SPECIAL_ASSETS, "_dafeiyuImgCache")
      ]);
    }

    studio.applyLightingPreset(activeLight);
    preloadFullSetAssets().then(() => {
      switchLayout("75");
      document.getElementById("loading-overlay").classList.add("done");
      setTimeout(() => showToast(`已加载「${activeTheme.name}」完整键帽预设，点击任意键帽可单独编辑`), 600);
    });
  };

  KB.tryBoot = function () {
    if (window.THREE && !KB._booted) {
      KB._booted = true;
      KB.boot();
    }
  };
  KB.tryBoot();
})(window.KB);
