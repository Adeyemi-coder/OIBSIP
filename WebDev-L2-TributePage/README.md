# Wole Soyinka — A Literary Portrait

A premium, interactive editorial tribute dedicated to the Nobel Laureate, Wole Soyinka. This project was built as part of the **Oasis Infobyte Web Development & Designing Internship (Level 2, Task 2)**.

The goal of this project was to transcend a standard static tribute page and engineer a bespoke, digital publication experience. It combines high-end editorial typography with cutting-edge frontend animation techniques, 3D spatial interactions, and buttery-smooth scrolling.

## 🔗 Live Demo
[Insert your Vercel or Netlify link here]

## ✨ Key Features

*   **Cinematic Preloader & Page Transitions:** A custom GSAP-powered preloader counts down on initial load. Navigating between pages triggers a seamless "curtain" transition, eliminating the harsh white flash of standard HTML page reloads.
*   **Custom Interactive Cursor:** A bespoke mouse cursor with a smooth follower that expands and adapts (e.g., displaying "View" over images or "Click" over buttons) using GSAP `quickTo`. Includes magnetic hover effects on navigation links and buttons.
*   **3D Spatial Carousel:** A continuously rotating 3D carousel of portraits built with CSS `transform-style: preserve-3d`. It features a dynamic tilt effect that responds smoothly to the user's mouse position via GSAP.
*   **Buttery Smooth Scrolling:** Integrated **Lenis** to hijack native scrolling, providing a premium, momentum-based scrolling physics model that perfectly syncs with GSAP ScrollTrigger.
*   **High-End Typography & Motion:** 
    *   Headings reveal via a rapid, cinematic "typewriter" effect using GSAP `TextPlugin`.
    *   Individual letters on navigation and text links physically "lift" on hover.
    *   Subtle text-mask reveals, parallax background images, and staggered fade-ups across all sections.
*   **Interactive Works Filter:** A custom vanilla JavaScript filtering system that allows users to sort Wole Soyinka's bibliography by genre (Plays, Novels, Poetry, etc.) with animated transitions.
*   **Floating Side Navigator & Progress Bar:** A custom floating action button (FAB) opens a mobile-friendly side navigation menu. A subtle terracotta reading progress bar tracks scroll depth across the page.
*   **Accessibility First:** Fully responsive mobile layout (with custom mobile header scaling), semantic HTML5, ARIA attributes, and strict support for `prefers-reduced-motion` to ensure users who are sensitive to motion can still enjoy the site comfortably.

## 🛠️ Tech Stack

*   **HTML5:** Semantic markup, ARIA attributes, and accessibility best practices.
*   **CSS3:** Custom properties (variables), CSS Grid, Flexbox, 3D Transforms, Clip-path animations, and advanced fluid typography (`clamp`).
*   **JavaScript (Vanilla):** DOM manipulation, active page routing logic, and custom filter functionality.
*   **GSAP (GreenSock):** Core animation engine, `ScrollTrigger` for scroll-based interactions, `TextPlugin` for the typewriter effect, and `quickTo` for cursor/parallax tracking.
*   **Lenis:** Smooth scroll library for premium momentum physics.
*   **Google Fonts:** Judson (Serif display) and IBM Plex Sans (Body).

## 📁 Folder Structure

```text
WebDev-L2-TributePage/
│
├── index.html            # Homepage (Overview & Hero)
├── biography.html        # Full Biography page
├── works.html            # Full Works index with JS filtering
├── timeline.html         # Full interactive Timeline page
│
├── style.css             # Core styling, typography, layout, and responsive fixes
├── motion.css            # Animation-specific CSS (masks, cursors, transitions)
├── polish.css            # Design refinements and overrides
│
├── script.js             # Navigation logic, custom cursor, page transitions
├── motion.js             # GSAP, ScrollTrigger, Lenis, and TextPlugin logic
├── features.js           # Works filter logic
│
├── assets/               # High-resolution images and media
│   ├── wole soyinka.jpg
│   ├── wole-soyinka 2.jpg
│   └── wole-soyinka 3.jpg
│
└── README.md             # Project documentation