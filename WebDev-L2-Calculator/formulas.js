/* VERDANT - Nursing formula field
   40 nursing formulas pop up at random behind the calculator, but always inside a tidy lattice of slots:
   - slots sit left and right of the calculator in rows, each slot holds one formula at a time
   - three depth tiers (near / mid / far) alternate across the lattice so the scene reads as layered 3D
   - a shuffled deck guarantees all 40 formulas appear once before any repeats
   - in "lite" mode (slow device, set by script.js) only half as many are shown at once
   The list is also shared as window.VERDANT_FORMULAS for the library in tools.js.
   Decorative only: the layer is aria-hidden and never takes clicks. For study; verify against local protocols. */
"use strict";

(function () {
  const FORMULAS = [
    ["BMI", "weight kg ÷ height m²"],
    ["Drip rate", "volume × drop factor ÷ minutes = gtt/min"],
    ["Pump rate", "volume ÷ hours = mL/hr"],
    ["Dose", "desired ÷ have × quantity"],
    ["Weight-based dose", "mg/kg × weight kg"],
    ["BSA (Mosteller)", "√(height cm × weight kg ÷ 3600)"],
    ["MAP", "(SBP + 2 × DBP) ÷ 3"],
    ["Pulse pressure", "SBP − DBP"],
    ["Cardiac output", "HR × stroke volume"],
    ["Maintenance fluids", "4 + 2 + 1 mL/kg/hr"],
    ["Holliday–Segar", "100 / 50 / 20 mL/kg/day"],
    ["°C to °F", "°C × 9/5 + 32"],
    ["°F to °C", "(°F − 32) × 5/9"],
    ["lb to kg", "lb ÷ 2.2"],
    ["Anion gap", "Na − (Cl + HCO₃)"],
    ["Corrected calcium", "Ca + 0.8 × (4 − albumin)"],
    ["Urine output", "mL ÷ (kg × hours)"],
    ["Heparin rate", "units/hr ÷ units/mL = mL/hr"],
    ["Percent solution", "g ÷ 100 mL"],
    ["Dilution", "C₁ × V₁ = C₂ × V₂"],
    ["Titration", "dose × kg × 60 ÷ mcg/mL = mL/hr"],
    ["mg to mcg", "mg × 1000"],
    ["Naegele’s rule", "LMP + 7 days − 3 months"],
    ["Apgar", "HR + breathing + tone + reflex + colour"],
    ["Glasgow Coma Scale", "eye + verbal + motor"],
    ["Fluid balance", "intake − output"],
    ["Minute ventilation", "tidal volume × RR"],
    ["Ideal weight (male)", "50 + 2.3 × inches over 60"],
    ["Ideal weight (female)", "45.5 + 2.3 × inches over 60"],
    ["Creatinine clearance", "(140 − age) × kg ÷ (72 × SCr)"],
    ["Parkland burn", "4 mL × kg × %TBSA"],
    ["mL/hr to gtt/min", "mL/hr × drop factor ÷ 60"],
    ["ECG heart rate", "300 ÷ large boxes"],
    ["Max heart rate", "220 − age"],
    ["Clark’s rule", "weight lb ÷ 150 × adult dose"],
    ["Young’s rule", "age ÷ (age + 12) × adult dose"],
    ["Insulin correction", "1800 ÷ total daily dose"],
    ["Carb ratio", "500 ÷ total daily dose"],
    ["Shock index", "HR ÷ SBP"],
    ["Percent change", "(new − old) ÷ old × 100"]
  ];
  window.VERDANT_FORMULAS = FORMULAS;

  const field = document.getElementById("formula-field");
  if (!field) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let slots = [];          // the lattice: { x, y, tier, busy }
  let maxActive = 0;       // how many formulas may be visible at once (full mode)
  let active = 0;
  let deck = [];           // shuffled formulas still to show in this round
  let timer = null;
  let startTimer = null;
  let lastWidth = window.innerWidth;

  function limit() {                                           // lite mode halves the load
    return root.classList.contains("lite") ? Math.max(2, Math.ceil(maxActive / 2)) : maxActive;
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  // The lattice depends on screen width. Columns stay outside the calculator; rows are evenly spaced.
  function buildSlots() {
    const w = window.innerWidth;
    let cols, rows;
    if (w >= 1024)     { cols = [9, 25, 75, 91]; rows = [12, 28, 44, 60, 76, 90]; maxActive = 10; }
    else if (w >= 600) { cols = [16, 84];        rows = [10, 24, 38, 52, 66, 80, 92]; maxActive = 6; }
    else               { cols = [27, 73];        rows = [9, 21, 79, 91]; maxActive = 4; }
    slots = [];
    rows.forEach(function (y, r) {
      cols.forEach(function (x, c) {
        slots.push({ x: x + (r % 2 ? 2.5 : -2.5), y: y, tier: (r + c) % 3, busy: false });   // staggered lattice, alternating depth
      });
    });
  }

  function createFormula(slot, formula, isStatic) {
    const el = document.createElement("div");
    el.className = isStatic ? "formula formula--static" : "formula";
    el.dataset.tier = slot.tier;
    el.style.left = slot.x + "%";
    el.style.top = slot.y + "%";
    el.style.setProperty("--life", (7 + Math.random() * 4).toFixed(1) + "s");
    const name = document.createElement("span");
    name.className = "formula__name";
    name.textContent = formula[0];
    const text = document.createElement("span");
    text.className = "formula__text";
    text.textContent = formula[1];
    el.append(name, text);
    return el;
  }

  function popOne() {
    if (document.hidden || document.body.classList.contains("calm") || active >= limit()) return;
    const open = slots.filter(function (s) { return !s.busy; });
    if (!open.length) return;
    const slot = open[Math.floor(Math.random() * open.length)];
    if (!deck.length) deck = shuffle(FORMULAS.slice());
    const el = createFormula(slot, deck.pop(), false);
    slot.busy = true;
    active++;
    el.addEventListener("animationend", function () {          // the animation is the whole lifetime of the formula
      el.remove();
      slot.busy = false;
      active--;
    }, { once: true });
    field.append(el);
  }

  function loop() {
    popOne();
    timer = setTimeout(loop, 600 + Math.random() * 700);
  }

  function stop() {
    if (timer) clearTimeout(timer);
    if (startTimer) clearTimeout(startTimer);
    timer = null;
    startTimer = null;
  }

  function start() {
    stop();
    const burst = Math.ceil(limit() / 2);
    for (let i = 0; i < burst; i++) setTimeout(popOne, i * 240);   // opening burst
    timer = setTimeout(loop, 1400);
  }

  // Reduced motion: no pop-ups, just a calm, still set of formulas
  function showStatic() {
    const picks = shuffle(slots.slice()).slice(0, maxActive);
    const names = shuffle(FORMULAS.slice());
    picks.forEach(function (slot, i) { field.append(createFormula(slot, names[i], true)); });
  }

  function init() {
    field.replaceChildren();
    active = 0;
    deck = [];
    buildSlots();
    if (reducedMotion) { showStatic(); return; }
    startTimer = setTimeout(start, 1500);                      // wait for the calculator to land first
  }

  document.addEventListener("visibilitychange", function () {  // do not pile up work in a background tab
    if (reducedMotion) return;
    if (document.hidden) stop();
    else if (!timer) timer = setTimeout(loop, 400);
  });

  let resizeTimer = null;
  window.addEventListener("resize", function () {              // rebuild only when the width changes (not the phone address bar)
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      stop();
      init();
    }, 250);
  }, { passive: true });

  init();
})();