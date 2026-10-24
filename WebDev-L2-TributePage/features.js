/* =========================================
   FEATURES: works filter
   Works with or without GSAP, and with reduced motion.
========================================= */

(() => {
  "use strict";

  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const items = Array.from(document.querySelectorAll(".work-item"));
  const count = document.querySelector(".works-count");

  if (!chips.length || !items.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;

      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      const visible = [];

      items.forEach((item) => {
        const match = filter === "all" || item.dataset.genre === filter;
        item.hidden = !match;
        if (match) visible.push(item);
      });

      if (count) {
        count.textContent = `${visible.length} ${visible.length === 1 ? "work" : "works"}`;
      }

      if (window.gsap && !prefersReducedMotion) {
        gsap.fromTo(
          visible,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
            overwrite: true,
            clearProps: "opacity,visibility,transform"
          }
        );
      }

      // The page height changed, so scroll triggers need new positions
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
})();