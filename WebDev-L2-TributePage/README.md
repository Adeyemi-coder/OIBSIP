# Wole Soyinka — A Literary Portrait

A premium, interactive tribute page dedicated to the Nobel Laureate, Wole Soyinka. This project was built as part of the Oasis Infobyte Web Development & Designing Internship (Level 2, Task 2).

The goal of this project was to move beyond a standard static tribute page and create a bespoke, editorial experience using modern web animation techniques, 3D CSS transforms, and buttery-smooth scrolling.


 Key Features

Pure CSS 3D Orbit Carousel: A continuously rotating 3D carousel of portraits built entirely with CSS `transform-style: preserve-3d`, `rotateY`, and keyframe animations. No JavaScript required for the continuous motion.

Buttery Smooth Scrolling: Integrated Lenis to hijack native scrolling and provide a premium, momentum-based scrolling experience.

Scroll-Driven Animations Leveraged GSAP (GreenSock) & ScrollTrigger for:
    *   Text-mask reveals (words sliding up from behind invisible walls).
    *   SVG/Line drawing on the timeline section as you scroll.
    *   Parallax effects on the full-bleed photo band and the final quote.
*Interactive Works Filter: A custom vanilla JavaScript filter system that allows users to sort Wole Soyinka's bibliography by genre (Plays, Novels, Poetry, etc.) with animated transitions.
* Mouse Parallax Tilt: The 3D carousel tilts smoothly in response to the user's mouse movement using GSAP `quickTo`.
*   Accessibility First: Fully responsive design with support for `prefers-reduced-motion` to ensure users who are sensitive to motion can still enjoy the site comfortably.

 🛠️ Tech Stack

*   HTML5: Semantic markup, ARIA attributes, and accessibility best practices.
*   CSS3: Custom properties (variables), CSS Grid, Flexbox, 3D Transforms, Clip-path, and advanced typography.
*  JavaScript (Vanilla):
 DOM manipulation and filtering logic.
GSAP (GreenSock): Core animation engine and ScrollTrigger for scroll-based interactions.
Lenis: Smooth scroll library.
Google Fonts:Judson (Serif display) and IBM Plex Sans (Body).

📁 Folder Structure

```text
WebDev-L2-TributePage/
│
├── index.html            # Main HTML document
├── style.css             # Core styling, typography, and layout
├── portrait-carousel.css # 3D CSS carousel styling
├── motion.css            # Animation-specific CSS
├── polish.css            # Design refinements and overrides
│
├── script.js             # Navigation and general scripts
├── motion.js             # GSAP and Lenis animation logic
├── features.js           # Works filter logic
│
├── assets/               # Images and media files
│   ├── wole soyinka.jpg
│   ├── wole-soyinka 2.jpg
│   └── wole-soyinka 3.jpg
│
└── README.md             # Project documentation