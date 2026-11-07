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
    ["Naegele’s rule", "LMP + 7 days − 3 months + 1 year"],
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

  /* ---------- 2. EXTRA CALCULATORS: one for every formula tools.js does not already cover, so every row gets an Open button.
     Same shape as the calculators in tools.js. The library name is the key that matches a row, so it must match the text above exactly. ---------- */
  function F(k, label, unit, ph, optional, zero) { return { k: k, label: label, unit: unit, ph: ph || "", optional: !!optional, zero: !!zero }; }
  function pick(k, label, options, fallback) { return { k: k, label: label, type: "select", options: options, value: fallback }; }
  function fmt(n, dp) { if (n !== 0 && Math.abs(n) < Math.pow(10, -dp)) return String(Number(n.toPrecision(2))); return String(Number(n.toFixed(dp))); }
  function R(value, dp, unit, parts, detail, warnings, text) { return { value: value, dp: dp, unit: unit, parts: parts, detail: detail || "", warnings: warnings || [], text: text }; }
  function C(id, name, formula, note, fields, compute) { return { id: id, name: name, label: name, lib: name, formula: formula, note: note, fields: fields, compute: compute }; }
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const TDD = [F("t", "Total daily insulin dose", "units/day", "e.g. 50")];
  const sbpdbp = [F("s", "Systolic (SBP)", "mmHg", "e.g. 120"), F("d", "Diastolic (DBP)", "mmHg", "e.g. 80")];
  const ibwNote = "Devine formula. A reference weight, not a target for every patient.";
  const tooShort = function (h) { return h < 60 ? ["The formula assumes a height of 60 in (5 ft) or more."] : []; };

  const EXTRA = [
    C("pp", "Pulse pressure", "SBP − DBP", "A normal resting value is about 40 mmHg.", sbpdbp,
      function (v) { if (v.d >= v.s) return { error: "Diastolic must be lower than systolic." }; return R(v.s - v.d, 0, "mmHg", [fmt(v.s, 4), "−", fmt(v.d, 4)], ""); }),
    C("co", "Cardiac output", "HR × stroke volume ÷ 1000", "A normal adult at rest is about 4 to 8 L/min.",
      [F("h", "Heart rate", "bpm", "e.g. 70"), F("s", "Stroke volume", "mL", "e.g. 70")],
      function (v) { return R(v.h * v.s / 1000, 2, "L/min", [fmt(v.h, 4), "×", fmt(v.s, 4), "÷ 1000"], ""); }),
    C("aniongap", "Anion gap", "Na − (Cl + HCO₃)", "Reference ranges vary by lab. About 8 to 12 mEq/L is common when potassium is not included.",
      [F("n", "Sodium", "mEq/L", "e.g. 140"), F("c", "Chloride", "mEq/L", "e.g. 104"), F("b", "Bicarbonate", "mEq/L", "e.g. 24")],
      function (v) { return R(v.n - (v.c + v.b), 0, "mEq/L", [fmt(v.n, 4), "− (" + fmt(v.c, 4), "+", fmt(v.b, 4) + ")"], ""); }),
    C("corca", "Corrected calcium", "Ca + 0.8 × (4 − albumin)", "Use total calcium in mg/dL and albumin in g/dL.",
      [F("c", "Total calcium", "mg/dL", "e.g. 7.5"), F("a", "Albumin", "g/dL", "e.g. 2.5")],
      function (v) { return R(v.c + 0.8 * (4 - v.a), 2, "mg/dL", [fmt(v.c, 4), "+ 0.8 × (4 −", fmt(v.a, 4) + ")"], ""); }),
    C("pctsol", "Percent solution", "grams ÷ mL × 100", "A 5 % solution has 5 g in every 100 mL.",
      [F("g", "Drug amount", "g", "e.g. 5"), F("v", "Total volume", "mL", "e.g. 250")],
      function (v) { const r = v.g / v.v * 100; return R(r, 2, "%", [fmt(v.g, 4), "÷", fmt(v.v, 4), "× 100"], fmt(r, 2) + " g in every 100 mL"); }),
    C("dilution", "Dilution", "C₁ × V₁ = C₂ × V₂", "Both concentrations must use the same unit. Solves for the volume of stock to draw up.",
      [F("c1", "Stock concentration", "same unit", "e.g. 10"), F("c2", "Desired concentration", "same unit", "e.g. 2"), F("v2", "Final volume", "mL", "e.g. 50")],
      function (v) {
        if (v.c2 > v.c1) return { error: "The desired concentration cannot be higher than the stock." };
        const v1 = v.c2 * v.v2 / v.c1;
        return R(v1, 2, "mL of stock", [fmt(v.c2, 4), "×", fmt(v.v2, 4), "÷", fmt(v.c1, 4)], "Add " + fmt(v.v2 - v1, 2) + " mL diluent to make " + fmt(v.v2, 2) + " mL");
      }),
    C("naegele", "Naegele’s rule", "LMP + 7 days − 3 months + 1 year", "Assumes a regular 28-day cycle. Ultrasound dating may change the due date.",
      [F("d", "First day of last period", "day", "e.g. 10"), F("m", "Month", "1 to 12", "e.g. 1"), F("y", "Year", "year", "e.g. 2026")],
      function (v) {
        if (![v.d, v.m, v.y].every(Number.isInteger) || v.m > 12 || v.y < 2000 || v.y > 2100) return { error: "Enter a whole day, a month from 1 to 12 and a year from 2000 to 2100." };
        const start = new Date(Date.UTC(v.y, v.m - 1, v.d));
        if (start.getUTCDate() !== v.d || start.getUTCMonth() !== v.m - 1) return { error: "That date does not exist." };
        const plus7 = new Date(Date.UTC(v.y, v.m - 1, v.d + 7));
        let month = plus7.getUTCMonth() + 1 - 3, year = plus7.getUTCFullYear() + 1;
        if (month < 1) { month += 12; year -= 1; }
        const day = Math.min(plus7.getUTCDate(), new Date(Date.UTC(year, month, 0)).getUTCDate());
        return R(1, 0, "due date", [v.d + " " + MONTHS[v.m - 1] + " " + v.y, "+ 7 days − 3 months + 1 year"], "Estimated due date", [], day + " " + MONTHS[month - 1] + " " + year);
      }),
    C("apgar", "Apgar", "sum of five scores, 0 to 2 each", "Scored at 1 and 5 minutes after birth. Follow your newborn resuscitation policy.",
      [pick("a", "Appearance (colour)", [["2", "2 Pink all over"], ["1", "1 Body pink, hands and feet blue"], ["0", "0 Blue or pale all over"]], "2"),
       pick("p", "Pulse (heart rate)", [["2", "2 100 or more"], ["1", "1 Under 100"], ["0", "0 Absent"]], "2"),
       pick("g", "Grimace (reflex)", [["2", "2 Cries or coughs"], ["1", "1 Grimace"], ["0", "0 No response"]], "2"),
       pick("t", "Activity (muscle tone)", [["2", "2 Active movement"], ["1", "1 Some flexion"], ["0", "0 Limp"]], "2"),
       pick("r", "Respiration", [["2", "2 Strong cry"], ["1", "1 Weak or slow"], ["0", "0 Absent"]], "2")],
      function (v) { const t = v.a + v.p + v.g + v.t + v.r; return R(t, 0, "/ 10", ["A" + v.a, "+", "P" + v.p, "+", "G" + v.g, "+", "A" + v.t, "+", "R" + v.r], t >= 7 ? "Reassuring" : t >= 4 ? "Moderately low" : "Low", t <= 6 ? ["A score of 6 or less needs prompt help. Follow your newborn resuscitation policy."] : []); }),
    C("gcs", "Glasgow Coma Scale", "eye + verbal + motor", "13 to 15 is mild, 9 to 12 moderate, 8 or less severe.",
      [pick("e", "Eye opening", [["4", "4 Spontaneous"], ["3", "3 To voice"], ["2", "2 To pain"], ["1", "1 None"]], "4"),
       pick("v", "Verbal response", [["5", "5 Oriented"], ["4", "4 Confused"], ["3", "3 Words only"], ["2", "2 Sounds only"], ["1", "1 None"]], "5"),
       pick("m", "Motor response", [["6", "6 Obeys commands"], ["5", "5 Localises pain"], ["4", "4 Withdraws"], ["3", "3 Abnormal flexion"], ["2", "2 Extension"], ["1", "1 None"]], "6")],
      function (v) { const t = v.e + v.v + v.m; return R(t, 0, "/ 15", ["E" + v.e, "+", "V" + v.v, "+", "M" + v.m], t >= 13 ? "Mild" : t >= 9 ? "Moderate" : "Severe", t <= 8 ? ["A score of 8 or less is severe. Follow your escalation policy."] : []); }),
    C("balance", "Fluid balance", "intake − output", "Use the same time period for both. A negative result means more output than intake.",
      [F("i", "Total intake", "mL", "e.g. 1500", false, true), F("o", "Total output", "mL", "e.g. 1200", false, true)],
      function (v) { const r = v.i - v.o; return R(r, 0, "mL", [fmt(v.i, 4), "−", fmt(v.o, 4)], r > 0 ? "Positive balance" : r < 0 ? "Negative balance" : "Even balance"); }),
    C("minvent", "Minute ventilation", "tidal volume × RR ÷ 1000", "A normal adult at rest is about 5 to 8 L/min.",
      [F("t", "Tidal volume", "mL", "e.g. 500"), F("r", "Respiratory rate", "breaths/min", "e.g. 14")],
      function (v) { return R(v.t * v.r / 1000, 1, "L/min", [fmt(v.t, 4), "×", fmt(v.r, 4), "÷ 1000"], ""); }),
    C("ibwm", "Ideal weight (male)", "50 + 2.3 × (in − 60)", ibwNote, [F("h", "Height", "in", "e.g. 70")],
      function (v) { return R(50 + 2.3 * (v.h - 60), 1, "kg", ["50 + 2.3 × (" + fmt(v.h, 4), "− 60)"], "", tooShort(v.h)); }),
    C("ibwf", "Ideal weight (female)", "45.5 + 2.3 × (in − 60)", ibwNote, [F("h", "Height", "in", "e.g. 65")],
      function (v) { return R(45.5 + 2.3 * (v.h - 60), 1, "kg", ["45.5 + 2.3 × (" + fmt(v.h, 4), "− 60)"], "", tooShort(v.h)); }),
    C("crcl", "Creatinine clearance", "(140 − age) × kg ÷ (72 × SCr)", "Cockcroft–Gault with actual body weight, for adults. Multiply by 0.85 for women, which is applied for you.",
      [F("a", "Age", "years", "e.g. 50"), F("k", "Weight", "kg", "e.g. 70"), F("s", "Serum creatinine", "mg/dL", "e.g. 1"),
       pick("x", "Sex", [["1", "Male"], ["0.85", "Female"]], "1")],
      function (v) {
        if (v.a >= 140) return { error: "Age must be below 140." };
        const r = (140 - v.a) * v.k / (72 * v.s) * v.x, w = [];
        if (v.s < 0.6) w.push("A very low creatinine can overestimate clearance. Check the lab value.");
        if (v.a < 18) w.push("This formula is meant for adults.");
        return R(r, 0, "mL/min", ["(140 −", fmt(v.a, 4) + ")", "×", fmt(v.k, 4), "÷ (72 ×", fmt(v.s, 4) + ")"].concat(v.x < 1 ? ["× 0.85"] : []), "", w);
      }),
    C("mlhrgtt", "mL/hr to gtt/min", "mL/hr × drop factor ÷ 60", "Drops are whole numbers, so round to the nearest drop.",
      [F("r", "Ordered rate", "mL/hr", "e.g. 125"), pick("f", "Drop factor", [["10", "10 gtt/mL"], ["15", "15 gtt/mL"], ["20", "20 gtt/mL"], ["60", "60 gtt/mL (micro)"]], "15")],
      function (v) { const r = v.r * v.f / 60; return R(r, 1, "gtt/min", [fmt(v.r, 4), "×", fmt(v.f, 0), "÷ 60"], "Set about " + Math.round(r) + " drops/min"); }),
    C("ecghr", "ECG heart rate", "300 ÷ large boxes", "Regular rhythms only. Count the large boxes between two R waves.",
      [F("b", "Large boxes between R waves", "boxes", "e.g. 4")], function (v) { return R(300 / v.b, 0, "bpm", ["300 ÷", fmt(v.b, 4)], ""); }),
    C("maxhr", "Max heart rate", "220 − age", "A population estimate. Individual maximums vary by about 10 to 12 beats.",
      [F("a", "Age", "years", "e.g. 40")],
      function (v) { if (v.a >= 220) return { error: "Age must be below 220." }; const r = 220 - v.a; return R(r, 0, "bpm", ["220 −", fmt(v.a, 4)], "50 to 85 % zone: " + Math.round(r * 0.5) + " to " + Math.round(r * 0.85) + " bpm"); }),
    C("clark", "Clark’s rule", "weight lb ÷ 150 × adult dose", "An old estimate. Use the prescriber's order or a paediatric reference for the real dose.",
      [F("w", "Child weight", "lb", "e.g. 50"), F("a", "Adult dose", "mg", "e.g. 500")],
      function (v) { return R(v.w / 150 * v.a, 2, "mg", [fmt(v.w, 4), "÷ 150 ×", fmt(v.a, 4)], ""); }),
    C("young", "Young’s rule", "age ÷ (age + 12) × adult dose", "An old estimate for ages 1 to 12. Use the prescriber's order for the real dose.",
      [F("g", "Child age", "years", "e.g. 6"), F("a", "Adult dose", "mg", "e.g. 300")],
      function (v) { return R(v.g / (v.g + 12) * v.a, 2, "mg", [fmt(v.g, 4), "÷ (" + fmt(v.g, 4) + " + 12) ×", fmt(v.a, 4)], "", v.g > 12 ? ["Young’s rule is meant for ages up to 12."] : []); }),
    C("insulincf", "Insulin correction", "1800 ÷ total daily dose", "Rule of 1800 for rapid-acting insulin. Always follow the prescriber's order or your facility's protocol.", TDD,
      function (v) { const r = 1800 / v.t; return R(r, 0, "mg/dL per unit", ["1800 ÷", fmt(v.t, 4)], "1 unit lowers glucose by about " + fmt(r, 0) + " mg/dL"); }),
    C("carbratio", "Carb ratio", "500 ÷ total daily dose", "Rule of 500. Always follow the prescriber's order or your facility's protocol.", TDD,
      function (v) { const r = 500 / v.t; return R(r, 0, "g per unit", ["500 ÷", fmt(v.t, 4)], "1 unit covers about " + fmt(r, 0) + " g of carbohydrate"); }),
    C("shock", "Shock index", "HR ÷ SBP", "A normal value is about 0.5 to 0.7.", [F("h", "Heart rate", "bpm", "e.g. 100"), F("s", "Systolic (SBP)", "mmHg", "e.g. 125")],
      function (v) { const r = v.h / v.s; return R(r, 2, "", [fmt(v.h, 4), "÷", fmt(v.s, 4)], r >= 0.9 ? "Raised" : "Within the usual range", r >= 1 ? ["A shock index of 1 or more may signal shock. Follow your escalation policy."] : []); }),
    C("pctchange", "Percent change", "(new − old) ÷ old × 100", "A negative result is a decrease.",
      [F("o", "Old value", "same unit", "e.g. 80"), F("n", "New value", "same unit", "e.g. 72", false, true)],
      function (v) { const r = (v.n - v.o) / v.o * 100; return R(r, 1, "%", ["(" + fmt(v.n, 4), "−", fmt(v.o, 4) + ")", "÷", fmt(v.o, 4), "× 100"], r > 0 ? "Increase" : r < 0 ? "Decrease" : "No change"); })
  ];
  const EXTRA_LIB = {};
  EXTRA.forEach(function (c) { EXTRA_LIB[c.lib] = ["calc", c.id]; });
  window.VERDANT_EXTRA_CALCS = EXTRA;
  window.VERDANT_EXTRA_LIB = EXTRA_LIB;

  /* ---------- 3. THE POP-UP SCENE (unchanged from your version) ---------- */
  const field = document.getElementById("formula-field");
  if (!field) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let slots = [];
  let maxActive = 0;
  let active = 0;
  let deck = [];
  let timer = null;
  let startTimer = null;
  let lastWidth = window.innerWidth;

  function limit() {
    return root.classList.contains("lite") ? Math.max(2, Math.ceil(maxActive / 2)) : maxActive;
  }
  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }
  function buildSlots() {
    const w = window.innerWidth;
    let cols, rows;
    if (w >= 1024)     { cols = [9, 25, 75, 91]; rows = [12, 28, 44, 60, 76, 90]; maxActive = 10; }
    else if (w >= 600) { cols = [16, 84];        rows = [10, 24, 38, 52, 66, 80, 92]; maxActive = 6; }
    else               { cols = [27, 73];        rows = [9, 21, 79, 91]; maxActive = 4; }
    slots = [];
    rows.forEach(function (y, r) {
      cols.forEach(function (x, c) {
        slots.push({ x: x + (r % 2 ? 2.5 : -2.5), y: y, tier: (r + c) % 3, busy: false });
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
    el.addEventListener("animationend", function () {
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
    for (let i = 0; i < burst; i++) setTimeout(popOne, i * 240);
    timer = setTimeout(loop, 1400);
  }
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
    startTimer = setTimeout(start, 1500);
  }
  document.addEventListener("visibilitychange", function () {
    if (reducedMotion) return;
    if (document.hidden) stop();
    else if (!timer) timer = setTimeout(loop, 400);
  });
  let resizeTimer = null;
  window.addEventListener("resize", function () {
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