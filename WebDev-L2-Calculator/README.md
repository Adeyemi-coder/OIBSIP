# Verdant | A Premium Web Calculator 🧮🌿

**Verdant** is a fully functional, browser-based calculator built from scratch. It combines a cinematic, glassmorphic UI with a robust, state-driven Vanilla JavaScript engine. 

Built for the **Oasis Infobyte Web Development & Designing Internship (Task 1)**, this project was designed to be more than just a standard calculator. It is a practical, accessible tool tailored for real-world use—including specific medical and nursing calculators—while pushing the boundaries of what pure CSS and JS can do visually.


## 🎨 The Concept: "Maths that grows"
The design philosophy behind Verdant is **"Sunlit Canopy."** Instead of a harsh, flat digital interface, the calculator looks and feels like a physical, frosted-glass object suspended in an organic, sunlit environment. 

When you calculate an equation, it "grows" into the background, floating away as a subtle 3D watermark. 

### Key Visual & Interactive Features:
*   **Spatial 3D Parallax:** On desktop, the calculator tilts slightly to follow your mouse, creating a sense of physical depth.
*   **Glassmorphism:** Built using `backdrop-filter` to create a polished glass effect that interacts with the background light.
*   **Midnight Forest (Dark Mode):** A fully accessible, native-feeling dark mode that remembers your preference via `localStorage`.
*   **Reduced-Motion Support:** If a user prefers reduced motion, all floating animations and 3D tilts are gracefully disabled.
*   **Responsive UI:** The layout completely reflows for mobile, transforming complex desktop columns into an app-like, touch-friendly interface.

 The Math Engine (No `eval()`)
To demonstrate a deep understanding of core JavaScript, **`eval()` was strictly forbidden** in this project. 

*   **Basic Mode:** Uses a sequential (left-to-right) evaluation engine. It tracks `currentInput`, `previousInput`, `pendingOperator`, and uses a `switch` statement to execute math.
*   **Scientific Mode:** Includes a custom-written **recursive descent parser**. It handles brackets, exponents, square roots, Pi, Euler's number, and implicit multiplication (e.g., `2(3)` becomes `2 * 3`) while strictly following the order of operations (BODMAS/PEMDAS).
*   **Floating Point Precision:** JavaScript is notorious for issues like `0.1 + 0.2 = 0.30000000000000004`. Verdant uses `Number(n.toPrecision(12))` to strip away these floating-point artifacts and return clean, accurate results.
*   **Number Formatting:** Integers automatically format with thousand separators (commas) for readability (e.g., `1,000,000`), without breaking the underlying math strings.

---

##  Nursing & Medical Tools
As a nursing student, I noticed most standard calculators lack the specific tools medical professionals need. 
*   **Nursing Tab:** Includes 12 dedicated calculators, including:
    *   BMI
    *   Parkland Burn Formula
    *   IV Drip Rate
    *   MAP (Mean Arterial Pressure)
    *   *and more...*
*   **Convert Tab:** Quickly converts between weights (kg/lb), volumes (mL/oz), temperatures, lengths, and times.
*   **Formula Library:** A searchable database of 40 nursing formulas.

*(Note: Includes clinical sanity checks and disclaimers. This is a study aid, not a replacement for facility protocols.)*

---

## 🛠️ Technical Stack & Accessibility
*   **HTML5:** Semantic structure with strict ARIA roles (`aria-live` for screen readers, `aria-expanded` for menus, `role="tablist"` for modes).
*   **CSS3:** Heavily uses CSS Grid for the keypad layout, Flexbox for alignment, and CSS Custom Properties (Variables) for seamless theme switching. No CSS frameworks were used.
*   **Vanilla JavaScript:** Organized into clean, modular sections (State Management, Math Engine, Rendering, Events). No React, no jQuery.
*   **Progressive Web App (PWA) Ready:** Includes a `manifest.json` and service worker for offline usage and "Add to Home Screen" support.
*   **Performance:** Automatically detects low-end devices (via `navigator.hardwareConcurrency`) and drops heavy blur effects to maintain a smooth 60fps.

---

## 📂 Folder Structure
```text
WebDev-L2-Calculator/
├── index.html          # Semantic layout and UI structure
├── style.css           # Design system, glassmorphism, animations, and responsive rules
├── script.js           # The math engine, state management, and event listeners
├── tools.js            # Logic for the Nursing and Convert tabs
├── formulas.js         # The floating background math generation logic
├── sw.js               # Service worker for offline support
├── manifest.json       # PWA configuration
└── README.md           # Project documentation