/*
   MOTION LAYER: GSAP + ScrollTrigger + Lenis
*/

(() => {
  "use strict";

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove("motion-pending");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  gsap.defaults({ ease: "power3.out", duration: 1 });

  const START = "top 80%";
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  /* 1. Preloader */
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    if (isHomePage && !isMobile) {
      const counter = { value: 0 };
      const tl = gsap.timeline();
      tl.to(".preloader-title", { opacity: 1, y: 0, duration: 0.8 })
        .to(".preloader-counter", { opacity: 1, duration: 0.5 }, "-=0.4")
        .to(counter, { value: 100, duration: 1.5, onUpdate: () => { document.querySelector(".preloader-counter").textContent = Math.round(counter.value) + "%"; } })
        .to(preloader, { yPercent: -100, duration: 1.2, ease: "expo.inOut", delay: 0.2, onComplete: () => { preloader.style.display = "none"; } });
    } else {
      preloader.style.display = "none";
    }
  }

  /* 2. Lenis Smooth Scroll (Desktop Only) */
  let lenis = null;
  if (window.Lenis && !isMobile) {
    lenis = new Lenis({ duration: 0.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* 3. Hero Section (Only runs on index.html) */
  const heroWords = gsap.utils.toArray(".hero-headline .word");
  if (heroWords.length > 0) {
    gsap.set(heroWords, { yPercent: 115, autoAlpha: 1 });
    gsap.set(".hero-text-col .eyebrow, .hero-tagline, .hero-intro, .text-link", { autoAlpha: 0, y: 28 });
    gsap.set(".portrait-stage", { autoAlpha: 0 });
    gsap.set(".portrait-tilt", { scale: 0.86 });
    root.classList.remove("motion-pending");

    const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: isMobile ? 0.2 : 2.5 });
    intro.to(".hero-text-col .eyebrow", { autoAlpha: 1, y: 0, duration: 1 }, 0)
         .to(heroWords, { yPercent: 0, duration: 1.2, stagger: 0.14 }, 0.1)
         .to(".hero-tagline, .hero-intro, .text-link", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.5)
         .to(".portrait-stage", { autoAlpha: 1, duration: 1.2 }, 0.3)
         .to(".portrait-tilt", { scale: 1, duration: 1.4 }, 0.3);
  } else {
    root.classList.remove("motion-pending");
  }

  /* 4. 3D Carousel Interaction */
  const tilt = document.querySelector(".portrait-tilt");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (tilt && finePointer.matches) {
    const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 1, ease: "power3.out" });
    const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 1, ease: "power3.out" });
    document.querySelector(".hero-section").addEventListener("pointermove", (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      rotateY(x * 18);
      rotateX(-y * 12);
    });
    document.querySelector(".hero-section").addEventListener("pointerleave", () => { rotateY(0); rotateX(0); });
  }

  /* 5. Typewriter Headings */
  const typewriterHeadings = document.querySelectorAll(".section-content h2, .quote-inner h2, .quote-label");
  typewriterHeadings.forEach((heading) => {
    const originalHTML = heading.innerHTML;
    heading.innerHTML = "";
    heading.classList.add("typewriter-cursor");
    ScrollTrigger.create({
      trigger: heading, start: "top 85%", once: true,
      onEnter: () => {
        gsap.to(heading, {
          duration: originalHTML.length * 0.03,
          text: { value: originalHTML, delimiter: "" },
          ease: "none",
          onComplete: () => { heading.classList.remove("typewriter-cursor"); }
        });
      }
    });
  });

  /* 6. Curtain Reveals */
  document.querySelectorAll(".photo-band, .works-index").forEach((section) => {
    section.classList.add("reveal-curtain");
    gsap.to(section, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: section, start: "top 85%", once: true } });
  });

  /* 7. Marquee */
  const marqueeTrack = document.querySelector(".marquee-track-js");
  if (marqueeTrack) {
    const marqueeTween = gsap.to(marqueeTrack, { xPercent: -50, repeat: -1, duration: 30, ease: "none" });
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: (self) => { marqueeTween.timeScale((self.direction === 1 ? 1 : -1) * (1 + Math.abs(self.getVelocity()) / 1000)); }
    });
    marqueeTrack.addEventListener("mouseenter", () => marqueeTween.pause());
    marqueeTrack.addEventListener("mouseleave", () => marqueeTween.play());
  }

  /* 8. Standard Fade-ups */
  gsap.utils.toArray(".section-kicker").forEach((kicker) => {
    gsap.from(kicker, { autoAlpha: 0, x: -24, duration: 1, scrollTrigger: { trigger: kicker, start: START, once: true } });
  });
  gsap.utils.toArray(".source-note, .section-subtitle, .closing-content p, .photo-band-caption").forEach((item) => {
    gsap.from(item, { autoAlpha: 0, y: 24, duration: 1, scrollTrigger: { trigger: item, start: START, once: true } });
  });
  if (document.querySelector(".bio-body")) {
    gsap.from(".bio-body > *", { autoAlpha: 0, y: 36, duration: 1, stagger: 0.14, scrollTrigger: { trigger: ".bio-body", start: START, once: true } });
  }
  if (document.querySelector(".work-item")) {
    gsap.from(".work-item", { autoAlpha: 0, y: 28, duration: 0.9, stagger: 0.09, clearProps: "opacity,visibility,transform", scrollTrigger: { trigger: ".works-index", start: START, once: true } });
  }

  /* 9. Quote & Footer */
  const quote = document.querySelector(".editorial-quote");
  if (quote) {
    gsap.fromTo(quote, { y: -40 }, { y: 40, ease: "none", scrollTrigger: { trigger: ".quote-section", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(quote, { "--bar": 0 }, { "--bar": 1, ease: "none", scrollTrigger: { trigger: quote, start: "top 80%", end: "bottom 40%", scrub: true } });
  }
  gsap.from(".footer-inner > div, .footer-bottom", { autoAlpha: 0, y: 40, duration: 1, stagger: 0.15, scrollTrigger: { trigger: ".site-footer", start: "clamp(top 80%)", once: true } });

  /* 10. Progress Bar */
  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    gsap.to(progressBar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.3 } });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();