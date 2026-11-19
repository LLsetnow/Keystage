(function (KB) {
  // Real mechanical keyboard switch acoustic profiles
  // Synthesized via multi-layer Web Audio API physical modeling (zero external dependencies)
  const SWITCH_PROFILES = [
    {
      id: "oil-king",
      name: "佳达隆 油王黑轴",
      enName: "Gateron Oil King",
      type: "线性 · 麻将音",
      typeTag: "linear",
      force: "55g",
      color: "#2a2d36",
      accentColor: "#636b7e",
      desc: "厂润顺滑，低频厚重温润，经典闷响麻将音（Thock）",
      acoustic: {
        // Deep creamy thock: strong warm body, low-mid marble pop, heavily damped highs
        bodyFreq: 165,
        bodyEndFreq: 62,
        bodyDecay: 0.062,
        bodyGain: 0.42,
        bodyType: "sine",
        shellFreq: 680,
        shellQ: 2.2,
        shellGain: 0.24,
        shellDecay: 0.032,
        impactFreq: 1450,
        impactQ: 1.4,
        impactGain: 0.16,
        impactDecay: 0.020,
        lowpassFreq: 2400,
        click: null,
        bump: null,
        upstroke: {
          freq: 1250,
          q: 1.8,
          bodyFreq: 210,
          gain: 0.14,
          decay: 0.022
        }
      }
    },
    {
      id: "mx-blue",
      name: "Cherry MX 青轴",
      enName: "Cherry MX Blue",
      type: "段落 · 有声",
      typeTag: "clicky",
      force: "50g",
      color: "#2b8cff",
      accentColor: "#5aa7ff",
      desc: "经典塑料发声套两段清脆「喀哒」声，打字节奏感强",
      acoustic: {
        bodyFreq: 230,
        bodyEndFreq: 95,
        bodyDecay: 0.042,
        bodyGain: 0.22,
        bodyType: "triangle",
        shellFreq: 1350,
        shellQ: 1.8,
        shellGain: 0.20,
        shellDecay: 0.022,
        impactFreq: 2650,
        impactQ: 1.5,
        impactGain: 0.24,
        impactDecay: 0.018,
        lowpassFreq: 7500,
        click: {
          delay: 0.004,
          freq: 4100,
          q: 3.4,
          gain: 0.44,
          decay: 0.014,
          pingFreq: 3650,
          pingGain: 0.14,
          pingDecay: 0.011
        },
        bump: null,
        upstroke: {
          freq: 3100,
          q: 2.4,
          bodyFreq: 320,
          gain: 0.18,
          decay: 0.016
        }
      }
    },
    {
      id: "mx-red",
      name: "Cherry MX 红轴",
      enName: "Cherry MX Red",
      type: "线性 · 轻快",
      typeTag: "linear",
      force: "45g",
      color: "#e64545",
      accentColor: "#ff6b6b",
      desc: "直上直下无段落，声音干净利落，经典尼龙壳脆响",
      acoustic: {
        bodyFreq: 215,
        bodyEndFreq: 82,
        bodyDecay: 0.046,
        bodyGain: 0.26,
        bodyType: "triangle",
        shellFreq: 1120,
        shellQ: 1.7,
        shellGain: 0.21,
        shellDecay: 0.024,
        impactFreq: 2150,
        impactQ: 1.5,
        impactGain: 0.22,
        impactDecay: 0.019,
        lowpassFreq: 4800,
        click: null,
        bump: null,
        upstroke: {
          freq: 2250,
          q: 2.0,
          bodyFreq: 270,
          gain: 0.16,
          decay: 0.018
        }
      }
    },
    {
      id: "mx-brown",
      name: "Cherry MX 茶轴",
      enName: "Cherry MX Brown",
      type: "微段落 · 万能",
      typeTag: "tactile",
      force: "45g",
      color: "#8c5a3c",
      accentColor: "#b57c58",
      desc: "轻柔微段落确认感，柔和沙感触发声搭配均衡触底",
      acoustic: {
        bodyFreq: 205,
        bodyEndFreq: 80,
        bodyDecay: 0.048,
        bodyGain: 0.27,
        bodyType: "triangle",
        shellFreq: 980,
        shellQ: 1.9,
        shellGain: 0.22,
        shellDecay: 0.026,
        impactFreq: 1900,
        impactQ: 1.6,
        impactGain: 0.20,
        impactDecay: 0.020,
        lowpassFreq: 4200,
        click: null,
        bump: {
          delay: 0.0,
          bottomDelay: 0.009,
          freq: 1950,
          q: 2.6,
          gain: 0.16,
          decay: 0.012
        },
        upstroke: {
          freq: 1980,
          q: 2.0,
          bodyFreq: 255,
          gain: 0.15,
          decay: 0.019
        }
      }
    },
    {
      id: "holy-panda",
      name: "圣熊猫轴",
      enName: "Holy Panda",
      type: "提前大段落",
      typeTag: "tactile",
      force: "67g",
      color: "#f0a686",
      accentColor: "#f7c2a8",
      desc: "加长 POM 轴心，标志性圆润饱满的雨滴爆裂「Pop」声",
      acoustic: {
        bodyFreq: 255,
        bodyEndFreq: 92,
        bodyDecay: 0.052,
        bodyGain: 0.36,
        bodyType: "sine",
        shellFreq: 860,
        shellQ: 3.1,
        shellGain: 0.32,
        shellDecay: 0.028,
        impactFreq: 2300,
        impactQ: 2.2,
        impactGain: 0.28,
        impactDecay: 0.017,
        lowpassFreq: 5200,
        click: null,
        bump: {
          delay: 0.0,
          bottomDelay: 0.007,
          freq: 2450,
          q: 3.2,
          gain: 0.24,
          decay: 0.011
        },
        upstroke: {
          freq: 2150,
          q: 2.6,
          bodyFreq: 310,
          gain: 0.22,
          decay: 0.019
        }
      }
    },
    {
      id: "box-white",
      name: "凯华 BOX 白轴",
      enName: "Kailh BOX White",
      type: "扭簧发声 · 极脆",
      typeTag: "clicky",
      force: "45g",
      color: "#e8ecf4",
      accentColor: "#ffffff",
      desc: "金属扭簧发声结构，按下与回弹皆有干脆利落的「滴答」声",
      acoustic: {
        bodyFreq: 245,
        bodyEndFreq: 105,
        bodyDecay: 0.036,
        bodyGain: 0.19,
        bodyType: "triangle",
        shellFreq: 1580,
        shellQ: 2.0,
        shellGain: 0.19,
        shellDecay: 0.018,
        impactFreq: 3100,
        impactQ: 1.8,
        impactGain: 0.22,
        impactDecay: 0.015,
        lowpassFreq: 9500,
        click: {
          delay: 0.002,
          freq: 5600,
          q: 4.8,
          gain: 0.46,
          decay: 0.010,
          pingFreq: 5200,
          pingGain: 0.18,
          pingDecay: 0.009
        },
        bump: null,
        upstroke: {
          freq: 4800,
          q: 4.0,
          bodyFreq: 360,
          gain: 0.24,
          decay: 0.012,
          returnClickFreq: 5400,
          returnClickGain: 0.22
        }
      }
    },
    {
      id: "topre-45g",
      name: "静电容 Topre 45g",
      enName: "Topre Electro-Capacitive",
      type: "静电容 · 胶碗",
      typeTag: "topre",
      force: "45g",
      color: "#9a7cff",
      accentColor: "#bba4ff",
      desc: "胶碗与锥形弹簧独有空灵低沉的「噗咚」声，回弹柔和绵密",
      acoustic: {
        bodyFreq: 148,
        bodyEndFreq: 54,
        bodyDecay: 0.068,
        bodyGain: 0.44,
        bodyType: "sine",
        shellFreq: 520,
        shellQ: 2.5,
        shellGain: 0.28,
        shellDecay: 0.036,
        impactFreq: 1080,
        impactQ: 1.3,
        impactGain: 0.14,
        impactDecay: 0.025,
        lowpassFreq: 1850,
        click: null,
        bump: {
          delay: 0.0,
          bottomDelay: 0.006,
          freq: 780,
          q: 1.8,
          gain: 0.14,
          decay: 0.018
        },
        upstroke: {
          freq: 920,
          q: 1.7,
          bodyFreq: 185,
          gain: 0.17,
          decay: 0.026
        }
      }
    },
    {
      id: "silent-red",
      name: "Cherry 静音红轴",
      enName: "Cherry MX Silent Red",
      type: "静音线性 · 办公",
      typeTag: "silent",
      force: "45g",
      color: "#f28b9c",
      accentColor: "#ffb0bd",
      desc: "内置静音硅胶垫，大幅吸收触底与回弹杂音，深夜办公不扰人",
      acoustic: {
        bodyFreq: 130,
        bodyEndFreq: 55,
        bodyDecay: 0.044,
        bodyGain: 0.18,
        bodyType: "sine",
        shellFreq: 480,
        shellQ: 1.2,
        shellGain: 0.10,
        shellDecay: 0.026,
        impactFreq: 760,
        impactQ: 1.0,
        impactGain: 0.08,
        impactDecay: 0.022,
        lowpassFreq: 1050,
        click: null,
        bump: null,
        upstroke: {
          freq: 680,
          q: 1.2,
          bodyFreq: 150,
          gain: 0.06,
          decay: 0.020
        }
      }
    }
  ];

  KB.SWITCH_PROFILES = SWITCH_PROFILES;

  const STORAGE_KEY = "keystage_audio_settings_v1";

  function loadSavedSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (_) {
      return {};
    }
  }

  function saveSettings(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  KB.createAudioEngine = function () {
    const saved = loadSavedSettings();
    let ctx = null;
    let noiseBuffer = null;
    let enabled = typeof saved.enabled === "boolean" ? saved.enabled : true;
    let volume = typeof saved.volume === "number" ? Math.max(0, Math.min(1, saved.volume)) : 0.8;
    let upstrokeEnabled = typeof saved.upstrokeEnabled === "boolean" ? saved.upstrokeEnabled : true;
    let currentSwitchId = SWITCH_PROFILES.some((s) => s.id === saved.switchId)
      ? saved.switchId
      : SWITCH_PROFILES[0].id;
    let previewTimers = [];

    function persist() {
      saveSettings({
        enabled,
        volume,
        upstrokeEnabled,
        switchId: currentSwitchId
      });
    }

    function ensureContext() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      if (!noiseBuffer && ctx) {
        // Pre-generate 0.5s white noise buffer for zero-allocation low-latency triggering
        const len = Math.floor(ctx.sampleRate * 0.5);
        noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const ch = noiseBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
          ch[i] = Math.random() * 2 - 1;
        }
      }
      return ctx;
    }

    function getProfile() {
      return SWITCH_PROFILES.find((s) => s.id === currentSwitchId) || SWITCH_PROFILES[0];
    }

    // Compute realistic pitch & resonance scaling from key geometry
    function computeKeyFactors(keyDef) {
      const w = (keyDef && keyDef.w) || 1;
      const role = (keyDef && keyDef.role) || "alpha";
      const row = typeof (keyDef && keyDef.row) === "number" ? keyDef.row : 2;
      const isSpace = role === "space" || w >= 4;
      const isLarge = !isSpace && w >= 1.75;

      // Subtle deterministic row character (top rows slightly deeper, bottom rows tighter)
      const rowBias = (row - 2) * 0.018;
      // Natural micro-variation on every stroke so rapid typing feels organic
      const jitter = (Math.random() - 0.5) * 0.06;

      if (isSpace) {
        return {
          pitch: 0.72 + jitter * 0.6,
          bodyBoost: 1.38,
          decayBoost: 1.35,
          stabilizer: true
        };
      }
      if (isLarge) {
        return {
          pitch: 0.87 + jitter * 0.8,
          bodyBoost: 1.18,
          decayBoost: 1.14,
          stabilizer: true
        };
      }
      return {
        pitch: 1.0 + rowBias + jitter,
        bodyBoost: 1.0,
        decayBoost: 1.0,
        stabilizer: false
      };
    }

    // Play a filtered noise burst through destination node
    function triggerNoiseBurst(ac, dest, startTime, duration, filterType, freq, q, peakGain) {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer;
      // Randomize offset in the noise buffer so consecutive hits never sound identical
      const maxOffset = Math.max(0, noiseBuffer.duration - duration - 0.02);
      const offset = Math.random() * maxOffset;

      const filter = ac.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(Math.max(60, Math.min(18000, freq)), startTime);
      filter.Q.setValueAtTime(q, startTime);

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(Math.max(0.0001, peakGain), startTime + 0.0012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      src.connect(filter).connect(gain).connect(dest);
      src.start(startTime, offset, duration + 0.005);
    }

    // Play a pitched resonant oscillator thump/ping
    function triggerOsc(ac, dest, startTime, duration, oscType, startFreq, endFreq, peakGain) {
      const osc = ac.createOscillator();
      osc.type = oscType;
      osc.frequency.setValueAtTime(Math.max(30, startFreq), startTime);
      if (endFreq !== startFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), startTime + duration);
      }

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(Math.max(0.0001, peakGain), startTime + 0.0015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain).connect(dest);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.005);
    }

    function playPress(keyDef) {
      if (!enabled || volume <= 0.001) return;
      try {
        const ac = ensureContext();
        if (!ac) return;

        const profile = getProfile();
        const a = profile.acoustic;
        const f = computeKeyFactors(keyDef);
        const now = ac.currentTime;

        // Master bus for this keystroke with switch-specific lowpass shaping
        const master = ac.createGain();
        master.gain.value = volume * (0.92 + Math.random() * 0.16);
        const toneFilter = ac.createBiquadFilter();
        toneFilter.type = "lowpass";
        toneFilter.frequency.setValueAtTime(a.lowpassFreq * (0.95 + Math.random() * 0.1), now);
        master.connect(toneFilter).connect(ac.destination);

        let bottomTime = now;

        // Layer 1: Tactile bump pre-transient (Brown, Holy Panda, Topre)
        if (a.bump) {
          const bt = now + a.bump.delay;
          triggerNoiseBurst(
            ac, master, bt, a.bump.decay, "bandpass",
            a.bump.freq * f.pitch, a.bump.q, a.bump.gain
          );
          bottomTime = now + (a.bump.bottomDelay || 0.007);
        }

        // Layer 2: Click jacket / Click bar transient (MX Blue, BOX White)
        if (a.click) {
          const ct = now + a.click.delay;
          triggerNoiseBurst(
            ac, master, ct, a.click.decay, "bandpass",
            a.click.freq * (0.96 + Math.random() * 0.08), a.click.q, a.click.gain
          );
          if (a.click.pingFreq) {
            triggerOsc(
              ac, master, ct, a.click.pingDecay, "sine",
              a.click.pingFreq * (0.97 + Math.random() * 0.06),
              a.click.pingFreq * 0.72,
              a.click.pingGain
            );
          }
          bottomTime = Math.max(bottomTime, now + 0.006);
        }

        // Layer 3: Bottom-out low-frequency housing thock / body resonance
        triggerOsc(
          ac, master, bottomTime,
          a.bodyDecay * f.decayBoost,
          a.bodyType,
          a.bodyFreq * f.pitch,
          a.bodyEndFreq * f.pitch,
          a.bodyGain * f.bodyBoost
        );

        // Layer 4: Keycap & switch housing cavity resonance (mid-band)
        triggerNoiseBurst(
          ac, master, bottomTime,
          a.shellDecay * f.decayBoost,
          "bandpass",
          a.shellFreq * f.pitch,
          a.shellQ,
          a.shellGain * f.bodyBoost
        );

        // Layer 5: Stem-to-housing bottom-out impact transient (upper-mid)
        triggerNoiseBurst(
          ac, master, bottomTime,
          a.impactDecay,
          "bandpass",
          a.impactFreq * f.pitch,
          a.impactQ,
          a.impactGain
        );

        // Layer 6: Subtle stabilizer secondary resonance for Spacebar / Enter / Shift
        if (f.stabilizer && profile.id !== "silent-red") {
          triggerNoiseBurst(
            ac, master, bottomTime + 0.003,
            0.028,
            "bandpass",
            420 * f.pitch,
            2.4,
            0.14
          );
        }
      } catch (_) {}
    }

    function playRelease(keyDef) {
      if (!enabled || !upstrokeEnabled || volume <= 0.001) return;
      try {
        const ac = ensureContext();
        if (!ac) return;

        const profile = getProfile();
        const up = profile.acoustic.upstroke;
        if (!up) return;

        const f = computeKeyFactors(keyDef);
        const now = ac.currentTime;

        const master = ac.createGain();
        master.gain.value = volume * (0.88 + Math.random() * 0.2);
        const toneFilter = ac.createBiquadFilter();
        toneFilter.type = "lowpass";
        toneFilter.frequency.setValueAtTime(profile.acoustic.lowpassFreq * 1.1, now);
        master.connect(toneFilter).connect(ac.destination);

        // Top-housing return tap
        triggerNoiseBurst(
          ac, master, now,
          up.decay * f.decayBoost,
          "bandpass",
          up.freq * f.pitch,
          up.q,
          up.gain
        );

        // Light hollow return body
        triggerOsc(
          ac, master, now,
          up.decay * 1.2,
          "sine",
          up.bodyFreq * f.pitch,
          up.bodyFreq * 0.55 * f.pitch,
          up.gain * 0.55 * f.bodyBoost
        );

        // Kailh BOX White return click-bar snap
        if (up.returnClickFreq) {
          triggerNoiseBurst(
            ac, master, now + 0.001,
            0.009,
            "bandpass",
            up.returnClickFreq * (0.97 + Math.random() * 0.06),
            4.5,
            up.returnClickGain
          );
        }
      } catch (_) {}
    }

    function clearPreviewTimers() {
      previewTimers.forEach((t) => clearTimeout(t));
      previewTimers = [];
    }

    // Play a quick single-key sample (down + up) when user selects a switch
    function playSingleSample() {
      clearPreviewTimers();
      const prevEnabled = enabled;
      if (!enabled) enabled = true;
      const sampleKey = { w: 1, role: "alpha", row: 2 };
      playPress(sampleKey);
      const t = setTimeout(() => {
        playRelease(sampleKey);
        enabled = prevEnabled;
      }, 95);
      previewTimers.push(t);
    }

    // Play a realistic 6-key typing cadence (4 alphas + Enter + Spacebar)
    function playTypingDemo() {
      clearPreviewTimers();
      const prevEnabled = enabled;
      if (!enabled) enabled = true;

      const sequence = [
        { at: 0, dur: 75, key: { w: 1, role: "alpha", row: 2 } },
        { at: 115, dur: 70, key: { w: 1, role: "alpha", row: 1 } },
        { at: 220, dur: 80, key: { w: 1, role: "alpha", row: 2 } },
        { at: 340, dur: 72, key: { w: 1, role: "alpha", row: 3 } },
        { at: 470, dur: 95, key: { w: 2.25, role: "accent", row: 2 } },
        { at: 635, dur: 110, key: { w: 6.25, role: "space", row: 4 } }
      ];

      sequence.forEach((step, idx) => {
        const tDown = setTimeout(() => playPress(step.key), step.at);
        const tUp = setTimeout(() => {
          playRelease(step.key);
          if (idx === sequence.length - 1) {
            enabled = prevEnabled;
          }
        }, step.at + step.dur);
        previewTimers.push(tDown, tUp);
      });
    }

    return {
      setEnabled(v) { enabled = Boolean(v); persist(); },
      isEnabled() { return enabled; },
      setVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); persist(); },
      getVolume() { return volume; },
      setUpstrokeEnabled(v) { upstrokeEnabled = Boolean(v); persist(); },
      isUpstrokeEnabled() { return upstrokeEnabled; },
      setSwitchType(id) {
        if (SWITCH_PROFILES.some((s) => s.id === id)) {
          currentSwitchId = id;
          persist();
          return true;
        }
        return false;
      },
      getSwitchType() { return currentSwitchId; },
      getSwitchProfile: getProfile,
      getAllProfiles() { return SWITCH_PROFILES; },
      playPress,
      playRelease,
      // Backward compatibility alias
      playClick(pitchScale) {
        playPress({ w: pitchScale && pitchScale < 0.9 ? 2.25 : 1, role: "alpha", row: 2 });
      },
      playSingleSample,
      playTypingDemo
    };
  };
})(window.KB);
