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

  { name: "Digoxin", category: "Cardiac Glycoside · NEML 8th · Dose: unverified", formulation: "Tab: 62.5, 125, 250 mcg. Inj: 250 mcg/mL in 2-mL ampoule; 100 mcg/mL in 1-mL ampoule. Oral liquid: 50 mcg/mL", adultDose: "0.125-0.25 mg daily", pediatricDose: "Digitalizing dose: 20-40 mcg/kg", warning: "Narrow therapeutic index. Bradycardia and arrhythmia in toxicity.", neml: "NEML 8th", doseStatus: "unverified", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_hr"] },

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

  { name: "Lisinopril", category: "ACE inhibitor · NEML 8th · Dose: not added", formulation: "Tab: 5 mg; 10 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Losartan", category: "Angiotensin receptor blocker · NEML 8th · Dose: not added", formulation: "Tab: 25 mg; 50 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Labetalol", category: "Antihypertensive · NEML 8th · Dose: not added", formulation: "Tab: 100 mg; 200 mg. Inj: 5 mg/mL in 20-mL ampoule (printed as 'powder for injection' in NEML 8th: check the label)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp", "hr"] },

  { name: "Nifedipine", category: "Calcium channel blocker · NEML 8th · Dose: not added", formulation: "Tab: 20 mg. Slow-release tab: 30 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Do not give capsule contents sublingually.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Hydrochlorothiazide", category: "Thiazide diuretic · NEML 8th · Dose: not added", formulation: "Tab: 12.5 mg; 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Spironolactone", category: "Diuretic · NEML 8th · Dose: not added", formulation: "Tab: 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Monitor potassium.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Carvedilol", category: "Beta-blocker · NEML 8th · Dose: not added", formulation: "Tab: 6.25, 12.5, 25 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp"], contraindications: ["low_hr"] },

    { name: "Metoprolol", category: "Beta-blocker · NEML 8th · Dose: partly source-checked", formulation: "Extended-release tab (succinate): 25 mg; 50 mg; 100 mg; 200 mg", adultDose: "25-200 mg once daily (succinate ER; start low, titrate)", pediatricDose: "Specialist use only — ER form not established in children. Immediate-release 1-2 mg/kg/day divided is used by specialists; consult prescriber.", warning: "Do not stop abruptly (rebound angina, tachycardia). Contraindicated in bradycardia, decompensated heart failure and severe asthma. Can cause bronchospasm and, in overdose, respiratory depression.", neml: "NEML 8th", doseStatus: "partly-checked", vitalsPolicy: "risk-based", requiresVitals: ["hr", "bp", "rr"], contraindications: ["low_hr", "low_rr"] },

  { name: "Torsemide", category: "Loop diuretic · NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL. Tab: 5 mg; 10 mg; 20 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["bp"] },

  { name: "Alteplase", category: "Thrombolytic · NEML 8th · Dose: not added", formulation: "Powder for inj: 10 mg; 20 mg; 50 mg in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Streptokinase", category: "Thrombolytic · NEML 8th · Dose: not added", formulation: "Powder for inj: 1.5 million units in vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Simvastatin", category: "Statin · NEML 8th · Dose: not added", formulation: "Tab: 10 mg; 20 mg; 40 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Rosuvastatin", category: "Statin · NEML 8th · Dose: not added", formulation: "Tab: 5 mg; 10 mg; 20 mg; 40 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Magnesium trisilicate", category: "Antacid · NEML 8th · Dose: not added", formulation: "Mixture: 250 mg/5 mL. Tab: 500 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Aluminium hydroxide + Magnesium hydroxide", category: "Antacid · Not in NEML 8th · Dose: not added", formulation: "Oral suspension: 500 mg + 500 mg per 5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "aluminium hydroxide", neml: "Not in NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Rabeprazole", category: "Proton pump inhibitor · NEML 8th · Dose: not added", formulation: "Tab: 20 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Lactulose", category: "Laxative · NEML 8th · Dose: not added", formulation: "Oral liquid: 68%", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Senna", category: "Laxative · NEML 8th · Dose: not added", formulation: "Tab: 7.5 mg (sennosides). Oral liquid: 7.5 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Loperamide", category: "Antidiarrhoeal · NEML 8th · Dose: not added", formulation: "Cap: 2 mg. Tab: 2 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Not for bloody diarrhoea.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Hyoscine butylbromide", category: "Antispasmodic · Not in NEML 8th · Dose: not added", formulation: "Inj: 10 mg/mL. Tab: 10 mg; 20 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "Not in NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Cyclizine", category: "Antiemetic · NEML 8th · Dose: not added", formulation: "Inj: 50 mg/mL. Tab: 25 mg; 50 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Domperidone", category: "Antiemetic (complementary list) · NEML 8th · Dose: not added", formulation: "Oral suspension: 1 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Methylprednisolone", category: "Corticosteroid · NEML 8th · Dose: not added", formulation: "Inj suspension: 20 mg/mL; 40 mg/mL. Powder for inj: 40 mg/mL; 80 mg/mL (sodium succinate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Fludrocortisone", category: "Corticosteroid · NEML 8th · Dose: not added", formulation: "Tab: 100 mcg (acetate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Glucagon", category: "Hypoglycaemia · NEML 8th · Dose: not added", formulation: "Inj: 1 mg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Gliclazide", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Tab: 60 mg; 80 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Hypoglycaemia risk.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Glimepiride", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Tab: 1, 2, 3, 4 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Hypoglycaemia risk.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["hr"] },

  { name: "Sitagliptin", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Tab: 50 mg; 100 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Insulin aspart", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Inj: 100 units/mL (prefilled)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Rapid-acting.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Insulin glargine", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Inj: 100 units/mL in 10-mL vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Long-acting.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Insulin isophane (intermediate-acting)", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Inj: 100 units/mL in 10-mL vial", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Biphasic isophane insulin 30/70", category: "Antidiabetic · NEML 8th · Dose: not added", formulation: "Inj: 30% soluble / 70% isophane, 100 units/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Propylthiouracil", category: "Antithyroid · NEML 8th · Dose: not added", formulation: "Tab: 50 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Octreotide", category: "Hormone · NEML 8th · Dose: not added", formulation: "Inj: 50, 100, 200 mcg/mL in 1-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Carbetocin", category: "Uterotonic · NEML 8th · Dose: not added", formulation: "Inj (heat stable): 100 mcg/mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Medroxyprogesterone acetate", category: "Progestogen / contraceptive · NEML 8th · Dose: not added", formulation: "Inj (IM): 150 mg/mL in 1-mL vial. Tab: 5 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Budesonide", category: "Inhaled corticosteroid · NEML 8th · Dose: not added", formulation: "Inhaler: 100 mcg/dose; 200 mcg/dose", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Rinse mouth after use.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Ipratropium bromide", category: "Bronchodilator · NEML 8th · Dose: not added", formulation: "MDI: 20 mcg/dose. Nebuliser solution: 0.02%", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Salmeterol + Fluticasone", category: "Inhaled corticosteroid + LABA · NEML 8th · Dose: not added", formulation: "Inhaler: 21/45 mcg per dose. Powder: 50/100 and 50/250 mcg per dose", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "salmeterol", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Heparin (unfractionated)", category: "Anticoagulant · NEML 8th · Dose: not added", formulation: "Inj: 1,000 units/mL; 5,000 units/mL in 1-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Check the concentration on the vial.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Enoxaparin", category: "Anticoagulant · NEML 8th · Dose: not added", formulation: "Inj: 1,000 units/mL; 5,000 units/mL in 1-mL ampoule (low molecular weight heparin)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Warfarin", category: "Anticoagulant · NEML 8th · Dose: not added", formulation: "Tab: 1 mg; 2 mg; 5 mg (sodium)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Needs INR monitoring.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Tranexamic acid", category: "Antifibrinolytic · NEML 8th · Dose: not added", formulation: "Inj: 100 mg/mL in 10-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Hydroxocobalamin (Vitamin B12)", category: "Vitamin · NEML 8th · Dose: not added", formulation: "Inj: 1 mg in 1-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "hydroxocobalamin", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Apixaban", category: "Anticoagulant · NEML 8th · Dose: not added", formulation: "Tab: 2.5 mg; 5 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Fentanyl", category: "Opioid · NEML 8th · Dose: not added", formulation: "Inj: 25 mcg/mL; 50 mcg/mL (1-, 2-, 10-mL ampoules). Patch: 12, 25, 75 mcg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Pethidine", category: "Opioid · NEML 8th · Dose: not added", formulation: "Inj: 50 mg/mL in 1-mL and 2-mL ampoule", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "High-alert. Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2", "bp"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Pentazocine", category: "Opioid · NEML 8th · Dose: not added", formulation: "Inj: 30 mg in 1-mL ampoule (lactate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Dihydrocodeine", category: "Opioid · NEML 8th · Dose: not added", formulation: "Inj: 50 mg/mL in 1-mL ampoule. Tab: 30 mg (tartrate)", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Respiratory depression.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr", "spo2"], contraindications: ["low_rr", "low_spo2"] },

  { name: "Hyoscine hydrobromide", category: "Antimuscarinic · NEML 8th · Dose: not added", formulation: "Inj: 400 mcg/mL; 600 mcg/mL. Transdermal patch: 1 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Docusate sodium", category: "Laxative · NEML 8th · Dose: not added", formulation: "Cap: 100 mg. Oral liquid: 50 mg/5 mL", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Bromazepam", category: "Anxiolytic · NEML 8th · Dose: not added", formulation: "Tab: 1.5 mg; 3 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "Sedating.", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based", requiresVitals: ["rr"], contraindications: ["low_rr"] },

  { name: "Biperiden", category: "Anticholinergic · NEML 8th · Dose: not added", formulation: "Inj: 5 mg (lactate)/mL in 1-mL ampoule. Tab: 2 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Benzhexol (trihexyphenidyl)", category: "Anticholinergic · NEML 8th · Dose: not added", formulation: "Tab: 2 mg; 5 mg", adultDose: "N/A. Dose not yet verified. Use the prescriber's order.", pediatricDose: "N/A. Dose not yet verified. Use the prescriber's order.", warning: "benzhexol", neml: "NEML 8th", doseStatus: "not-added", vitalsPolicy: "risk-based" },

  { name: "Pyridoxine (Vitamin B6)", category: "Vitamin · NEML 8th · Dose: source-checked (NEML App. 1)", formulation: "Tab: 10 mg; 25 mg", adultDose: "Daily 1-2 mg; deficiency 50-400 mg", pediatricDose: "Daily 0.3-0.6 mg; deficiency 20-50 mg", warning: "Dose from NEML 8th Appendix 1.", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Thiamine (Vitamin B1)", category: "Vitamin · NEML 8th (restricted list) · Dose: source-checked (NEML App. 1)", formulation: "Cap: 50 mg. Tab: 50 mg; 100 mg. Inj: 100 mg/mL", adultDose: "Daily 1-1.3 mg; deficiency 200-300 mg", pediatricDose: "Daily 0.3-1 mg; deficiency 5-50 mg", warning: "Dose from NEML 8th Appendix 1.", neml: "NEML 8th (restricted list)", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Riboflavin (Vitamin B2)", category: "Vitamin · NEML 8th (restricted list) · Dose: source-checked (NEML App. 1)", formulation: "Tab: 25 mg; 50 mg", adultDose: "Daily 0.3-1 mg; deficiency 5-30 mg", pediatricDose: "Daily 1-1.8 mg", warning: "Dose from NEML 8th Appendix 1.", neml: "NEML 8th (restricted list)", doseStatus: "source-checked", vitalsPolicy: "risk-based" },

  { name: "Cholecalciferol (Vitamin D3)", category: "Vitamin · NEML 8th · Dose: source-checked (NEML App. 1)", formulation: "Cap/Tab: 400 units; 1,000 units. Oral solution: 400 units/mL", adultDose: "Daily 25-50 mcg", pediatricDose: "Daily 2.5-5 mcg", warning: "Dose from NEML 8th Appendix 1 (mcg).", neml: "NEML 8th", doseStatus: "source-checked", vitalsPolicy: "risk-based" }
];