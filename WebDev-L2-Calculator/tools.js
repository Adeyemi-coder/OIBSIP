"use strict";

(function () {
  const nursingPanel = document.getElementById("panel-nursing");
  const convertPanel = document.getElementById("panel-convert");
  if (!nursingPanel || !convertPanel) return;

  const noop = function () {};
  const V = window.Verdant || { useValue: noop, record: noop, speak: noop, toast: noop, setMode: noop };

  /* ---------- 1. HELPERS ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function parseNumber(raw, allowNegative) {
    const text = String(raw).trim().replace(",", ".");
    if (text === "") return null;
    const pattern = allowNegative ? /^-?([0-9]+\.?[0-9]*|\.[0-9]+)$/ : /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    return pattern.test(text) ? Number(text) : NaN;
  }

  function fmt(n, dp) {
    if (n !== 0 && Math.abs(n) < Math.pow(10, -dp)) return String(Number(n.toPrecision(2)));
    return String(Number(n.toFixed(dp)));
  }

  function sig(n) {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1e12 || abs < 1e-6) return Number(n.toPrecision(5)).toExponential().replace("+", "");
    return String(Number(n.toPrecision(8)));
  }

  function remember(id) { try { localStorage.setItem("verdant.tool", id); } catch (error) {} }
  function recall() { try { return localStorage.getItem("verdant.tool"); } catch (error) { return null; } }

  function numField(key, label, unit, placeholder, optional, zero, prefill) {
    return { k: key, label: label, unit: unit, ph: placeholder || "", optional: !!optional, zero: !!zero, prefill: prefill };
  }
  function pickField(key, label, options, fallback) {
    return { k: key, label: label, type: "select", options: options, value: fallback };
  }
  function bmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy range";
    if (bmi < 30) return "Overweight";
    return "Obese range";
  }
  function checkBody(heightCm, weightKg) {
    const list = [];
    if (heightCm !== undefined && (heightCm < 50 || heightCm > 250)) list.push("Height looks unusual. It should be in cm.");
    if (weightKg !== undefined && (weightKg < 2 || weightKg > 400)) list.push("Weight looks unusual. It should be in kg.");
    return list;
  }

  function getLimits(unit) {
    if (!unit) return [0, Infinity];
    const u = unit.toLowerCase();
    if (u === "kg") return [0.5, 500]; 
    if (u === "cm" || u === "in") return [20, 250]; 
    if (u === "bpm" || u === "breaths/min") return [20, 300]; 
    if (u === "mmhg") return [20, 300]; 
    if (u === "years") return [0, 120]; 
    if (u === "°c" || u === "°f") return [20, 45]; 
    if (u === "ml") return [0, 5000]; 
    return [0, Infinity];
  }

  /* ---------- 2. THE CALCULATORS ---------- */
  const CALCS = [
    {
      id: "dose", name: "Dose (desired ÷ have × quantity)", label: "Dose", formula: "desired ÷ have × quantity",
      note: "Use the same unit for desired and on hand. If the quantity is tablets, read the answer as tablets.",
      fields: [numField("desired", "Desired dose", "same unit", "e.g. 250"), numField("have", "Dose on hand", "same unit", "e.g. 500"), numField("qty", "Quantity it comes in", "mL", "e.g. 2")],
      compute: function (v) {
        const r = v.desired / v.have * v.qty, w = [];
        if (r > 20) w.push("That is a large volume. Check your units and the route.");
        if (r < 0.1) w.push("That is a very small volume. Check your units.");
        return { value: r, dp: 2, unit: "mL", parts: [fmt(v.desired, 4), "÷", fmt(v.have, 4), "×", fmt(v.qty, 4)], detail: "", warnings: w };
      }
    },
    {
      id: "drip", name: "Drip rate (gtt/min)", label: "Drip rate", formula: "volume × drop factor ÷ minutes = gtt/min",
      note: "Time is in minutes (hours × 60). Drops are whole numbers, so round to the nearest drop.",
      fields: [numField("vol", "Volume", "mL", "e.g. 1000"), numField("min", "Time", "min", "e.g. 480"),
        pickField("df", "Drop factor", [["10", "10 gtt/mL"], ["15", "15 gtt/mL"], ["20", "20 gtt/mL"], ["60", "60 gtt/mL (micro)"]], "15")],
      compute: function (v) {
        const r = v.vol * v.df / v.min;
        const w = [];
        let limit = null;

        if (r > 250) {
          w.push("Rate is > 250 gtt/min. This is usually considered a free-flow bolus and requires a pump.");
          limit = { title: "Flow Rate Warning", msg: "A rate of " + Math.round(r) + " drops/min is extremely fast. Verify the order and use a pump." };
        } else if (r > 60 && v.df == 60) {
          w.push("Microdrip rate is very fast. Confirm the order.");
        }

        return { value: r, dp: 1, unit: "gtt/min", parts: [fmt(v.vol, 4), "×", fmt(v.df, 0), "÷", fmt(v.min, 4)],
          detail: "Set about " + Math.round(r) + " drops/min (" + fmt(v.vol / v.min * 60, 1) + " mL/hr)", warnings: w, limit: limit };
      }
    },
    {
      id: "pump", name: "Pump rate (mL/hr)", label: "Pump rate", formula: "volume ÷ hours = mL/hr",
      note: "Always double-check the pump settings against the order.",
      fields: [numField("vol", "Volume", "mL", "e.g. 1000"), numField("hrs", "Time", "hours", "e.g. 8")],
      compute: function (v) {
        const r = v.vol / v.hrs, w = [];
        let limit = null;

        if (r > 999) {
          w.push("Calculated rate is above 999 mL/hr, which is the limit of most standard infusion pumps.");
          limit = { title: "Pump Limit Warning", msg: "A rate of " + fmt(r, 1) + " mL/hr exceeds the limit of most pumps. Verify the volume and time." };
        } else if (r > 500) {
          w.push("High pump rate. Verify the order.");
        }

        return { value: r, dp: 1, unit: "mL/hr", parts: [fmt(v.vol, 4), "÷", fmt(v.hrs, 4)], detail: "Over " + fmt(v.hrs, 2) + " h", warnings: w, limit: limit };
      }
    },
    {
      id: "weightdose", name: "Weight-based dose", label: "Weight-based dose", formula: "mg/kg × weight kg",
      note: "Enter a maximum single dose if the order or reference gives one, and it will be checked for you.",
      fields: [numField("dpk", "Dose per kg", "mg/kg", "e.g. 15"), numField("kg", "Weight", "kg", "e.g. 20"), numField("max", "Max single dose", "mg", "optional", true)],
      compute: function (v) {
        const r = v.dpk * v.kg, w = checkBody(undefined, v.kg);
        if (v.max !== null && r > v.max) w.unshift("Over the maximum single dose you entered (" + fmt(v.max, 2) + " mg). Do not exceed it. Verify the order.");
        return { value: r, dp: 2, unit: "mg", parts: [fmt(v.dpk, 4), "×", fmt(v.kg, 4)], detail: fmt(v.dpk, 4) + " mg/kg × " + fmt(v.kg, 4) + " kg", warnings: w };
      }
    },
    {
      id: "bmi", name: "BMI", label: "BMI", formula: "weight kg ÷ height m²",
      note: "Adult cut-offs. Children use age and sex percentile charts.",
      fields: [numField("kg", "Weight", "kg", "e.g. 70"), numField("cm", "Height", "cm", "e.g. 175")],
      compute: function (v) {
        const r = v.kg / Math.pow(v.cm / 100, 2);
        return { value: r, dp: 1, unit: "kg/m²", parts: [fmt(v.kg, 4), "÷", "(" + fmt(v.cm / 100, 4) + ")²"], detail: bmiCategory(r), warnings: checkBody(v.cm, v.kg) };
      }
    },
    {
      id: "map", name: "MAP (mean arterial pressure)", label: "MAP", formula: "(SBP + 2 × DBP) ÷ 3",
      note: "Targets differ by patient and unit. Follow the order.",
      fields: [numField("sbp", "Systolic (SBP)", "mmHg", "e.g. 120"), numField("dbp", "Diastolic (DBP)", "mmHg", "e.g. 80")],
      compute: function (v) {
        if (v.dbp >= v.sbp) return { error: "Diastolic must be lower than systolic." };
        const r = (v.sbp + 2 * v.dbp) / 3, w = [];
        if (r < 65) w.push("Below 65 mmHg. Check the patient and follow your escalation policy.");
        return { value: r, dp: 1, unit: "mmHg", parts: ["(" + fmt(v.sbp, 4), "+ 2 ×", fmt(v.dbp, 4) + ")", "÷", "3"], detail: "Pulse pressure " + fmt(v.sbp - v.dbp, 1) + " mmHg", warnings: w };
      }
    },
    {
      id: "bsa", name: "Body surface area (Mosteller)", label: "BSA", formula: "√(height cm × weight kg ÷ 3600)",
      note: "Mosteller formula.",
      fields: [numField("cm", "Height", "cm", "e.g. 175"), numField("kg", "Weight", "kg", "e.g. 70")],
      compute: function (v) {
        const r = Math.sqrt(v.cm * v.kg / 3600);
        return { value: r, dp: 2, unit: "m²", parts: ["√(" + fmt(v.cm, 4) + " × " + fmt(v.kg, 4) + " ÷ 3600)"], detail: "", warnings: checkBody(v.cm, v.kg) };
      }
    },
    {
      id: "parkland", name: "Parkland burn formula", label: "Parkland", formula: "4 mL × kg × %TBSA",
      note: "Count from the time of the burn. Use second- and third-degree burns only. Ringer's lactate is usual. Adjust to urine output.",
      fields: [numField("kg", "Weight", "kg", "e.g. 70"), numField("pct", "Burn area", "% TBSA", "e.g. 20")],
      compute: function (v) {
        if (v.pct > 100) return { error: "Burn area cannot be above 100 %." };
        const total = 4 * v.kg * v.pct, half = total / 2;
        return { value: total, dp: 0, unit: "mL / 24 h", parts: ["4 ×", fmt(v.kg, 4), "×", fmt(v.pct, 4)],
          detail: "First 8 h: " + fmt(half, 0) + " mL (" + fmt(half / 8, 0) + " mL/hr). Next 16 h: " + fmt(half, 0) + " mL (" + fmt(half / 16, 0) + " mL/hr).",
          warnings: checkBody(undefined, v.kg) };
      }
    },
    {
     id: "fluids", name: "Maintenance fluids (4-2-1)", label: "Maintenance fluids", formula: "4 mL/kg/hr (first 10 kg) + 2 mL/kg/hr (next 10 kg) + 1 mL/kg/hr (each kg above 20)",
      note: "Maintenance only. It does not replace deficits or ongoing losses.",
      fields: [numField("kg", "Weight", "kg", "e.g. 20")],
      compute: function (v) {
        const kg = v.kg;
        const hourly = kg <= 10 ? 4 * kg : kg <= 20 ? 40 + 2 * (kg - 10) : 60 + (kg - 20);
        const daily = kg <= 10 ? 100 * kg : kg <= 20 ? 1000 + 50 * (kg - 10) : 1500 + 20 * (kg - 20);
        
        const w = checkBody(undefined, kg);
        let limit = null;

        if (hourly > 200) {
          w.push("Calculated rate is above 200 mL/hr. For an adult, this usually requires a pump, not a gravity drip.");
          limit = { title: "Fluid Rate Warning", msg: "The calculated rate of " + fmt(hourly, 1) + " mL/hr is very high. Verify the weight and order." };
        } else if (hourly > 100 && kg < 40) {
          w.push("High rate for this weight.");
        }

        return { 
          value: hourly, 
          dp: 1, 
          unit: "mL/hr", 
          parts: ["4-2-1 rule for " + fmt(kg, 4) + " kg"], 
          detail: "About " + fmt(daily, 0) + " mL/day by Holliday–Segar", 
          warnings: w,
          limit: limit
        };
      }
    },
    {
      id: "uop", name: "Urine output (mL/kg/hr)", label: "Urine output", formula: "mL ÷ (kg × hours)",
      note: "For adults, about 0.5 mL/kg/hr or more is a common minimum.",
      fields: [numField("ml", "Urine volume", "mL", "e.g. 300"), numField("kg", "Weight", "kg", "e.g. 70"), numField("hrs", "Time", "hours", "e.g. 6")],
      compute: function (v) {
        const r = v.ml / (v.kg * v.hrs), w = checkBody(undefined, v.kg);
        if (r < 0.5) w.push("Below 0.5 mL/kg/hr. Check the patient and follow your escalation policy.");
        return { value: r, dp: 2, unit: "mL/kg/hr", parts: [fmt(v.ml, 4), "÷ (" + fmt(v.kg, 4), "×", fmt(v.hrs, 4) + ")"], detail: fmt(v.ml, 0) + " mL over " + fmt(v.hrs, 2) + " h", warnings: w };
      }
    },
    {
      id: "titration", name: "Titration (mcg/kg/min to mL/hr)", label: "Titration", formula: "dose × kg × 60 ÷ mcg/mL = mL/hr",
      note: "High-alert medication. Have a second nurse verify the dose, concentration and pump settings.",
      fields: [numField("dose", "Ordered dose", "mcg/kg/min", "e.g. 5"), numField("kg", "Weight", "kg", "e.g. 80"), numField("conc", "Concentration", "mcg/mL", "e.g. 1600")],
      compute: function (v) {
        const r = v.dose * v.kg * 60 / v.conc, w = checkBody(undefined, v.kg);
        if (r > 500) w.push("Very high rate. Check the concentration and units.");
        return { value: r, dp: 1, unit: "mL/hr", parts: [fmt(v.dose, 4), "×", fmt(v.kg, 4), "× 60 ÷", fmt(v.conc, 4)], detail: "", warnings: w };
      }
    },
    {
      id: "heparin", name: "Heparin rate (units/hr to mL/hr)", label: "Heparin rate", formula: "units/hr ÷ units/mL = mL/hr",
      note: "High-alert medication. Have a second nurse verify the order, concentration and pump settings.",
      fields: [numField("rate", "Ordered rate", "units/hr", "e.g. 1000"), numField("conc", "Concentration", "units/mL", "e.g. 100")],
      compute: function (v) {
        const r = v.rate / v.conc, w = [];
        if (r > 100) w.push("Very high rate. Check the concentration and units.");
        return { value: r, dp: 1, unit: "mL/hr", parts: [fmt(v.rate, 4), "÷", fmt(v.conc, 4)], detail: "", warnings: w };
      }
    }
  ];
 
  (window.VERDANT_EXTRA_CALCS || []).forEach(function (c) { CALCS.push(c); });
  const CALC_BY_ID = {};
  CALCS.forEach(function (c) { CALC_BY_ID[c.id] = c; });

  /* ---------- 2b. DRUG DOSE CALCULATOR ---------- */
  const MASS = { mcg: 0.001, mg: 1, g: 1000 };
  const UNIT_NAMES = { ml: "mL", iu: "IU", mu: "MU", meq: "mEq", mg: "mg", mcg: "mcg", g: "g", unit: "units", units: "units" };
  function canonUnit(u) { return UNIT_NAMES[String(u || "").toLowerCase()] || ""; }
  function massTo(value, from, to) {
    if (from === to) return value;
    if (MASS[from] && MASS[to]) return value * MASS[from] / MASS[to];
    return null;
  }

  function parseDoseText(raw) {
    const out = { kind: "other", lo: null, hi: null, unit: "", maxSingle: null, maxDay: null, perDay: 0, count: 0 };
    let t = String(raw || "").replace(/(\d),(\d{3})/g, "$1$2").trim();
    if (!t || /^(n\/a|contraindicated|avoid|rarely used)/i.test(t)) { out.kind = "none"; return out; }

    t = t.replace(/\(?\bmax(?:imum)?\.?\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|mL)?\s*(\/\s*day|daily|per day)?\s*\)?/gi, function (m, num, unit, perDay) {
      const cap = { v: Number(num), unit: canonUnit(unit) };
      if (perDay) out.maxDay = cap; else out.maxSingle = cap;
      return " ";
    });

    if (/\bevery\s+\d+\s*[-–]\s*\d+/i.test(t)) { /* ranges */ }
    else {
      const every = /every\s+(\d+)\s*(?:h|hours?|hrs?)\b/i.exec(t);
      const inDoses = /\bin\s+(\d+)\s+(?:divided\s+)?doses?\b/i.exec(t);
      if (every) out.perDay = Math.round(24 / Number(every[1]));
      else if (inDoses) out.perDay = Number(inDoses[1]);
      else if (/\b(bid|twice)\b/i.test(t)) out.perDay = 2;
      else if (/\btid\b/i.test(t)) out.perDay = 3;
      else if (/\bqid\b/i.test(t)) out.perDay = 4;
      else if (/\b(daily|once)\b/i.test(t)) out.perDay = 1;
    }

    const any = /(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*(mg|mcg|g|IU|MU|mEq|mL|units?)\b(?:\s*\/\s*(kg|mL|dL|L|hr|h|day|min))?(?:\s*\/\s*(kg|mL|dL|L|hr|h|day|min))?/gi;
    const found = [];
    let m;
    while ((m = any.exec(t)) !== null) found.push(m);
    out.count = found.length;
    if (!found.length) return out;

    const first = found[0];
    let lo = Number(first[1]);
    let hi = first[2] ? Number(first[2]) : lo;
    let unit = canonUnit(first[3]);
    const a = first[4] ? first[4].toLowerCase() : "";
    const b = first[5] ? first[5].toLowerCase() : "";

    if (a === "kg") {
      out.kind = !b ? "perKg" : b === "day" ? "perKgDay" : b === "min" ? "perMin" : "other";
    } else if (a) {
      out.kind = "other";
    } else if (/\bdaily\b[^.]*\bin\s+\d+(?:\s*[-–]\s*\d+)?\s+doses?/i.test(t)) {
      out.kind = "other";
    } else {
      out.kind = "fixed";
      if (unit === "g") { lo *= 1000; hi *= 1000; unit = "mg"; }
    }
    if (/\be\.g\./i.test(t)) out.kind = "other";
    out.lo = lo; out.hi = hi; out.unit = unit;

    ["maxSingle", "maxDay"].forEach(function (key) {
      const cap = out[key];
      if (!cap) return;
      const conv = massTo(cap.v, cap.unit || unit, unit);
      out[key] = conv === null ? null : conv;
    });
    return out;
  }

  const DRUGDOSE = { id: "drugdose", name: "Drug dose", label: "Drug dose", hidden: true, formula: "", note: "", fields: [], compute: function (v) { return computeDrugDose(v); } };
  CALCS.push(DRUGDOSE);
  CALC_BY_ID[DRUGDOSE.id] = DRUGDOSE;

  function buildDrugCalc(ctx) {
    const info = ctx.info, u = info.unit, d = ctx.drug;
    const one = info.count === 1 && info.lo !== null;
    const pre = function (n) { return one && n !== null ? fmt(n, 4) : undefined; };
    const perDay = info.kind === "perKgDay";
    const fields = [];

    // Standard Dose Fields
    if (info.kind === "fixed") {
      fields.push(numField("dose", "Ordered dose", u, info.lo !== null ? "e.g. " + fmt(info.lo, 4) : "", false, false, pre(info.lo)));
    } else {
      fields.push(numField("dpk", perDay ? "Dose per kg per day" : "Dose per kg", u + "/kg" + (perDay ? "/day" : ""), info.lo !== null ? "e.g. " + fmt(info.lo, 4) : "", false, false, pre(info.lo)));
      fields.push(numField("kg", "Weight", "kg", ctx.group === "adult" ? "e.g. 70" : "e.g. 20"));
      if (perDay) {
        const opts = [["0", "Choose…"], ["1", "1 (once daily)"], ["2", "2"], ["3", "3"], ["4", "4"], ["6", "6"]];
        const known = [1, 2, 3, 4, 6].indexOf(info.perDay) !== -1;
        fields.push(pickField("n", "Doses per day", opts, known ? String(info.perDay) : "0"));
      }
    }

    // Vitals & Contraindications
    if (d.requiresVitals && d.requiresVitals.includes("rr")) {
      fields.push(numField("rr", "Respiratory rate (RR)", "breaths/min", "e.g. 16"));
    }
    if (d.contraindications && d.contraindications.includes("high_bp")) {
      fields.push(numField("sbp", "Systolic BP", "mmHg", "e.g. 120"));
      fields.push(numField("dbp", "Diastolic BP", "mmHg", "e.g. 80"));
    }

    if (u !== "mL") {
      fields.push(pickField("form", "Form on hand", [["0", "Liquid or injection (mL)"], ["1", "Tablet or capsule"]], "0"));
      // The unit label switches between "per mL" and "per tablet" when the form changes (see syncStrengthLabel).
      fields.push(numField("st", "Strength on hand", u + " per mL", "e.g. 50", false));
    }
    fields.push(numField("max", "Max single dose", u, "optional", true, false, info.maxSingle !== null ? fmt(info.maxSingle, 4) : undefined));

    const who = ctx.group === "adult" ? "adult" : "child";
    DRUGDOSE.fields = fields;
    DRUGDOSE.name = "Drug dose: " + d.name + " (" + who + ")";
    DRUGDOSE.label = d.name + " (" + who + ")";
    DRUGDOSE.formula = info.kind === "fixed" ? "ordered dose ÷ strength" : (perDay ? "(dose/kg/day × weight) ÷ doses per day, then ÷ strength" : "dose/kg × weight, then ÷ strength");
    DRUGDOSE.note = "Check the prescriber's order and your facility's drug reference.";
    
    // Kept correct nr.select usage here to avoid breaking the app
    for (let i = 0; i < nr.select.options.length; i++) {
      if (nr.select.options[i].value === DRUGDOSE.id) nr.select.options[i].textContent = DRUGDOSE.name;
    }
  }

  // Keeps the "Strength on hand" unit label in step with the "Form on hand" choice.
  function syncStrengthLabel() {
    const formSel = document.getElementById("nr-f-form");
    const stIn = document.getElementById("nr-f-st");
    if (!formSel || !stIn || !drugCtx || !drugCtx.info) return;
    const unitEl = stIn.parentNode.querySelector(".input-wrap__unit");
    const base = drugCtx.info.unit;
    const per = formSel.value === "1" ? " per tablet" : " per mL";
    if (unitEl) unitEl.textContent = base + per;
    stIn.setAttribute("aria-label", "Strength on hand, in " + base + per);
  }

  // Reads the strengths listed in a drug's "Comes as" text, e.g. "Inj: 50mg/mL, 100mg/mL" or "Tab: 250mg, 500mg".
  // Liquids use the per-mL entries, tablets use the entries without "/mL". Returns values in the dose unit.
  function listedStrengths(formulation, unit, tablets) {
    const out = [];
    const re = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|IU|MU|mEq|units?)\b(\s*\/\s*\d*\s*mL)?/gi;
    let m;
    const text = String(formulation || "").replace(/(\d),(\d{3})/g, "$1$2");
    while ((m = re.exec(text)) !== null) {
      const perMl = !!m[3];
      if (perMl === tablets) continue;
      let val = Number(m[1]);
      const from = canonUnit(m[2]);
      if (from !== unit) {
        const conv = massTo(val, from, unit);
        if (conv === null) continue;
        val = conv;
      }
      out.push(val);
    }
    return out;
  }

  function computeDrugDose(v) {
    const c = drugCtx;
    if (!c || !c.info) return { error: "Open a drug from the Drug Reference first." };
    const info = c.info, u = info.unit, kind = info.kind, name = c.drug.name;
    const doseLimits = [], bodyLimits = [], notes = [];
    let entered, perDose, daily = null, label, parts;

    if (kind === "fixed") {
      entered = v.dose; perDose = v.dose; label = u;
      parts = [fmt(v.dose, 4) + " " + u];
      if (info.maxDay !== null && info.perDay > 0) daily = v.dose * info.perDay;
    } else {
      label = u + "/kg" + (kind === "perKgDay" ? "/day" : "");
      entered = v.dpk;
      const total = v.dpk * v.kg;
      if (kind === "perKgDay") {
        if (!v.n) return { error: "Choose how many doses per day." };
        daily = total; perDose = total / v.n;
        parts = [fmt(v.dpk, 4), "×", fmt(v.kg, 4), "÷", fmt(v.n, 0)];
      } else {
        perDose = total;
        parts = [fmt(v.dpk, 4), "×", fmt(v.kg, 4)];
      }
      if (c.group === "adult" && v.kg < 30) bodyLimits.push("A weight of " + fmt(v.kg, 4) + " kg is unusually low for an adult.");
      if (c.group === "child" && v.kg > 80) bodyLimits.push("A weight of " + fmt(v.kg, 4) + " kg is unusually high for a child.");
    }

    // Vitals & Contraindication Checks
    if (c.drug.requiresVitals && c.drug.requiresVitals.includes("rr") && v.rr !== null) {
      if (v.rr < 12) {
        bodyLimits.push("Respiratory rate of " + v.rr + " is dangerously low (bradypnea). Risk of respiratory depression with this drug.");
      } else if (v.rr > 20) {
        notes.push("Respiratory rate is elevated (" + v.rr + "). Check for underlying causes.");
      }
    }

    if (c.drug.contraindications && c.drug.contraindications.includes("high_bp") && v.sbp !== null && v.dbp !== null) {
      if (v.sbp > 140 || v.dbp > 90) {
        doseLimits.push("Patient has elevated BP (" + v.sbp + "/" + v.dbp + "). This drug may exacerbate hypertension. Consult the prescriber.");
      }
    }

    if (info.count === 1 && info.lo !== null) {
      const range = info.hi > info.lo ? fmt(info.lo, 4) + " to " + fmt(info.hi, 4) : fmt(info.lo, 4);
      if (entered > info.hi * 1.000001) doseLimits.push(fmt(entered, 4) + " " + label + " is above the reference dose for " + name + " (" + range + " " + label + ").");
      else if (entered < info.lo * 0.999999) notes.push(fmt(entered, 4) + " " + label + " is below the reference dose (" + range + " " + label + ").");
    }
    if (v.max !== null && v.max !== undefined && perDose > v.max * 1.000001) {
      doseLimits.push("The dose of " + fmt(perDose, 3) + " " + u + " is above the maximum single dose of " + fmt(v.max, 3) + " " + u + ".");
    }
    if (daily !== null && info.maxDay !== null && daily > info.maxDay * 1.000001) {
      doseLimits.push("The daily total of " + fmt(daily, 3) + " " + u + (kind === "fixed" ? " (" + info.perDay + " doses of " + fmt(perDose, 3) + " " + u + ")" : "") + " is above the maximum daily dose of " + fmt(info.maxDay, 3) + " " + u + ".");
    }

    let value = perDose, outUnit = u, detail = "";
    
    // If the unit is not mL, they MUST provide the strength on hand to get the physical amount.
    if (u !== "mL") {
      if (v.st === null || v.st === undefined || v.st <= 0) {
        return { error: "Enter the strength on hand (e.g. " + u + " per mL or per tablet) to calculate the volume or tablets." };
      }
      
      const tablets = v.form === 1;

      // Safety check: the strength must match a product this drug actually comes as.
      const known = listedStrengths(c.drug.formulation, u, tablets);
      if (known.length && !known.some(function (k) { return Math.abs(k - v.st) <= k * 1e-6; })) {
        doseLimits.push("The strength you entered (" + fmt(v.st, 4) + " " + u + (tablets ? " per tablet" : " per mL") +
          ") does not match any listed for " + name + " (" + known.map(function (k) { return fmt(k, 4); }).join(", ") + " " + u +
          (tablets ? " per tablet" : " per mL") + "). Check the vial or pack label and do not use this result based on an assumed strength.");
      }

      value = perDose / v.st;
      parts = parts.concat(["÷", fmt(v.st, 4)]);
      outUnit = tablets ? "tablets" : "mL";
      detail = "Dose " + fmt(perDose, 3) + " " + u + (daily !== null ? " (daily total " + fmt(daily, 3) + " " + u + ")" : "") + ", strength " + fmt(v.st, 4) + " " + u + (tablets ? " per tablet" : " per mL");
      
      if (tablets) {
        const exact = value;
        const rounded = Math.round(exact * 2) / 2; // nearest half tablet
        if (rounded === 0) {
          notes.push("The dose is less than half a tablet. A tablet is not suitable. Consider a liquid form.");
        } else if (Math.abs(exact - rounded) > 0.02) {
          notes.push("The exact amount is " + fmt(exact, 2) + " tablets, but only whole or half tablets can be given. " +
            fmt(rounded, 1) + " tablets would give " + fmt(rounded * v.st, 3) + " " + u +
            " (ordered " + fmt(perDose, 3) + " " + u + "). Check the order or use another strength.");
        }
        if (exact > 6) notes.push("That is a lot of tablets. Check the strength is in " + u + " per tablet.");
        if (rounded !== 0) value = rounded;
        detail += ". Exact: " + fmt(exact, 2) + " tablets";
      } else {
        if (value > 50) notes.push("That is a large volume. Check the strength is in " + u + " per mL.");
        if (value < 0.1) notes.push("That is a very small volume. Check the strength is in " + u + " per mL.");
      }
    } else {
      detail = daily !== null ? "Per dose. Daily total " + fmt(daily, 3) + " " + u : (kind === "fixed" ? "" : "Per dose");
    }

    const warnings = doseLimits.concat(bodyLimits, notes);
    let limit = null;
    if (doseLimits.length) limit = { title: "Dose Limit Warning", msg: doseLimits.concat(bodyLimits).join(" ") + " Check the order with the prescriber before you go on." };
    else if (bodyLimits.length) limit = { title: "Physiological Limit Warning", msg: bodyLimits.join(" ") + " Please verify your entry." };

    return { value: value, dp: 2, unit: outUnit, parts: parts, detail: detail, warnings: warnings, limit: limit };
  }

  /* ---------- 3. UNIT CONVERTER DATA ---------- */
  function lin(id, label, factor) {
    return { id: id, label: label, to: function (x) { return x * factor; }, from: function (x) { return x / factor; } };
  }
  const CATS = [
    { id: "weight", label: "Weight", linear: true, defaults: ["lb", "kg"],
      note: "1 lb = 0.4536 kg. Dividing by 2.2 is a quick check.",
      units: [lin("mcg", "mcg", 1e-9), lin("mg", "mg", 1e-6), lin("g", "g", 1e-3), lin("kg", "kg", 1), lin("oz", "oz", 0.028349523125), lin("lb", "lb", 0.45359237)] },
    { id: "volume", label: "Volume", linear: true, defaults: ["tbsp", "mL"],
      note: "Household nursing equivalents: 1 tsp = 5 mL, 1 tbsp = 15 mL, 1 fl oz = 30 mL, 1 cup = 240 mL.",
      units: [lin("mL", "mL", 1), lin("L", "L", 1000), lin("tsp", "tsp", 5), lin("tbsp", "tbsp", 15), lin("floz", "fl oz", 30), lin("cup", "cup", 240)] },
    { id: "temperature", label: "Temperature", linear: false, defaults: ["f", "c"], note: "",
      units: [
        { id: "c", label: "°C", to: function (x) { return x; }, from: function (x) { return x; } },
        { id: "f", label: "°F", to: function (x) { return (x - 32) * 5 / 9; }, from: function (x) { return x * 9 / 5 + 32; } },
        { id: "k", label: "K", to: function (x) { return x - 273.15; }, from: function (x) { return x + 273.15; } }
      ] },
    { id: "length", label: "Length", linear: true, defaults: ["in", "cm"], note: "",
      units: [lin("mm", "mm", 0.001), lin("cm", "cm", 0.01), lin("m", "m", 1), lin("in", "in", 0.0254), lin("ft", "ft", 0.3048)] },
    { id: "time", label: "Time", linear: true, defaults: ["h", "min"], note: "",
      units: [lin("s", "sec", 1), lin("min", "min", 60), lin("h", "hr", 3600), lin("day", "days", 86400), lin("wk", "weeks", 604800)] }
  ];
  const CAT_BY_ID = {};
  CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });
  function unitOf(cat, id) {
    for (let i = 0; i < cat.units.length; i++) if (cat.units[i].id === id) return cat.units[i];
    return cat.units[0];
  }

  /* ---------- 4. SHARED RESULT CARD ---------- */
  function makeCard() {
    const card = el("div", "result-card");
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", "Result");
    const value = el("div", "result-card__value is-empty", "—");
    const detail = el("p", "result-card__detail");
    detail.hidden = true;
    const warns = el("div", "result-card__warnings");
    warns.hidden = true;
    const note = el("p", "result-card__note");
    card.append(value, detail, warns, note);
    return { card: card, value: value, detail: detail, warns: warns, note: note };
  }

  function paint(ui, d) {
    ui.value.textContent = "";
    if (d.valueText) {
      ui.value.classList.remove("is-empty");
      ui.value.append(d.valueText);
      if (d.unit) ui.value.append(el("span", "result-card__unit", " " + d.unit));
    } else {
      ui.value.classList.add("is-empty");
      ui.value.append("—");
    }
    ui.detail.textContent = d.detail || "";
    ui.detail.hidden = !d.detail;
    const items = (d.warnings || []).map(function (message) { return el("p", "result-card__warn", message); });
    ui.warns.replaceChildren.apply(ui.warns, items);
    ui.warns.hidden = items.length === 0;
    ui.note.textContent = d.note || "";
  }

  function makeActions() {
    const wrap = el("div", "tool__actions");
    const save = el("button", "btn btn--primary", "Save to history");
    save.type = "button";
    save.disabled = true;
    const use = el("button", "btn", "Use on calculator");
    use.type = "button";
    use.disabled = true;
    wrap.append(save, use);
    return { wrap: wrap, save: save, use: use };
  }

  const LIB = {
    "Dose": ["calc", "dose"], "Drip rate": ["calc", "drip"], "Pump rate": ["calc", "pump"], "Weight-based dose": ["calc", "weightdose"],
    "BMI": ["calc", "bmi"], "BSA (Mosteller)": ["calc", "bsa"], "MAP": ["calc", "map"], "Pulse pressure": ["calc", "map"],
    "Maintenance fluids": ["calc", "fluids"], "Holliday–Segar": ["calc", "fluids"], "Urine output": ["calc", "uop"],
    "Heparin rate": ["calc", "heparin"], "Titration": ["calc", "titration"], "Parkland burn": ["calc", "parkland"],
    "°C to °F": ["convert", "temperature", "c", "f"], "°F to °C": ["convert", "temperature", "f", "c"],
    "lb to kg": ["convert", "weight", "lb", "kg"], "mg to mcg": ["convert", "weight", "mg", "mcg"]
  };
  Object.assign(LIB, window.VERDANT_EXTRA_LIB || {});

  /* ---------- 5. NURSING TAB ---------- */
  const nr = {};
  let activeCalc = CALCS[0];
  let nursingOut = null;
  let drugCtx = null;

  nr.outOfBounds = false;
  nr.outOfBoundsMsg = "";
  nr.userConfirmed = false; 

  function renderFields() {
    const items = activeCalc.fields.map(function (f, i, all) {
      const wide = all.length % 2 === 1 && i === all.length - 1;
      const field = el("div", wide ? "field field--wide" : "field");
      const id = "nr-f-" + f.k;
      const label = el("label", "field__label", f.label + (f.optional ? " (optional)" : ""));
      label.htmlFor = id;
      let control;
      if (f.type === "select") {
        control = el("select", "control");
        control.id = id;
        f.options.forEach(function (pair) {
          const option = el("option", "", pair[1]);
          option.value = pair[0];
          control.append(option);
        });
        control.value = f.value;
      } else {
        const wrap = el("div", "input-wrap");
        const input = el("input", "control control--unit");
        input.type = "text";
        input.id = id;
        input.inputMode = "decimal";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.placeholder = f.ph;
        if (f.prefill !== undefined && f.prefill !== null) input.value = String(f.prefill);
        input.setAttribute("enterkeyhint", "done");
        input.setAttribute("aria-label", f.label + ", in " + f.unit + (f.optional ? ", optional" : ""));
        const unit = el("span", "input-wrap__unit", f.unit);
        unit.setAttribute("aria-hidden", "true");
        wrap.append(input, unit);
        control = wrap;
      }
      field.append(label, control);
      return field;
    });
    nr.form.replaceChildren.apply(nr.form, items);
  }

  function recomputeNursing() {
    const v = {};
    let missing = false, problem = "";
    nr.outOfBounds = false;
    nr.outOfBoundsMsg = "";
    nr.outOfBoundsTitle = "";

    activeCalc.fields.forEach(function (f) {
      const node = document.getElementById("nr-f-" + f.k);
      if (!node || !nr.form.contains(node)) { if (!f.optional) missing = true; v[f.k] = null; return; }
      if (f.type === "select") { v[f.k] = Number(node.value); return; }
      const n = parseNumber(node.value, false);
      v[f.k] = null;
      if (n === null) { if (!f.optional) missing = true; return; }
      if (Number.isNaN(n) || n < 0 || (n === 0 && !f.zero) || n > 1e7) { if (!problem) problem = f.label + (f.zero ? " must be a number of 0 or more." : " must be a number above 0."); return; }
      
      const limits = getLimits(f.unit);
      if (n < limits[0] || n > limits[1]) {
        nr.outOfBounds = true;
        nr.outOfBoundsTitle = "Physiological Limit Warning";
        nr.outOfBoundsMsg = `The value for ${f.label} (${n} ${f.unit}) is outside normal physiological limits. Please verify your entry.`;
      }

      v[f.k] = n;
    });

    nursingOut = null;
    if (problem) {
      paint(nr.ui, { warnings: [problem], note: activeCalc.note });
    } else if (missing) {
      paint(nr.ui, { detail: "Fill in the fields above.", note: activeCalc.note });
    } else {
      const out = activeCalc.compute(v);
      if (out.error) {
        paint(nr.ui, { warnings: [out.error], note: activeCalc.note });
      } else if (!Number.isFinite(out.value) || Math.abs(out.value) > 1e9) {
        paint(nr.ui, { warnings: ["That result is out of range. Check the numbers."], note: activeCalc.note });
      } else {
        const valueText = out.text || fmt(out.value, out.dp);
        if (out.limit) {
          nr.outOfBoundsMsg = nr.outOfBounds ? nr.outOfBoundsMsg + " " + out.limit.msg : out.limit.msg;
          nr.outOfBounds = true;
          nr.outOfBoundsTitle = out.limit.title;
        }
        const expression = out.parts.join(" ");
        paint(nr.ui, { valueText: valueText, unit: out.unit, detail: out.detail, warnings: out.warnings, note: activeCalc.note });
        nursingOut = {
          text: activeCalc.label + ": " + expression + " = " + valueText + " " + out.unit,
          valueText: valueText,
          tokens: out.parts.concat(["=", valueText]),
          spoken: activeCalc.label + ": " + valueText + " " + out.unit + (out.detail ? ". " + out.detail : "") + (out.warnings.length ? ". Warning: " + out.warnings.join(" ") : "")
        };
      }
    }
    
    nr.actions.save.disabled = !nursingOut;
    nr.actions.use.disabled = !nursingOut || !/^-?[0-9.]+$/.test(nursingOut.valueText);
  }

  function selectCalc(id, keepDrug) {
    const calc = CALC_BY_ID[id];
    if (!calc) return;
    if (!keepDrug) drugCtx = null;
    activeCalc = calc;
    nr.select.value = id;
    nr.formula.textContent = "Formula: " + calc.formula;
    nr.userConfirmed = false;
    renderFields();
    if (!calc.hidden) remember(id);
    renderBanner();
    recomputeNursing();
  }

  (function buildNursing() {
    const selectField = el("div", "field");
    const label = el("label", "field__label", "Calculator");
    label.htmlFor = "nr-select";
    nr.select = el("select", "control");
    nr.select.id = "nr-select";
    CALCS.forEach(function (c) {
      const option = el("option", "", c.name);
      option.value = c.id;
      if (c.hidden) option.hidden = true;
      nr.select.append(option);
    });
    selectField.append(label, nr.select);

    nr.formula = el("p", "tool__formula");
    nr.banner = el("div", "drug-context");
    nr.banner.hidden = true;
    nr.form = el("form", "tool__form");
    nr.form.noValidate = true;
    nr.form.addEventListener("submit", function (event) { event.preventDefault(); });
    nr.ui = makeCard();
    nr.actions = makeActions();
    const disclaimer = el("p", "tool__disclaimer", "Clinical Decision Support Tool. Does not replace clinical judgment or the prescriber's order. Always verify high-alert medications with a second clinician and follow facility protocols. No patient identifiers are stored.");

    nr.select.addEventListener("change", function () { 
      selectCalc(nr.select.value); 
    });
    
    nr.form.addEventListener("input", function() {
      nr.snoozed = false;
      nr.userConfirmed = false; 
      syncStrengthLabel();
      recomputeNursing();
    });
    
    nr.form.addEventListener("focusout", function (event) {
      if (!nr.form.contains(event.target)) return;
      const to = event.relatedTarget;
      if (to && to.closest && (to.closest(".library") || to.closest(".drug-context"))) return;
      recomputeNursing();
      if (nr.outOfBounds && !nr.userConfirmed && !nr.snoozed) {
        showClinicalWarning(nr.outOfBoundsMsg, nr.outOfBoundsTitle);
      }
    });

    nr.actions.save.addEventListener("click", function () {
      if (nr.outOfBounds && !nr.userConfirmed) {
        showClinicalWarning(nr.outOfBoundsMsg, nr.outOfBoundsTitle);
        return;
      }
      if (nursingOut) V.record(nursingOut.text, nursingOut.valueText, nursingOut.tokens, nursingOut.spoken);
    });

    nr.actions.use.addEventListener("click", function () {
      if (nr.outOfBounds && !nr.userConfirmed) {
        showClinicalWarning(nr.outOfBoundsMsg, nr.outOfBoundsTitle);
        return;
      }
      if (nursingOut) V.useValue(nursingOut.valueText);
    });

    nursingPanel.append(selectField, nr.formula, nr.banner, nr.form, nr.ui.card, nr.actions.wrap, disclaimer, buildLibrary(), buildDrugLibrary());

    const saved = recall();
    selectCalc(saved && CALC_BY_ID[saved] && !CALC_BY_ID[saved].hidden ? saved : CALCS[0].id);
  })();

  /* ---------- 6. FORMULA LIBRARY ---------- */
  function openFromLibrary(name) {
    const target = LIB[name];
    if (!target) return;
    if (target[0] === "calc") {
      V.setMode("nursing");
      selectCalc(target[1]);
    } else {
      V.setMode("convert");
      setConvert(target[1], target[2], target[3]);
    }
    const first = target[0] === "calc" ? nr.form.querySelector("input, select") : cv.value;
    if (first) first.focus();
  }

  function buildLibrary() {
    const formulas = Array.isArray(window.VERDANT_FORMULAS) ? window.VERDANT_FORMULAS : [];
    const details = el("details", "library");
    if (!formulas.length) { details.hidden = true; return details; }
    const summary = el("summary", "", "Formula library (" + formulas.length + ")");
    const search = el("input", "control");
    search.type = "search";
    search.placeholder = "Search formulas";
    search.autocomplete = "off";
    search.setAttribute("aria-label", "Search formulas");
    const list = el("ul", "library__list");
    const empty = el("p", "library__empty", "No formula matches that search.");
    empty.hidden = true;

    function draw() {
      const query = search.value.trim().toLowerCase();
      const matches = formulas.filter(function (f) { return (f[0] + " " + f[1]).toLowerCase().indexOf(query) !== -1; });
      const rows = matches.map(function (f) {
        const row = el("li", "library__row");
        const text = el("div", "library__text");
        text.append(el("span", "library__name", f[0]), el("span", "library__formula", f[1]));
        row.append(text);
        if (LIB[f[0]]) {
          const open = el("button", "btn btn--small", "Open");
          open.type = "button";
          open.dataset.name = f[0];
          open.setAttribute("aria-label", "Open the " + f[0] + " calculator");
          row.append(open);
        }
        return row;
      });
      list.replaceChildren.apply(list, rows);
      empty.hidden = rows.length > 0;
    }
    search.addEventListener("input", draw);
    list.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-name]");
      if (button) openFromLibrary(button.dataset.name);
    });
    draw();
    details.append(summary, search, list, empty);
    return details;
  }

  /* ---------- 7. CONVERT TAB ---------- */
  const cv = {};
  let convertOut = null;

  function fillUnits(catId, fromId, toId) {
    const cat = CAT_BY_ID[catId] || CATS[0];
    [cv.from, cv.to].forEach(function (select) {
      select.replaceChildren();
      cat.units.forEach(function (u) {
        const option = el("option", "", u.label);
        option.value = u.id;
        select.append(option);
      });
    });
    cv.from.value = fromId || cat.defaults[0];
    cv.to.value = toId || cat.defaults[1];
  }

  function setConvert(catId, fromId, toId) {
    if (!CAT_BY_ID[catId]) return;
    cv.cat.value = catId;
    fillUnits(catId, fromId, toId);
    recomputeConvert();
  }

  function recomputeConvert() {
    const cat = CAT_BY_ID[cv.cat.value] || CATS[0];
    const from = unitOf(cat, cv.from.value), to = unitOf(cat, cv.to.value);
    const n = parseNumber(cv.value.value, cat.id === "temperature");
    convertOut = null;
    if (n === null) {
      paint(cv.ui, { detail: "Enter a value above.", note: cat.note });
    } else if (Number.isNaN(n) || Math.abs(n) > 1e12) {
      paint(cv.ui, { warnings: [cat.id === "temperature" ? "Enter a number." : "Enter a number of 0 or more."], note: cat.note });
    } else if (cat.id === "temperature" && from.to(n) < -273.15 - 1e-9) {
      paint(cv.ui, { warnings: ["That is below absolute zero."], note: cat.note });
    } else {
      const result = to.from(from.to(n));
      const valueText = sig(result), inputText = sig(n);
      let detail = "";
      if (cat.linear) detail = "1 " + from.label + " = " + sig(to.from(from.to(1))) + " " + to.label;
      paint(cv.ui, { valueText: valueText, unit: to.label, detail: detail, note: cat.note });
      convertOut = {
        text: inputText + " " + from.label + " = " + valueText + " " + to.label,
        valueText: valueText,
        tokens: [inputText + " " + from.label, "=", valueText + " " + to.label],
        spoken: inputText + " " + from.label + " equals " + valueText + " " + to.label
      };
    }
    cv.actions.save.disabled = !convertOut;
    cv.actions.use.disabled = !convertOut;
  }

  (function buildConvert() {
    const catField = el("div", "field");
    const catLabel = el("label", "field__label", "Measure");
    catLabel.htmlFor = "cv-cat";
    cv.cat = el("select", "control");
    cv.cat.id = "cv-cat";
    CATS.forEach(function (c) {
      const option = el("option", "", c.label);
      option.value = c.id;
      cv.cat.append(option);
    });
    catField.append(catLabel, cv.cat);

    const valueField = el("div", "field");
    const valueLabel = el("label", "field__label", "Value");
    valueLabel.htmlFor = "cv-value";
    cv.value = el("input", "control");
    cv.value.type = "text";
    cv.value.id = "cv-value";
    cv.value.inputMode = "decimal";
    cv.value.autocomplete = "off";
    cv.value.spellcheck = false;
    cv.value.placeholder = "e.g. 70";
    cv.value.setAttribute("enterkeyhint", "done");
    valueField.append(valueLabel, cv.value);

    const row = el("div", "convert-row");
    const fromField = el("div", "field");
    const fromLabel = el("label", "field__label", "From");
    fromLabel.htmlFor = "cv-from";
    cv.from = el("select", "control");
    cv.from.id = "cv-from";
    fromField.append(fromLabel, cv.from);
    const toField = el("div", "field");
    const toLabel = el("label", "field__label", "To");
    toLabel.htmlFor = "cv-to";
    cv.to = el("select", "control");
    cv.to.id = "cv-to";
    toField.append(toLabel, cv.to);
    const swap = el("button", "btn btn--icon", "⇄");
    swap.type = "button";
    swap.setAttribute("aria-label", "Swap the two units");
    row.append(fromField, swap, toField);

    cv.ui = makeCard();
    cv.actions = makeActions();
    const disclaimer = el("p", "tool__disclaimer", "Clinical Decision Support Tool. Always double-check conversions that affect a medication dose against the prescriber's order.");

    cv.cat.addEventListener("change", function () { fillUnits(cv.cat.value); recomputeConvert(); });
    cv.value.addEventListener("input", recomputeConvert);
    cv.value.addEventListener("change", function () { if (convertOut) V.speak(convertOut.spoken); });
    [cv.from, cv.to].forEach(function (select) {
      select.addEventListener("change", function () { recomputeConvert(); if (convertOut) V.speak(convertOut.spoken); });
    });
    swap.addEventListener("click", function () {
      const keep = cv.from.value;
      cv.from.value = cv.to.value;
      cv.to.value = keep;
      recomputeConvert();
      if (convertOut) V.speak(convertOut.spoken);
    });
    cv.actions.save.addEventListener("click", function () {
      if (convertOut) V.record(convertOut.text, convertOut.valueText, convertOut.tokens, convertOut.spoken);
    });
    cv.actions.use.addEventListener("click", function () {
      if (convertOut) V.useValue(convertOut.valueText);
    });

    convertPanel.append(catField, valueField, row, cv.ui.card, cv.actions.wrap, disclaimer);
    fillUnits(CATS[0].id);
    recomputeConvert();
  })();

  /* ---------- 8. LIMIT WARNING MODAL ---------- */
  const limitStyle = document.createElement("style");
  limitStyle.textContent = `
    .vlimit { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 16px; background: rgba(10, 20, 14, 0.6); }
    .vlimit.is-open { display: flex; }
    .vlimit__box { width: min(440px, 100%); padding: 22px; border-radius: 16px; background: var(--panel, #ffffff); color: var(--ink, #14231a); border: 2px solid #c45c3a; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4); }
    .vlimit__head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #c45c3a; }
    .vlimit__head h2 { margin: 0; font-size: 18px; line-height: 1.2; }
    .vlimit__text { margin: 0 0 18px; font-size: 15px; line-height: 1.5; }
    .vlimit__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
  `;
  document.head.appendChild(limitStyle);

  const limitModal = el("div", "vlimit");
  limitModal.id = "verdant-limit-modal";
  limitModal.setAttribute("aria-hidden", "true");
  const limitBox = el("div", "vlimit__box");
  limitBox.setAttribute("role", "alertdialog");
  limitBox.setAttribute("aria-modal", "true");
  limitBox.setAttribute("aria-labelledby", "vlimit-title");
  limitBox.setAttribute("aria-describedby", "vlimit-text");
  limitBox.tabIndex = -1;
  const limitHead = el("div", "vlimit__head");
  limitHead.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>');
  const limitTitle = el("h2", "", "Physiological Limit Warning");
  limitTitle.id = "vlimit-title";
  limitHead.append(limitTitle);
  const limitText = el("p", "vlimit__text");
  limitText.id = "vlimit-text";
  const limitActions = el("div", "vlimit__actions");
  const limitCancel = el("button", "btn", "Edit entry");
  limitCancel.type = "button";
  const limitConfirm = el("button", "btn btn--primary", "I am sure, proceed");
  limitConfirm.type = "button";
  limitActions.append(limitCancel, limitConfirm);
  limitBox.append(limitHead, limitText, limitActions);
  limitModal.append(limitBox);
  document.body.append(limitModal);

  function closeLimit() {
    limitModal.classList.remove("is-open");
    limitModal.setAttribute("aria-hidden", "true");
  }
  function showClinicalWarning(message, title) {
    if (limitModal.classList.contains("is-open")) return;
    limitTitle.textContent = title || "Physiological Limit Warning";
    limitText.textContent = message;
    limitModal.classList.add("is-open");
    limitModal.setAttribute("aria-hidden", "false");
    limitCancel.focus();
  }
  function cancelLimit() {
    closeLimit();
    nr.snoozed = true;
    const firstInput = nr.form.querySelector("input");
    if (firstInput) firstInput.focus();
  }
  limitCancel.addEventListener("click", cancelLimit);
  limitModal.addEventListener("click", function (event) { if (event.target === limitModal) cancelLimit(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && limitModal.classList.contains("is-open")) { event.stopPropagation(); cancelLimit(); }
  }, true);
  limitConfirm.addEventListener("click", function () {
    closeLimit();
    nr.userConfirmed = true;
    if (nursingOut) {
      nr.actions.save.disabled = false;
      nr.actions.use.disabled = !/^-?[0-9.]+$/.test(nursingOut.valueText);
    }
  });

  /* ---------- 9. DRUG REFERENCE LIBRARY ---------- */
  const drugStyle = document.createElement("style");
  drugStyle.textContent = `
    .drug-card { background: var(--panel); border: 1px solid var(--edge); border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .drug-name { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
    .drug-category { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 12px; font-weight: 600; }
    .drug-info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; }
    .drug-label { font-weight: 600; color: var(--ink); min-width: 80px; }
    .drug-value { color: var(--ink-dim); flex: 1; }
    .drug-dose { margin-bottom: 10px; }
    .drug-dose .drug-info-row { margin-bottom: 6px; }
    .drug-open { margin-left: 88px; }
    .drug-warning { background: var(--warn-bg); color: var(--warn-ink); padding: 8px; border-radius: 8px; font-size: 13px; margin-top: 12px; border: 1px solid rgba(196, 92, 58, 0.3); }
    [data-theme="dark"] .drug-card { background: rgba(20, 35, 25, 0.85); border-color: rgba(255, 255, 255, 0.1); }
    .drug-context { margin: 4px 0 12px; padding: 12px 14px; border-radius: 12px; background: var(--panel); border: 1px solid var(--edge); border-left: 4px solid var(--accent); font-size: 13px; }
    .drug-context[hidden] { display: none; }
    .drug-context__head { font-size: 15px; color: var(--ink); margin-bottom: 4px; }
    .drug-context__ref { margin: 2px 0; color: var(--ink-dim); }
    .drug-context__warn { margin: 8px 0 0; padding: 6px 8px; border-radius: 8px; background: var(--warn-bg); color: var(--warn-ink); }
    .drug-context__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  `;
  document.head.appendChild(drugStyle);

  function canCalculate(text) { return parseDoseText(text).kind !== "none"; }

  function renderBanner() {
    const box = nr.banner;
    if (!drugCtx) { box.hidden = true; box.replaceChildren(); return; }
    const d = drugCtx.drug, info = drugCtx.info;
    const head = el("div", "drug-context__head");
    head.append(el("strong", "", d.name), el("span", "", " · " + (drugCtx.group === "adult" ? "Adult" : "Child")));
    const rows = [head, el("p", "drug-context__ref", "Reference dose: " + drugCtx.text)];
    if (d.formulation) rows.push(el("p", "drug-context__ref", "Comes as: " + d.formulation));
    if (info.kind === "other" || info.count > 1) {
      rows.push(el("p", "drug-context__ref", "The reference gives more than one dose or a special regimen, so no dose is filled in. Enter the dose from the order."));
    }
    if (d.warning) rows.push(el("p", "drug-context__warn", "⚠ " + d.warning));

    const actions = el("div", "drug-context__actions");
    const back = el("button", "btn btn--small", "Back to drug list");
    back.type = "button";
    back.addEventListener("click", function () {
      if (nr.drugDetails) { nr.drugDetails.open = true; nr.drugDetails.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    const clear = el("button", "btn btn--small", "Clear drug");
    clear.type = "button";
    clear.addEventListener("click", function () { selectCalc(CALCS[0].id); });
    actions.append(back, clear);
    rows.push(actions);
    box.replaceChildren.apply(box, rows);
    box.hidden = false;
  }

  function openDrug(drug, group) {
    const text = group === "adult" ? drug.adultDose : drug.pediatricDose;
    const generic = /blood product/i.test(drug.category || "");
    const info = generic ? parseDoseText("") : parseDoseText(text);
    if (generic) info.kind = "other";
    const ctx = { drug: drug, group: group, text: text, info: info, calcId: "dose" };

    if (info.kind === "perMin" && info.unit === "mcg") ctx.calcId = "titration";
    else if (info.kind === "perKg" || info.kind === "perKgDay" || info.kind === "fixed") ctx.calcId = "drugdose";

    drugCtx = ctx;
    if (ctx.calcId === "drugdose") buildDrugCalc(ctx);
    V.setMode("nursing");
    selectCalc(ctx.calcId, true);

    if (ctx.calcId === "titration" && info.count === 1 && info.lo !== null) {
      const dose = document.getElementById("nr-f-dose");
      if (dose) { dose.value = fmt(info.lo, 4); nr.form.dispatchEvent(new Event("input", { bubbles: true })); }
    }
    renderBanner();

    nr.select.scrollIntoView({ behavior: "smooth", block: "start" });
    const inputs = Array.prototype.slice.call(nr.form.querySelectorAll("input"));
    const empty = inputs.filter(function (i) { return !i.value; })[0] || inputs[0];
    if (empty) empty.focus({ preventScroll: true });
  }

  function buildDrugLibrary() {
    const drugs = Array.isArray(window.VERDANT_DRUGS) ? window.VERDANT_DRUGS : [];
    if (!drugs.length) {
      console.warn("Verdant: window.VERDANT_DRUGS is empty or missing. Check that the drug data file is loaded BEFORE tools.js.");
      const none = el("details", "library");
      none.hidden = true;
      return none;
    }

    const details = el("details", "library");
    nr.drugDetails = details;
    const summary = el("summary", "", "Drug Reference (" + drugs.length + ")");

    const search = el("input", "control");
    search.type = "search";
    search.placeholder = "Search drugs (e.g. Paracetamol)";
    search.autocomplete = "off";
    search.setAttribute("aria-label", "Search drugs");

    const list = el("div", "library__list");

    function doseBlock(d, label, text, group) {
      const wrap = el("div", "drug-dose");
      const row = el("div", "drug-info-row");
      row.append(el("span", "drug-label", label), el("span", "drug-value", text));
      wrap.append(row);
      if (canCalculate(text)) {
        const open = el("button", "btn btn--small drug-open", "Open calculator");
        open.type = "button";
        open.setAttribute("aria-label", "Open the " + d.name + " " + (group === "adult" ? "adult" : "child") + " dose calculator");
        open.addEventListener("click", function () { openDrug(d, group); });
        wrap.append(open);
      }
      return wrap;
    }

    function draw() {
      const query = search.value.trim().toLowerCase();
      const matches = drugs.filter(function (d) {
        return (d.name + " " + d.category).toLowerCase().indexOf(query) !== -1;
      });

      const cards = matches.map(function (d) {
        const card = el("div", "drug-card");
        card.append(el("div", "drug-name", d.name));
        card.append(el("div", "drug-category", d.category));

        const formRow = el("div", "drug-info-row");
        formRow.append(el("span", "drug-label", "Formulations:"));
        formRow.append(el("span", "drug-value", d.formulation));
        card.append(formRow);

        card.append(doseBlock(d, "Adult:", d.adultDose, "adult"));
        card.append(doseBlock(d, "Pediatric:", d.pediatricDose, "child"));

        if (d.warning) card.append(el("div", "drug-warning", "⚠ " + d.warning));
        return card;
      });

      list.replaceChildren.apply(list, cards);
    }

    search.addEventListener("input", draw);
    draw();

    details.append(summary, search, list);
    return details;
  }

})();