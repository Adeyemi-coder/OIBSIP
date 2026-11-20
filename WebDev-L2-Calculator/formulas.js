"use strict";

(function () {
  /* ---------- 1. THE FORMULAS (name, formula). The Nursing library and the pop-up scene both read this ---------- */
  const FORMULAS = [
    ["BMI", "weight kg ÷ height m²"],
    ["Drip rate", "volume × drop factor ÷ minutes = gtt/min"],
    ["Pump rate", "volume ÷ hours = mL/hr"],
    ["Dose", "desired ÷ have × quantity"],
    ["Weight-based dose", "mg/kg × weight kg"],
    ["BSA (Mosteller)", "√(height cm × weight kg ÷ 3600)"],
    ["MAP", "(SBP + 2 × DBP) ÷ 3"],
    ["Pulse pressure", "SBP − DBP"],
    ["Cardiac output", "HR × stroke volume ÷ 1000 = L/min"],
    ["Maintenance fluids", "4 mL/kg/hr (first 10 kg) + 2 (next 10 kg) + 1 (each kg above 20); adjust clinically"],
    ["Holliday–Segar", "100 mL/kg (first 10 kg) + 50 (next 10 kg) + 20 (each kg above 20) per day; not a prescription"],
    ["°C to °F", "°C × 9/5 + 32"],
    ["°F to °C", "(°F − 32) × 5/9"],
    ["lb to kg", "lb ÷ 2.20462"],
    ["Anion gap", "Na − (Cl + HCO₃)"],
    ["Corrected calcium", "Ca + 0.8 × (4 − albumin), with Ca mg/dL and albumin g/dL; may be inaccurate in critical illness/CKD"],
    ["Urine output", "mL ÷ (kg × hours)"],
    ["Heparin rate", "units/hr ÷ units/mL = mL/hr"],
    ["Percent solution", "grams ÷ final volume (mL) × 100 = % w/v"],
    ["Dilution", "C₁ × V₁ = C₂ × V₂"],
    ["Titration", "dose × kg × 60 ÷ mcg/mL = mL/hr"],
    ["mg to mcg", "mg × 1000"],
    ["Naegele’s rule", "LMP + 7 days − 3 months + 1 year"],
    ["Apgar", "HR + breathing + tone + reflex + colour"],
    ["Glasgow Coma Scale", "eye + verbal + motor"],
    ["Fluid balance", "intake − output"],
    ["Minute ventilation", "tidal volume × RR ÷ 1000 = L/min"],
    ["Ideal weight (male)", "50 + 2.3 × inches over 60"],
    ["Ideal weight (female)", "45.5 + 2.3 × inches over 60"],
    ["Creatinine clearance", "(140 − age) × weight kg ÷ (72 × SCr mg/dL); legacy female factor 0.85"],
    ["Parkland burn", "Traditional estimate: 4 mL × kg × %TBSA; half in first 8 hours from time of burn; titrate to response/protocol"],
    ["mL/hr to gtt/min", "mL/hr × drop factor ÷ 60"],
    ["ECG heart rate", "300 ÷ large boxes"],
    ["Max heart rate", "220 − age (rough population estimate; not a diagnostic or individual target)"],
    ["Clark’s rule", "weight lb ÷ 150 × adult dose"],
    ["Young’s rule", "age ÷ (age + 12) × adult dose"],
    ["Insulin correction", "1800 ÷ total daily dose = mg/dL per unit"],
    ["Carb ratio", "500 ÷ total daily dose = g per unit"],
    ["Shock index", "HR ÷ SBP"],
    ["Percent change", "(new − old) ÷ old × 100"],
    ["Corrected sodium (hyperglycaemia)", "Measured Na + 1.6 × [(glucose − 100) ÷ 100] (mg/dL)"],
    ["Calculated serum osmolality", "2 × Na + glucose ÷ 18 + BUN ÷ 2.8 (conventional US units)"],
    ["Osmolal gap", "Measured osmolality − calculated osmolality"],
    ["Free water deficit", "TBW × [(serum Na ÷ 140) − 1]"],
    ["Fractional excretion of sodium (FENa)", "(Urine Na × plasma creatinine) ÷ (plasma Na × urine creatinine) × 100"],
    ["Fractional excretion of urea (FEUrea)", "(Urine urea × plasma creatinine) ÷ (plasma urea × urine creatinine) × 100"],
    ["PaO₂/FiO₂ ratio", "PaO₂ (mmHg) ÷ FiO₂ (decimal)"],
    ["Oxygen content (CaO₂)", "1.34 × Hb × SaO₂ + 0.003 × PaO₂"],
    ["Alveolar oxygen (PAO₂)", "FiO₂ × (Patm − PH₂O) − PaCO₂ ÷ RQ"],
    ["A–a oxygen gradient", "PAO₂ − PaO₂"],
    ["QTc (Bazett)", "QT ÷ √RR (seconds)"],
    ["QTc (Fridericia)", "QT ÷ RR^(1/3) (seconds)"],
    ["Ejection fraction", "(EDV − ESV) ÷ EDV × 100"],
    ["Systemic vascular resistance", "(MAP − CVP) ÷ CO × 80"],
    ["Oxygen delivery (DO₂)", "Cardiac output × CaO₂ × 10"],
    ["Adjusted body weight", "IBW + 0.4 × (actual weight − IBW)"],
    ["Body surface area (Du Bois)", "0.007184 × height(cm)^0.725 × weight(kg)^0.425"],
    ["Corrected phenytoin (Sheiner–Tozer)", "Measured phenytoin ÷ [0.2 × albumin + 0.1]"],
    ["Corrected phenytoin (renal impairment)", "Measured phenytoin ÷ [0.1 × albumin + 0.1]"],
    ["Sodium deficit", "TBW × (desired Na − measured Na)"],
    ["Infusion time", "Total volume ÷ rate (mL/hr)"],
    ["Infusion rate", "Total volume ÷ time (hours)"],
    ["Dose volume", "Required dose ÷ concentration"],
    ["Concentration", "Amount of drug ÷ total volume"],
    ["Glucose mmol/L to mg/dL", "mmol/L × 18"],
    ["Glucose mg/dL to mmol/L", "mg/dL ÷ 18"],
    ["Temperature change", "Final temperature − initial temperature"],
    ["Corrected reticulocyte count", "Reticulocyte % × patient Hct ÷ normal Hct"],
    ["Reticulocyte production index", "Corrected reticulocyte % ÷ maturation factor"],
    ["Absolute neutrophil count (ANC)", "WBC × (neutrophil % + band %) ÷ 100"],

    /* ---- Paediatric additions ---- */
    ["Fried’s rule", "age in months ÷ 150 × adult dose"],
    ["APLS weight estimate", "(age + 4) × 2 kg"],
    ["ET tube size (uncuffed)", "(age ÷ 4) + 4 mm"],
    ["Paediatric defibrillation", "first 2 J/kg, then 4 J/kg"],
    ["Paediatric fluid bolus", "Prescribed mL/kg × weight; select dose by clinical context and current protocol; reassess after each bolus"],
    ["Paediatric blood volume", "neonates 80 mL/kg, children 70 mL/kg"],
    ["Paediatric urine output", "mL ÷ (kg × hours)"],
    ["BSA dose", "BSA m² × dose per m²"],
    ["Paediatric GCS", "eye + verbal + motor (age-adjusted)"],
    ["Paediatric transfusion volume", "Prescribed PRBC dose (mL/kg) × weight; indication and volume are patient- and guideline-specific"]
  ];
  window.VERDANT_FORMULAS = FORMULAS;


  /* ---------- 2. EXTRA CALCULATORS: one for every formula tools.js does not already cover.
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
  const cmError = "A height above 100 in looks like cm. Enter inches (cm ÷ 2.54).";

  const EXTRA = [
    C("pp", "Pulse pressure", "SBP − DBP", "A normal resting value is about 40 mmHg.", sbpdbp,
      function (v) { if (v.d >= v.s) return { error: "Diastolic must be lower than systolic." }; return R(v.s - v.d, 0, "mmHg", [fmt(v.s, 4), "−", fmt(v.d, 4)], ""); }),
    C("co", "Cardiac output", "HR × stroke volume ÷ 1000", "Adult resting reference is often about 4–8 L/min; interpret in clinical context. This calculation is not a measure of tissue perfusion.",
      [F("h", "Heart rate", "bpm", "e.g. 70"), F("s", "Stroke volume", "mL", "e.g. 70")],
      function (v) { return R(v.h * v.s / 1000, 2, "L/min", [fmt(v.h, 4), "×", fmt(v.s, 4), "÷ 1000"], ""); }),
    C("aniongap", "Anion gap", "Na − (Cl + HCO₃)", "Reference ranges vary by lab. About 8 to 12 mEq/L is common when potassium is not included.",
      [F("n", "Sodium", "mEq/L", "e.g. 140"), F("c", "Chloride", "mEq/L", "e.g. 104"), F("b", "Bicarbonate", "mEq/L", "e.g. 24")],
      function (v) { return R(v.n - (v.c + v.b), 0, "mEq/L", [fmt(v.n, 4), "− (" + fmt(v.c, 4), "+", fmt(v.b, 4) + ")"], ""); }),
    C("corca", "Corrected calcium", "Ca + 0.8 × (4 − albumin)", "This albumin-correction equation is only an estimate and can be unreliable in critical illness, kidney disease and abnormal protein states. Consider measured ionised calcium when clinically indicated.",
      [F("c", "Total calcium", "mg/dL", "e.g. 7.5"), F("a", "Albumin", "g/dL", "e.g. 2.5")],
      function (v) {
        if (v.c < 4) return { error: "That calcium looks like mmol/L. This formula needs mg/dL (mmol/L × 4.008)." };
        if (v.a > 10) return { error: "That albumin looks like g/L. Enter g/dL (g/L ÷ 10)." };
        return R(v.c + 0.8 * (4 - v.a), 2, "mg/dL", [fmt(v.c, 4), "+ 0.8 × (4 −", fmt(v.a, 4) + ")"], ""); }),
    C("pctsol", "Percent solution", "grams ÷ mL × 100", "This calculates % w/v (grams per 100 mL final solution). It does not apply to % w/w or % v/v.",
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
    C("apgar", "Apgar", "sum of five scores, 0 to 2 each", "Score at 1 and 5 minutes after birth (and repeat as indicated). Apgar describes the newborn’s condition; it does not determine the need to start resuscitation or predict an individual outcome.",
      [pick("a", "Appearance (colour)", [["2", "2 Pink all over"], ["1", "1 Body pink, hands and feet blue"], ["0", "0 Blue or pale all over"]], "2"),
       pick("p", "Pulse (heart rate)", [["2", "2 100 or more"], ["1", "1 Under 100"], ["0", "0 Absent"]], "2"),
       pick("g", "Grimace (reflex)", [["2", "2 Cries or coughs"], ["1", "1 Grimace"], ["0", "0 No response"]], "2"),
       pick("t", "Activity (muscle tone)", [["2", "2 Active movement"], ["1", "1 Some flexion"], ["0", "0 Limp"]], "2"),
       pick("r", "Respiration", [["2", "2 Strong cry"], ["1", "1 Weak or slow"], ["0", "0 Absent"]], "2")],
      function (v) { const t = v.a + v.p + v.g + v.t + v.r; return R(t, 0, "/ 10", ["A" + v.a, "+", "P" + v.p, "+", "G" + v.g, "+", "A" + v.t, "+", "R" + v.r], t >= 7 ? "Reassuring range" : t >= 4 ? "Moderately low range" : "Low range", ["Interpret the individual components and trend. Do not delay or determine resuscitation from the Apgar score; follow neonatal resuscitation guidance."]); }),
    C("gcs", "Glasgow Coma Scale", "eye + verbal + motor", "Record E, V and M separately as well as the total. Common severity bands are 13–15 mild, 9–12 moderate and 8 or less severe, but the total alone can hide clinically important changes. Not for young children; use an age-appropriate paediatric scale. For intubation, document verbal as not testable (e.g. V-NT/T) per local policy.",
      [pick("e", "Eye opening", [["4", "4 Spontaneous"], ["3", "3 To voice"], ["2", "2 To pain"], ["1", "1 None"]], "4"),
       pick("v", "Verbal response", [["5", "5 Oriented"], ["4", "4 Confused"], ["3", "3 Words only"], ["2", "2 Sounds only"], ["1", "1 None"]], "5"),
       pick("m", "Motor response", [["6", "6 Obeys commands"], ["5", "5 Localises pain"], ["4", "4 Withdraws"], ["3", "3 Abnormal flexion"], ["2", "2 Extension"], ["1", "1 None"]], "6")],
      function (v) { const t = v.e + v.v + v.m; return R(t, 0, "/ 15", ["E" + v.e, "+", "V" + v.v, "+", "M" + v.m], t >= 13 ? "Mild" : t >= 9 ? "Moderate" : "Severe", t <= 8 ? ["A score of 8 or less is severe. Follow your escalation policy."] : []); }),
    C("balance", "Fluid balance", "intake − output", "Use the same time period for both. A negative result means more output than intake.",
      [F("i", "Total intake", "mL", "e.g. 1500", false, true), F("o", "Total output", "mL", "e.g. 1200", false, true)],
      function (v) { const r = v.i - v.o; return R(r, 0, "mL", [fmt(v.i, 4), "−", fmt(v.o, 4)], r > 0 ? "Positive balance" : r < 0 ? "Negative balance" : "Even balance"); }),
    C("minvent", "Minute ventilation", "tidal volume × RR ÷ 1000", "Typical adult resting values are often around 5–8 L/min, but interpretation depends on patient and ventilator context.",
      [F("t", "Tidal volume", "mL", "e.g. 500"), F("r", "Respiratory rate", "breaths/min", "e.g. 14")],
      function (v) { return R(v.t * v.r / 1000, 1, "L/min", [fmt(v.t, 4), "×", fmt(v.r, 4), "÷ 1000"], ""); }),
    C("ibwm", "Ideal weight (male)", "50 + 2.3 × (in − 60)", ibwNote, [F("h", "Height", "in", "e.g. 70")],
      function (v) { if (v.h > 100) return { error: cmError }; return R(50 + 2.3 * (v.h - 60), 1, "kg", ["50 + 2.3 × (" + fmt(v.h, 4), "− 60)"], "", tooShort(v.h)); }),
    C("ibwf", "Ideal weight (female)", "45.5 + 2.3 × (in − 60)", ibwNote, [F("h", "Height", "in", "e.g. 65")],
      function (v) { if (v.h > 100) return { error: cmError }; return R(45.5 + 2.3 * (v.h - 60), 1, "kg", ["45.5 + 2.3 × (" + fmt(v.h, 4), "− 60)"], "", tooShort(v.h)); }),
    C("crcl", "Creatinine clearance", "(140 − age) × kg ÷ (72 × SCr)", "Cockcroft–Gault estimate for adults. The historical 0.85 factor is applied when Female is selected. Enter SCr in mg/dL (µmol/L ÷ 88.4). Not reliable in acute/rapidly changing kidney function; weight selection needs clinical judgement, especially with obesity, oedema or amputation. Not a measured GFR.",
      [F("a", "Age", "years", "e.g. 50"), F("k", "Weight", "kg", "e.g. 70"), F("s", "Serum creatinine", "mg/dL", "e.g. 1"),
       pick("x", "Sex", [["1", "Male"], ["0.85", "Female"]], "1")],
      function (v) {
        if (v.a < 18 || v.a >= 120) return { error: "Cockcroft–Gault is intended for adults. Enter an age from 18 to 119 years; use an appropriate paediatric method for children." };
        if (v.s >= 30) return { error: "That creatinine looks like µmol/L. Divide by 88.4 to get mg/dL." };
        const r = (140 - v.a) * v.k / (72 * v.s) * v.x, w = [];
        if (v.s < 0.6) w.push("A low serum creatinine can overestimate creatinine clearance. Interpret with muscle mass and clinical context.");
        if (v.s > 15) w.push("A creatinine above 15 mg/dL is very high. Check it is not µmol/L.");
        
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
    C("clark", "Clark’s rule", "weight lb ÷ 150 × adult dose", "A historical rule of thumb. Do not use it to decide a dose. Use the prescriber's order or a paediatric reference (mg/kg or BSA).",
      [F("w", "Child weight", "lb", "e.g. 50"), F("a", "Adult dose", "mg", "e.g. 500")],
      function (v) { return R(v.w / 150 * v.a, 2, "mg", [fmt(v.w, 4), "÷ 150 ×", fmt(v.a, 4)], "", ["Historical rule. Do not use this to decide a dose to give."]); }),
    C("young", "Young’s rule", "age ÷ (age + 12) × adult dose", "A historical rule of thumb for ages 1 to 12. Do not use it to decide a dose. Use the prescriber's order or a paediatric reference.",
      [F("g", "Child age", "years", "e.g. 6"), F("a", "Adult dose", "mg", "e.g. 300")],
      function (v) { return R(v.g / (v.g + 12) * v.a, 2, "mg", [fmt(v.g, 4), "÷ (" + fmt(v.g, 4) + " + 12) ×", fmt(v.a, 4)], "", ["Historical rule. Do not use this to decide a dose to give."].concat(v.g > 12 ? ["Young’s rule is meant for ages up to 12."] : [])); }),
    C("insulincf", "Insulin correction", "1800 ÷ total daily dose", "Educational estimate (rule of 1800) for rapid-acting insulin; individual factors and insulin type matter. Not a dose instruction. Use the prescribed correction factor and written diabetes plan. Convert mg/dL to mmol/L by ÷18.", TDD,
      function (v) { const r = 1800 / v.t; return R(r, 0, "mg/dL per unit", ["1800 ÷", fmt(v.t, 4)], "1 unit lowers glucose by about " + fmt(r, 0) + " mg/dL (about " + fmt(r / 18, 1) + " mmol/L)"); }),
    C("carbratio", "Carb ratio", "500 ÷ total daily dose", "Educational starting estimate only. Individual insulin-to-carbohydrate ratios vary by time of day, illness and treatment plan. Use the patient’s prescribed ratio; do not calculate a dose from this estimate alone.", TDD,
      function (v) { const r = 500 / v.t; return R(r, 0, "g per unit", ["500 ÷", fmt(v.t, 4)], "1 unit covers about " + fmt(r, 0) + " g of carbohydrate"); }),
    C("shock", "Shock index", "HR ÷ SBP", "Shock-index thresholds vary by age, pregnancy and clinical context. A single value cannot diagnose or exclude shock.", [F("h", "Heart rate", "bpm", "e.g. 100"), F("s", "Systolic (SBP)", "mmHg", "e.g. 125")],
      function (v) { const r = v.h / v.s; return R(r, 2, "", [fmt(v.h, 4), "÷", fmt(v.s, 4)], r >= 0.9 ? "Raised" : "Within the usual range", r >= 1 ? ["A shock index of 1 or more may signal shock. Follow your escalation policy."] : []); }),
    C("pctchange", "Percent change", "(new − old) ÷ old × 100", "A negative result is a decrease.",
      [F("o", "Old value", "same unit", "e.g. 80"), F("n", "New value", "same unit", "e.g. 72", false, true)],
      function (v) { const r = (v.n - v.o) / v.o * 100; return R(r, 1, "%", ["(" + fmt(v.n, 4), "−", fmt(v.o, 4) + ")", "÷", fmt(v.o, 4), "× 100"], r > 0 ? "Increase" : r < 0 ? "Decrease" : "No change"); }),

    /* ---------- PAEDIATRIC ADDITIONS ---------- */
    C("fried", "Fried’s rule", "age in months ÷ 150 × adult dose", "A historical rule of thumb for infants under 2 years. Do not use it to decide a dose. Use the prescriber's order or a paediatric reference (mg/kg or BSA).",
      [F("m", "Infant age", "months", "e.g. 6"), F("a", "Adult dose", "mg", "e.g. 300")],
      function (v) {
        const r = v.m / 150 * v.a, w = ["Historical rule. Do not use this to decide a dose to give."];
        if (v.m > 24) w.push("Fried’s rule is meant for infants under 2 years.");
        return R(r, 2, "mg", [fmt(v.m, 4), "÷ 150 ×", fmt(v.a, 4)], "", w);
      }),

    C("aplsweight", "APLS weight estimate", "(age + 4) × 2 kg", "A rough emergency weight estimate for children in the stated age range; formula versions vary by resuscitation system. Use measured weight whenever possible and use the local paediatric emergency chart.",
      [F("a", "Age", "years", "e.g. 5")],
      function (v) {
        if (v.a < 1) return { error: "The APLS weight estimate is for children 1 year and older." };
        if (v.a > 10) return { error: "The APLS weight estimate is for children up to 10 years." };
        const r = (v.a + 4) * 2;
        return R(r, 1, "kg", ["(" + fmt(v.a, 4), "+ 4) × 2"], "Estimated weight", ["An estimate only. Use the measured weight whenever available."]);
      }),

    C("ettube", "ET tube size (uncuffed)", "(age ÷ 4) + 4 mm", "Age-based estimate only; tube choice depends on the child and local airway guidance. Confirm position with appropriate clinical methods and have adjacent sizes available. Do not select a tube from this formula alone.",
      [F("a", "Age", "years", "e.g. 6")],
      function (v) {
        if (v.a < 1) return { error: "This formula is for children over 1 year." };
        if (v.a > 14) return { error: "This formula is for children up to about 14 years." };
        const r = (v.a / 4) + 4;
        return R(r, 1, "mm ID", ["(" + fmt(v.a, 4), "÷ 4) + 4"], "Cuffed: " + fmt((v.a / 4) + 3.5, 1) + " mm", ["Confirm the tube size with the airway algorithm before intubation."]);
      }),

    C("pedsdefib", "Paediatric defibrillation", "first 2 J/kg, then 4 J/kg", "For paediatric cardiac arrest with VF/pulseless VT using a manual defibrillator. Confirm the current resuscitation algorithm, device and maximum energy limits; this calculator does not replace real-time resuscitation guidance.",
      [F("k", "Weight", "kg", "e.g. 20")],
      function (v) {
        const first = 2 * v.k, next = 4 * v.k;
        return R(first, 0, "J", ["2 ×", fmt(v.k, 4)], "First shock " + fmt(first, 0) + " J; next 4 J/kg = " + fmt(next, 0) + " J", ["Confirm the joules on the device before delivering. Follow the resuscitation algorithm."]);
      }),

    C("pedsbolus", "Paediatric fluid bolus", "prescribed mL/kg × weight", "There is no universal paediatric bolus volume or speed. Select the prescribed dose using the child’s condition and current local/condition-specific guideline; reassess perfusion, respiratory status and fluid tolerance after every bolus. Some conditions require smaller aliquots or no bolus.",
      [F("k", "Weight", "kg", "e.g. 20"), F("d", "Prescribed bolus dose", "mL/kg", "Enter the clinician-selected dose")],
      function (v) {
        const r = Number(v.d) * v.k;
        return R(r, 0, "mL", [fmt(v.d, 0), "×", fmt(v.k, 4)], "Calculated volume only — administer at the prescribed rate", ["This is a calculation input, not a recommended dose. Confirm indication, fluid type, rate and reassessment plan against the current patient-specific protocol. Stop and reassess if signs of fluid overload develop."]);
      }),

    C("pedsblood", "Paediatric blood volume", "neonates 80 mL/kg, children 70 mL/kg", "Approximate circulating blood volume only. Values vary with gestational age, postnatal age and clinical state; do not use as a stand-alone transfusion or blood-loss prescription.",
      [F("k", "Weight", "kg", "e.g. 20"), pick("g", "Age group", [["80", "Neonate (80 mL/kg)"], ["70", "Child (70 mL/kg)"]], "70")],
      function (v) {
        const r = v.g * v.k;
        return R(r, 0, "mL", [fmt(v.g, 0), "×", fmt(v.k, 4)], "");
      }),

    C("pedsuop", "Paediatric urine output", "mL ÷ (kg × hours)", "Interpret urine output by age, clinical state and observation period. A single low value is not a diagnosis; persistent reduction or anuria requires prompt clinical assessment.",
      [F("m", "Urine volume", "mL", "e.g. 150"), F("k", "Weight", "kg", "e.g. 20"), F("h", "Time", "hours", "e.g. 6")],
      function (v) {
        const r = v.m / (v.k * v.h), w = [];
        if (r < 1) w.push("Reduced urine output may be clinically important. Verify measurement, assess hydration/perfusion and escalate according to age-specific policy; do not diagnose AKI from this value alone.");
        return R(r, 2, "mL/kg/hr", [fmt(v.m, 4), "÷ (" + fmt(v.k, 4), "×", fmt(v.h, 4) + ")"], fmt(v.m, 0) + " mL over " + fmt(v.h, 2) + " h", w);
      }),

    C("bsadose", "BSA dose", "BSA m² × dose per m²", "For specialist medicines only when the approved protocol specifies mg/m². Confirm height, weight, BSA cap (if any), dose intensity, organ-function adjustments and independent checks. This result is not a prescribing recommendation.",
      [F("b", "Body surface area", "m²", "e.g. 0.8"), F("d", "Dose per m²", "mg/m²", "e.g. 100")],
      function (v) {
        return R(v.b * v.d, 2, "mg", [fmt(v.b, 4), "×", fmt(v.d, 4)], "", ["Confirm the BSA and dose per m² against the protocol."]);
      }),

    C("pedsgcs", "Paediatric GCS", "eye + verbal + motor (age-adjusted)", "For infants and children under 5 years. Verbal and motor scales differ from the adult GCS. For an intubated patient, record verbal as T.",
      [pick("e", "Eye opening", [["4", "4 Spontaneous"], ["3", "3 To voice/sound"], ["2", "2 To pain"], ["1", "1 None"]], "4"),
       pick("v", "Verbal response", [["5", "5 Smiles, coos, babbles (age-appropriate)"], ["4", "4 Irritable cry, consolable"], ["3", "3 Cries to pain, inconsolable"], ["2", "2 Moans to pain, restless"], ["1", "1 None"]], "5"),
       pick("m", "Motor response", [["6", "6 Spontaneous movement"], ["5", "5 Withdraws to touch"], ["4", "4 Withdraws to pain"], ["3", "3 Abnormal flexion (decorticate)"], ["2", "2 Extension (decerebrate)"], ["1", "1 None"]], "6")],
      function (v) {
        const t = v.e + v.v + v.m;
        return R(t, 0, "/ 15", ["E" + v.e, "+", "V" + v.v, "+", "M" + v.m], t >= 13 ? "Mild" : t >= 9 ? "Moderate" : "Severe", t <= 8 ? ["A score of 8 or less is severe. Follow your escalation policy."] : []);
      }),

    C("pedstrans", "Paediatric transfusion volume", "Prescribed PRBC dose (mL/kg) × weight; patient- and guideline-specific", "Dose is determined by the transfusion indication, haemoglobin, symptoms, product characteristics and current national/institutional guideline. This calculator estimates volume only; it does not decide whether transfusion is indicated.",
      [F("k", "Weight", "kg", "e.g. 20"), F("d", "Prescribed PRBC dose", "mL/kg", "Enter the clinician-selected dose"), F("h", "Prescribed transfusion duration", "hours", "e.g. 3")],
      function (v) {
        const volume = Number(v.d) * v.k;
        const rate = volume / v.h;
        return R(volume, 0, "mL of PRBC", [fmt(v.d, 0), "mL/kg ×", fmt(v.k, 4), "kg"], "At the entered duration: " + fmt(rate, 1) + " mL/hour", ["The entered dose is a calculation input, not a recommended dose for every child. Confirm indication, product, volume, duration and monitoring plan against the current national/institutional guideline and obtain the required independent check.", "Do not exceed the locally permitted component hang time. Monitor closely for transfusion reactions and circulatory overload; stop the transfusion and follow emergency policy if a reaction is suspected."]);
      }),

    /* ---------- 30 additional bedside / clinical calculations ---------- */
    C("corrna", "Corrected sodium (hyperglycaemia)", "Na + 1.6 × [(glucose − 100) ÷ 100]", "Educational estimate using glucose mg/dL and the 1.6 correction factor. Alternative coefficients are used in some settings; interpret with the clinical picture and local guidance.",
      [F("n", "Measured sodium", "mmol/L", "e.g. 128"), F("g", "Glucose", "mg/dL", "e.g. 400")],
      function(v){ const r=v.n+1.6*((v.g-100)/100); return R(r,1,"mmol/L",[fmt(v.n,3),"+ 1.6 × ((",fmt(v.g,3),"− 100) ÷ 100)"],"Estimated sodium after glucose correction",["Correction factor is an approximation. Do not use this result alone to select fluids or treatment."]); }),
    C("osmol", "Calculated serum osmolality", "2Na + glucose/18 + BUN/2.8", "Requires sodium in mmol/L, glucose and BUN in mg/dL. If using SI glucose or urea, convert units or use a validated SI equation.",
      [F("n","Sodium","mmol/L","e.g. 140"),F("g","Glucose","mg/dL","e.g. 100"),F("b","BUN","mg/dL","e.g. 14")],
      function(v){const r=2*v.n+v.g/18+v.b/2.8;return R(r,1,"mOsm/kg",["2 ×",fmt(v.n,3),"+",fmt(v.g,3),"÷ 18 +",fmt(v.b,3),"÷ 2.8"],"Calculated value; compare with measured osmolality when assessing an osmolal gap",["Check that glucose and BUN are entered in mg/dL."]);}),
    C("osmgap", "Osmolal gap", "Measured osmolality − calculated osmolality", "Use measured and calculated osmolality in the same units. Interpretation depends on laboratory method, timing and clinical context.",
      [F("m","Measured osmolality","mOsm/kg","e.g. 310"),F("c","Calculated osmolality","mOsm/kg","e.g. 290")],
      function(v){const r=v.m-v.c;return R(r,1,"mOsm/kg",[fmt(v.m,3),"−",fmt(v.c,3)],"A raised gap is nonspecific and requires clinical assessment.");}),
    C("waterdef", "Free water deficit", "TBW × [(Na ÷ 140) − 1]", "Requires an estimated total body water (TBW) in litres and sodium in mmol/L. TBW estimates vary with age, sex and body composition.",
      [F("t","Estimated total body water","L","e.g. 35"),F("n","Serum sodium","mmol/L","e.g. 155")],
      function(v){const r=v.t*((v.n/140)-1);return R(r,2,"L",[fmt(v.t,3),"× ((",fmt(v.n,3),"÷ 140) − 1)"],"Mathematical estimate only",["Not a fluid prescription. Correction rate and fluid choice require clinician assessment and monitoring."]);}),
    C("fena", "Fractional excretion of sodium (FENa)", "(Urine Na × plasma Cr) ÷ (plasma Na × urine Cr) × 100", "Enter sodium values in the same units and creatinine values in the same units. Diuretics, CKD, sepsis and other factors limit interpretation.",
      [F("un","Urine sodium","mmol/L","e.g. 20"),F("pc","Plasma creatinine","same units","e.g. 1"),F("pn","Plasma sodium","mmol/L","e.g. 140"),F("uc","Urine creatinine","same units","e.g. 100")],
      function(v){const r=(v.un*v.pc)/(v.pn*v.uc)*100;return R(r,2,"%",["(",fmt(v.un,3),"×",fmt(v.pc,3),") ÷ (",fmt(v.pn,3),"×",fmt(v.uc,3),") × 100"],"Interpret with the clinical context; not a stand-alone diagnosis.");}),
    C("feurea", "Fractional excretion of urea (FEUrea)", "(Urine urea × plasma Cr) ÷ (plasma urea × urine Cr) × 100", "Enter urea values in the same units and creatinine values in the same units. FEUrea is not definitive and has important limitations.",
      [F("uu","Urine urea","same units","e.g. 300"),F("pc","Plasma creatinine","same units","e.g. 1"),F("pu","Plasma urea","same units","e.g. 40"),F("uc","Urine creatinine","same units","e.g. 100")],
      function(v){const r=(v.uu*v.pc)/(v.pu*v.uc)*100;return R(r,2,"%",["(",fmt(v.uu,3),"×",fmt(v.pc,3),") ÷ (",fmt(v.pu,3),"×",fmt(v.uc,3),") × 100"],"Interpret with clinical context; not a stand-alone diagnosis.");}),
    C("pfratio", "PaO₂/FiO₂ ratio", "PaO₂ ÷ FiO₂", "Enter FiO₂ as a decimal (for example 40% = 0.40) and PaO₂ in mmHg. This ratio is one component of respiratory assessment.",
      [F("p","PaO₂","mmHg","e.g. 80"),F("f","FiO₂","decimal","e.g. 0.4")],
      function(v){if(v.f>1)return {error:"Enter FiO₂ as a decimal from 0 to 1 (40% = 0.40)."};const r=v.p/v.f;return R(r,0,"mmHg",[fmt(v.p,3),"÷",fmt(v.f,3)],"Interpret alongside PEEP, timing and full clinical criteria.");}),
    C("cao2", "Oxygen content (CaO₂)", "1.34 × Hb × SaO₂ + 0.003 × PaO₂", "Enter Hb in g/dL, SaO₂ as a decimal (0–1), and PaO₂ in mmHg. SaO₂ must be a fraction, not a percentage.",
      [F("h","Haemoglobin","g/dL","e.g. 12"),F("s","SaO₂","decimal","e.g. 0.98"),F("p","PaO₂","mmHg","e.g. 90")],
      function(v){if(v.s>1)return {error:"Enter SaO₂ as a decimal (98% = 0.98)."};const r=1.34*v.h*v.s+0.003*v.p;return R(r,2,"mL O₂/dL",["1.34 ×",fmt(v.h,3),"×",fmt(v.s,3),"+ 0.003 ×",fmt(v.p,3)],"Calculated arterial oxygen content.");}),
    C("pao2", "Alveolar oxygen (PAO₂)", "FiO₂ × (Patm − PH₂O) − PaCO₂/RQ", "Simplified alveolar gas equation. Use FiO₂ as decimal, atmospheric pressure and water vapour pressure in mmHg, PaCO₂ in mmHg; RQ is commonly approximated as 0.8.",
      [F("f","FiO₂","decimal","e.g. 0.21"),F("a","Atmospheric pressure","mmHg","e.g. 760"),F("w","Water vapour pressure","mmHg","e.g. 47"),F("c","PaCO₂","mmHg","e.g. 40"),F("r","Respiratory quotient","ratio","e.g. 0.8")],
      function(v){if(v.f>1)return {error:"Enter FiO₂ as a decimal (21% = 0.21)."};const x=v.f*(v.a-v.w)-v.c/v.r;return R(x,1,"mmHg",[fmt(v.f,3),"× (",fmt(v.a,3),"−",fmt(v.w,3),") −",fmt(v.c,3),"÷",fmt(v.r,3)],"Simplified estimate; assumptions may not hold in all patients.");}),
    C("aagrad", "A–a oxygen gradient", "PAO₂ − PaO₂", "Requires PAO₂ and PaO₂ in mmHg, measured under the same inspired oxygen conditions.",
      [F("a","PAO₂","mmHg","e.g. 100"),F("p","PaO₂","mmHg","e.g. 80")],
      function(v){return R(v.a-v.p,1,"mmHg",[fmt(v.a,3),"−",fmt(v.p,3)],"Interpret in relation to age, FiO₂ and clinical context.");}),
    C("qtcbaz", "QTc (Bazett)", "QT ÷ √RR", "QT and RR must both be entered in seconds. Bazett correction may overcorrect at high heart rates and undercorrect at low heart rates.",
      [F("q","QT interval","seconds","e.g. 0.36"),F("r","RR interval","seconds","e.g. 0.80")],
      function(v){const x=v.q/Math.sqrt(v.r);return R(x*1000,0,"ms",[fmt(v.q,4),"÷ √",fmt(v.r,4)],"Automated calculation does not replace ECG measurement or clinical interpretation.");}),
    C("qtcfrid", "QTc (Fridericia)", "QT ÷ RR^(1/3)", "QT and RR must both be entered in seconds. Confirm intervals and correction method with the ECG and local guidance.",
      [F("q","QT interval","seconds","e.g. 0.36"),F("r","RR interval","seconds","e.g. 0.80")],
      function(v){const x=v.q/Math.pow(v.r,1/3);return R(x*1000,0,"ms",[fmt(v.q,4),"÷",fmt(v.r,4),"^(1/3)"],"Automated calculation does not replace ECG measurement or clinical interpretation.");}),
    C("ef", "Ejection fraction", "(EDV − ESV) ÷ EDV × 100", "Enter end-diastolic and end-systolic volumes in the same units. Measurement method and image quality affect interpretation.",
      [F("d","End-diastolic volume","mL","e.g. 120"),F("s","End-systolic volume","mL","e.g. 50")],
      function(v){if(v.s>v.d)return {error:"End-systolic volume cannot exceed end-diastolic volume."};const x=(v.d-v.s)/v.d*100;return R(x,1,"%",["(",fmt(v.d,3),"−",fmt(v.s,3),") ÷",fmt(v.d,3),"× 100"],"Do not interpret without the imaging report and clinical context.");}),
    C("svr", "Systemic vascular resistance", "(MAP − CVP) ÷ CO × 80", "MAP and CVP in mmHg; cardiac output in L/min. Requires reliable haemodynamic measurements.",
      [F("m","Mean arterial pressure","mmHg","e.g. 90"),F("c","Central venous pressure","mmHg","e.g. 8"),F("o","Cardiac output","L/min","e.g. 5")],
      function(v){if(v.m<=v.c)return {error:"MAP should be greater than CVP for this calculation."};const x=(v.m-v.c)/v.o*80;return R(x,0,"dyn·s/cm⁵",["(",fmt(v.m,3),"−",fmt(v.c,3),") ÷",fmt(v.o,3),"× 80"],"Requires clinically valid haemodynamic inputs.");}),
    C("do2", "Oxygen delivery (DO₂)", "Cardiac output × CaO₂ × 10", "Cardiac output in L/min and CaO₂ in mL O₂/dL. Derived value; depends on valid cardiac output and oxygen-content measurements.",
      [F("c","Cardiac output","L/min","e.g. 5"),F("a","CaO₂","mL O₂/dL","e.g. 16")],
      function(v){const x=v.c*v.a*10;return R(x,0,"mL O₂/min",[fmt(v.c,3),"×",fmt(v.a,3),"× 10"],"Calculated oxygen delivery; not a direct measure of tissue oxygen use.");}),
    C("adjwt", "Adjusted body weight", "IBW + 0.4 × (actual weight − IBW)", "A convention used in some drug-dosing and nutrition contexts; not appropriate for every medicine or patient.",
      [F("i","Ideal body weight","kg","e.g. 60"),F("a","Actual body weight","kg","e.g. 100")],
      function(v){const x=v.i+0.4*(v.a-v.i);return R(x,1,"kg",[fmt(v.i,3),"+ 0.4 × (",fmt(v.a,3),"−",fmt(v.i,3),")"],"Use only when the relevant protocol specifies adjusted body weight.");}),
    C("dubois", "Body surface area (Du Bois)", "0.007184 × height^0.725 × weight^0.425", "Height in centimetres and weight in kilograms. BSA equations are estimates and may differ slightly.",
      [F("h","Height","cm","e.g. 170"),F("w","Weight","kg","e.g. 70")],
      function(v){const x=0.007184*Math.pow(v.h,0.725)*Math.pow(v.w,0.425);return R(x,2,"m²",["0.007184 ×",fmt(v.h,3),"^0.725 ×",fmt(v.w,3),"^0.425"],"Estimated BSA.");}),
    C("pheny", "Corrected phenytoin (Sheiner–Tozer)", "Measured phenytoin ÷ (0.2 × albumin + 0.1)", "Approximation for low albumin in selected patients. Enter phenytoin in mcg/mL and albumin in g/dL. Direct free phenytoin measurement is preferred when available or clinically indicated.",
      [F("p","Measured total phenytoin","mcg/mL","e.g. 8"),F("a","Albumin","g/dL","e.g. 2.5")],
      function(v){if(v.a>10)return {error:"Enter albumin in g/dL (g/L ÷ 10)."};const x=v.p/(0.2*v.a+0.1);return R(x,1,"mcg/mL (estimated)",[fmt(v.p,3),"÷ (0.2 ×",fmt(v.a,3),"+ 0.1)"],"Estimated corrected total concentration",["This equation may be inaccurate, especially in renal impairment or critical illness. Consider a measured free phenytoin level."]);}),
    C("phenyrenal", "Corrected phenytoin (renal impairment)", "Measured phenytoin ÷ (0.1 × albumin + 0.1)", "Legacy estimate sometimes cited for concurrent hypoalbuminaemia and renal dysfunction. It is not a substitute for measured free phenytoin.",
      [F("p","Measured total phenytoin","mcg/mL","e.g. 8"),F("a","Albumin","g/dL","e.g. 2.5")],
      function(v){if(v.a>10)return {error:"Enter albumin in g/dL (g/L ÷ 10)."};const x=v.p/(0.1*v.a+0.1);return R(x,1,"mcg/mL (estimated)",[fmt(v.p,3),"÷ (0.1 ×",fmt(v.a,3),"+ 0.1)"],"Estimated corrected total concentration",["This legacy estimate can be unreliable. Prefer measured free phenytoin and specialist interpretation."]);}),
    C("nadeficit", "Sodium deficit", "TBW × (desired Na − measured Na)", "TBW in litres and sodium in mmol/L. The equation estimates a theoretical deficit; it does not specify fluid type, rate or a safe correction plan.",
      [F("t","Estimated total body water","L","e.g. 35"),F("d","Desired sodium","mmol/L","e.g. 140"),F("m","Measured sodium","mmol/L","e.g. 125")],
      function(v){const x=v.t*(v.d-v.m);return R(x,1,"mmol (theoretical)",[fmt(v.t,3),"× (",fmt(v.d,3),"−",fmt(v.m,3),")"],"Theoretical estimate only",["Do not use as a treatment prescription. Sodium correction requires an individualised plan and serial monitoring."]);}),
    C("infusiontime", "Infusion time", "Total volume ÷ rate", "Volume in mL and rate in mL/hour.",
      [F("v","Total volume","mL","e.g. 500"),F("r","Rate","mL/hr","e.g. 100")],
      function(v){const x=v.v/v.r;return R(x,2,"hours",[fmt(v.v,3),"÷",fmt(v.r,3)],fmt(x*60,0)+" minutes");}),
    C("infusionrate", "Infusion rate", "Total volume ÷ time", "Volume in mL and time in hours. Confirm the prescribed rate and any maximum rate for the medicine or fluid.",
      [F("v","Total volume","mL","e.g. 500"),F("t","Time","hours","e.g. 4")],
      function(v){const x=v.v/v.t;return R(x,1,"mL/hr",[fmt(v.v,3),"÷",fmt(v.t,3)],"Confirm against the prescription and product-specific rate limits.");}),
    C("dosevol", "Dose volume", "Required dose ÷ concentration", "Dose and concentration units must be compatible (for example mg and mg/mL). Verify the final volume independently before administration.",
      [F("d","Required dose","mg","e.g. 250"),F("c","Concentration","mg/mL","e.g. 50")],
      function(v){const x=v.d/v.c;return R(x,2,"mL",[fmt(v.d,3),"÷",fmt(v.c,3)],"Check dose units and concentration on the actual product label.");}),
    C("conc", "Concentration", "Amount of drug ÷ total volume", "Amount and volume units must be compatible. This is a concentration calculation, not a compatibility or stability check.",
      [F("a","Drug amount","mg","e.g. 500"),F("v","Final volume","mL","e.g. 10")],
      function(v){const x=v.a/v.v;return R(x,2,"mg/mL",[fmt(v.a,3),"÷",fmt(v.v,3)],"Verify preparation, compatibility and stability using an approved reference.");}),
    C("glucmmol", "Glucose mmol/L to mg/dL", "mmol/L × 18", "Approximate conversion for glucose.",
      [F("g","Glucose","mmol/L","e.g. 5.6")],function(v){const x=v.g*18;return R(x,1,"mg/dL",[fmt(v.g,3),"× 18"],"");}),
    C("glucmg", "Glucose mg/dL to mmol/L", "mg/dL ÷ 18", "Approximate conversion for glucose.",
      [F("g","Glucose","mg/dL","e.g. 100")],function(v){const x=v.g/18;return R(x,2,"mmol/L",[fmt(v.g,3),"÷ 18"],"");}),
    C("tempchange", "Temperature change", "Final temperature − initial temperature", "Both temperatures must use the same scale (both °C or both °F). A negative result means a decrease.",
      [F("f","Final temperature","°C or °F","e.g. 37"),F("i","Initial temperature","same unit","e.g. 36.5")],function(v){const x=v.f-v.i;return R(x,1,"°C or °F",[fmt(v.f,3),"−",fmt(v.i,3)],x>0?"Increase":x<0?"Decrease":"No change");}),
    C("reticcorr", "Corrected reticulocyte count", "Reticulocyte % × patient Hct ÷ normal Hct", "Enter reticulocyte percentage as a number (for example 4, not 0.04); haematocrit values must use the same units.",
      [F("r","Reticulocyte","%","e.g. 4"),F("h","Patient haematocrit","%","e.g. 30"),F("n","Reference haematocrit","%","e.g. 45")],function(v){const x=v.r*v.h/v.n;return R(x,2,"%",[fmt(v.r,3),"×",fmt(v.h,3),"÷",fmt(v.n,3)],"Corrected reticulocyte percentage.");}),
    C("rpi", "Reticulocyte production index", "Corrected reticulocyte % ÷ maturation factor", "The maturation factor is an estimate based on the degree of anaemia; select it using an appropriate clinical/haematology reference.",
      [F("r","Corrected reticulocyte","%","e.g. 2.7"),F("m","Maturation factor","ratio","e.g. 2")],function(v){const x=v.r/v.m;return R(x,2,"",[fmt(v.r,3),"÷",fmt(v.m,3)],"Interpret with the blood film, haemoglobin and clinical context.");}),
    C("anc", "Absolute neutrophil count (ANC)", "WBC × (neutrophils % + bands %) ÷ 100", "Enter WBC in ×10⁹/L and differential percentages as whole numbers (for example 60, not 0.60). Confirm local laboratory reporting conventions.",
      [F("w","White blood cell count","×10⁹/L","e.g. 4.0"),F("n","Neutrophils","%","e.g. 50"),F("b","Bands","%","e.g. 2",true)],function(v){const x=v.w*(v.n+(v.b||0))/100;return R(x,2,"×10⁹/L",[fmt(v.w,3),"× (",fmt(v.n,3),"+",fmt(v.b||0,3),") ÷ 100"],"ANC is a laboratory-derived value; interpret using the patient’s clinical context.");})
  ];
  /* Validate numeric fields centrally before any calculation runs.
     Select fields are numeric in this library; text/select UI values are normalised here. */
  EXTRA.forEach(function (calc) {
    const originalCompute = calc.compute;
    calc.compute = function (raw) {
      const values = {};
      for (const field of calc.fields) {
        const rawValue = raw ? raw[field.k] : undefined;
        if (field.type === "select") {
          const n = Number(rawValue === undefined || rawValue === "" ? field.value : rawValue);
          if (!Number.isFinite(n)) return { error: "Select a valid option for “" + field.label + "”." };
          values[field.k] = n;
          continue;
        }
        if (field.optional && (rawValue === undefined || rawValue === null || rawValue === "")) continue;
        if (rawValue === undefined || rawValue === null || rawValue === "") {
          return { error: "Enter a value for “" + field.label + "”." };
        }
        const n = Number(rawValue);
        if (!Number.isFinite(n)) return { error: "Enter a valid number for “" + field.label + "”." };
        if (field.zero ? n < 0 : n <= 0) {
          return { error: field.zero ? "“" + field.label + "” cannot be negative." : "“" + field.label + "” must be greater than zero." };
        }
        values[field.k] = n;
      }
      return originalCompute(values);
    };
  });

  const EXTRA_LIB = {};
  EXTRA.forEach(function (c) { EXTRA_LIB[c.lib] = ["calc", c.id]; });
  window.VERDANT_EXTRA_CALCS = EXTRA;
  window.VERDANT_EXTRA_LIB = EXTRA_LIB;

  /* ---------- 3. THE POP-UP SCENE (unchanged) ---------- */
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