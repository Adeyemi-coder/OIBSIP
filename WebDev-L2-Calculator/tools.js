
"use strict";

(function () {
  const nursingPanel = document.getElementById("panel-nursing");
  const convertPanel = document.getElementById("panel-convert");
  if (!nursingPanel || !convertPanel) return;

  const noop = function () {};
  // If script.js ever failed to load, the tools still work; only save / use / announce do nothing
  const V = window.Verdant || { useValue: noop, record: noop, speak: noop, toast: noop, setMode: noop };

  /* ---------- 1. HELPERS ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // "12,5" and "12.5" both work. Returns null (empty), NaN (not a number) or the number.
  function parseNumber(raw, allowNegative) {
    const text = String(raw).trim().replace(",", ".");
    if (text === "") return null;
    const pattern = allowNegative ? /^-?([0-9]+\.?[0-9]*|\.[0-9]+)$/ : /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    return pattern.test(text) ? Number(text) : NaN;
  }

  // Round to dp decimals without trailing zeros. Tiny non-zero results keep 2 significant digits instead of showing 0.
  function fmt(n, dp) {
    if (n !== 0 && Math.abs(n) < Math.pow(10, -dp)) return String(Number(n.toPrecision(2)));
    return String(Number(n.toFixed(dp)));
  }

  // Converter output: 8 significant digits removes float noise (1 g to mcg is 1000000, not 1000000.0000000001)
  function sig(n) {
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1e12 || abs < 1e-6) return Number(n.toPrecision(5)).toExponential().replace("+", "");
    return String(Number(n.toPrecision(8)));
  }

  function remember(id) { try { localStorage.setItem("verdant.tool", id); } catch (error) { /* storage can be blocked */ } }
  function recall() { try { return localStorage.getItem("verdant.tool"); } catch (error) { return null; } }

  /* ---------- 2. NURSING CALCULATORS ----------
     Each calculator: fields to fill in, and compute(v) which returns
       { value, dp, unit, parts, detail, warnings }   or   { error: "message" }
     "parts" is the working shown in history and in the equation tunnel, e.g. ["250","÷","500","×","2"]. */
  function numField(key, label, unit, placeholder, optional) {
    return { k: key, label: label, unit: unit, ph: placeholder || "", optional: !!optional };
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
        return { value: r, dp: 1, unit: "gtt/min", parts: [fmt(v.vol, 4), "×", fmt(v.df, 0), "÷", fmt(v.min, 4)],
          detail: "Set about " + Math.round(r) + " drops/min (" + fmt(v.vol / v.min * 60, 1) + " mL/hr)", warnings: [] };
      }
    },
    {
      id: "pump", name: "Pump rate (mL/hr)", label: "Pump rate", formula: "volume ÷ hours = mL/hr",
      note: "",
      fields: [numField("vol", "Volume", "mL", "e.g. 1000"), numField("hrs", "Time", "hours", "e.g. 8")],
      compute: function (v) {
        const r = v.vol / v.hrs, w = [];
        if (r > 999) w.push("Above the limit of most pumps (999 mL/hr). Check the volume and time.");
        return { value: r, dp: 1, unit: "mL/hr", parts: [fmt(v.vol, 4), "÷", fmt(v.hrs, 4)], detail: "Over " + fmt(v.hrs, 2) + " h", warnings: w };
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
      id: "fluids", name: "Maintenance fluids (4-2-1)", label: "Maintenance fluids", formula: "4 + 2 + 1 mL/kg/hr",
      note: "Maintenance only. It does not replace deficits or ongoing losses.",
      fields: [numField("kg", "Weight", "kg", "e.g. 20")],
      compute: function (v) {
        const kg = v.kg;
        const hourly = kg <= 10 ? 4 * kg : kg <= 20 ? 40 + 2 * (kg - 10) : 60 + (kg - 20);
        const daily = kg <= 10 ? 100 * kg : kg <= 20 ? 1000 + 50 * (kg - 10) : 1500 + 20 * (kg - 20);
        const w = checkBody(undefined, kg);
        if (hourly > 100) w.push("Above 100 mL/hr. Adult maximums are often capped there, so check the order.");
        return { value: hourly, dp: 1, unit: "mL/hr", parts: ["4-2-1 rule for " + fmt(kg, 4) + " kg"], detail: "About " + fmt(daily, 0) + " mL/day by Holliday–Segar (100/50/20)", warnings: w };
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
  const CALC_BY_ID = {};
  CALCS.forEach(function (c) { CALC_BY_ID[c.id] = c; });

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

  // d = { valueText, unit, detail, warnings[], note }. No valueText shows the empty dash.
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

  // Library formulas that have a calculator or a converter preset get an "Open" button.
  // Declared before the tabs are built, because building the library reads it straight away.
  const LIB = {
    "Dose": ["calc", "dose"], "Drip rate": ["calc", "drip"], "Pump rate": ["calc", "pump"], "Weight-based dose": ["calc", "weightdose"],
    "BMI": ["calc", "bmi"], "BSA (Mosteller)": ["calc", "bsa"], "MAP": ["calc", "map"], "Pulse pressure": ["calc", "map"],
    "Maintenance fluids": ["calc", "fluids"], "Holliday–Segar": ["calc", "fluids"], "Urine output": ["calc", "uop"],
    "Heparin rate": ["calc", "heparin"], "Titration": ["calc", "titration"], "Parkland burn": ["calc", "parkland"],
    "°C to °F": ["convert", "temperature", "c", "f"], "°F to °C": ["convert", "temperature", "f", "c"],
    "lb to kg": ["convert", "weight", "lb", "kg"], "mg to mcg": ["convert", "weight", "mg", "mcg"]
  };

  /* ---------- 5. NURSING TAB ---------- */
  const nr = {};
  let activeCalc = CALCS[0];
  let nursingOut = null;                       // the current valid result, ready to save

  function renderFields() {
    const items = activeCalc.fields.map(function (f, i, all) {
      const wide = all.length % 2 === 1 && i === all.length - 1;     // an odd last field spans both columns
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
    activeCalc.fields.forEach(function (f) {
      const node = document.getElementById("nr-f-" + f.k);
      // A field that is not on screen (for example while the calculator is being switched) counts as "not filled in yet"
      if (!node || !nr.form.contains(node)) { if (!f.optional) missing = true; v[f.k] = null; return; }
      if (f.type === "select") { v[f.k] = Number(node.value); return; }
      const n = parseNumber(node.value, false);
      v[f.k] = null;
      if (n === null) { if (!f.optional) missing = true; return; }
      if (Number.isNaN(n) || n <= 0 || n > 1e7) { if (!problem) problem = f.label + " must be a number above 0."; return; }
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
        const valueText = fmt(out.value, out.dp);
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
    nr.actions.use.disabled = !nursingOut;
  }

  function selectCalc(id) {
    const calc = CALC_BY_ID[id];
    if (!calc) return;
    activeCalc = calc;
    nr.select.value = id;
    nr.formula.textContent = "Formula: " + calc.formula;
    renderFields();
    remember(id);
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
      nr.select.append(option);
    });
    selectField.append(label, nr.select);

    nr.formula = el("p", "tool__formula");
    nr.form = el("form", "tool__form");
    nr.form.noValidate = true;
    nr.form.addEventListener("submit", function (event) { event.preventDefault(); });
    nr.ui = makeCard();
    nr.actions = makeActions();
    const disclaimer = el("p", "tool__disclaimer", "Study aid only. Check results against your facility protocols, and have high-alert medications verified by a second nurse or your pharmacist. Nothing is stored unless you press Save to history.");

    nr.select.addEventListener("change", function () { selectCalc(nr.select.value); });
    nr.form.addEventListener("input", recomputeNursing);
    nr.form.addEventListener("change", function (event) {                  // fires when a field is left: read the result aloud
      if (!nr.form.contains(event.target)) return;                         // a field that was just replaced by switching calculators
      recomputeNursing();
      if (nursingOut) V.speak(nursingOut.spoken);
    });
    nr.actions.save.addEventListener("click", function () {
      if (nursingOut) V.record(nursingOut.text, nursingOut.valueText, nursingOut.tokens, nursingOut.spoken);
    });
    nr.actions.use.addEventListener("click", function () {
      if (nursingOut) V.useValue(nursingOut.valueText);
    });

    nursingPanel.append(selectField, nr.formula, nr.form, nr.ui.card, nr.actions.wrap, disclaimer, buildLibrary());

    const saved = recall();
    selectCalc(saved && CALC_BY_ID[saved] ? saved : CALCS[0].id);
  })();

  /* ---------- 6. FORMULA LIBRARY (the same 40 formulas that float behind the calculator) ---------- */
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
    const disclaimer = el("p", "tool__disclaimer", "Study aid only. Double-check conversions that affect a dose.");

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
})();