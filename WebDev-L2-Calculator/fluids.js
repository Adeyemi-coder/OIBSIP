"use strict";

/* VERDANT fluids reference, version 1.0 (reviewed 17 Nov 2026)
   Load AFTER tools.js (it adds a library to the Nursing tab).
   Sources:
   - NEML Adult 8th edition: sections 20.1 to 20.3 (fluids and electrolytes), 9.3 (plasma substitutes), 14 (mannitol), 15.5.1 (ORS)
   - WHO Pocket Book of Hospital Care for Children, 2nd edition 2013, Annex 4 (composition table) and section A4.1 (choice of IV fluids)
   - NEMLc 1st edition 2020 (children's list)
   Compositions are mmol/L unless stated; glucose is g/L. Osmolarity is CALCULATED (ions + glucose/0.1802), so it is approximate.
   Educational reference and double-check tool. It never replaces the prescriber's order. */
(function () {
  const panel = document.getElementById("panel-nursing");
  if (!panel) return;

  const WHO = "WHO Pocket Book 2013, Annex 4";
  const FLUIDS = [
    // ---- Crystalloids ----
    { name: "0.9% sodium chloride (normal saline)", group: "Crystalloid", neml: "NEML 8th, 20.2", na: 154, cl: 154,
      use: "Resuscitation fluid for severe dehydration or shock (" + WHO + "). For IV maintenance in children it must be given with 5% glucose.",
      caution: "Contains no glucose. Large volumes can cause hyperchloraemia.", calcs: [["Pump rate", "pump"], ["Drip rate", "drip"]] },
    { name: "0.45% sodium chloride (half-normal saline)", group: "Crystalloid", neml: "NEML 8th, 20.2", na: 77, cl: 77,
      use: "WHO lists 0.45% saline WITH 5% glucose as an IV maintenance option for children (" + WHO + ").",
      caution: "On its own it is hypotonic and contains no glucose.", calcs: [["Pump rate", "pump"], ["Drip rate", "drip"]] },
    { name: "Ringer's lactate (Hartmann's)", group: "Crystalloid", neml: "NEML 8th, 20.2", na: 130, k: 5.4, cl: 112, ca: 1.8, lactate: 27,
      use: "Resuscitation fluid for severe dehydration or shock. With 5% dextrose it is an IV maintenance option for children (" + WHO + "). The usual fluid for burns resuscitation.",
      caution: "Contains calcium: do not give through the same line as ceftriaxone, and do not run with blood in the same line.", calcs: [["Parkland (burns)", "parkland"], ["Maintenance (4-2-1)", "fluids"], ["Pump rate", "pump"], ["Drip rate", "drip"]] },
    // ---- Glucose ----
    { name: "5% glucose (dextrose in water)", group: "Glucose", neml: "NEML 8th, 20.2", glucose: 50,
      use: "Supplies glucose and free water. Adult use per the prescriber.",
      caution: "WHO: do NOT use for rehydration or maintenance in children. It can be used mainly in the first few days of life (hyponatraemia risk).", warn: true, calcs: [["Pump rate", "pump"], ["Drip rate", "drip"]] },
    { name: "10% glucose", group: "Glucose", neml: "NEML 8th, 20.2 (hypertonic)", glucose: 100,
      use: "Neonatal hypoglycaemia: 2 mL/kg IV (WHO Pocket Book 2013, as quoted in the MSF clinical guideline).",
      caution: "Hypertonic and irritant: use a good vein and check the site. Check blood glucose after giving.", calcs: [["Pump rate", "pump"]] },
    { name: "50% glucose", group: "Glucose", neml: "NEML 8th, 20.2 and 16.7.1 (hypertonic)", glucose: 500,
      use: "Severe hypoglycaemia in adults, per the prescriber.",
      caution: "Very hypertonic and irritant. For children use 10% glucose, not 50%. Flush the line after giving.", warn: true, calcs: [] },
    { name: "5% glucose / 0.9% sodium chloride", group: "Glucose with saline", neml: "NEML 8th, 20.2", na: 154, cl: 154, glucose: 50,
      use: "WHO IV maintenance option for children: 0.9% saline with 5% glucose (" + WHO + ").",
      caution: "Monitor blood glucose and sodium on prolonged use.", calcs: [["Maintenance (4-2-1)", "fluids"], ["Pump rate", "pump"], ["Drip rate", "drip"]] },
    { name: "4.3% glucose / 0.18% sodium chloride (dextrose saline)", group: "Glucose with saline", neml: "NEML 8th, 20.2", na: 31, cl: 31, glucose: 40, glucoseNote: "WHO table lists 4% glucose (40 g/L); the NEML names 4.3%.",
      use: "Low-sodium fluid, widely stocked.",
      caution: "WHO: do NOT use for rehydration or maintenance in children. It can be used mainly in the first few days of life (hyponatraemia risk). Follow your unit protocol.", warn: true, calcs: [["Pump rate", "pump"], ["Drip rate", "drip"]] },
    { name: "5% glucose / 0.45% sodium chloride", group: "Glucose with saline", neml: "Not on NEML 8th (listed by WHO)", na: 77, cl: 77, glucose: 50,
      use: "WHO IV maintenance option for children (" + WHO + ").",
      caution: "Confirm local availability.", calcs: [["Maintenance (4-2-1)", "fluids"], ["Pump rate", "pump"]] },
    // ---- Paediatric / special ----
    { name: "Darrow's solution, full strength", group: "Paediatric / special", neml: "NEML 8th, 20.2", na: 121, k: 35, cl: 103, lactate: 53,
      use: "Used mainly in children with diarrhoeal dehydration, per the prescriber.",
      caution: "Contains potassium (35 mmol/L). Check urine output and potassium before use.", calcs: [["Pump rate", "pump"]] },
    { name: "Darrow's solution, half strength", group: "Paediatric / special", neml: "NEML 8th, 20.2", na: 61, k: 17, cl: 52, lactate: 27,
      use: "WHO lists half-strength Darrow's with 5% glucose as a maintenance-type fluid for children (" + WHO + ").",
      caution: "It often comes WITHOUT glucose: glucose must be added before use (WHO). Contains potassium.", warn: true, calcs: [["Maintenance (4-2-1)", "fluids"], ["Pump rate", "pump"]] },
    { name: "Half-strength Ringer's lactate with 5% glucose", group: "Paediatric / special", neml: "Not on NEML 8th (listed by WHO)", na: 65, k: 2.7, cl: 56, ca: 1, lactate: 14, glucose: 50,
      use: "Listed in the WHO composition table for children (" + WHO + ").",
      caution: "Confirm local availability. Contains calcium.", calcs: [["Maintenance (4-2-1)", "fluids"]] },
    { name: "ReSoMal (rehydration solution for malnutrition)", group: "Paediatric / special", neml: "NEMLc 1st ed (children)",
      use: "For children with severe acute malnutrition. Composition and volumes are in the product label and the national malnutrition protocol.",
      caution: "Not the same as standard ORS. Follow the malnutrition protocol closely.", calcs: [] },
    // ---- Electrolyte concentrates ----
    { name: "Potassium chloride 7.5% (1 mmol/mL) and 15% (2 mmol/mL)", group: "Concentrate: must be diluted", neml: "NEML 8th, 20.1", k: 1000, cl: 1000, kNote: "7.5% shown (1,000 mmol/L K+ and Cl-). 15% is 2,000 mmol/L.",
      use: "Potassium replacement, per the prescriber.",
      caution: "HIGH-ALERT concentrate. Must be diluted and never given undiluted or as an IV push. Check the strength (7.5% or 15%) on the vial before calculating.", warn: true, calcs: [] },
    { name: "Potassium chloride injection, 20 mEq and 40 mEq", group: "Concentrate: must be diluted", neml: "NEML 8th, 20.2",
      use: "Potassium replacement, per the prescriber.",
      caution: "HIGH-ALERT. Must be diluted. Check whether the vial is 20 or 40 mEq.", warn: true, calcs: [] },
    { name: "Sodium bicarbonate 8.4%", group: "Concentrate: must be diluted", neml: "NEML 8th, 20.2", na: 1000, hco3: 1000, naNote: "8.4% = 1 mmol/mL = 1,000 mmol/L of Na+ and HCO3-.",
      use: "Per the prescriber.",
      caution: "Hypertonic. NEML 8th calls it 'isotonic (167 mmol/L)': 167 mmol/L is the 1.4% strength, NOT 8.4%. Do not mix with calcium. Flush the line.", warn: true, calcs: [] },
    { name: "Water for injection", group: "Concentrate: must be diluted", neml: "NEML 8th, 20.3",
      use: "Diluent for medicines (2, 5 and 10 mL ampoules).",
      caution: "Never infuse as a fluid: it is hypotonic and can cause haemolysis.", warn: true, calcs: [] },
    // ---- Colloids and osmotic ----
    { name: "Polygeline (gelatin) 3.5%, 500 mL", group: "Colloid / osmotic", neml: "NEML 8th, 9.3",
      use: "Plasma substitute, per the prescriber.",
      caution: "Check the product label: some gelatin products contain calcium and must not run with citrated blood in the same line.", calcs: [["Pump rate", "pump"]] },
    { name: "Dextran 6%", group: "Colloid / osmotic", neml: "NEML 8th, 9.3 (the PDF text reads 'Dextran 10': check the product)",
      use: "Plasma substitute, per the prescriber.", caution: "Check the product label for the dextran type and the dose limit.", calcs: [["Pump rate", "pump"]] },
    { name: "Mannitol 10% and 20%", group: "Colloid / osmotic", neml: "NEML 8th, section 14",
      use: "Osmotic diuretic, per the prescriber.", caution: "Check the solution is clear before use (crystals can form). Monitor urine output and fluid balance.", calcs: [["Pump rate", "pump"]] },
    // ---- Oral ----
    { name: "Oral rehydration salts (ORS), low osmolarity", group: "Oral", neml: "NEML 8th, 15.5.1 and 20.1", na: 75, k: 20, cl: 65, citrate: 10, glucoseMmol: 75, osm: 245,
      use: "Rehydration for diarrhoea. Powder for 200 mL, 500 mL or 1 L (13.5 g glucose, 2.6 g NaCl, 1.5 g KCl, 2.9 g trisodium citrate per litre).",
      caution: "Mix with clean water and the exact volume on the sachet. Sodium bicarbonate 2.5 g/L can replace the citrate.", calcs: [] },
    // ---- Blood products (not NEML) ----
    { name: "Packed red cells / whole blood", group: "Blood products (not on NEML)", neml: "Not on NEML (NEML 9 lists immunoglobulins and clotting factors only)",
      use: "Previous app values, unverified: adults 1 unit raises Hb by about 1 g/dL; children 10-15 mL/kg.", caution: "Crossmatch and the two-person bedside check are required. Follow the transfusion policy and monitor for reactions.", warn: true, calcs: [["Pump rate", "pump"]] },
    { name: "Fresh frozen plasma", group: "Blood products (not on NEML)", neml: "Not on NEML",
      use: "Previous app value, unverified: 10-15 mL/kg.", caution: "ABO compatibility is required. Follow the transfusion policy.", warn: true, calcs: [["Pump rate", "pump"]] },
    { name: "Platelets", group: "Blood products (not on NEML)", neml: "Not on NEML",
      use: "Dose not yet verified. The previous entry ('1 unit') was not suitable for children.", caution: "ABO compatibility is required. Follow the transfusion policy.", warn: true, calcs: [] }
  ];
  window.VERDANT_FLUIDS = FLUIDS;
  window.VERDANT_FLUIDS_VERSION = "1.0, reviewed 17 Nov 2026";

  function el(tag, className, text) { const n = document.createElement(tag); if (className) n.className = className; if (text !== undefined) n.textContent = text; return n; }
  const fmt = function (n) { return String(Number(n.toFixed(1))); };

  // Calculated osmolarity: every dissolved ion counts, glucose is converted from g/L to mmol/L
  function osmolarity(f) {
    if (f.osm) return f.osm;
    const ions = (f.na || 0) + (f.k || 0) + (f.cl || 0) + (f.ca || 0) + (f.lactate || 0) + (f.hco3 || 0) + (f.citrate || 0);
    const glu = f.glucoseMmol || (f.glucose ? f.glucose / 0.1802 : 0);
    const total = ions + glu;
    return total > 0 ? Math.round(total) : null;
  }
  function tonicity(osm) { return osm === null ? "" : osm < 250 ? "hypotonic" : osm <= 340 ? "about isotonic" : "hypertonic"; }
  function composition(f) {
    const parts = [];
    [["Na+", f.na], ["K+", f.k], ["Cl-", f.cl], ["Ca++", f.ca], ["lactate", f.lactate], ["HCO3-", f.hco3], ["citrate", f.citrate]].forEach(function (p) { if (p[1] !== undefined) parts.push(p[0] + " " + fmt(p[1])); });
    if (f.glucoseMmol) parts.push("glucose " + f.glucoseMmol);
    const text = parts.length ? parts.join(", ") + " mmol/L" : "";
    return text + (f.glucose ? (text ? "; " : "") + "glucose " + fmt(f.glucose) + " g/L" : "");
  }

  const css = el("style");
  css.textContent = ".fluid-guide{margin:0 0 12px;padding:12px 14px;border-radius:12px;border:1px solid var(--edge,#ccc);border-left:4px solid var(--accent,#A94A27);background:var(--panel,#fff);font-size:14px;color:var(--ink,#12372A)}" +
    ".fluid-guide h3{margin:0 0 6px;font-size:15px}.fluid-guide p{margin:4px 0}.fluid-guide__src{color:var(--ink-dim,#3E6652);font-size:12px}" +
    ".fluid-card{background:var(--panel,#fff);border:1px solid var(--edge,#ccc);border-radius:12px;padding:16px;margin-bottom:12px}" +
    ".fluid-card .drug-info-row{margin-bottom:6px}.fluid-card__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}" +
    ".fluid-filter{display:flex;gap:8px;margin:8px 0}.fluid-filter .control{flex:1}";
  document.head.append(css);

  const details = el("details", "library");
  details.id = "fluids-library";
  details.append(el("summary", "", "Fluids Reference (" + FLUIDS.length + ")"));

  const guide = el("div", "fluid-guide");
  guide.append(el("h3", "", "Choosing IV fluids for children"));
  guide.append(el("p", "", "Resuscitation (severe dehydration or shock): isotonic fluid, 0.9% saline or Ringer's lactate."));
  guide.append(el("p", "", "IV maintenance: Ringer's lactate with 5% dextrose, 0.9% saline with 5% glucose, or half-normal saline with 5% glucose."));
  guide.append(el("p", "", "Do not use 0.18% saline with 4% glucose, or 5% glucose in water, for rehydration or maintenance. They can be used mainly in the first few days of life."));
  guide.append(el("p", "", "When a child can feed or take fluids by mouth or NG tube, that is the safest route."));
  guide.append(el("p", "fluid-guide__src", "Source: WHO Pocket Book of Hospital Care for Children, 2nd edition 2013, Annex 4 (section A4.1). Follow your unit protocol."));

  const search = el("input", "control");
  search.type = "search";
  search.placeholder = "Search fluids";
  search.autocomplete = "off";
  search.setAttribute("aria-label", "Search fluids");
  const groups = Array.from(new Set(FLUIDS.map(function (f) { return f.group; })));
  const filter = el("select", "control");
  filter.setAttribute("aria-label", "Filter by group");
  filter.append(new Option("All groups", ""));
  groups.forEach(function (g) { filter.append(new Option(g, g)); });
  const bar = el("div", "fluid-filter");
  bar.append(search, filter);
  const list = el("div", "library__list");
  const empty = el("p", "library__empty", "No fluid matches that search.");
  empty.hidden = true;

  function openCalc(id) {
    const select = document.getElementById("nr-select");
    if (!select) return;
    if (window.Verdant && window.Verdant.setMode) window.Verdant.setMode("nursing");
    select.value = id;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    if (select.scrollIntoView) select.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function card(f) {
    const c = el("div", "drug-card fluid-card");
    c.append(el("div", "drug-name", f.name));
    c.append(el("div", "drug-category", f.group + " \u00b7 " + f.neml));
    const comp = composition(f), osm = osmolarity(f);
    const rows = [];
    if (comp) rows.push(["Contains:", comp + (f.kNote ? " (" + f.kNote + ")" : "") + (f.naNote ? " (" + f.naNote + ")" : "")]);
    if (osm !== null) rows.push(["Osmolarity:", "about " + osm + " mOsm/L (calculated), " + tonicity(osm)]);
    if (f.glucoseNote) rows.push(["Note:", f.glucoseNote]);
    rows.push(["Use:", f.use]);
    rows.forEach(function (r) {
      const row = el("div", "drug-info-row");
      row.append(el("span", "drug-label", r[0]), el("span", "drug-value", r[1]));
      c.append(row);
    });
    if (f.caution) c.append(el("div", "drug-warning", "\u26a0 " + f.caution));
    if (f.calcs && f.calcs.length) {
      const actions = el("div", "fluid-card__actions");
      f.calcs.forEach(function (pair) {
        const b = el("button", "btn btn--small", pair[0]);
        b.type = "button";
        b.setAttribute("aria-label", "Open the " + pair[0] + " calculator for " + f.name);
        b.addEventListener("click", function () { openCalc(pair[1]); });
        actions.append(b);
      });
      c.append(actions);
    }
    return c;
  }

  function draw() {
    const q = search.value.trim().toLowerCase(), g = filter.value;
    const shown = FLUIDS.filter(function (f) { return (!g || f.group === g) && (f.name + " " + f.group + " " + f.use).toLowerCase().indexOf(q) !== -1; });
    list.replaceChildren.apply(list, shown.map(card));
    empty.hidden = shown.length > 0;
  }
  search.addEventListener("input", draw);
  filter.addEventListener("change", draw);
  draw();

  details.append(guide, bar, list, empty);
  panel.append(details);
})();