"use strict";

/* VERDANT drug reference, version 2.2 (reviewed 19 Nov 2026)
   Presentations and strengths: Nigeria Essential Medicines List, Adult 8th edition.
   Paediatric restrictions: Nigeria Essential Medicines List for Children, 1st edition (2020).
   Doses: NEITHER Nigerian list contains doses (except vitamins, Appendix 1). Each entry's category line shows its dose status.
   Vitals policy: RISK-BASED. A vital sign is requested only where the drug has a clinically
   significant acute effect on that parameter at therapeutic dose. Absence of a vital is a
   deliberate clinical decision, not an omission. See window.VERDANT_VITALS_POLICY.
   Source note: the attached NSTG 2022 excerpt contains front matter only (pp. 1-15); no drug
   monograph was available for dose verification. doseStatus values are carried from v2.0 and
   its cited sources, not from the attached PDF.
   Educational reference and double-check tool. It never replaces the prescriber's order. */

window.VERDANT_DRUGS_VERSION = "2.2, reviewed 19 Nov 2026";

window.VERDANT_VITALS_POLICY = {
  mode: "risk-based",
  description: "A vital sign is shown for a drug only where that drug has a clinically significant acute effect on the parameter at therapeutic dose. No field means no monitoring requirement, not missing data.",
  parameters: {
    bp:  { label: "Blood pressure", noFieldReason: "No clinically significant acute BP effect at therapeutic dose." },
    hr:  { label: "Heart rate",     noFieldReason: "No clinically significant acute HR effect at therapeutic dose." },
    rr:  { label: "Respiratory rate", noFieldReason: "Not a respiratory depressant at therapeutic dose." },
    spo2:{ label: "SpO2",           noFieldReason: "No clinically significant acute oxygen-saturation effect at therapeutic dose." }
  },
  contraindicationLabels: {
    low_bp:  "Hypotension — review before administering",
    low_hr:  "Bradycardia — review before administering",
    low_rr:  "Respiratory rate below safe threshold — respiratory depressant",
    low_spo2:"SpO2 below safe threshold — respiratory depressant"
  }
};

window.VERDANT_DRUGS = [
  { name: "Oxygen", category: "Medical Gas · NEML 8th · Dose: unverified", formulation: "Inhalation (medical gas)", adultDose: "As required for hypoxaemia", pediatricDose: "As required", warning: "Monitor SpO2.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["spo2"] },

  { name: "Ketamine", category: "Anaesthetic · NEML 8th · Dose: unverified", formulation: "Inj: 50 mg/mL in 10-mL vial; 100 mg/mL in 5-mL vial", adultDose: "Induction: 1-2 mg/kg IV", pediatricDose: "Induction: 1-2 mg/kg IV", warning: "Emergence reactions. High-alert. Respiratory depression possible at induction doses.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Propofol", category: "Anaesthetic · NEML 8th · Dose: unverified", formulation: "Inj (emulsion): 10 mg/mL in 20-mL ampoule", adultDose: "Induction: 1.5-2.5 mg/kg IV", pediatricDose: "Induction: 2.5-3.5 mg/kg IV", warning: "Respiratory depression. High-alert. NEMLc 1st ed: not for children under 3 years.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Midazolam", category: "Anaesthetic / Anticonvulsant · NEML 8th · Dose: unverified", formulation: "Inj: 1 mg/mL; 2 mg/mL; 5 mg/mL. Oral liquid: 2 mg/mL. Tab: 7.5 mg; 15 mg. Oromucosal solution: 1, 5, 10 mg/mL", adultDose: "Sedation: 0.5-2 mg IV", pediatricDose: "0.1-0.2 mg/kg IV", warning: "Respiratory depression. The dose depends on the indication (sedation or seizures): confirm with the order.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Atropine", category: "Pre-med / Antidote · NEML 8th · Dose: unverified", formulation: "Inj: 600 mcg/mL; 1 mg/mL", adultDose: "Bradycardia: 0.5 mg IV (Max 3 mg)", pediatricDose: "0.02 mg/kg IV", warning: "Minimum dose 0.1 mg in children.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Epinephrine (Adrenaline)", category: "Anti-anaphylactic · NEML 8th · Dose: unverified", formulation: "Inj: 1 mg in 1-mL ampoule (1 mg/mL, 1:1000)", adultDose: "Anaphylaxis: 0.5 mg IM", pediatricDose: "Anaphylaxis: 0.01 mg/kg IM (Max 0.5 mg)", warning: "Use IM route for anaphylaxis.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"] },

  { name: "Hydrocortisone", category: "Corticosteroid · NEML 8th · Dose: unverified", formulation: "Powder for inj: 100 mg (sodium succinate) in vial", adultDose: "100-200 mg IV", pediatricDose: "4 mg/kg IV", warning: "Monitor blood glucose.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Prednisolone", category: "Corticosteroid · NEML 8th · Dose: unverified", formulation: "Tab: 5 mg; 25 mg. Oral liquid: 5 mg/mL; 15 mg/5 mL", adultDose: "15-40 mg PO daily", pediatricDose: "1-2 mg/kg/day PO", warning: "Give with food. Short courses unless prescribed.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Chlorphenamine", category: "Antihistamine · NEML 8th · Dose: unverified", formulation: "Inj: 10 mg in 1-mL ampoule. Oral liquid: 2 mg/5 mL", adultDose: "10 mg IV/IM", pediatricDose: "2.5-5 mg IV/IM", warning: "May cause drowsiness.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Dexamethasone", category: "Corticosteroid · NEML 8th · Dose: unverified", formulation: "Inj: 2 mg/mL; 4 mg/mL. Tab: 0.5 mg; 2 mg; 4 mg. Oral liquid: 2 mg/5 mL", adultDose: "0.5-10 mg daily", pediatricDose: "0.1-0.6 mg/kg/day", warning: "Hyperglycaemia risk.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Diazepam", category: "Anticonvulsant · NEML 8th · Dose: unverified", formulation: "Inj: 5 mg/mL in 2-mL ampoule. Tab: 5 mg; 10 mg. Suppository: 2.5, 5, 10 mg", adultDose: "Status epilepticus: 10 mg IV", pediatricDose: "0.3 mg/kg IV", warning: "Respiratory depression. Rectal route is an alternative.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Magnesium Sulfate", category: "Anticonvulsant / Eclampsia · NEML 8th · Dose: unverified", formulation: "Inj: 50% in 2-mL ampoule; 20% in 5- or 10-mL ampoule", adultDose: "Eclampsia: 4 g IV loading, then 1 g/hr", pediatricDose: "Asthma: 40-50 mg/kg IV", warning: "Monitor for toxicity (loss of reflexes, oliguria). Antidote: calcium gluconate. Can cause respiratory depression at toxic levels.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Phenobarbital", category: "Anticonvulsant · NEML 8th · Dose: unverified", formulation: "Inj: 30 mg/mL; 60 mg/mL. Tab: 15, 30, 60 mg. Oral liquid: 15 mg/5 mL; 20 mg/mL", adultDose: "Status: 10-20 mg/kg IV", pediatricDose: "10-20 mg/kg IV", warning: "Respiratory depression.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Phenytoin Sodium", category: "Anticonvulsant · NEML 8th · Dose: unverified", formulation: "Inj: 50 mg/mL. Cap: 25, 50, 100, 300 mg. Oral liquid: 125 mg/5 mL", adultDose: "Loading: 15-20 mg/kg IV", pediatricDose: "Loading: 15-20 mg/kg IV", warning: "Dilute in normal saline only. Do not mix with dextrose. Rapid IV infusion can cause respiratory depression.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "bp", "hr"], contraindications: ["low_rr"] },

  { name: "Sodium Valproate", category: "Anticonvulsant · NEML 8th · Dose: unverified", formulation: "Tab (enteric-coated): 100 mg; 200 mg; 500 mg. Oral liquid: 200 mg/5 mL; 250 mg/5 mL", adultDose: "10-15 mg/kg/day", pediatricDose: "20-30 mg/kg/day", warning: "Hepatotoxicity risk. Avoid in pregnancy.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Naloxone", category: "Opioid Antidote · NEML 8th · Dose: unverified", formulation: "Inj: 0.4 mg (400 mcg) in 1-mL ampoule", adultDose: "0.4 - 2 mg IV/IM", pediatricDose: "0.01 mg/kg IV", warning: "May cause acute withdrawal.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"] },

  { name: "Vitamin K1 (Phytomenadione)", category: "Coagulation Antidote · NEML 8th · Dose: unverified", formulation: "Inj: 10 mg/mL in 1-mL ampoule (antidote list); 1 mg/mL (blood list). Tab: 10 mg", adultDose: "10 mg IV/IM", pediatricDose: "1 mg IM (neonates)", warning: "Protect from light. For neonates use the 1 mg/mL product.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Calcium Gluconate", category: "Antidote · NEML 8th · Dose: unverified", formulation: "Inj: 100 mg/mL in 10-mL ampoule", adultDose: "10-20 mL IV", pediatricDose: "0.5-1 mL/kg IV", warning: "Extravasation can cause necrosis.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Activated Charcoal", category: "Poisoning · NEML 8th · Dose: unverified", formulation: "Cap: 260 mg. Powder/granules: 5 g. Tab: 250 mg", adultDose: "50 g PO", pediatricDose: "1 g/kg PO", warning: "Contraindicated in unprotected airway.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Amoxicillin", category: "Antibiotic (Access) · NEML 8th · Dose: unverified", formulation: "Cap: 250 mg; 500 mg. Tab: 250 mg; 500 mg. Powder for oral liquid: 125 mg/5 mL; 250 mg/5 mL. Powder for inj: 250 mg; 500 mg; 1 g", adultDose: "500 mg every 8 hours", pediatricDose: "25-50 mg/kg/day in 3 doses", warning: "Check for penicillin allergy. Recent WHO-based paediatric recommendations use up to 100 mg/kg/day in 2 to 3 doses (max 4 g/day) for pneumonia or severe infection: confirm the indication.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Ceftriaxone", category: "Antibiotic (Watch) · NEML 8th · Dose: partly source-checked", formulation: "Powder for inj: 250 mg; 500 mg; 1 g (sodium) in vial", adultDose: "1-2 g IV/IM daily", pediatricDose: "50-80 mg/kg IV/IM daily", warning: "Do not mix with calcium-containing fluids (Ringer's lactate). NEMLc 1st ed lists it only above 41 weeks corrected gestational age.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based" },

  { name: "Metronidazole", category: "Antibiotic / Antiprotozoal · NEML 8th · Dose: unverified", formulation: "Tab: 200 mg; 400 mg. Oral liquid: 200 mg/5 mL. Inj: 500 mg in 100-mL bottle", adultDose: "400 mg PO TID or 500 mg IV TID", pediatricDose: "7.5 mg/kg TID", warning: "Disulfiram-like reaction with alcohol.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Gentamicin", category: "Antibiotic (Access) · NEML 8th · Dose: partly source-checked", formulation: "Inj: 40 mg/mL in 2-mL ampoule", adultDose: "3-5 mg/kg/day IV", pediatricDose: "5-7.5 mg/kg/day IV", warning: "Nephrotoxic and ototoxic. Monitor levels. Neonates (WHO Pocket Book 2013, via MSF guideline): 3 mg/kg every 24 h if birth weight 2000 g or less; 5 mg/kg every 24 h if above 2000 g.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based" },

  { name: "Doxycycline", category: "Antibiotic (Access) · NEML 8th · Dose: unverified", formulation: "Cap: 100 mg", adultDose: "100 mg BID PO", pediatricDose: "Avoid under 8 years unless there is no alternative", warning: "Avoid in children under 8 and in pregnancy.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Ciprofloxacin", category: "Antibiotic (Watch) · NEML 8th · Dose: partly source-checked", formulation: "Tab: 250 mg; 500 mg. Inj: 2 mg/mL in 50-mL or 100-mL bottle", adultDose: "500 mg BID PO", pediatricDose: "10-15 mg/kg BID", warning: "Tendon rupture risk.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based" },

  { name: "Benzylpenicillin", category: "Antibiotic (Access) · NEML 8th · Dose: corrected, verify", formulation: "Powder for inj: 600 mg (= 1 million units); 3 g (= 5 million units)", adultDose: "N/A. Under review: the previous value (1.2-2.4 g per DAY) looked too low. Confirm in NSTG or BNF.", pediatricDose: "100 mg/kg/day IV in 4 doses; 200 mg/kg/day in severe infection (Bull WHO 2020 expert recommendation)", warning: "The previous paediatric value (50,000 IU/kg/day) was about 4 times too low if meant per day. 600 mg = 1 million units. High doses can cause seizures in renal failure.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Ampicillin", category: "Antibiotic (Access) · NEML 8th · Dose: corrected, verify", formulation: "Cap: 250 mg; 500 mg. Powder for inj: 500 mg; 1 g (sodium)", adultDose: "500 mg - 1 g IV/PO every 6 hours", pediatricDose: "100 mg/kg/day PO/IV in 4 doses; 200 mg/kg/day in severe infection (Bull WHO 2020)", warning: "Check for penicillin allergy. Neonates (WHO Pocket Book via MSF): birth weight 2000 g or less 50 mg/kg every 12 h; above 2000 g 50 mg/kg every 8 h (100 mg/kg per dose if meningitis).", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Cloxacillin", category: "Antibiotic (Access) · NEML 8th · Dose: partly source-checked", formulation: "Cap: 250 mg; 500 mg (sodium). Powder for inj: 500 mg. Powder for oral solution: 125 mg/5 mL", adultDose: "500 mg every 6 hours", pediatricDose: "100 mg/kg/day PO/IV in 2 to 4 doses (Bull WHO 2020)", warning: "Check for penicillin allergy.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based" },

  { name: "Erythromycin", category: "Antibiotic (Watch) · NEML 8th · Dose: unverified", formulation: "Cap/Tab: 250 mg; 500 mg. Oral liquid: 125 mg/5 mL. Powder for inj: 500 mg", adultDose: "500 mg every 6 hours", pediatricDose: "30-50 mg/kg/day", warning: "QT prolongation.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Azithromycin", category: "Antibiotic (Watch) · NEML 8th · Dose: partly source-checked", formulation: "Tab: 250 mg; 500 mg. Powder for oral liquid: 200 mg/5 mL", adultDose: "500 mg daily for 3 days", pediatricDose: "10 mg/kg day 1, then 5 mg/kg", warning: "QT prolongation.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based" },

  { name: "Artemether + Lumefantrine", category: "Antimalarial · NEML 8th · Dose: unverified", formulation: "Tab: 20/120 mg; 40/240 mg; 80/480 mg", adultDose: "4 tabs (20/120) BID for 3 days", pediatricDose: "Weight-based (see pack)", warning: "Take with fatty food. NEMLc 1st ed: not recommended under 5 kg.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Artesunate", category: "Antimalarial (Severe) · NEML 8th · Dose: corrected, verify", formulation: "Powder for inj: 60 mg vial with 1 mL of 5% sodium bicarbonate solvent", adultDose: "2.4 mg/kg IV at 0, 12, 24 hours", pediatricDose: "2.4 mg/kg IV (children under 20 kg: 3 mg/kg per WHO malaria guidelines, verify)", warning: "Preferred for severe malaria.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Quinine", category: "Antimalarial · NEML 8th · Dose: unverified", formulation: "Tab: 300 mg. Inj: 300 mg/mL in 2-mL ampoule", adultDose: "600 mg IV every 8 hours", pediatricDose: "10 mg/kg IV every 8 hours", warning: "Monitor blood glucose (hypoglycaemia risk). Rapid IV infusion can cause hypotension and respiratory depression.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_rr", "low_bp"] },

  { name: "Primaquine", category: "Antimalarial · Not in NEML 8th · Dose: not added", formulation: "Not listed in NEML 8th. Tab: 7.5 mg; 15 mg (common pack sizes)", adultDose: "N/A. Under review: the previous text was ambiguous (daily for 14 days or a single dose).", pediatricDose: "N/A. Under review: the previous text was ambiguous.", warning: "Check for G6PD deficiency. Not on NEML 8th: follow the national malaria programme.", neml: "Not in NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Atenolol", category: "Beta-blocker · NEML 8th · Dose: unverified", formulation: "Tab: 25 mg; 50 mg; 100 mg", adultDose: "50-100 mg daily", pediatricDose: "1-2 mg/kg/day", warning: "Do not stop abruptly. Contraindicated in bradycardia. Can worsen bronchospasm and respiratory depression in overdose.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_hr", "low_rr"] },

  { name: "Amlodipine", category: "Calcium Channel Blocker · NEML 8th · Dose: unverified", formulation: "Tab: 5 mg; 10 mg", adultDose: "5-10 mg daily", pediatricDose: "0.1-0.2 mg/kg/day", warning: "Ankle oedema.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Furosemide", category: "Loop Diuretic · NEML 8th · Dose: unverified", formulation: "Inj: 10 mg/mL in 2-mL ampoule. Tab: 20 mg; 40 mg", adultDose: "20-40 mg IV/PO", pediatricDose: "1-2 mg/kg IV/PO", warning: "Monitor potassium and renal function. NEML 8th prints the injection as 10 mg/mL in one place and 10 mg/2 mL in another: check the ampoule label.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Digoxin", category: "Cardiac Glycoside · NEML 8th · Dose: unverified", formulation: "Tab: 62.5, 125, 250 mcg. Inj: 250 mcg/mL in 2-mL ampoule; 100 mcg/mL in 1-mL ampoule. Oral liquid: 50 mcg/mL", adultDose: "0.125-0.25 mg daily", pediatricDose: "Digitalizing dose: 20-40 mcg/kg", warning: "Narrow therapeutic index. Bradycardia and arrhythmia in toxicity.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "pr"], contraindications: ["low_hr"] },

  { name: "Hydralazine", category: "Vasodilator / obstetric antihypertensive · NEML 8th · Dose: unverified", formulation: "Powder for inj: 20 mg in ampoule (reconstitute). Tab: 25 mg; 50 mg", adultDose: "5-10 mg IV every 20-30 mins", pediatricDose: "0.1-0.2 mg/kg IV", warning: "Reflex tachycardia. Monitor BP closely (also used in pre-eclampsia). Reconstitute the powder: the ampoule is not a ready-made 20 mg/mL solution.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"], contraindications: ["low_bp"] },

  { name: "Isosorbide Dinitrate", category: "Nitrate · NEML 8th · Dose: unverified", formulation: "Tab: 5, 10, 20, 30 mg. Sublingual tab: 5 mg", adultDose: "5-10 mg SL", pediatricDose: "Rarely used", warning: "Hypotension. Contraindicated with PDE5 inhibitors.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"], contraindications: ["low_bp"] },

  { name: "Atorvastatin", category: "Statin · NEML 8th · Dose: unverified", formulation: "Tab: 10 mg; 20 mg; 40 mg", adultDose: "10-80 mg daily", pediatricDose: "N/A", warning: "Monitor LFTs.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Aspirin", category: "Antiplatelet · NEML 8th · Dose: unverified", formulation: "Tab: 75, 100, 150, 300 mg. Cap: 300 mg", adultDose: "75-300 mg daily", pediatricDose: "Avoid (Reye's syndrome)", warning: "GI bleeding risk.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Clopidogrel", category: "Antiplatelet · NEML 8th · Dose: unverified", formulation: "Tab: 75 mg; 300 mg", adultDose: "75 mg daily", pediatricDose: "N/A", warning: "Monitor for bleeding.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Insulin (Soluble)", category: "Antidiabetic · NEML 8th · Dose: unverified", formulation: "Inj: 100 units/mL in 10-mL vial", adultDose: "Variable (e.g. sliding scale)", pediatricDose: "0.1 IU/kg/hr IV infusion", warning: "High-alert. Monitor blood glucose closely. Use an insulin syringe for 100 units/mL.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Metformin", category: "Antidiabetic · NEML 8th · Dose: unverified", formulation: "Tab: 500 mg; 1 g", adultDose: "500-850 mg BID", pediatricDose: "500 mg BID (Max 2g/day)", warning: "Hold before contrast imaging. 850 mg tablets are not on NEML 8th.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Glibenclamide", category: "Antidiabetic · NEML 8th · Dose: unverified", formulation: "Tab: 5 mg", adultDose: "5-15 mg daily", pediatricDose: "N/A", warning: "Hypoglycaemia risk.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Levothyroxine", category: "Thyroid Hormone · NEML 8th · Dose: unverified", formulation: "Tab: 50 mcg; 100 mcg", adultDose: "1.6 mcg/kg/day", pediatricDose: "Weight-based", warning: "Take on an empty stomach.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Carbimazole", category: "Antithyroid · NEML 8th · Dose: unverified", formulation: "Tab: 5 mg", adultDose: "20-40 mg daily", pediatricDose: "0.5 mg/kg/day", warning: "Monitor FBC (agranulocytosis).", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Omeprazole", category: "Proton Pump Inhibitor · NEML 8th · Dose: unverified", formulation: "Cap: 10 mg; 20 mg. Powder for inj: 40 mg in vial", adultDose: "20-40 mg daily", pediatricDose: "0.7-1.4 mg/kg/day", warning: "Take before meals.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Ranitidine", category: "H2 Blocker · NEML 8th · Dose: unverified", formulation: "Inj: 25 mg/mL in 2-mL ampoule. Tab: 150 mg; 300 mg", adultDose: "50 mg IV every 8 hours", pediatricDose: "1-2 mg/kg IV", warning: "Renal adjustment needed. Ranitidine products were withdrawn in several countries over NDMA contamination: check current NAFDAC and pharmacy availability.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Ondansetron", category: "Antiemetic · NEML 8th · Dose: unverified", formulation: "Inj: 2 mg/mL in 2-mL ampoule. Oral liquid: 4 mg/5 mL. Tab: 4 mg; 8 mg", adultDose: "4-8 mg IV", pediatricDose: "0.1-0.15 mg/kg IV", warning: "QT prolongation. NEMLc 1st ed: use from 1 month of age.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Metoclopramide", category: "Antiemetic · NEML 8th · Dose: unverified", formulation: "Inj: 5 mg/mL in 2-mL ampoule. Oral liquid: 5 mg/5 mL. Tab: 10 mg", adultDose: "10 mg IV/IM", pediatricDose: "0.1-0.15 mg/kg IV", warning: "Extrapyramidal side effects. Not for children under 1 year (EMA restriction).", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Bisacodyl", category: "Laxative · NEML 8th · Dose: unverified", formulation: "Tab: 5 mg. Suppository: 5 mg; 10 mg", adultDose: "5-15 mg PO or 10 mg PR", pediatricDose: "5 mg PO", warning: "Do not crush tablets.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Oral Rehydration Salts (ORS)", category: "Rehydration · NEML 8th · Dose: corrected, verify", formulation: "Powder for dilution in 200 mL; 500 mL; 1 L. Low osmolarity 245 mOsm/L: Na 75, K 20, Cl 65, citrate 10, glucose 75 mmol/L", adultDose: "As required", pediatricDose: "75 mL/kg over 4 hours (some dehydration, WHO Plan B: verify)", warning: "Use clean water. See also the Fluids Reference.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Oxytocin", category: "Uterotonic · NEML 8th · Dose: unverified", formulation: "Inj: 10 units in 1 mL", adultDose: "5-10 IU IM/IV", pediatricDose: "N/A", warning: "High-alert medication.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"] },

  { name: "Misoprostol", category: "Uterotonic · NEML 8th · Dose: unverified", formulation: "Tab: 200 mcg", adultDose: "600 mcg PO/PR", pediatricDose: "N/A", warning: "Contraindicated in viable pregnancy. For incomplete abortion or miscarriage it is on the NEML Restricted Medicines List.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"] },

  { name: "Ergometrine", category: "Uterotonic · NEML 8th · Dose: corrected, verify", formulation: "Inj: 200 mcg (hydrogen maleate) in 1-mL ampoule", adultDose: "200 mcg IM", pediatricDose: "N/A", warning: "Contraindicated in hypertension. The previous entry gave 500 mcg and a 500 mcg/mL strength, which does not match the NEML 200 mcg ampoule: verify against the order and the vial.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Mifepristone", category: "Abortifacient · NEML 8th · Dose: unverified", formulation: "Tab (co-packaged with misoprostol): 200 mg + 200 mcg. Restricted list: 300 mg tab", adultDose: "As per protocol", pediatricDose: "N/A", warning: "Restricted use.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Paracetamol", category: "Analgesic / Antipyretic · NEML 8th · Dose: unverified", formulation: "Tab: 125 mg; 500 mg. Oral liquid: 125 mg/5 mL. Suppository: 100 mg. Inj: 150 mg/mL (as printed in NEML 8th)", adultDose: "1g every 6 hours (Max 4g/day)", pediatricDose: "15 mg/kg every 6 hours", warning: "Hepatotoxic in overdose. NEML prints the injection as 150 mg/mL, but the common IV product is 10 mg/mL: read the vial strength before calculating.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Ibuprofen", category: "NSAID · NEML 8th · Dose: unverified", formulation: "Tab: 200 mg; 400 mg", adultDose: "400 mg every 8 hours", pediatricDose: "10 mg/kg every 8 hours", warning: "GI irritation. NEMLc 1st ed: not under 3 months of age.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Morphine", category: "Opioid · NEML 8th · Dose: unverified", formulation: "Inj: 10 mg/mL; 15 mg/mL (1-mL ampoule); 0.5 and 1 mg/mL preservative-free (10-mL vial). Oral liquid: 10 mg/5 mL. MR tab: 10, 30, 60 mg", adultDose: "2.5-5 mg IV", pediatricDose: "0.05-0.1 mg/kg IV", warning: "Respiratory depression. High-alert.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Tramadol", category: "Opioid · NEML 8th · Dose: unverified", formulation: "Cap: 50 mg; 100 mg. Inj: 50 mg/mL (1-mL and 2-mL ampoule); 100 mg/2 mL", adultDose: "50-100 mg IV/PO", pediatricDose: "1-2 mg/kg IV", warning: "Seizure risk. Respiratory depression.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Haloperidol", category: "Antipsychotic · NEML 8th · Dose: unverified", formulation: "Inj: 5 mg in 1-mL ampoule. Oral liquid: 2 mg/mL. Tab: 0.5 mg; 2 mg; 5 mg", adultDose: "5-10 mg IM", pediatricDose: "0.05 mg/kg/day", warning: "Extrapyramidal side effects.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"] },

  { name: "Fluoxetine", category: "Antidepressant · NEML 8th · Dose: unverified", formulation: "Cap: 20 mg. Tab: 20 mg", adultDose: "20 mg daily", pediatricDose: "10 mg daily", warning: "Suicidal ideation risk.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Amitriptyline", category: "Tricyclic · NEML 8th · Dose: unverified", formulation: "Tab: 10 mg; 25 mg; 50 mg; 100 mg", adultDose: "25-150 mg daily", pediatricDose: "1-2 mg/kg/day", warning: "Cardiotoxic in overdose. The paediatric dose depends on the indication, and tricyclics are not recommended for depression in children: confirm. Respiratory depression in overdose.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_rr"] },

  { name: "Salbutamol", category: "Bronchodilator · NEML 8th · Dose: unverified", formulation: "Inj: 50 mcg/mL in 5-mL ampoule. MDI: 100 mcg/dose. Nebuliser solution: 5 mg/mL. Tab: 2 mg", adultDose: "2.5-5 mg nebulized", pediatricDose: "2.5 mg nebulized", warning: "Tremor and tachycardia.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Beclomethasone", category: "Inhaled Corticosteroid · NEML 8th (restricted list) · Dose: unverified", formulation: "Inhaler: 100 mcg/dose; 200 mcg/dose", adultDose: "100-1000 mcg/day", pediatricDose: "50-100 mcg/day", warning: "Rinse mouth after use.", neml: "NEML 8th (restricted list)", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Aminophylline", category: "Bronchodilator · NEML 8th (restricted list) · Dose: unverified", formulation: "Inj: 25 mg/mL in 10-mL ampoule", adultDose: "5 mg/kg IV loading", pediatricDose: "5 mg/kg IV loading", warning: "Narrow therapeutic index. Do not load if the patient already takes theophylline. On the NEML Restricted Medicines List. Respiratory depression and arrhythmias in toxicity.", neml: "NEML 8th (restricted list)", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Vitamin A", category: "Vitamin · NEML 8th (primary care list only) · Dose: unverified", formulation: "Cap: 100,000 units; 200,000 units (palmitate). Tab: 10,000 units. Oral oily solution: 100,000 units/mL", adultDose: "200,000 IU", pediatricDose: "100,000 IU (6-11m), 200,000 IU (>1y)", warning: "Teratogenic in high doses. NEML App. 1 daily doses: deficiency in adults 25,000-50,000 units; pregnancy 5,000-6,000 units.", neml: "NEML 8th (primary care list only)", doseStatus: "unverified", vitalsPolicy: "risk-based" },

  { name: "Folic Acid", category: "Vitamin · NEML 8th · Dose: corrected, verify", formulation: "Tab: 400 mcg; 1 mg; 5 mg. Inj: 5 mg/mL", adultDose: "5 mg daily", pediatricDose: "40-200 mcg daily (NEML 8th App. 1)", warning: "Take with food. NEML App. 1: adults 200-5,000 mcg daily. The previous paediatric value (0.5 mg) was above the NEML range.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Ferrous Sulfate", category: "Mineral · NEML 8th · Dose: corrected, verify", formulation: "Ferrous salt: tab equivalent to 60 mg iron. Oral liquid equivalent to 25 mg iron/mL", adultDose: "60 mg elemental iron daily (1 NEML tablet)", pediatricDose: "3-6 mg/kg/day of ELEMENTAL iron", warning: "GI upset, dark stools. Doses are in mg of elemental iron, not mg of the salt.", neml: "NEML 8th", doseStatus: "corrected", vitalsPolicy: "risk-based" },

  { name: "Ascorbic Acid (Vitamin C)", category: "Vitamin · NEML 8th · Dose: source-checked (NEML App. 1)", formulation: "Inj: 100 mg. Oral solution: 100 mg/5 mL. Tab: 50 mg; 100 mg", adultDose: "250-1,000 mg daily (NEML 8th App. 1)", pediatricDose: "50-200 mg daily (NEML 8th App. 1)", warning: "High doses cause diarrhoea.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Dopamine", category: "Vasopressor · NEML 8th · Dose: unverified", formulation: "Inj: 40 mg/mL in 5-mL vial", adultDose: "2-20 mcg/kg/min IV", pediatricDose: "2-20 mcg/kg/min IV", warning: "Extravasation risk. Central line preferred.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_bp"] },

  { name: "Noradrenaline", category: "Vasopressor · Not in NEML 8th · Dose: unverified", formulation: "Not listed in NEML 8th. Inj: 1 mg/mL (common product)", adultDose: "0.05-3 mcg/kg/min IV", pediatricDose: "0.05-1 mcg/kg/min IV", warning: "Not on NEML 8th: confirm local availability and protocol. Central line preferred.", neml: "Not in NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_bp"] },

  { name: "Dobutamine", category: "Inotrope · NEML 8th · Dose: unverified", formulation: "Inj: 5 mg/mL in 50-mL vial", adultDose: "2.5-20 mcg/kg/min IV", pediatricDose: "2.5-20 mcg/kg/min IV", warning: "Monitor for arrhythmias. The previous entry gave 12.5 mg/mL, which is not the NEML strength: check the vial.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_bp"] },

  { name: "Amiodarone", category: "Antiarrhythmic · NEML 8th · Dose: unverified", formulation: "Tab: 100 mg; 200 mg (NEML 8th). Injection is not on the NEML", adultDose: "300 mg IV (Cardiac arrest)", pediatricDose: "5 mg/kg IV", warning: "Hypotension. High-alert. The NEML lists tablets only. Can cause bradycardia and respiratory depression.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_hr", "low_bp"] },

  { name: "Thiopental", category: "Anaesthetic · NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL; 20 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Bupivacaine", category: "Local anaesthetic · NEML 8th · Dose: not added", formulation: "Inj: 0.25%; 0.5% in vial. Spinal: 0.5% in 4-mL ampoule, mixed with 7.5% glucose", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Use the spinal-specific product for spinal anaesthesia.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Lidocaine", category: "Local anaesthetic / antiarrhythmic · NEML 8th · Dose: not added", formulation: "Inj: 1%; 2% in vial. Spinal: 5% in 2-mL ampoule (mix with 7.5% glucose). Topical: 2%; 4% cream. IV antiarrhythmic: 20 mg/mL in 5-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Lidocaine + Epinephrine", category: "Local anaesthetic · NEML 8th · Dose: not added", formulation: "Inj: 1%; 2% with epinephrine 1:200,000 in vial. Dental cartridge: 2% with 1:80,000", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Not for end-arteries (fingers, toes).", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Suxamethonium", category: "Muscle relaxant · NEML 8th · Dose: not added", formulation: "Inj: 20 mg/mL; 50 mg/mL; 100 mg/mL (chloride) in 2-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. For anaesthetic use. Respiratory paralysis.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Atracurium", category: "Muscle relaxant · NEML 8th (restricted list) · Dose: not added", formulation: "Inj: 10 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory paralysis.", neml: "NEML 8th (restricted list)", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Vecuronium", category: "Muscle relaxant · NEML 8th · Dose: not added", formulation: "Powder for inj: 10 mg; 20 mg (bromide) in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory paralysis.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Pancuronium", category: "Muscle relaxant · NEML 8th · Dose: not added", formulation: "Inj: 2 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory paralysis.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Neostigmine", category: "Cholinesterase inhibitor · NEML 8th · Dose: not added", formulation: "Inj: 0.5 mg/mL; 1 mg/mL; 2.5 mg/mL (methylsulfate) in 1-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Promethazine", category: "Antihistamine / antiemetic · NEML 8th · Dose: not added", formulation: "Inj: 25 mg/mL. Tab: 10, 12.5, 25 mg. Oral liquid: 5 mg/5 mL. Suppository: 12.5, 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Sedating. Respiratory depression, especially in children.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Clonidine", category: "Anaesthetic adjuvant · NEML 8th · Dose: not added", formulation: "Inj: 500 mcg/mL in 1-mL ampoule. Tab: 0.1 mg; 0.2 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Can cause bradycardia and respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_rr", "low_hr", "low_bp"] },

  { name: "Lorazepam", category: "Benzodiazepine / Anticonvulsant · NEML 8th · Dose: not added", formulation: "Inj: 2 mg/mL; 4 mg/mL in 1-mL ampoule. Tab: 1 mg; 2 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Loratadine", category: "Antihistamine · NEML 8th · Dose: not added", formulation: "Oral liquid: 1 mg/mL. Tab: 10 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Carbamazepine", category: "Anticonvulsant · NEML 8th · Dose: not added", formulation: "Tab: 100 mg; 200 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Can cause respiratory depression in overdose.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr"], contraindications: ["low_rr"] },

  { name: "Clonazepam", category: "Anticonvulsant · NEML 8th · Dose: not added", formulation: "Inj: 1 mg/mL ampoule (for dilution). Oral liquid: 500 mcg/5 mL. Tab: 500 mcg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Levetiracetam", category: "Anticonvulsant · NEML 8th · Dose: not added", formulation: "Oral solution: 100 mg/mL. Tab: 250, 500, 750, 1000 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Pregabalin", category: "Anticonvulsant / neuropathic pain · NEML 8th · Dose: not added", formulation: "Cap: 25, 75, 150, 300 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Respiratory depression, especially with opioids.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr"], contraindications: ["low_rr"] },

  { name: "Topiramate", category: "Anticonvulsant · NEML 8th · Dose: not added", formulation: "Cap: 25, 50, 100 mg. Tab: 25, 50, 100, 200 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Acetylcysteine", category: "Paracetamol antidote · NEML 8th · Dose: not added", formulation: "Inj: 200 mg/mL in 10-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Flumazenil", category: "Benzodiazepine antidote · NEML 8th · Dose: not added", formulation: "Inj: 0.1 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Methionine", category: "Paracetamol antidote · NEML 8th · Dose: not added", formulation: "Tab: 250 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Methylene blue", category: "Antidote · NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL in 10-mL ampoule (methylthioninium chloride)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "methylammonium|methylene blue", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Protamine sulfate", category: "Heparin antidote · NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL in 5-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Albendazole", category: "Anthelminthic · NEML 8th · Dose: not added", formulation: "Tab: 200 mg; 400 mg. Oral liquid: 100 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Mebendazole", category: "Anthelminthic · NEML 8th · Dose: not added", formulation: "Tab: 100 mg; 500 mg. Oral liquid: 100 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Praziquantel", category: "Anthelminthic · NEML 8th · Dose: not added", formulation: "Tab: 600 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Ivermectin", category: "Antifilarial / anthelminthic · NEML 8th (restricted list) · Dose: not added", formulation: "Tab: 3 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "ivennectin|ivermectin", neml: "NEML 8th (restricted list)", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Secnidazole", category: "Antiprotozoal · NEML 8th · Dose: not added", formulation: "Oral granules: 2 g. Tab: 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Tinidazole", category: "Antiprotozoal · NEML 8th · Dose: not added", formulation: "Tab: 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Amikacin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Inj: 250 mg/mL in 2-mL ampoule (sulfate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Nephrotoxic and ototoxic.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Amoxicillin + Clavulanic acid", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Tab: 250/125, 500/125, 875/125 mg. Oral liquid: 125/31.25 and 250/62.5 mg per 5 mL. Powder for inj: 500/100 mg; 1000/200 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Check for penicillin allergy.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Benzathine benzylpenicillin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Powder for inj: 900 mg (1.2 million units) per 2 mL; 1.44 g (2.4 million units) per 4 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "IM only. Never give IV.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Cefazolin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Powder for inj: 500 mg; 1 g; 2 g (sodium)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Cephalexin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Cap: 250 mg; 500 mg. Oral suspension: 125 mg/5 mL; 250 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Cefixime", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Cap: 200 mg; 400 mg. Tab: 200 mg; 400 mg. Oral liquid: 100 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Cefuroxime", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Powder for inj: 750 mg; 1.5 g. Tab: 250 mg; 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Ceftazidime", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Powder for inj: 250 mg; 1 g (pentahydrate) in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Clindamycin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Cap: 150 mg; 300 mg. Inj: 150 mg/mL (phosphate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Flucloxacillin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Cap: 250 mg; 500 mg. Powder for oral liquid: 125 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Check for penicillin allergy.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Phenoxymethylpenicillin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Tab: 250 mg (potassium). Powder for oral liquid: 250 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Check for penicillin allergy.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Nitrofurantoin", category: "Antibiotic (Access) · NEML 8th · Dose: not added", formulation: "Tab: 50 mg; 100 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Co-trimoxazole", category: "Antibiotic (Access) · NEML 8th (primary care list only) · Dose: not added", formulation: "Tab: 100/20, 400/80, 800/160 mg. Oral liquid: 200/40 mg per 5 mL. Inj: 80/16 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "sulfamethoxazole", neml: "NEML 8th (primary care list only)", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Clarithromycin", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Tab: 250 mg; 500 mg. Suspension: 250 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "QT prolongation.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Levofloxacin", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Tab: 250, 500, 750 mg. Inj: 5 mg/mL in 100-mL bottle", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Tendon rupture risk.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Piperacillin + Tazobactam", category: "Antibiotic (Watch) · NEML 8th · Dose: not added", formulation: "Powder for inj: 2 g + 250 mg; 4 g + 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Check for penicillin allergy.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Meropenem", category: "Antibiotic (Reserve) · NEML 8th · Dose: not added", formulation: "Powder for inj: 500 mg; 1 g (trihydrate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Reserve antibiotic: use per local stewardship policy.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Vancomycin", category: "Antibiotic (Reserve) · NEML 8th · Dose: not added", formulation: "Powder for inj: 250 mg; 500 mg; 1 g. Cap: 125 mg; 250 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Reserve antibiotic. Nephrotoxic. Monitor levels.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Fluconazole", category: "Antifungal · NEML 8th · Dose: not added", formulation: "Cap: 50, 100, 150, 200 mg. Inj: 2 mg/mL in 0.9% sodium chloride", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Nystatin", category: "Antifungal · NEML 8th · Dose: not added", formulation: "Oral liquid: 100,000 units/mL. Tab: 500,000 units. Lozenge: 100,000 units", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Clotrimazole", category: "Antifungal · NEML 8th · Dose: not added", formulation: "Vaginal tab: 100 mg; 500 mg. Vaginal cream: 1%; 10%", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Aciclovir", category: "Antiviral · NEML 8th · Dose: not added", formulation: "Tab: 200, 400, 800 mg. Oral liquid: 200 mg/5 mL. Powder for inj: 250 mg; 500 mg; 1 g", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Artemether (injection)", category: "Antimalarial (Severe) · NEML 8th · Dose: not added", formulation: "Inj: 80 mg/mL in 1-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "artemether injection|artemether", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Artesunate + Amodiaquine", category: "Antimalarial · NEML 8th · Dose: not added", formulation: "Tab: 25/67.5, 50/135, 100/270 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "amodiaquine", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Dihydroartemisinin + Piperaquine", category: "Antimalarial · NEML 8th (restricted list) · Dose: not added", formulation: "Tab: 20/160 mg; 40/320 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "piperaquine", neml: "NEML 8th (restricted list)", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Artesunate + Pyronaridine", category: "Antimalarial · NEML 8th · Dose: not added", formulation: "Tab: 60/180 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "pyronaridine", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Sulfadoxine + Pyrimethamine", category: "Antimalarial (prophylaxis) · NEML 8th · Dose: not added", formulation: "Tab: 500/25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Restricted list for prophylaxis.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Rifampicin", category: "Antituberculosis · NEML 8th · Dose: not added", formulation: "Cap: 150 mg; 300 mg. Tab: 150 mg; 300 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national TB programme regimen. Can cause respiratory depression in overdose.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr"], contraindications: ["low_rr"] },

  { name: "Isoniazid", category: "Antituberculosis · NEML 8th · Dose: not added", formulation: "Tab: 100 mg; 300 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national TB programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Pyrazinamide", category: "Antituberculosis · NEML 8th · Dose: not added", formulation: "Tab: 100, 400, 500 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national TB programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Ethambutol", category: "Antituberculosis · NEML 8th · Dose: not added", formulation: "Tab: 100, 275, 400 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national TB programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Dolutegravir", category: "Antiretroviral · NEML 8th · Dose: not added", formulation: "Tab: 50 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national HIV programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Tenofovir + Lamivudine + Dolutegravir", category: "Antiretroviral · NEML 8th · Dose: not added", formulation: "Tab: 300/300/50 mg", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national HIV programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Nevirapine", category: "Antiretroviral · NEML 8th · Dose: not added", formulation: "Tab: 200 mg. Oral liquid: 50 mg/5 mL", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national HIV programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Zidovudine", category: "Antiretroviral · NEML 8th · Dose: not added", formulation: "Cap: 100 mg; 250 mg. Oral liquid: 50 mg/mL", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national HIV programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Lamivudine", category: "Antiretroviral · NEML 8th · Dose: not added", formulation: "Tab: 150 mg. Oral liquid: 5 mg/mL", adultDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", pediatricDose: "N/A. Follow the national TB/HIV programme regimen and weight-band tables.", warning: "Follow the national HIV programme regimen.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Bisoprolol", category: "Beta-blocker · NEML 8th · Dose: not added", formulation: "Tab: 1.25 mg; 5 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_hr"] },

  { name: "Diltiazem", category: "Calcium channel blocker · NEML 8th · Dose: not added", formulation: "Tab: 60, 90, 120, 180 mg (hydrochloride)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"] },

  { name: "Glyceryl trinitrate", category: "Nitrate · NEML 8th · Dose: not added", formulation: "Sublingual tab: 500 mcg. Patch: 0.1, 0.2, 0.4 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Hypotension. Contraindicated with PDE5 inhibitors.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"], contraindications: ["low_bp"] },

  { name: "Verapamil", category: "Calcium channel blocker · NEML 8th · Dose: not added", formulation: "Tab: 40 mg; 80 mg; 120 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_hr"] },

  { name: "Methyldopa", category: "Antihypertensive · NEML 8th · Dose: not added", formulation: "Tab: 250 mg; 500 mg. Inj: 250 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "methyldopa|alpha methyl", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"] },

  { name: "Captopril", category: "ACE inhibitor · NEML 8th · Dose: not added", formulation: "Tab: 12.5 mg; 25 mg; 50 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Enalapril", category: "ACE inhibitor · NEML 8th · Dose: not added", formulation: "Tab: 5 mg; 10 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  {
  name: "Lisinopril",
  category: "ACE inhibitor · NEML 8th",
  formulation: "Tab: 5 mg; 10 mg",
  adultDose: "Start: 10 mg once daily. Usual: 20 mg daily. Maximum: 40 mg/day. Adjust for renal impairment.",
  pediatricDose: "Age 6–16 years: 20–<50 kg: 2.5 mg daily; ≥50 kg: 5 mg daily. Maximum: 20 mg and 40 mg/day, respectively.",
  warning: "Avoid in pregnancy and history of ACE inhibitor-induced angioedema. Monitor BP, renal function and potassium.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based",
  requiresVitals: ["bp"]
    },

  { name: "Losartan", category: "Angiotensin receptor blocker · NEML 8th · Dose: not added", formulation: "Tab: 25 mg; 50 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Labetalol", category: "Antihypertensive · NEML 8th · Dose: not added", formulation: "Tab: 100 mg; 200 mg. Inj: 5 mg/mL in 20-mL ampoule (printed as 'powder for injection' in NEML 8th: check the label)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"] },

  { name: "Nifedipine", category: "Calcium channel blocker · NEML 8th · Dose: not added", formulation: "Tab: 20 mg. Slow-release tab: 30 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Do not give capsule contents sublingually.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Hydrochlorothiazide", category: "Thiazide diuretic · NEML 8th · Dose: not added", formulation: "Tab: 12.5 mg; 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Spironolactone", category: "Diuretic · NEML 8th · Dose: not added", formulation: "Tab: 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Monitor potassium.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

{
  name: "Carvedilol",
  category: "Beta-blocker · NEML 8th",
  formulation: "Tab: 6.25, 12.5, 25 mg",
  adultDose: "Heart failure: Start 3.125 mg twice daily; titrate gradually to 25 mg twice daily. Hypertension: Start 6.25 mg twice daily; usual maximum 25 mg twice daily. Take with food.",
  pediatricDose: "Routine paediatric dosing not established. Use only on specialist advice.",
  warning: "Monitor HR and BP. Risk of bradycardia, hypotension and worsening heart failure. Do not stop abruptly.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based",
  requiresVitals: ["hr", "bp"],
  contraindications: ["low_hr"]
},
    { name: "Metoprolol", category: "Beta-blocker · NEML 8th · Dose: partly source-checked", formulation: "Extended-release tab (succinate): 25 mg; 50 mg; 100 mg; 200 mg", adultDose: "25-200 mg once daily (succinate ER; start low, titrate)", pediatricDose: "Specialist use only — ER form not established in children. Immediate-release 1-2 mg/kg/day divided is used by specialists; consult prescriber.", warning: "Do not stop abruptly (rebound angina, tachycardia). Contraindicated in bradycardia, decompensated heart failure and severe asthma. Can cause bronchospasm and, in overdose, respiratory depression.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_hr", "low_rr"] },

  { name: "Torsemide", category: "Loop diuretic · NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL. Tab: 5 mg; 10 mg; 20 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Alteplase", category: "Thrombolytic · NEML 8th · Dose: not added", formulation: "Powder for inj: 10 mg; 20 mg; 50 mg in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Streptokinase", category: "Thrombolytic · NEML 8th · Dose: not added", formulation: "Powder for inj: 1.5 million units in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Simvastatin", category: "Statin · NEML 8th · Dose: not added", formulation: "Tab: 10 mg; 20 mg; 40 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Rosuvastatin", category: "Statin · NEML 8th · Dose: not added", formulation: "Tab: 5 mg; 10 mg; 20 mg; 40 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Magnesium trisilicate", category: "Antacid · NEML 8th · Dose: not added", formulation: "Mixture: 250 mg/5 mL. Tab: 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Aluminium hydroxide + Magnesium hydroxide", category: "Antacid · Not in NEML 8th · Dose: not added", formulation: "Oral suspension: 500 mg + 500 mg per 5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "aluminium hydroxide", neml: "Not in NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Rabeprazole", category: "Proton pump inhibitor · NEML 8th · Dose: not added", formulation: "Tab: 20 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

{
  name: "Lactulose",
  category: "Osmotic laxative · NEML 8th",
  formulation: "Oral liquid: 68%",
  adultDose: "Constipation: Start 15 mL twice daily; adjust to response. Hepatic encephalopathy: 30–50 mL three times daily; target 2–3 soft stools/day.",
  pediatricDose: "Constipation: <1 year: up to 5 mL/day; 1–6 years: 5–10 mL/day; 7–14 years: 15 mL/day. Adjust to response.",
  warning: "May cause diarrhoea, dehydration and electrolyte imbalance. Avoid in intestinal obstruction.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Senna",
  category: "Stimulant laxative · NEML 8th",
  formulation: "Tab: 7.5 mg (sennosides). Oral liquid: 7.5 mg/5 mL",
  adultDose: "7.5–15 mg orally at bedtime; adjust to response.",
  pediatricDose: "Use age-specific dosing. Not routinely recommended below 2 years without specialist advice.",
  warning: "May cause abdominal cramps and diarrhoea. Avoid in intestinal obstruction.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Loperamide",
  category: "Antidiarrhoeal · NEML 8th",
  formulation: "Cap: 2 mg. Tab: 2 mg",
  adultDose: "4 mg initially, then 2 mg after each loose stool. Maximum 16 mg/day.",
  pediatricDose: "Not routinely recommended in children; avoid in children under 2 years.",
  warning: "Avoid in bloody diarrhoea, fever, acute colitis or suspected invasive infection. Prioritise ORS.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Hyoscine butylbromide",
  category: "Antispasmodic · Not in NEML 8th",
  formulation: "Inj: 10 mg/mL. Tab: 10 mg; 20 mg",
  adultDose: "10–20 mg orally up to 4 times daily. Injection: 20 mg IM or slow IV as prescribed.",
  pediatricDose: "Use age-specific specialist guidance; dosing depends on formulation.",
  warning: "Avoid in glaucoma, myasthenia gravis and intestinal obstruction. May cause tachycardia.",
  neml: "Not in NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Cyclizine",
  category: "Antiemetic · NEML 8th",
  formulation: "Inj: 50 mg/mL. Tab: 25 mg; 50 mg",
  adultDose: "50 mg orally or IM up to 3 times daily.",
  pediatricDose: "Age 6–12 years: 25 mg up to 3 times daily. Avoid below 6 years.",
  warning: "May cause drowsiness and anticholinergic effects. Use caution in glaucoma and urinary retention.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Domperidone",
  category: "Antiemetic (complementary list) · NEML 8th",
  formulation: "Oral suspension: 1 mg/mL",
  adultDose: "10 mg orally up to 3 times daily. Maximum 30 mg/day; use the shortest duration.",
  pediatricDose: "Not routinely recommended; specialist assessment required.",
  warning: "QT prolongation and serious arrhythmia risk. Avoid in significant cardiac disease and with QT-prolonging drugs.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based",
  requiresVitals: ["hr"]
},

{
  name: "Methylprednisolone",
  category: "Corticosteroid · NEML 8th",
  formulation: "Inj suspension: 20 mg/mL; 40 mg/mL. Powder for inj: 40 mg/mL; 80 mg/mL (sodium succinate)",
  adultDose: "Dose varies widely by indication and formulation. Use the condition-specific prescribed regimen.",
  pediatricDose: "Individualised by weight, indication and severity. Specialist guidance required.",
  warning: "Monitor glucose, BP and infection risk. Do not confuse depot suspension with IV sodium succinate.",
  neml: "NEML 8th",
  doseStatus: "not-added",
  vitalsPolicy: "risk-based"
},

{
  name: "Fludrocortisone",
  category: "Mineralocorticoid · NEML 8th",
  formulation: "Tab: 100 mcg (acetate)",
  adultDose: "Adrenal insufficiency: usually 50–300 mcg orally once daily; adjust to clinical response and electrolytes.",
  pediatricDose: "Individualised by age, growth, BP and electrolyte response; specialist supervision required.",
  warning: "Monitor BP, potassium, sodium and fluid retention.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based",
  requiresVitals: ["bp"]
},

{
  name: "Glucagon",
  category: "Hypoglycaemia · NEML 8th",
  formulation: "Inj: 1 mg/mL",
  adultDose: "Severe hypoglycaemia: 1 mg IM or SC. Seek emergency medical assistance.",
  pediatricDose: "<25 kg: 0.5 mg IM/SC; ≥25 kg: 1 mg IM/SC.",
  warning: "High-alert. Turn patient onto their side due to vomiting risk. Give oral carbohydrate once conscious and able to swallow.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Gliclazide",
  category: "Sulfonylurea · NEML 8th",
  formulation: "Tab: 60 mg; 80 mg",
  adultDose: "80 mg once daily with breakfast; adjust to glucose response. Maximum 320 mg/day. Confirm immediate-release formulation.",
  pediatricDose: "Not routinely recommended in children.",
  warning: "Risk of prolonged hypoglycaemia, especially with missed meals or renal impairment.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Glimepiride",
  category: "Sulfonylurea · NEML 8th",
  formulation: "Tab: 1, 2, 3, 4 mg",
  adultDose: "Start 1–2 mg once daily with breakfast. Increase gradually according to glucose response. Maximum 8 mg/day.",
  pediatricDose: "Not recommended for routine paediatric use.",
  warning: "Risk of severe hypoglycaemia. Start low in older adults and renal impairment.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Sitagliptin",
  category: "DPP-4 inhibitor · NEML 8th",
  formulation: "Tab: 50 mg; 100 mg",
  adultDose: "100 mg orally once daily. Reduce to 50 mg or 25 mg daily according to renal function.",
  pediatricDose: "Safety and efficacy not established in children.",
  warning: "Assess renal function before dosing. Watch for pancreatitis and severe joint pain.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

 {
  name: "Insulin aspart",
  category: "Rapid-acting insulin · NEML 8th",
  formulation: "Inj: 100 units/mL (prefilled)",
  adultDose: "Individualised dose based on blood glucose, carbohydrate intake and insulin regimen. Give SC 5–10 minutes before meals.",
  pediatricDose: "Individualised by weight, meal intake and glucose levels. Give SC 5–10 minutes before meals.",
  warning: "High-alert. Risk of severe hypoglycaemia. Check blood glucose, verify dose and insulin type. Never share insulin pens.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

{
  name: "Insulin glargine",
  category: "Long-acting insulin · NEML 8th",
  formulation: "Inj: 100 units/mL (10-mL vial)",
  adultDose: "Individualised according to diabetes type, blood glucose and insulin regimen. Administer SC once daily at the same time.",
  pediatricDose: "Individualised by age, weight and glucose response. Administer SC once daily as prescribed.",
  warning: "High-alert. Risk of severe hypoglycaemia. Never give IV or mix with other insulins. Do not omit basal insulin in type 1 diabetes.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},
{
  name: "Insulin isophane (NPH)",
  category: "Intermediate-acting insulin · NEML 8th",
  formulation: "Inj: 100 units/mL (10-mL vial)",
  adultDose: "Individualised according to blood glucose and insulin regimen. Usually administered SC once or twice daily.",
  pediatricDose: "Individualised by age, weight, glucose levels and insulin regimen. Use as prescribed.",
  warning: "High-alert. Risk of hypoglycaemia, especially overnight. Resuspend gently before use. Never administer IV.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},
  {
  name: "Biphasic isophane insulin 30/70",
  category: "Premixed insulin · NEML 8th",
  formulation: "Inj: 30% soluble / 70% isophane, 100 units/mL",
  adultDose: "Individualised according to blood glucose, meal pattern and insulin regimen. Usually administered SC before breakfast and evening meal.",
  pediatricDose: "Individualised by age, weight, glucose levels and meal pattern. Use under specialist supervision.",
  warning: "High-alert. Risk of hypoglycaemia. Resuspend gently before use. Give in relation to meals. Never administer IV.",
  neml: "NEML 8th",
  doseStatus: "added",
  vitalsPolicy: "risk-based"
},

   { name: "Propylthiouracil", category: "Antithyroid · NEML 8th", formulation: "Tab: 50 mg", adultDose: "Individualised by thyroid function; specialist-supervised titration.", pediatricDose: "Specialist-directed; dose is weight- and thyroid-function-based.", warning: "Risk of severe liver injury and agranulocytosis. Stop and seek urgent review for jaundice, dark urine, fever or sore throat.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Octreotide", category: "Somatostatin analogue · NEML 8th", formulation: "Inj: 50, 100, 200 mcg/mL in 1-mL ampoule", adultDose: "Indication-specific; regimen differs for variceal bleeding, acromegaly and other uses. Follow the relevant protocol.", pediatricDose: "Specialist-directed; indication- and weight-specific.", warning: "Monitor glucose, heart rate and gallbladder-related effects. IV infusion regimens require protocol-based preparation.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Carbetocin", category: "Uterotonic · NEML 8th", formulation: "Inj (heat stable): 100 mcg/mL", adultDose: "PPH prevention: 100 mcg IM or slow IV once, immediately after birth. Not for PPH treatment or labour induction.", pediatricDose: "Not indicated for children.", warning: "High-alert uterotonic. Give only after birth; single dose. Avoid in serious cardiovascular, hepatic or renal disease.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Medroxyprogesterone acetate", category: "Progestogen / contraceptive · NEML 8th", formulation: "Inj (IM): 150 mg/mL in 1-mL vial. Tab: 5 mg", adultDose: "Contraceptive injection: 150 mg deep IM every 13 weeks. Oral 5-mg tablet dosing is indication-specific; verify the prescribed regimen.", pediatricDose: "Not for routine paediatric use. Adolescent contraception requires individual assessment and local guidance.", warning: "For IM injection, shake well. Discuss irregular bleeding and bone-density effects; assess pregnancy and relevant contraindications.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Budesonide", category: "Inhaled corticosteroid · NEML 8th", formulation: "Inhaler: 100 mcg/dose; 200 mcg/dose", adultDose: "Maintenance dose is product- and severity-specific; use the lowest effective prescribed dose. Not for acute relief.", pediatricDose: "Age- and product-specific maintenance dose; use under clinical supervision. Not for acute relief.", warning: "Rinse mouth after use. Check inhaler technique; do not stop regular therapy without review.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Ipratropium bromide", category: "Anticholinergic bronchodilator · NEML 8th", formulation: "MDI: 20 mcg/dose. Nebuliser solution: 0.02%", adultDose: "Dose depends on device, indication and severity; follow the inhaler or nebuliser protocol.", pediatricDose: "Age- and device-specific; use under clinical supervision.", warning: "Avoid spraying into eyes. Use caution with narrow-angle glaucoma and urinary retention.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Salmeterol + Fluticasone", category: "Inhaled corticosteroid + LABA · NEML 8th", formulation: "Inhaler: 21/45 mcg per dose. Powder: 50/100 and 50/250 mcg per dose", adultDose: "Maintenance inhaler; dose depends on device and strength. Not for acute attacks. Use regularly as prescribed.", pediatricDose: "Age- and strength-specific; use only where licensed and prescribed for the child's age.", warning: "Not a rescue inhaler. Rinse mouth after use. Do not use with another LABA unless specifically directed.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Heparin (unfractionated)", category: "Anticoagulant · NEML 8th", formulation: "Inj: 1,000 units/mL; 5,000 units/mL in 1-mL ampoule", adultDose: "Regimen depends on indication and weight; adjust IV therapy using aPTT or anti-Xa protocol.", pediatricDose: "Weight-based specialist protocol; monitor anti-Xa or aPTT as directed.", warning: "High-alert. Verify vial concentration. Monitor aPTT/anti-Xa, platelets and bleeding. Never give IM.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Enoxaparin", category: "Low-molecular-weight heparin · NEML 8th", formulation: "Inj: 1,000 units/mL; 5,000 units/mL in 1-mL ampoule", adultDose: "Dose depends on indication, body weight and renal function; use the appropriate prophylaxis or treatment protocol.", pediatricDose: "Weight-based specialist dosing; anti-Xa monitoring may be required.", warning: "High-alert. Monitor bleeding, platelets and renal function. Check product strength and dose units carefully.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Warfarin", category: "Vitamin K antagonist · NEML 8th", formulation: "Tab: 1 mg; 2 mg; 5 mg (sodium)", adultDose: "Individualise to indication and INR target; adjust only using the anticoagulation protocol.", pediatricDose: "Specialist-directed, weight- and INR-guided dosing.", warning: "High-alert. Frequent INR monitoring. Major bleeding risk; many food and drug interactions. Avoid in pregnancy in most indications.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Tranexamic acid", category: "Antifibrinolytic · NEML 8th", formulation: "Inj: 100 mg/mL in 10-mL ampoule", adultDose: "PPH: 1 g IV over 10 min within 3 hours of birth; repeat 1 g if bleeding continues after 30 min or restarts within 24 hours. Other indications require separate dosing.", pediatricDose: "Indication- and weight-specific; follow paediatric protocol.", warning: "Give IV slowly. Adjust for renal impairment. Avoid in active intravascular clotting; PPH benefit is time-critical.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Hydroxocobalamin (Vitamin B12)", category: "Vitamin · NEML 8th", formulation: "Inj: 1 mg in 1-mL ampoule", adultDose: "Dose and frequency depend on cause of deficiency and neurological involvement; follow the B12 replacement protocol.", pediatricDose: "Age- and cause-specific; specialist or paediatric formulary guidance required.", warning: "Check cause of deficiency and response. Do not delay treatment when neurological involvement is suspected.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Apixaban", category: "Direct oral anticoagulant · NEML 8th", formulation: "Tab: 2.5 mg; 5 mg", adultDose: "Dose depends on indication and patient factors; AF, DVT/PE treatment and prophylaxis regimens differ.", pediatricDose: "Paediatric use is indication- and age-specific; specialist prescribing only.", warning: "High-alert. Monitor bleeding, renal function and interactions. Not interchangeable with other anticoagulants; avoid in active bleeding.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Fentanyl", category: "Opioid · NEML 8th", formulation: "Inj: 25 mcg/mL; 50 mcg/mL (1-, 2-, 10-mL ampoules). Patch: 12, 25, 75 mcg", adultDose: "Individualise by route, indication, opioid tolerance and monitoring setting. Transdermal patch is for opioid-tolerant patients only.", pediatricDose: "Specialist-directed, weight- and route-specific dosing with continuous monitoring where indicated.", warning: "High-alert. Can cause fatal respiratory depression. Monitor RR, SpO2 and sedation; have naloxone and airway support available.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Pethidine", category: "Opioid · NEML 8th", formulation: "Inj: 50 mg/mL in 1-mL and 2-mL ampoule", adultDose: "Dose depends on route, indication and patient factors; use only a local opioid protocol.", pediatricDose: "Avoid routine paediatric use; specialist decision required.", warning: "High-alert. Respiratory depression, dependence and neurotoxicity risk (especially with renal impairment). Monitor RR, SpO2 and sedation.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Pentazocine", category: "Opioid · NEML 8th", formulation: "Inj: 30 mg in 1-mL ampoule (lactate)", adultDose: "30–60 mg SC, IM or IV; repeat every 3–4 hours if needed. Max 360 mg/day; IV/SC/IM single-dose limits differ.", pediatricDose: "1–12 years: specialist-directed; label gives a maximum single IV dose of 1 mg/kg. Not recommended under 1 year.", warning: "Opioid. Monitor RR, SpO2 and sedation. Avoid in respiratory depression; may precipitate withdrawal in opioid-dependent patients.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Dihydrocodeine", category: "Opioid · NEML 8th", formulation: "Inj: 50 mg/mL in 1-mL ampoule. Tab: 30 mg (tartrate)", adultDose: "Tablet: 30 mg orally every 4–6 hours as needed; max 180 mg/day. Injectable dosing requires a separate protocol.", pediatricDose: "Not for children under 12 years; avoid routine use in adolescents unless specifically prescribed.", warning: "Opioid. Risk of respiratory depression, dependence and constipation. Monitor sedation and breathing; avoid alcohol and other sedatives.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Hyoscine hydrobromide", category: "Antimuscarinic · NEML 8th", formulation: "Inj: 400 mcg/mL; 600 mcg/mL. Transdermal patch: 1 mg", adultDose: "Dose depends on route and indication; injection and patch regimens are not interchangeable.", pediatricDose: "Age- and indication-specific; use only with an appropriate paediatric reference.", warning: "May cause drowsiness, blurred vision, dry mouth and urinary retention. Use caution in glaucoma.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Docusate sodium", category: "Stool softener · NEML 8th", formulation: "Cap: 100 mg. Oral liquid: 50 mg/5 mL", adultDose: "Dose depends on formulation and indication; follow the product label. Encourage adequate fluid intake where appropriate.", pediatricDose: "Age-specific dosing; do not use in young children without clinical advice.", warning: "Avoid with suspected bowel obstruction, acute abdominal pain or nausea/vomiting of unknown cause.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Bromazepam", category: "Benzodiazepine · NEML 8th", formulation: "Tab: 1.5 mg; 3 mg", adultDose: "Use the lowest effective dose for the shortest period; dose must be individualised and reviewed.", pediatricDose: "Not recommended for routine paediatric use.", warning: "Sedation, dependence and withdrawal risk. Respiratory depression may occur with opioids or alcohol. Do not stop long-term use abruptly.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr"], contraindications: ["low_rr"] },

  { name: "Biperiden", category: "Anticholinergic · NEML 8th", formulation: "Inj: 5 mg (lactate)/mL in 1-mL ampoule. Tab: 2 mg", adultDose: "Dose depends on indication (Parkinsonism or drug-induced extrapyramidal symptoms); titrate under clinical supervision.", pediatricDose: "Specialist-directed; routine paediatric dosing is not established for this entry.", warning: "Anticholinergic effects: confusion, blurred vision, constipation and urinary retention. Use caution in glaucoma.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Benzhexol (trihexyphenidyl)", category: "Anticholinergic · NEML 8th", formulation: "Tab: 2 mg; 5 mg", adultDose: "Start low and titrate gradually according to response and adverse effects; indication-specific regimen required.", pediatricDose: "Specialist-directed; not for routine paediatric self-medication.", warning: "May cause confusion, blurred vision, constipation and urinary retention. Use caution in glaucoma; avoid abrupt changes without review.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Pyridoxine (Vitamin B6)", category: "Vitamin · NEML 8th", formulation: "Tab: 10 mg; 25 mg", adultDose: "Daily requirement: 1–2 mg; deficiency treatment: 50–400 mg as indicated.", pediatricDose: "Daily requirement: 0.3–0.6 mg; deficiency treatment: 20–50 mg as indicated.", warning: "High-dose or prolonged use can cause peripheral neuropathy. Dose from NEML 8th Appendix 1.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Thiamine (Vitamin B1)", category: "Vitamin · NEML 8th (restricted list)", formulation: "Cap: 50 mg. Tab: 50 mg; 100 mg. Inj: 100 mg/mL", adultDose: "Daily requirement: 1–1.3 mg; deficiency treatment: 200–300 mg as indicated.", pediatricDose: "Daily requirement: 0.3–1 mg; deficiency treatment: 5–50 mg as indicated.", warning: "Suspected Wernicke encephalopathy requires urgent parenteral treatment; do not rely on routine oral doses. NEML 8th Appendix 1.", neml: "NEML 8th (restricted list)", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Riboflavin (Vitamin B2)", category: "Vitamin · NEML 8th (restricted list)", formulation: "Tab: 25 mg; 50 mg", adultDose: "Daily requirement: 0.3–1 mg; deficiency treatment: 5–30 mg as indicated.", pediatricDose: "Daily requirement: 1–1.8 mg.", warning: "Dose from NEML 8th Appendix 1; confirm age-specific nutritional requirements.", neml: "NEML 8th (restricted list)", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Cholecalciferol (Vitamin D3)", category: "Vitamin · NEML 8th", formulation: "Cap/Tab: 400 units; 1,000 units. Oral solution: 400 units/mL", adultDose: "Daily: 25–50 mcg (1,000–2,000 IU), as indicated.", pediatricDose: "Daily: 2.5–5 mcg (100–200 IU), as listed in NEML Appendix 1; confirm age-specific prevention or treatment guidance.", warning: "Check units carefully: 1 mcg = 40 IU. Avoid unsupervised high-dose treatment; excess can cause hypercalcaemia.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },
   { name: "8-Methylpsoralen", category: "Dermatological / Photosensitising Agent · NEML Adult 8th · Dose: unverified", formulation: "NEML index p.80; verify capsule 10 mg and lotion 10 mg/mL against catalogue.", adultDose: "Not added — indication-specific regimen not established by NEML.", pediatricDose: "Not added — paediatric use requires specialist verification and the children's list.", warning: "Photosensitising medicine; specialist-supervised photochemotherapy. Protect eyes and skin from unintended UVA exposure.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 80, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Abacavir", category: "Antiretroviral · NEML Adult 8th · Dose: unverified", formulation: "NEML p.11; verify listed tablet/oral liquid strengths in catalogue.", adultDose: "Not added — use current national HIV treatment protocol.", pediatricDose: "Not added — age/weight/formulation-specific regimen requires NEMLc verification.", warning: "Potentially life-threatening hypersensitivity. HLA-B*5701 testing where recommended; never rechallenge after suspected abacavir hypersensitivity.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 11, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Abacavir + Efavirenz + Lamivudine", category: "Antiretroviral Combination · NEML Adult 8th · Dose: unverified", formulation: "NEML p.12; confirm exact fixed-dose combination and strength in catalogue before creating a selectable product.", adultDose: "Not added — confirm product identity and current HIV protocol.", pediatricDose: "Not added — do not infer paediatric suitability from adult listing.", warning: "Confirm exact combination; review abacavir hypersensitivity risk, efavirenz neuropsychiatric effects and interactions.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 12, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Abacavir + Lamivudine", category: "Antiretroviral Combination · NEML Adult 8th · Dose: unverified", formulation: "NEML p.12; verify fixed-dose tablet strength in catalogue.", adultDose: "Not added — use current national HIV treatment protocol.", pediatricDose: "Not added — age/weight/formulation-specific regimen requires NEMLc verification.", warning: "Check abacavir hypersensitivity history and renal function; verify whether the fixed-dose product is appropriate.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 12, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Abiraterone", category: "Antineoplastic / Hormonal Therapy · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify tablet strength and formulation in catalogue.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor blood pressure, potassium, fluid retention and liver function; verify required concomitant corticosteroid and food instructions for the exact product.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Acetazolamide", category: "Carbonic Anhydrase Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.39; transcribe exact dosage form and strength from catalogue before activation.", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not added — specialist verification required.", warning: "Assess renal function and electrolytes; may cause metabolic acidosis, hypokalaemia and sulfonamide-related reactions.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 39, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Acetic acid", category: "Topical / Otic Preparation · NEML Adult 8th · Dose: unverified", formulation: "NEML p.31; exact concentration and route must be transcribed from catalogue.", adultDose: "Not added — preparation- and indication-specific instructions required.", pediatricDose: "Not added — verify age restrictions and exact product.", warning: "Do not substitute household vinegar or an unverified concentration. Use only the listed pharmaceutical preparation and route.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 31, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Actinomycin-D (Dactinomycin)", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify injection strength and vial presentation in catalogue.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not added — paediatric oncology protocol required.", warning: "Cytotoxic medicine; specialist prescribing and hazardous-drug handling. Monitor blood counts, hepatic effects and extravasation injury.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Adalimumab", category: "Biological / Immunosuppressant · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.37, 85; injection 10 mg/0.2 mL and 20 mg/0.4 mL (confirm catalogue and product).", adultDose: "Not added — indication-specific specialist regimen required.", pediatricDose: "Not added — age-, weight- and indication-specific specialist regimen required.", warning: "Screen for tuberculosis and hepatitis B as appropriate; serious infections may occur. Review vaccination status and avoid live vaccines during therapy unless specialist guidance permits.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 37, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Alfuzosin", category: "Alpha-1 Adrenergic Blocker · NEML Adult 8th · Dose: unverified", formulation: "NEML p.86; tablet 10 mg (confirm release formulation).", adultDose: "Not added — verify exact release formulation and indication.", pediatricDose: "Not established for routine paediatric use.", warning: "May cause postural hypotension, dizziness and syncope. Do not interchange modified-release and immediate-release products.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 86, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Allopurinol", category: "Xanthine Oxidase Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.37; verify tablet strength(s) in catalogue.", adultDose: "Not added — indication- and renal-function-specific regimen required.", pediatricDose: "Not added — specialist verification required.", warning: "Stop and urgently assess new rash or mucosal lesions; severe cutaneous reactions can occur. Consider renal function and HLA-B*58:01 risk where appropriate.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 37, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Alprazolam", category: "Benzodiazepine · NEML Adult 8th · Dose: unverified", formulation: "NEML p.34; verify tablet strength(s) and release form.", adultDose: "Not added — indication- and formulation-specific regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "Sedation, dependence and withdrawal risk. Respiratory depression may occur with opioids, alcohol or other CNS depressants.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 34, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"] },
  { name: "Aluminium diacetate", category: "Dermatological Astringent · NEML Adult 8th · Dose: unverified", formulation: "NEML p.22; verify exact topical preparation and concentration.", adultDose: "Not added — preparation-specific topical instructions required.", pediatricDose: "Not added — verify preparation and age restrictions.", warning: "External use only where specified. Confirm concentration and application site before use.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 22, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Amethocaine (Tetracaine)", category: "Local Anaesthetic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.39; verify ophthalmic preparation and concentration.", adultDose: "Not added — procedure-specific ophthalmic use.", pediatricDose: "Not added — specialist-directed ophthalmic use.", warning: "Topical ophthalmic anaesthetic; repeated unsupervised use can damage corneal epithelium and delay healing.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 39, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Aminobenzoic acid", category: "Other Therapeutic Agent · NEML Adult 8th · Dose: unverified", formulation: "NEML p.23; verify exact listed product, formulation and route.", adultDose: "Not added — exact preparation and indication must be confirmed.", pediatricDose: "Not added — exact preparation and indication must be confirmed.", warning: "Do not activate until medicine identity, route and intended clinical use are confirmed from the catalogue.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 23, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Aminoglutethimide", category: "Endocrine / Specialist Medicine · NEML Adult 8th · Dose: unverified", formulation: "NEML index p.83; confirm catalogue entry and exact formulation (index spelling may vary).", adultDose: "Not added — specialist verification required.", pediatricDose: "Not established for routine paediatric use.", warning: "Confirm medicine identity, current clinical role, interactions and monitoring before use.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 83, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Anastrozole", category: "Antineoplastic / Aromatase Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML index p.33; verify tablet strength in catalogue.", adultDose: "Not added — oncology/endocrine specialist regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "Assess indication and menopausal status; consider bone health and musculoskeletal adverse effects.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 33, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Antazoline + Tetrahydrozoline", category: "Ophthalmic Antiallergic / Vasoconstrictor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.39; verify eye-drop concentrations and product combination.", adultDose: "Not added — product-specific ophthalmic instructions required.", pediatricDose: "Not added — verify age restrictions.", warning: "Ophthalmic use only. Avoid prolonged unsupervised use because rebound redness may occur.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 39, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Anti-rabies immunoglobulin", category: "Rabies Immunobiological · NEML Adult 8th · Dose: unverified", formulation: "NEML p.18; verify human/equine product, concentration, vial size and route.", adultDose: "Not added — product-specific IU/kg and post-exposure protocol required.", pediatricDose: "Not added — product-specific IU/kg and post-exposure protocol required.", warning: "For rabies post-exposure prophylaxis. Follow current protocol for wound infiltration and maximum dose; administer vaccine at a separate anatomical site.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 18, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Anti-snake venom", category: "Antivenom · NEML Adult 8th · Dose: unverified", formulation: "NEML p.62; verify product, species coverage, potency, vial size and route.", adultDose: "Not added — product- and envenoming-specific protocol required.", pediatricDose: "Not added — product- and envenoming-specific protocol required.", warning: "Use only a product with appropriate species coverage. Monitor for acute hypersensitivity/anaphylaxis. Paediatric vial requirement is based on envenoming severity/product protocol, not simply body weight.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 62, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp", "rr", "spo2"] },
  { name: "Anti-snake venom immunoglobulin", category: "Antivenom Immunoglobulin · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.27, 54; confirm exact product identity and whether distinct from anti-snake venom.", adultDose: "Not added — product-specific specialist protocol required.", pediatricDose: "Not added — product-specific specialist protocol required.", warning: "Potential duplicate/index synonym. Do not create a separate selectable product or stock item until product identity is confirmed.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 27, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp", "rr", "spo2"] },
  { name: "Anti-tetanus immunoglobulin", category: "Tetanus Immunobiological · NEML Adult 8th · Dose: unverified", formulation: "NEML p.18; verify human tetanus immunoglobulin concentration and presentation.", adultDose: "Not added — wound-risk and immunisation-history protocol required.", pediatricDose: "Not added — wound-risk and immunisation-history protocol required.", warning: "Distinguish human tetanus immunoglobulin from equine antitoxin and tetanus-containing vaccine.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 18, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Anti-tetanus serum", category: "Tetanus Antitoxin · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.27, 54, 62; verify whether equine antitoxin and exact potency/concentration.", adultDose: "Not added — product-specific protocol required.", pediatricDose: "Not added — product-specific protocol required.", warning: "Do not confuse with human tetanus immunoglobulin or tetanus toxoid vaccine. Equine products may cause severe hypersensitivity/anaphylaxis.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 27, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp", "rr", "spo2"] },
  { name: "Anti-venom immunoglobulin", category: "Antivenom Immunoglobulin · NEML Adult 8th · Dose: unverified", formulation: "NEML p.27; verify exact product identity and venom coverage; possible synonym of antivenom entries.", adultDose: "Not added — product-specific specialist protocol required.", pediatricDose: "Not added — product-specific specialist protocol required.", warning: "Potential overlap with anti-snake venom immunoglobulin. Confirm exact product before creating a separate medicine record.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 27, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp", "rr", "spo2"] },
  { name: "Arachis oil + Paradichlorobenzene + Chlorobutanol + Turpentine oil", category: "Otic Preparation · NEML Adult 8th · Dose: unverified", formulation: "NEML p.31; verify exact ear-drop combination and concentrations.", adultDose: "Not added — product-specific otic instructions required.", pediatricDose: "Not added — verify age restrictions and tympanic membrane status.", warning: "Otic use only. Check for tympanic membrane perforation and product-specific contraindications.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 31, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Arsenic trioxide", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify concentrate-for-infusion strength and vial presentation.", adultDose: "Not added — specialist oncology protocol required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "High-risk antineoplastic. ECG/QTc, electrolytes, liver function and blood counts require protocol-directed monitoring.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Atazanavir + Ritonavir", category: "Antiretroviral Combination · NEML Adult 8th · Dose: unverified", formulation: "NEML p.12; verify tablet/capsule strengths and dosage form.", adultDose: "Not added — current HIV protocol and product-specific regimen required.", pediatricDose: "Not added — age/weight/formulation-specific regimen requires NEMLc verification.", warning: "Major interaction potential; review CYP3A interactions, hepatic status, acid-suppressing medicines and QT risk where relevant.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 12, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Atovaquone + Proguanil", category: "Antimalarial · NEML Adult 8th · Dose: unverified", formulation: "NEML p.78; verify adult and paediatric tablet strengths from catalogue/listing.", adultDose: "Not added — distinguish prophylaxis from treatment regimen.", pediatricDose: "Not added — weight-specific regimen and minimum-weight restrictions require verification.", warning: "Do not confuse prophylaxis and treatment dosing. Check body weight, renal function and administration with food.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 78, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Azathioprine", category: "Immunosuppressant / Antimetabolite · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify tablet strength and dosage form.", adultDose: "Not added — indication-specific specialist regimen required.", pediatricDose: "Not added — specialist regimen required.", warning: "Risk of myelosuppression, hepatotoxicity and infection. Monitor full blood count and liver function; consider TPMT/NUDT15 status where available.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Baclofen", category: "Skeletal Muscle Relaxant · NEML Adult 8th · Dose: unverified", formulation: "NEML p.38; verify tablet/oral liquid strengths in catalogue.", adultDose: "Not added — indication- and renal-function-specific regimen required.", pediatricDose: "Not added — specialist verification required.", warning: "Sedation and weakness may occur. Abrupt withdrawal can be serious; use caution in renal impairment and with other CNS depressants.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 38, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Barium sulfate", category: "Diagnostic Contrast Agent · NEML Adult 8th · Dose: unverified", formulation: "NEML p.23; verify oral/rectal suspension concentration and product.", adultDose: "Not added — radiology procedure-specific administration.", pediatricDose: "Not added — paediatric radiology protocol required.", warning: "For gastrointestinal imaging. Avoid when perforation is suspected; aspiration can cause serious complications.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 23, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "BCG vaccine", category: "Vaccine · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.28, 54; verify strain, vial presentation, reconstitution and cold-chain requirements.", adultDose: "Not added — national immunisation policy/indication required.", pediatricDose: "Not added — use current national immunisation schedule and product instructions.", warning: "Live attenuated vaccine. Do not administer in significant immunodeficiency; correct intradermal technique and cold-chain handling are essential.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 28, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Bedaquiline", category: "Antituberculosis · NEML Adult 8th · Dose: unverified", formulation: "NEML p.78; verify tablet strength and formulation.", adultDose: "Not added — current drug-resistant TB regimen required.", pediatricDose: "Not added — age- and weight-specific TB programme regimen required.", warning: "QT prolongation risk. Protocol-directed ECG, potassium, magnesium, liver function and interaction review required.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 78, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Bendamustine", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify injection vial strength and formulation.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Cytotoxic medicine. Monitor blood counts, renal/hepatic function, infection and infusion reactions; follow hazardous-drug handling.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Bendroflumethiazide", category: "Thiazide Diuretic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.19; verify tablet strength.", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not added — specialist verification required.", warning: "Monitor blood pressure, renal function and electrolytes; may cause hyponatraemia, hypokalaemia and hyperuricaemia.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 19, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Benzoic acid + Salicylic acid (Whitfield's ointment)", category: "Topical Antifungal / Keratolytic · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.21, 49, 60, 69; verify exact ointment concentrations and presentation.", adultDose: "Not added — topical product instructions required.", pediatricDose: "Not added — verify age, concentration and application-area restrictions.", warning: "External use only. Avoid extensive application, broken skin and sensitive sites unless specifically directed; salicylate absorption can increase with large-area use.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 21, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Benzoin", category: "Topical Protective Preparation · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.17, 49, 60, 68; verify exact tincture/compound preparation and concentration.", adultDose: "Not added — preparation-specific topical use.", pediatricDose: "Not added — verify age and skin-area restrictions.", warning: "External use only. May cause contact dermatitis; avoid mucous membranes and damaged skin unless product instructions permit.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 17, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Benzoyl peroxide", category: "Topical Anti-acne · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.21, 22, 49, 60; verify gel/cream concentrations.", adultDose: "Not added — concentration- and indication-specific topical instructions required.", pediatricDose: "Not added — verify age and concentration restrictions.", warning: "May cause dryness and irritation and bleach fabrics. Avoid eyes and mucous membranes; assess severe allergic reaction.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 21, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Benzyl benzoate", category: "Topical Scabicide · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.23, 49, 60, 64, 70; verify lotion concentration.", adultDose: "Not added — concentration- and infestation-specific instructions required.", pediatricDose: "Not added — age-specific dilution/application instructions required.", warning: "External use only. Can irritate skin and mucosa; avoid eyes. Do not assume adult concentration is suitable for children.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 23, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Betamethasone", category: "Corticosteroid · NEML Adult 8th · Dose: unverified", formulation: "NEML p.22; verify exact salt/ester, dosage form and strength.", adultDose: "Not added — formulation- and indication-specific regimen required.", pediatricDose: "Not added — formulation- and indication-specific regimen required.", warning: "Different betamethasone salts and formulations are not interchangeable. Systemic and topical preparations have different precautions.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 22, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Bethanechol", category: "Cholinergic Agonist · NEML Adult 8th · Dose: unverified", formulation: "NEML p.86; tablet 10 mg and 25 mg (confirm catalogue).", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "May cause bradycardia, hypotension, bronchospasm and diarrhoea. Avoid in mechanical urinary or gastrointestinal obstruction.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 86, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp"] },
  { name: "Bevacizumab", category: "Antineoplastic / Monoclonal Antibody · NEML Adult 8th · Dose: unverified", formulation: "NEML p.17; verify concentrate-for-infusion strength and vial presentation.", adultDose: "Not added — cancer- and regimen-specific specialist protocol required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Risks include hypertension, proteinuria, haemorrhage, thrombosis, impaired wound healing and GI perforation. Monitor BP and urine protein under oncology protocol.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 17, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Bicalutamide", category: "Antineoplastic / Antiandrogen · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify tablet strength.", adultDose: "Not added — oncology specialist regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor liver function and review drug interactions; confirm indication and concomitant therapy.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Biotin", category: "Vitamin · NEML Adult 8th · Dose: unverified", formulation: "NEML Appendix 1 p.73; transcribe listed presentation from vitamin appendix/catalogue.", adultDose: "Not added — verify NEML Appendix 1 dose and indication.", pediatricDose: "Not added — verify age-specific NEML Appendix 1 dose.", warning: "High-dose biotin can interfere with some laboratory immunoassays, including thyroid and cardiac tests; inform the laboratory/clinician.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 73, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Bleomycin", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify injection vial strength.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Potential pulmonary toxicity. Assess respiratory symptoms and lung function per protocol; monitor renal function and cumulative exposure.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"] },
  { name: "Bortezomib", category: "Antineoplastic / Proteasome Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.17; verify powder-for-injection strength and route-specific product instructions.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor blood counts, peripheral neuropathy, orthostatic symptoms and herpes zoster risk. Route errors can be fatal; confirm IV versus subcutaneous administration.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 17, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Bromocriptine", category: "Dopamine Agonist · NEML Adult 8th · Dose: unverified", formulation: "NEML p.33; verify tablet/capsule strength.", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "May cause nausea, dizziness and postural hypotension; indication-specific contraindications apply, particularly postpartum use.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 33, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Buserelin", category: "Gonadotropin-Releasing Hormone Analogue · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify nasal/injectable formulation and strength.", adultDose: "Not added — indication- and formulation-specific specialist regimen required.", pediatricDose: "Not added — specialist endocrinology regimen required.", warning: "Confirm formulation and indication; monitor relevant endocrine effects and bone health during prolonged therapy.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Busulfan", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify oral/injectable formulation and strength.", adultDose: "Not added — specialist haematology/oncology protocol required.", pediatricDose: "Not added — specialist protocol required.", warning: "High-risk cytotoxic medicine; monitor blood counts, hepatic function and regimen-specific toxicity. Follow hazardous-drug handling.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Cabotegravir", category: "Antiretroviral · NEML Adult 8th · Dose: unverified", formulation: "NEML p.11; verify oral/injectable formulation and strength.", adultDose: "Not added — distinguish oral lead-in from long-acting injectable regimen; use current HIV protocol.", pediatricDose: "Not added — paediatric indication/eligibility requires separate verification.", warning: "Long-acting injection has prolonged pharmacokinetic tail; review HIV testing, resistance risk, injection-site reactions and drug interactions.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 11, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Capecitabine", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify tablet strengths.", adultDose: "Not added — body-surface-area- and regimen-specific oncology protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor blood counts, renal function, diarrhoea, hand-foot syndrome and fluoropyrimidine toxicity; assess DPD deficiency risk per local protocol.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Carbetocin", category: "Uterotonic · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.27, 33; verify injection strength and presentation.", adultDose: "Not added — indication- and route-specific obstetric protocol required.", pediatricDose: "Not applicable to routine paediatric use.", warning: "Uterotonic medicine; use only in appropriate obstetric setting. Monitor uterine tone, bleeding and maternal haemodynamic status.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 27, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp"] },
  { name: "Carbimazole", category: "Antithyroid · NEML Adult 8th · Dose: unverified", formulation: "NEML p.27; verify tablet strength.", adultDose: "Not added — thyroid function- and indication-specific regimen required.", pediatricDose: "Not added — specialist paediatric endocrine regimen required.", warning: "Urgently assess sore throat, fever or mouth ulcers because agranulocytosis may occur. Monitor thyroid function and liver-related symptoms.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 27, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Carboplatin", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.14; verify injection concentration and vial size.", adultDose: "Not added — renal-function/AUC-based oncology protocol required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Dose depends on renal function and target AUC. Monitor blood counts, renal function and hypersensitivity; cytotoxic handling required.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 14, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Celecoxib", category: "NSAID / COX-2 Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.37; verify capsule/tablet strength.", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not added — verify paediatric approval and specialist indication.", warning: "Assess cardiovascular, gastrointestinal and renal risk; avoid in relevant NSAID hypersensitivity and review anticoagulant interactions.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 37, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Ceftazidime + Avibactam", category: "Antibiotic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.8; verify vial combination strength and ratio.", adultDose: "Not added — organism-, site- and renal-function-specific specialist regimen required.", pediatricDose: "Not added — paediatric eligibility and weight-based regimen require verification.", warning: "Reserve/stewardship antibiotic. Confirm susceptibility, renal adjustment and local antimicrobial approval; review beta-lactam allergy.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 8, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Ciclosporin (Cyclosporin)", category: "Immunosuppressant · NEML Adult 8th · Dose: unverified", formulation: "NEML p.17; verify capsule/oral solution/concentrate strengths and formulation.", adultDose: "Not added — indication-, formulation- and trough-level-specific regimen required.", pediatricDose: "Not added — specialist regimen required.", warning: "Narrow therapeutic index. Monitor renal function, BP, electrolytes and drug levels; major interactions. Do not interchange formulations without specialist review.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 17, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Clofazimine", category: "Antimycobacterial · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.9, 78; verify capsule strength and programme-specific product.", adultDose: "Not added — use current leprosy/TB programme regimen.", pediatricDose: "Not added — age- and weight-specific programme regimen required.", warning: "Skin/body-fluid discoloration and gastrointestinal effects may occur; consider QT risk and interactions in multidrug regimens.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 9, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Clomifene", category: "Ovulation Induction · NEML Adult 8th · Dose: unverified", formulation: "NEML p.33; verify tablet strength.", adultDose: "Not added — cycle- and indication-specific fertility protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Specialist fertility use. Assess pregnancy status and ovarian response; multiple pregnancy and ovarian enlargement risks.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 33, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Clozapine", category: "Antipsychotic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.34; verify tablet strength and dosage form.", adultDose: "Not added — specialist titration and monitoring protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Requires mandated blood-count monitoring due to neutropenia/agranulocytosis risk. Also monitor myocarditis, constipation/ileus, seizures, metabolic effects and orthostatic hypotension.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 34, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse", "bp"] },
  { name: "Cytarabine", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.15; verify injection strength and formulation.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not added — paediatric oncology protocol required.", warning: "Cytotoxic medicine. Monitor full blood count, hepatic/renal function, infection and neurotoxicity according to regimen; hazardous-drug handling required.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 15, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Dabigatran", category: "Direct Oral Anticoagulant · NEML Adult 8th · Dose: unverified", formulation: "NEML p.29; verify capsule strength and formulation.", adultDose: "Not added — indication-, age- and renal-function-specific regimen required.", pediatricDose: "Not added — paediatric eligibility and formulation require separate verification.", warning: "Bleeding risk. Assess renal function, interactions and indication; verify availability/role of specific reversal agent and peri-procedural plan.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 29, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Daclatasvir", category: "Direct-Acting Antiviral · NEML Adult 8th · Dose: unverified", formulation: "NEML p.13; verify tablet strength.", adultDose: "Not added — HCV genotype/regimen and interaction-specific protocol required.", pediatricDose: "Not added — paediatric indication and regimen require verification.", warning: "Use only as part of an appropriate combination regimen; review interactions and hepatitis B reactivation risk during HCV treatment.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 13, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Dapagliflozin", category: "SGLT2 Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.26; verify tablet strength.", adultDose: "Not added — indication- and renal-function-specific regimen required.", pediatricDose: "Not added — verify current paediatric approval and indication.", warning: "Risk of genital infections, volume depletion and euglycaemic ketoacidosis. Review renal function, sick-day rules and perioperative withholding guidance.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 26, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },
  { name: "Dapsone", category: "Antimycobacterial / Antiprotozoal · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.9, 47, 77; verify tablet strength and programme-specific formulation.", adultDose: "Not added — indication-specific regimen required.", pediatricDose: "Not added — weight-specific specialist/programme regimen required.", warning: "Check G6PD status where appropriate; risk of haemolysis, methaemoglobinaemia, agranulocytosis and severe skin reactions. Monitor blood counts.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 9, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Dasatinib", category: "Antineoplastic / Tyrosine Kinase Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.17; verify tablet strength.", adultDose: "Not added — disease- and response-specific oncology protocol required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Monitor blood counts, fluid retention/pleural effusion, bleeding, liver function and QT risk; review interactions including acid suppression.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 17, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Daunorubicin", category: "Antineoplastic / Anthracycline · NEML Adult 8th · Dose: unverified", formulation: "NEML p.15; verify injection vial strength.", adultDose: "Not added — oncology protocol and cumulative-dose calculation required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Cardiotoxicity and myelosuppression risks. Monitor cardiac function, blood counts and cumulative anthracycline exposure; cytotoxic handling.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 15, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Degarelix", category: "Gonadotropin-Releasing Hormone Antagonist · NEML Adult 8th · Dose: unverified", formulation: "NEML p.15; verify powder-for-injection strength and reconstitution.", adultDose: "Not added — oncology specialist regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor testosterone/PSA response, injection-site reactions and QT risk where clinically indicated.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 15, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Desmopressin", category: "Antidiuretic / Haemostatic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.29; verify nasal, oral and injection strengths separately.", adultDose: "Not added — indication- and formulation-specific regimen required.", pediatricDose: "Not added — age-, indication- and formulation-specific regimen required.", warning: "Risk of severe hyponatraemia/water intoxication. Fluid restriction and serum sodium monitoring depend on indication and formulation.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 29, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Diclofenac", category: "NSAID · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.37, 39; verify oral, topical, rectal and injectable strengths individually.", adultDose: "Not added — route-, formulation- and indication-specific regimen required.", pediatricDose: "Not added — verify age, route and indication restrictions.", warning: "GI bleeding, renal injury and cardiovascular risk. Avoid duplicate NSAID therapy; assess hydration, renal function and anticoagulant use.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 37, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Diethylcarbamazine", category: "Anthelmintic / Antifilarial · NEML Adult 8th · Dose: unverified", formulation: "NEML pp.5, 47, 77; verify tablet strength and programme-specific formulation.", adultDose: "Not added — infection-specific regimen required.", pediatricDose: "Not added — weight- and age-specific regimen required.", warning: "Use under appropriate filariasis programme guidance; reactions may occur from parasite death. Assess for onchocerciasis co-infection where relevant.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 5, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Diphenhydramine", category: "Antihistamine · NEML Adult 8th · Dose: unverified", formulation: "NEML p.68; verify exact dosage form and strength in product list.", adultDose: "Not added — formulation- and indication-specific regimen required.", pediatricDose: "Not added — age- and weight-specific regimen required.", warning: "Sedation and anticholinergic effects. Avoid combining with alcohol or other CNS depressants; caution in older adults and young children.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 68, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Docetaxel", category: "Antineoplastic · NEML Adult 8th · Dose: unverified", formulation: "NEML p.15; verify concentrate strength and vial presentation.", adultDose: "Not added — oncology protocol required.", pediatricDose: "Not established for routine paediatric use.", warning: "Monitor blood counts, liver function, fluid retention and hypersensitivity; premedication is regimen/product-specific. Cytotoxic handling required.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 15, doseStatus: "unverified", vitalsPolicy: "risk-based" },
  { name: "Donepezil", category: "Cholinesterase Inhibitor · NEML Adult 8th · Dose: unverified", formulation: "NEML p.35; verify tablet/orodispersible strengths.", adultDose: "Not added — indication- and formulation-specific regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "May cause bradycardia, syncope, nausea and weight loss. Review pulse, conduction disease and interacting medicines.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 35, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Doxepin", category: "Tricyclic Antidepressant · NEML Adult 8th · Dose: unverified", formulation: "NEML p.79; verify exact capsule/tablet/other formulation and strength.", adultDose: "Not added — indication- and formulation-specific regimen required.", pediatricDose: "Not established for routine paediatric use.", warning: "Anticholinergic and sedative effects; overdose can cause serious cardiac toxicity. Review suicide risk, interactions and cardiac history.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 79, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  { name: "Doxorubicin", category: "Antineoplastic / Anthracycline · NEML Adult 8th · Dose: unverified", formulation: "NEML p.15; verify injection vial strength and formulation.", adultDose: "Not added — oncology protocol and cumulative-dose calculation required.", pediatricDose: "Not added — specialist oncology protocol required.", warning: "Potential cumulative cardiotoxicity and myelosuppression. Monitor cardiac function, blood counts and extravasation; cytotoxic handling required.", neml: "NEML Adult 8th Edition (2024)", nemlPage: 15, doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["pulse"] },
  {
  name: "Propranolol",
  category: "Cardiovascular · Beta-blocker · NEML 8th",
  formulation: "Tablets: 20 mg, 40 mg (propranolol hydrochloride)",
  adultDose: "Not added — requires an indication-specific dosing source.",
  pediatricDose: "Not added — requires an indication-specific dosing source.",
  warning: "Monitor blood pressure and pulse rate. Use caution in patients with bradycardia, hypotension, heart block, or bronchospastic disease. Do not discontinue abruptly.",
  neml: "NEML 8th",
  doseStatus: "unverified",
  vitalsPolicy: "risk-based",
  requiresVitals: ["bp", "hr", "pulse"],
  contraindications: ["low_bp", "low_hr", "heart_block", "bronchospasm"]
},
{
  name: "Valsartan",
  category: "Cardiovascular · Angiotensin II receptor blocker (ARB) · NEML 8th",
  formulation: "Tablets: 40 mg, 80 mg, 160 mg, 320 mg; Capsules: 40 mg, 80 mg, 160 mg; Oral solution: 3 mg/mL (160 mL bottle)",
  adultDose: "Not added — requires an indication-specific dosing source.",
  pediatricDose: "Not added — requires an indication-specific dosing source.",
  warning: "Monitor blood pressure, renal function, and serum potassium. Risk of hypotension, hyperkalaemia, and deterioration in renal function. Contraindicated in pregnancy.",
  neml: "NEML 8th",
  doseStatus: "unverified",
  vitalsPolicy: "risk-based",
  requiresVitals: ["bp"],
  contraindications: ["low_bp", "hyperkalaemia", "pregnancy"]
}
];