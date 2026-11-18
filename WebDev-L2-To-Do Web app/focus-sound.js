/**
 * focus-sound.js — REAL recorded ambient audio for TaskPulse
 * Matches your downloaded files in the /audio/ folder.
 */
(function () {
  "use strict";

  const PREF_KEY = "taskpulse:sound:v1";

  // Matched to the filenames in your screenshot
  const FILES = {
    cafe:   "audio/community-cafe.mp3",
    forest: "audio/forest-ambience.mp3",
    rain:   "audio/rain-ambience.mp3",
    storm:  "audio/thunderstorm-ambience.mp3",
  };

  const presets = [
    { id: "off",    label: "Off",          icon: "○" },
    { id: "rain",   label: "Rainfall",     icon: "☂" },
    { id: "storm",  label: "Thunderstorm", icon: "⛈" },
    { id: "forest", label: "Forest",       icon: "♣" },
    { id: "cafe",   label: "Café murmur",  icon: "☕" },
  ];

  let pref = {};
  try { pref = JSON.parse(localStorage.getItem(PREF_KEY) || "{}") || {}; } catch {}
  let volume = typeof pref.volume === "number" ? pref.volume : 0.35;

  let audio = null;
  let currentPreset = null;
  let panel = null;

  function savePref() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        preset: currentPreset || "off",
        volume,
      }));
    } catch {}
  }

  function stopCurrent(fadeMs = 400) {
    if (!audio) return;
    const dying = audio;
    audio = null;
    currentPreset = null;
    const startVol = dying.volume;
    const steps = 12;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      dying.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        clearInterval(timer);
        dying.pause();
        dying.src = "";
      }
    }, fadeMs / steps);
    updateUI();
  }

  function play(id) {
    if (!presets.some((p) => p.id === id)) return;

    if (id === "off") {
      stopCurrent();
      savePref();
      updateUI();
      return;
    }

    const url = FILES[id];
    if (!url) {
      console.warn("[focus-sound] No file mapped for preset:", id);
      return;
    }

    stopCurrent(300);

    setTimeout(() => {
      const el = new Audio();
      el.src = url;
      el.loop = true;
      el.preload = "auto";
      el.volume = 0; 

      el.addEventListener("error", () => {
        console.error("[focus-sound] Failed to load:", url, "— check the file exists in /audio/");
        if (audio === el) { audio = null; currentPreset = null; updateUI(); }
      }, { once: true });

      el.play().then(() => {
        audio = el;
        currentPreset = id;
        
        const target = volume;
        const steps = 12;
        let i = 0;
        const timer = setInterval(() => {
          i++;
          el.volume = Math.min(target, target * (i / steps));
          if (i >= steps) clearInterval(timer);
        }, 80);
        
        savePref();
        updateUI();
      }).catch((err) => {
        console.error("[focus-sound] play() failed:", err);
        console.error("If you're opening index.html via file://, you MUST use a local server (e.g., VS Code Live Server).");
      });
    }, 350);
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = volume;
    savePref();
  }

  function buildUI() {
    panel = document.createElement("div");
    panel.className = "sound-dock";
    panel.innerHTML =
      '<button class="sound-toggle" type="button" aria-expanded="false" title="Focus sounds">' +
        '<span class="sound-glyph">♪</span><span class="sound-label">Focus</span>' +
      '</button>' +
      '<div class="sound-panel" role="dialog" aria-label="Focus sounds">' +
        '<div class="sound-head"><strong>Focus sounds</strong>' +
        '<button class="sound-close" type="button" aria-label="Close">×</button></div>' +
        '<div class="sound-grid"></div>' +
        '<label class="sound-vol"><span>Volume</span>' +
        '<input type="range" min="0" max="1" step="0.01" value="' + volume + '" /></label>' +
      '</div>';
    document.body.appendChild(panel);

    const grid = panel.querySelector(".sound-grid");
    for (const p of presets) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sound-chip";
      b.dataset.id = p.id;
      b.innerHTML = '<span class="ic">' + p.icon + '</span><span>' + p.label + '</span>';
      b.addEventListener("click", () => play(p.id));
      grid.appendChild(b);
    }

    panel.querySelector(".sound-toggle").addEventListener("click", (e) => {
      const open = panel.classList.toggle("open");
      e.currentTarget.setAttribute("aria-expanded", String(open));
    });
    panel.querySelector(".sound-close").addEventListener("click", () => {
      panel.classList.remove("open");
      panel.querySelector(".sound-toggle").setAttribute("aria-expanded", "false");
    });
    panel.querySelector("input[type=range]").addEventListener("input", (e) => setVolume(+e.target.value));

    updateUI();
  }

  function updateUI() {
    if (!panel) return;
    const active = currentPreset ?? "off";
    panel.querySelectorAll(".sound-chip").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.id === active));
    });
    panel.classList.toggle("is-playing", !!audio);
  }

  function boot() {
    buildUI();
    if (pref.preset && pref.preset !== "off") {
      const resume = () => {
        if (pref.preset && FILES[pref.preset] && !audio) play(pref.preset);
        document.removeEventListener("pointerdown", resume);
      };
      document.addEventListener("pointerdown", resume, { once: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.taskpulseSound = { play, stop: () => play("off"), setVolume, presets };
})();