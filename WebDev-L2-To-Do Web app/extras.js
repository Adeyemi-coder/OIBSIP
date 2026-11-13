/**
 * TaskPulse - extras.js  (load AFTER app.js and upgrade.js)
 *  1. The Pulse  - your day drawn as a living heartbeat
 *  2. Voice pin  - say a task, a hand pins it
 */
(() => {
  "use strict";

  const isGeneral = () => settings.mode !== "clinical";
  const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };

  /* =====================================================================
     1. THE PULSE
     ===================================================================== */
  const RED = "#ef4444", AMBER = "#f59e0b", GREEN = "#22c55e";
  const section = document.createElement("section");
  section.className = "pulse";
  section.id = "pulse";
  section.dataset.tone = "calm";
  section.setAttribute("aria-label", "The Pulse: your day as a heartbeat");
  section.innerHTML =
    '<button type="button" class="pulse-head" id="pulse-toggle" aria-expanded="true">' +
    '<span class="pulse-title"><span class="pulse-dot" aria-hidden="true"></span>The Pulse</span>' +
    '<span class="pulse-state" id="pulse-state">Calm</span>' +
    '<span class="pulse-bpm"><b id="pulse-bpm">60</b> bpm</span>' +
    '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
    '</button>' +
    '<div class="pulse-body" id="pulse-body">' +
    '<div class="pulse-canvas-wrap"><canvas id="pulse-canvas" role="img" aria-label="Your day as a heartbeat"></canvas>' +
    '<div class="pulse-tip" id="pulse-tip" hidden></div><p class="pulse-empty" id="pulse-empty" hidden></p></div>' +
    '<ul class="pulse-legend"><li><i class="k-stat"></i><span id="pulse-k-stat">Urgent</span></li><li><i class="k-open"></i>Open</li><li><i class="k-late"></i>Late</li><li><i class="k-done"></i>Done</li></ul>' +
    '</div>';
  document.querySelector('[data-view="board"] .view-head').after(section);

  const canvas = $("pulse-canvas");
  const ctx = canvas.getContext("2d");
  const tip = $("pulse-tip");

  let W = 0, H = 0, dpr = 1;
  let data = { beats: [], lo: 0, hi: 480, isToday: false, nowMin: 0, dur: 8 };
  let ys = new Float32Array(0);
  let seg = [];
  let dirty = true;
  let neutral = "#888";
  let frameCount = 0;
  const known = new Set();
  const born = new Map();
  let firstPass = true;

  const gauss = (d, c, s) => Math.exp(-((d - c) * (d - c)) / (2 * s * s));

  function beatShape(dx, kind) {
    if (kind === "done") return 0.5 * 0.3 * gauss(dx, 0, 7);
    const A = kind === "stat" ? 1 : kind === "late" ? 0.8 : 0.6;
    let v = 0.12 * A * gauss(dx, -16, 4) - 0.15 * A * gauss(dx, -5, 1.6) + A * gauss(dx, 0, 1.8) - 0.3 * A * gauss(dx, 5, 2) + 0.2 * A * gauss(dx, 17, 5);
    if (kind === "late") v += 0.6 * gauss(dx, 11, 1.7) - 0.4 * gauss(dx, 15, 1.8);
    return v;
  }

  function collect() {
    const key = state.viewDate;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isToday = key === toDateKey(now);
    const tasks = store.getTasks().filter((t) => t.date === key);
    const timed = tasks.map((t) => ({ t, b: parseBlock(t.timeBlock) })).filter((x) => x.b);

    let lo = Infinity, hi = -Infinity;
    timed.forEach(({ b }) => { lo = Math.min(lo, minutesOf(b.start)); hi = Math.max(hi, minutesOf(b.end)); });
    if (isToday) { lo = Math.min(lo, nowMin); hi = Math.max(hi, nowMin); }
    if (!Number.isFinite(lo)) { lo = isToday ? Math.max(0, nowMin - 120) : 8 * 60; hi = lo + 480; }
    lo = Math.max(0, lo - 45);
    hi = Math.min(1440, hi + 45);
    if (hi - lo < 480) {
      const mid = (lo + hi) / 2;
      hi = Math.min(1440, Math.max(mid + 240, 480));
      lo = Math.max(0, hi - 480);
    }

    const beats = timed.map(({ t, b }) => ({
      id: t.id,
      title: t.title,
      min: minutesOf(b.start),
      time: t.timeBlock.replace("-", " – "),
      kind: t.status === STATUS.COMPLETED ? "done" : store.isOverdue(t, now) ? "late" : t.isStat ? "stat" : "open",
    }));

    const s = store.getStats(key, now);
    const score = s.overdue * 3 + s.statOpen * 2 + Math.max(0, s.pending - 6) * 0.5;
    let label, tone;
    if (!s.total && !s.carried) { label = "Calm"; tone = "calm"; }
    else if (s.total && !s.pending && !s.statOpen) { label = "All clear"; tone = "calm"; }
    else if (score < 3) { label = "Steady"; tone = "steady"; }
    else if (score < 7) { label = "Busy"; tone = "busy"; }
    else { label = "Critical"; tone = "critical"; }
    const bpm = Math.round(Math.min(160, Math.max(56, 58 + s.pending * 2 + s.statOpen * 6 + s.overdue * 8)));

    return { beats, lo, hi, isToday, nowMin, dur: Math.min(9, Math.max(3, 9 - (bpm - 56) / 14)), s, label, tone, bpm, timedCount: timed.length, taskCount: tasks.length };
  }

  const xOf = (min) => 24 + ((min - data.lo) / (data.hi - data.lo)) * Math.max(1, W - 48);

  function build() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const base = H * 0.58, amp = H * 0.4;
    const xs = data.beats.map((b) => ({ ...b, x: xOf(b.min) }));
    data.xs = xs;
    ys = new Float32Array(W);
    seg = new Array(W).fill(null);
    for (let x = 0; x < W; x += 1) {
      let v = 0, best = null, bestD = 999;
      for (const b of xs) {
        const dx = x - b.x;
        if (Math.abs(dx) < 60) v += beatShape(dx, b.kind);
        if (Math.abs(dx) < 26 && Math.abs(dx) < bestD) { bestD = Math.abs(dx); best = b.kind; }
      }
      ys[x] = base - v * amp + Math.sin(x / 37) * 0.6;
      seg[x] = best;
    }
    dirty = true;
  }

  function colorFor(kind) {
    return kind === "stat" ? RED : kind === "late" ? AMBER : kind === "done" ? GREEN : neutral;
  }

  function draw(t, still) {
    if (!W || !H) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // hour ticks
    const step = data.hi - data.lo > 600 ? 120 : 60;
    ctx.fillStyle = neutral;
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    for (let m = Math.ceil(data.lo / step) * step; m <= data.hi; m += step) {
      const x = xOf(m);
      ctx.globalAlpha = 0.18;
      ctx.fillRect(x, H * 0.18, 1, H * 0.66);
      ctx.globalAlpha = 0.5;
      ctx.fillText(`${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, x, H - 3);
    }
    ctx.globalAlpha = 1;

    // base trace
    ctx.beginPath();
    for (let x = 0; x < W; x += 1) (x ? ctx.lineTo(x, ys[x]) : ctx.moveTo(x, ys[x]));
    ctx.strokeStyle = neutral;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // coloured beats
    let x = 0;
    while (x < W) {
      const kind = seg[x];
      if (!kind) { x += 1; continue; }
      let end = x;
      while (end + 1 < W && seg[end + 1] === kind) end += 1;
      ctx.beginPath();
      for (let i = x; i <= end; i += 1) (i === x ? ctx.moveTo(i, ys[i]) : ctx.lineTo(i, ys[i]));
      ctx.strokeStyle = colorFor(kind);
      ctx.lineWidth = kind === "open" ? 2.2 : 2.8;
      if (kind !== "open") { ctx.shadowColor = colorFor(kind); ctx.shadowBlur = still ? 0 : 8; }
      ctx.stroke();
      ctx.shadowBlur = 0;
      x = end + 1;
    }

    // now marker
    if (data.isToday && data.nowMin >= data.lo && data.nowMin <= data.hi) {
      const nx = Math.min(W - 1, Math.max(0, Math.round(xOf(data.nowMin))));
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = neutral;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(nx, 6);
      ctx.lineTo(nx, H - 14);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = neutral;
      ctx.globalAlpha = 0.7;
      ctx.textAlign = "left";
      ctx.fillText("now", nx + 4, 12);
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(nx, ys[nx], 3.4, 0, Math.PI * 2);
      ctx.fillStyle = neutral;
      ctx.fill();
    }

    if (still) return;

    // scan head with fading trail
    const pos = Math.floor((((t / 1000) / data.dur) % 1) * W);
    for (let k = 0; k < 6; k += 1) {
      const from = Math.max(1, pos - (k + 1) * 9), to = Math.max(1, pos - k * 9);
      ctx.beginPath();
      ctx.moveTo(from, ys[from]);
      for (let i = from + 1; i <= to; i += 1) ctx.lineTo(i, ys[i]);
      ctx.strokeStyle = neutral;
      ctx.globalAlpha = 0.85 - k * 0.14;
      ctx.lineWidth = 3.2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = neutral;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(pos, ys[Math.min(W - 1, pos)], 3.8, 0, Math.PI * 2);
    ctx.fillStyle = neutral;
    ctx.fill();
    ctx.shadowBlur = 0;

    // ping rings on newly added beats
    const nowMs = performance.now();
    for (const b of data.xs || []) {
      const t0 = born.get(b.id);
      if (!t0) continue;
      const p = (nowMs - t0) / 1100;
      if (p >= 1) { born.delete(b.id); continue; }
      ctx.beginPath();
      ctx.arc(b.x, ys[Math.min(W - 1, Math.max(0, Math.round(b.x)))], 5 + p * 22, 0, Math.PI * 2);
      ctx.strokeStyle = colorFor(b.kind);
      ctx.globalAlpha = 1 - p;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  }

  function loop(t) {
    requestAnimationFrame(loop);
    if (document.hidden || !visible || !W) return;
    if (frameCount++ % 30 === 0 || dirty) neutral = getComputedStyle(canvas).color || neutral;
    if (!motionOn()) {
      if (dirty) { draw(0, true); dirty = false; }
      return;
    }
    dirty = false;
    draw(t, false);
  }

  function updatePulse() {
    data = collect();
    const g = isGeneral();
    section.dataset.tone = data.tone;
    section.style.setProperty("--beat", `${(60 / data.bpm).toFixed(2)}s`);
    setText($("pulse-state"), data.label);
    setText($("pulse-bpm"), String(data.bpm));
    setText($("pulse-k-stat"), g ? "Urgent" : "STAT");
    canvas.setAttribute("aria-label", `${data.label}. ${data.s.pending} open, ${data.s.done} done, ${data.s.statOpen} ${g ? "urgent" : "STAT"} open, ${data.s.overdue} late.`);

    const empty = $("pulse-empty");
    empty.hidden = data.timedCount > 0;
    empty.textContent = data.taskCount
      ? "Give tasks a start and end time to see them on The Pulse."
      : "A flat line. Pin a task and watch your day come alive.";

    for (const b of data.beats) {
      if (!known.has(b.id)) { known.add(b.id); if (!firstPass) born.set(b.id, performance.now()); }
    }
    firstPass = false;
    build();
  }

  // Hover tooltip + click to open the note
  function beatAt(clientX) {
    const r = canvas.getBoundingClientRect();
    const x = clientX - r.left;
    let hit = null, bestD = 18;
    for (const b of data.xs || []) if (Math.abs(b.x - x) < bestD) { bestD = Math.abs(b.x - x); hit = b; }
    return hit;
  }
  canvas.addEventListener("pointermove", (e) => {
    const b = beatAt(e.clientX);
    canvas.style.cursor = b ? "pointer" : "default";
    tip.hidden = !b;
    if (b) {
      tip.textContent = `${b.title} · ${b.time}`;
      tip.style.left = `${Math.min(Math.max(b.x + 8, 60), W - 40)}px`;
      tip.style.top = `${ys[Math.min(W - 1, Math.max(0, Math.round(b.x)))] + 4}px`;
    }
  });
  canvas.addEventListener("pointerleave", () => { tip.hidden = true; });
  canvas.addEventListener("click", (e) => {
    const b = beatAt(e.clientX);
    if (!b) return;
    const note = document.querySelector(`.note[data-id="${CSS.escape(b.id)}"]`);
    if (note) note.click(); else openEditor(b.id);
  });

  // Collapse / expand (remembered)
  const toggle = $("pulse-toggle");
  function applyCollapsed() {
    const c = Boolean(settings.pulseCollapsed);
    section.classList.toggle("is-collapsed", c);
    toggle.setAttribute("aria-expanded", String(!c));
    if (!c) requestAnimationFrame(() => { build(); });
  }
  toggle.addEventListener("click", () => { settings.pulseCollapsed = !settings.pulseCollapsed; saveSettings(); applyCollapsed(); });

  if ("ResizeObserver" in window) new ResizeObserver(() => { if (canvas.clientWidth !== W) build(); }).observe(canvas);
  new MutationObserver(() => { dirty = true; }).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

  const baseRenderAll = window.renderAll;
  window.renderAll = function () { baseRenderAll(); updatePulse(); };
  setInterval(updatePulse, 30000);
  applyCollapsed();
  requestAnimationFrame(loop);

  /* =====================================================================
     2. VOICE PIN
     ===================================================================== */
  /* VOICE-PARSER-START */
  function voiceToQuick(raw) {
    const general = settings.mode !== "clinical";
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    const tokens = [];
    let s = ` ${String(raw || "").replace(/\b([ap])\.m\./gi, "$1m").replace(/\s+/g, " ").trim()} `;
    let m;

    s = s.replace(/^\s*(?:please\s+)?(?:remind me to|don't forget to|do not forget to|i need to|i have to|add (?:a )?(?:task|note|reminder)(?: to| for)?|create (?:a )?(?:task|note|reminder)(?: to| for)?|pin (?:a )?(?:task|note)?(?: to| for)?)\s+/i, " ");

    const URG = "urgent(?:ly)?|stat|emergency|asap|high priority|top priority";
    if (new RegExp(`\\b(?:${URG})\\b`, "i").test(s)) {
      tokens.push("!stat");
      s = s.replace(new RegExp(`\\b(?:mark(?:ed)?(?: it| this)?(?: as)?\\s+|this is\\s+|as\\s+)?(?:${URG})\\b`, "gi"), " ");
    }

    if ((m = /\bin (\d{1,3}) days?\b/i.exec(s))) { tokens.push(`+${m[1]}d`); s = s.replace(m[0], " "); }
    else if ((m = /\b(?:on |next |this |coming )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.exec(s))) { tokens.push(`~${m[1].slice(0, 3).toLowerCase()}`); s = s.replace(m[0], " "); }
    else if ((m = /\b(tomorrow|tmrw|today|tonight)\b/i.exec(s))) { const w = m[1].toLowerCase(); tokens.push(w === "tonight" ? "today" : w); s = s.replace(m[0], " "); }

    if (/\b(?:at )?(noon|midday)\b/i.test(s)) { tokens.push("@12pm"); s = s.replace(/\b(?:at )?(noon|midday)\b/i, " "); }
    else if (/\b(?:at )?midnight\b/i.test(s)) { tokens.push("@12am"); s = s.replace(/\b(?:at )?midnight\b/i, " "); }
    else if ((m = /\b(?:from|at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s*(?:to|until|till|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i.exec(s))) {
      const rest = s.slice(m.index + m[0].length);
      const strong = m[2] || m[3] || m[4];
      if (strong || /^\s*(?:$|[,.]|(?:tomorrow|today|tmrw|tonight|urgent|urgently|stat|emergency|asap|please)\b)/i.test(rest)) {
        let ap1 = (m[3] || "").toLowerCase(), ap2 = (m[6] || "").toLowerCase();
        if (!ap1 && ap2) ap1 = ap2;
        if (!ap2 && ap1 && m[4]) ap2 = ap1;
        const guess = (h) => (+h >= 1 && +h <= 6 ? "pm" : "");
        let spec = `${m[1]}${m[2] ? `:${m[2]}` : ""}${ap1 || guess(m[1])}`;
        if (m[4]) spec += `-${m[4]}${m[5] ? `:${m[5]}` : ""}${ap2 || guess(m[4])}`;
        tokens.push(`@${spec}`);
        s = s.slice(0, m.index) + " " + s.slice(m.index + m[0].length);
      }
    }

    if ((m = /\b(?:category|tag|under|hashtag)\s+(work|clinical|study|personal|general)\b/i.exec(s)) && !(general && /clinical/i.test(m[1]))) {
      tokens.push(`#${m[1].toLowerCase()}`);
      s = s.replace(m[0], " ");
    }
    if ((m = /\b(?:assign(?:ed)?(?: it)? to|give (?:it )?to|delegate(?: it)? to)\s+([A-Za-z][\w'-]*)/i.exec(s))) {
      tokens.push(`>${cap(m[1])}`);
      s = s.replace(m[0], " ");
    }
    if (!general && (m = /\b(bed|room|ward)\s+(\w+)/i.exec(s))) tokens.push(`[${cap(m[1].toLowerCase())} ${m[2]}]`);
    if (general && (m = /\bclient\s+([A-Za-z][\w'-]*)/i.exec(s))) tokens.push(`[Client: ${cap(m[1])}]`);

    s = s.replace(/[!#@>[\]]/g, " ").replace(/\b(?:please|um|uh)\b/gi, " ");
    let title = s.replace(/\s+/g, " ").trim();
    while (/\s(?:on|at|by|for|to|and|with)$/i.test(title)) title = title.replace(/\s(?:on|at|by|for|to|and|with)$/i, "");
    title = title.replace(/[.,]+$/, "").trim();
    title = cap(title);
    return `${title} ${tokens.join(" ")}`.trim();
  }
  /* VOICE-PARSER-END */

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const quickBox = document.querySelector(".quick-box");
  const quickInput = $("quick-input");
  const quickForm = $("quick-form");

  const mic = el("button", "icon-btn mic-btn");
  mic.type = "button";
  mic.setAttribute("aria-label", "Voice pin");
  mic.setAttribute("aria-pressed", "false");
  mic.title = "Voice pin (v)";
  mic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const status = el("div", "voice-status");
  status.hidden = true;
  status.setAttribute("role", "status");
  quickBox.querySelector(".kbd")?.before(mic);
  if (!quickBox.contains(mic)) quickBox.append(mic);
  quickBox.after(status);

  const sc = document.querySelector(".shortcuts");
  if (sc) {
    const dt = document.createElement("dt");
    dt.innerHTML = '<kbd class="kbd">v</kbd>';
    const dd = document.createElement("dd");
    dd.textContent = "Voice pin";
    sc.append(dt, dd);
  }

  let rec = null, listening = false, autoTimer = 0, finalText = "", lastError = "";
  const say = (msg, kind) => { status.hidden = !msg; status.textContent = msg || ""; status.classList.toggle("error", kind === "error"); };
  const cancelAuto = () => { clearTimeout(autoTimer); autoTimer = 0; };

  const ERRORS = {
    "not-allowed": "The microphone is blocked. Allow it in the address bar, and open the app with Live Server or https.",
    "service-not-allowed": "Voice isn't allowed here. Open the app with Live Server or https.",
    "no-speech": "I didn't hear anything. Tap the mic and try again.",
    "audio-capture": "No microphone was found.",
    network: "Voice needs an internet connection.",
  };

  function handleSpoken(text) {
    const quick = voiceToQuick(text);
    if (!TaskStore.parseQuickAdd(quick).title) { say(`I heard “${text}” but couldn't find a task. Try again.`, "error"); return; }
    quickInput.value = quick;
    quickInput.dispatchEvent(new Event("input", { bubbles: true }));
    say(`Heard “${text}”. Pinning in 2 seconds. Edit the text or press Esc to cancel.`);
    autoTimer = setTimeout(() => {
      autoTimer = 0;
      say("");
      if (quickForm.requestSubmit) quickForm.requestSubmit();
      else quickForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 2000);
  }

  function startVoice() {
    if (!SR) return;
    if (listening) { rec.stop(); return; }
    cancelAuto();
    finalText = "";
    lastError = "";
    rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      listening = true;
      mic.classList.add("is-listening");
      mic.setAttribute("aria-pressed", "true");
      say("Listening… try “check vitals at 2pm tomorrow, urgent”");
    };
    rec.onresult = (e) => {
      finalText = Array.from(e.results).map((r) => r[0].transcript).join(" ").trim();
      say(`Listening… “${finalText}”`);
    };
    rec.onerror = (e) => { lastError = e.error; };
    rec.onend = () => {
      listening = false;
      mic.classList.remove("is-listening");
      mic.setAttribute("aria-pressed", "false");
      if (lastError && lastError !== "aborted") say(ERRORS[lastError] || "Voice stopped unexpectedly. Try again.", "error");
      else if (finalText) handleSpoken(finalText);
      else if (lastError !== "aborted") say("I didn't catch that. Tap the mic and try again.", "error");
    };
    try { rec.start(); } catch { say("Voice couldn't start. Try again.", "error"); }
  }

  if (SR) {
    mic.addEventListener("click", startVoice);
  } else {
    mic.disabled = true;
    mic.title = "Voice isn't supported in this browser. Try Chrome, Edge or Safari.";
  }

  quickInput.addEventListener("input", (e) => {
    if (e.isTrusted && autoTimer) { cancelAuto(); say("Edit it, then press Pin it."); }
  });
  quickForm.addEventListener("submit", () => say(""));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (autoTimer || listening)) {
      cancelAuto();
      if (listening) rec.abort();
      say("");
      return;
    }
    const t = e.target;
    const typing = t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
    if (e.key === "v" && SR && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !document.querySelector("dialog[open]")) {
      e.preventDefault();
      if (state.view !== "board") showView("board", { focus: true });
      startVoice();
    }
  });

  updatePulse();
})();