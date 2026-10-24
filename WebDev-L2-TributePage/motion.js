/*
   MOTION LAYER: GSAP + ScrollTrigger + Lenis
  */

(() => {
  "use strict";

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

 
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove("motion-pending");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 1 });

  const START = "top 80%";

  /* -----------------------------------------
     1. Global: Lenis smooth scrolling
  ----------------------------------------- */

  let lenis = null;

  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // In-page links use Lenis so they glide instead of jumping
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.classList.contains("skip-link")) return;

      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;

        event.preventDefault();
        lenis.scrollTo(target, { duration: 1.4 });
      });
    });
  }


  function splitWords(element) {
    const text = element.textContent.trim().replace(/\s+/g, " ");
    const words = text.split(" ");

    element.setAttribute("aria-label", text);
    element.textContent = "";

    words.forEach((word, index) => {
      const mask = document.createElement("span");
      mask.className = "word-mask";
      mask.setAttribute("aria-hidden", "true");

      const inner = document.createElement("span");
      inner.className = "word";
      inner.textContent = word;

      mask.appendChild(inner);
      element.appendChild(mask);

      if (index < words.length - 1) {
        element.appendChild(document.createTextNode(" "));
      }
    });

    return element.querySelectorAll(".word");
  }

  /* -----------------------------------------
     2. Hero
  ----------------------------------------- */

  const heroWords = gsap.utils.toArray(".hero-headline .word");
  const heroEyebrow = document.querySelector(".hero-text-col .eyebrow");
  const heroFades = gsap.utils.toArray(".hero-tagline, .hero-intro, .text-link");
  const stage = document.querySelector(".portrait-stage");
  const tilt = document.querySelector(".portrait-tilt");

  // Set the start state in JS first, then hand over from the CSS fail-safe
  gsap.set(heroWords, { yPercent: 115, autoAlpha: 1 });
  gsap.set([heroEyebrow, ...heroFades], { autoAlpha: 0, y: 28 });
  if (stage) gsap.set(stage, { autoAlpha: 0 });
  if (tilt) gsap.set(tilt, { scale: 0.86 });
  root.classList.remove("motion-pending");

  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

  intro
    .to(heroEyebrow, { autoAlpha: 1, y: 0, duration: 1 }, 0)
    .to(heroWords, { yPercent: 0, duration: 1.2, stagger: 0.14 }, 0.1)
    .to(heroFades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.5);

  if (stage && tilt) {
    intro
      .to(stage, { autoAlpha: 1, duration: 1.2 }, 0.3)
      .to(tilt, { scale: 1, duration: 1.4 }, 0.3);
  }


  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const heroSection = document.querySelector(".hero-section");

  if (tilt && heroSection && finePointer.matches) {
    const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 1, ease: "power3.out" });
    const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 1, ease: "power3.out" });

    heroSection.addEventListener("pointermove", (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      rotateY(x * 18);
      rotateX(-y * 12);
    });

    heroSection.addEventListener("pointerleave", () => {
      rotateY(0);
      rotateX(0);
    });
  }

  // Scroll velocity: the carousel orbits faster the faster you scroll
  if (stage) {
    const rate = { value: 1 };

    const setOrbitSpeed = (target) => {
      gsap.to(rate, {
        value: target,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          stage.getAnimations({ subtree: true }).forEach((animation) => {
            animation.playbackRate = rate.value;
          });
        }
      });
    };

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setOrbitSpeed(1 + Math.min(Math.abs(self.getVelocity()) / 700, 3.5));
      }
    });

    ScrollTrigger.addEventListener("scrollEnd", () => setOrbitSpeed(1));
  }



  gsap.utils.toArray(".section-content h2, .quote-inner h2").forEach((heading) => {
    const words = splitWords(heading);

    gsap.from(words, {
      yPercent: 115,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: heading, start: START, once: true }
    });
  });

  gsap.utils.toArray(".section-kicker").forEach((kicker) => {
    gsap.from(kicker, {
      autoAlpha: 0,
      x: -24,
      duration: 1,
      scrollTrigger: { trigger: kicker, start: START, once: true }
    });
  });

  // Photo band: the image drifts slowly inside its frame
  const bandImage = document.querySelector(".photo-band-img");

  if (bandImage) {
    gsap.fromTo(
      bandImage,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: ".photo-band",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }

  gsap.utils.toArray(".source-note, .section-subtitle, .closing-content p, .photo-band-caption").forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 24,
      duration: 1,
      scrollTrigger: { trigger: item, start: START, once: true }
    });
  });

  /* -----------------------------------------
     4. Section 01: Biography
  ----------------------------------------- */

  gsap.from(".bio-body > *", {
    autoAlpha: 0,
    y: 36,
    duration: 1,
    stagger: 0.14,
    scrollTrigger: { trigger: ".bio-body", start: START, once: true }
  });

  /* -----------------------------------------
     5. Section 02: Selected works
     (the hover state is pure CSS in motion.css)
  ----------------------------------------- */

  gsap.from(".work-item", {
    autoAlpha: 0,
    y: 28,
    duration: 0.9,
    stagger: 0.09,
    clearProps: "opacity,visibility,transform",
    scrollTrigger: { trigger: ".works-index", start: START, once: true }
  });

  /* -----------------------------------------
     6. Section 03: Timeline
  ----------------------------------------- */

  const timeline = document.querySelector(".timeline-list");

  if (timeline) {
    // The line draws as you scroll. Scrubbed tweens must be linear,
    // so the line stays locked to the scrollbar.
    gsap.fromTo(
      timeline,
      { "--line": 0 },
      {
        "--line": 1,
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 60%",
          end: "bottom 60%",
          scrub: true
        }
      }
    );

    // Each milestone appears as the line head reaches it
    gsap.utils.toArray(".milestone-item").forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, scale: 0.94, "--dot": 0 },
        {
          autoAlpha: 1,
          scale: 1,
          "--dot": 1,
          duration: 1,
          transformOrigin: "left center",
          scrollTrigger: { trigger: item, start: "top 60%", once: true }
        }
      );
    });
  }

  /* -----------------------------------------
     7. Section 04: Quote
  ----------------------------------------- */

  const quote = document.querySelector(".editorial-quote");

  if (quote) {
    // Parallax: drifts against the scroll so it appears to move slower
    gsap.fromTo(
      quote,
      { y: -80 },
      {
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: ".quote-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    // Red accent line draws from top to bottom
    gsap.fromTo(
      quote,
      { "--bar": 0 },
      {
        "--bar": 1,
        ease: "none",
        scrollTrigger: {
          trigger: quote,
          start: START,
          end: "bottom 40%",
          scrub: true
        }
      }
    );
  }

  /* -----------------------------------------
     8. Footer
  ----------------------------------------- */

  gsap.from(".footer-inner > div, .footer-bottom", {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    stagger: 0.15,
    scrollTrigger: { trigger: ".site-footer", start: "clamp(top 80%)", once: true }
  });


  window.addEventListener("load", () => ScrollTrigger.refresh());

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();