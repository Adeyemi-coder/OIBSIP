/*
   MOTION LAYER: GSAP + ScrollTrigger + Lenis
   Fully assembled with Mobile Fixes, Typewriter, and 3D Stacking.
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

  /* -----------------------------------------
     1. Cinematic Preloader (Homepage Only)
  ----------------------------------------- */
  const preloader = document.querySelector(".preloader");
  const preloaderTitle = document.querySelector(".preloader-title");
  const preloaderCounter = document.querySelector(".preloader-counter");

  if (preloader) {
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');

    if (isHomePage && !prefersReducedMotion) {
      const counter = { value: 0 };
      const tl = gsap.timeline();
      
      tl.to(preloaderTitle, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .to(preloaderCounter, { opacity: 1, duration: 0.5 }, "-=0.4")
        .to(counter, {
          value: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            preloaderCounter.textContent = Math.round(counter.value) + "%";
          }
        })
        .to(preloader, {
          yPercent: -100,
          duration: 1.2,
          ease: "expo.inOut",
          delay: 0.2,
          onComplete: () => {
            preloader.style.display = "none";
          }
        }, "+=0.2");
    } else {
      // Instantly hide on subpages to prevent flash/reload feeling
      preloader.style.display = "none";
    }
  }

  /* -----------------------------------------
     2. Global: Lenis smooth scrolling
  ----------------------------------------- */
  let lenis = null;

  // ONLY enable Lenis on desktop. Mobile touch scrolling is better natively.
  if (window.Lenis && !isMobile) {
    lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.classList.contains("skip-link")) return;
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { duration: 1.2 });
      });
    });
  }

  /* -----------------------------------------
     3. Hero Section (3D Carousel & Entrance)
  ----------------------------------------- */
  const heroWords = gsap.utils.toArray(".hero-headline .word");
  const heroEyebrow = document.querySelector(".hero-text-col .eyebrow");
  const heroFades = gsap.utils.toArray(".hero-tagline, .hero-intro, .text-link");
  const stage = document.querySelector(".portrait-stage");
  const tilt = document.querySelector(".portrait-tilt");

  if (heroWords.length > 0) {
    gsap.set(heroWords, { yPercent: 115, autoAlpha: 1 });
    if (heroEyebrow) gsap.set(heroEyebrow, { autoAlpha: 0, y: 28 });
    gsap.set(heroFades, { autoAlpha: 0, y: 28 });
    if (stage) gsap.set(stage, { autoAlpha: 0 });
    if (tilt) gsap.set(tilt, { scale: 0.86 });
    
    root.classList.remove("motion-pending");

    // Delay intro slightly if preloader is running to sync perfectly
    const introDelay = (preloader && !isMobile) ? 2.5 : 0.2;

    const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: introDelay });
    if (heroEyebrow) intro.to(heroEyebrow, { autoAlpha: 1, y: 0, duration: 1 }, 0);
    intro.to(heroWords, { yPercent: 0, duration: 1.2, stagger: 0.14 }, 0.1);
    if (heroFades.length) intro.to(heroFades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.5);
    if (stage && tilt) {
      intro.to(stage, { autoAlpha: 1, duration: 1.2 }, 0.3).to(tilt, { scale: 1, duration: 1.4 }, 0.3);
    }
  } else {
    root.classList.remove("motion-pending");
  }

  /* -----------------------------------------
     4. 3D Carousel Mouse & Scroll Interaction
  ----------------------------------------- */
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

  if (stage && !isMobile) {
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

  /* -----------------------------------------
     5. High-End Fast Typewriter Effect
  ----------------------------------------- */
  const typewriterHeadings = document.querySelectorAll(".section-content h2, .quote-inner h2, .quote-label");
  
  if (typewriterHeadings.length > 0) {
    typewriterHeadings.forEach((heading) => {
      const originalHTML = heading.innerHTML;
      heading.innerHTML = "";
      heading.classList.add("typewriter-cursor");

      ScrollTrigger.create({
        trigger: heading,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(heading, {
            duration: originalHTML.length * 0.03, 
            text: {
              value: originalHTML,
              delimiter: "" 
            },
            ease: "none",
            onComplete: () => {
              heading.classList.remove("typewriter-cursor");
            }
          });
        }
      });
    });
  }

  /* -----------------------------------------
     6. Cinematic Curtain Reveals
  ----------------------------------------- */
  const reveals = document.querySelectorAll(".photo-band, .works-index");
  reveals.forEach((section) => {
    section.classList.add("reveal-curtain");
    gsap.to(section, {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      duration: 1.5,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        once: true
      }
    });
  });

  /* -----------------------------------------
     7. Interactive Velocity Marquee
  ----------------------------------------- */
  const marqueeTrack = document.querySelector(".marquee-track-js");
  
  if (marqueeTrack) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      repeat: -1,
      duration: 30,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const direction = self.direction === 1 ? 1 : -1;
        marqueeTween.timeScale(direction * (1 + Math.abs(self.getVelocity()) / 1000));
      }
    });

    marqueeTrack.addEventListener("mouseenter", () => marqueeTween.pause());
    marqueeTrack.addEventListener("mouseleave", () => marqueeTween.play());
  }

  /* -----------------------------------------
     8. Standard Fade-ups (Bio, Kickers)
  ----------------------------------------- */
  gsap.utils.toArray(".section-kicker").forEach((kicker) => {
    gsap.from(kicker, {
      autoAlpha: 0,
      x: -24,
      duration: 1,
      scrollTrigger: { trigger: kicker, start: START, once: true }
    });
  });

  gsap.utils.toArray(".source-note, .section-subtitle, .closing-content p, .photo-band-caption").forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 24,
      duration: 1,
      scrollTrigger: { trigger: item, start: START, once: true }
    });
  });

  if (document.querySelector(".bio-body")) {
    gsap.from(".bio-body > *", {
      autoAlpha: 0,
      y: 36,
      duration: 1,
      stagger: 0.14,
      scrollTrigger: { trigger: ".bio-body", start: START, once: true }
    });
  }

  if (document.querySelector(".work-item")) {
    gsap.from(".work-item", {
      autoAlpha: 0,
      y: 28,
      duration: 0.9,
      stagger: 0.09,
      clearProps: "opacity,visibility,transform",
      scrollTrigger: { trigger: ".works-index", start: START, once: true }
    });
  }

  /* -----------------------------------------
     9. 3D Depth Stack Timeline
  ----------------------------------------- */
  const timelineList = document.querySelector(".timeline-list");
  const milestones = gsap.utils.toArray(".milestone-item");

  if (timelineList && !isMobile) { // Disable heavy stacking on mobile for performance
    milestones.forEach((item, i) => {
      const textElements = item.querySelectorAll("h3, p");
      gsap.from(textElements, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 75%", once: true }
      });

      if (i !== milestones.length - 1) {
        gsap.to(item, {
          scale: 0.85,
          opacity: 0,
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: milestones[i + 1],
            start: "top bottom",
            end: "top 15vh",
            scrub: true
          }
        });
      }
    });
  } else if (timelineList && isMobile) {
    // Simple fade-up for mobile timeline
    gsap.from(".milestone-item", {
      autoAlpha: 0,
      y: 30,
      duration: 1,
      stagger: 0.15,
      scrollTrigger: { trigger: timelineList, start: START, once: true }
    });
  }

  /* -----------------------------------------
     10. Quote Animation
  ----------------------------------------- */
  const quote = document.querySelector(".editorial-quote");
  const quoteSection = document.querySelector(".quote-section");

  if (quote && quoteSection) {
    gsap.fromTo(
      quote,
      { y: -40 },
      {
        y: 40,
        ease: "none",
        scrollTrigger: {
          trigger: quoteSection,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    gsap.fromTo(
      quote,
      { "--bar": 0 },
      {
        "--bar": 1,
        ease: "none",
        scrollTrigger: {
          trigger: quote,
          start: "top 80%",
          end: "bottom 40%",
          scrub: true
        }
      }
    );
  }

  /* -----------------------------------------
     11. Footer & Scroll Progress Bar
  ----------------------------------------- */
  gsap.from(".footer-inner > div, .footer-bottom", {
    autoAlpha: 0,
    y: 40,
    duration: 1,
    stagger: 0.15,
    scrollTrigger: { trigger: ".site-footer", start: "clamp(top 80%)", once: true }
  });

  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3
      }
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();