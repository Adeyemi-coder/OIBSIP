/*
  MOTION LAYER: GSAP + ScrollTrigger + Lenis
  Wole Soyinka Tribute Website

  Desktop: cinematic animations and 3D interactions.
  Mobile: lighter motion, readable timeline, stable scrolling.
  Accessibility: respects prefers-reduced-motion.
*/

(() => {
  "use strict";

  const root = document.documentElement;

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const mobileQuery = window.matchMedia(
    "(max-width: 768px), (hover: none) and (pointer: coarse)"
  );

  const finePointerQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const isMobile = mobileQuery.matches;
  const prefersReducedMotion = reducedMotionQuery.matches;

  /*
    1. Safe fallback
  */

  const restorePageVisibility = () => {
    root.classList.remove("motion-pending");

    document
      .querySelectorAll(
        ".hero-text-col .eyebrow, .hero-tagline, .hero-intro, " +
        ".text-link, .portrait-stage"
      )
      .forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("visibility");
      });

    document.querySelectorAll(".hero-headline .word").forEach((word) => {
      word.style.removeProperty("opacity");
      word.style.removeProperty("visibility");
      word.style.removeProperty("transform");
    });

    document
      .querySelectorAll(".milestone-item h3, .milestone-item p, .milestone-item time")
      .forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("visibility");
        element.style.removeProperty("transform");
      });
  };

  if (
    prefersReducedMotion ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    restorePageVisibility();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const TextPlugin = window.TextPlugin;

  const availablePlugins = [ScrollTrigger];

  if (TextPlugin) {
    availablePlugins.push(TextPlugin);
  }

  gsap.registerPlugin(...availablePlugins);

  gsap.defaults({
    ease: "power3.out",
    duration: 1
  });

  const START = isMobile ? "top 88%" : "top 80%";

  /*
    2. Cinematic preloader
  */

  const preloader = document.querySelector(".preloader");
  const preloaderTitle = document.querySelector(".preloader-title");
  const preloaderCounter = document.querySelector(".preloader-counter");

  if (preloader) {
    const isHomePage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("/");

    if (isHomePage && !isMobile) {
      const counter = { value: 0 };
      const timeline = gsap.timeline();

      if (preloaderTitle) {
        timeline.to(preloaderTitle, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out"
        });
      }

      if (preloaderCounter) {
        timeline.to(
          preloaderCounter,
          { opacity: 1, duration: 0.5 },
          "-=0.4"
        );

        timeline.to(counter, {
          value: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            preloaderCounter.textContent =
              `${Math.round(counter.value)}%`;
          }
        });
      }

      timeline.to(
        preloader,
        {
          yPercent: -100,
          duration: 1,
          ease: "power3.inOut",
          delay: 0.1,
          onComplete: () => {
            preloader.style.display = "none";
          }
        },
        "+=0.1"
      );
    } else {
      preloader.style.display = "none";
    }
  }

  /*
    3. Lenis smooth scrolling
  */

  let lenis = null;

  if (window.Lenis && !isMobile) {
    lenis = new window.Lenis({
      duration: 0.8,
      easing: (t) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.classList.contains("skip-link")) return;

      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target =
          id && id.length > 1
            ? document.querySelector(id)
            : null;

        if (!target) return;

        event.preventDefault();
        lenis.scrollTo(target, { duration: 1.2 });
      });
    });
  }

  /*
    4. Hero entrance animation
  */

  const heroWords = gsap.utils.toArray(".hero-headline .word");
  const heroEyebrow = document.querySelector(".hero-text-col .eyebrow");
  const heroFades = gsap.utils.toArray(
    ".hero-tagline, .hero-intro, .text-link"
  );

  const stage = document.querySelector(".portrait-stage");
  const tilt = document.querySelector(".portrait-tilt");

  if (heroWords.length > 0) {
    gsap.set(heroWords, {
      yPercent: isMobile ? 40 : 115,
      autoAlpha: 1
    });

    if (heroEyebrow) {
      gsap.set(heroEyebrow, {
        autoAlpha: 0,
        y: isMobile ? 10 : 28
      });
    }

    gsap.set(heroFades, {
      autoAlpha: 0,
      y: isMobile ? 10 : 28
    });

    if (stage) {
      gsap.set(stage, { autoAlpha: 0 });
    }

    if (tilt && !isMobile) {
      gsap.set(tilt, { scale: 0.86 });
    }

    root.classList.remove("motion-pending");

    const introDelay = preloader && !isMobile ? 2.2 : 0.1;

    const intro = gsap.timeline({
      defaults: {
        ease: "expo.out"
      },
      delay: introDelay
    });

    if (heroEyebrow) {
      intro.to(
        heroEyebrow,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.55 : 1
        },
        0
      );
    }

    intro.to(
      heroWords,
      {
        yPercent: 0,
        duration: isMobile ? 0.65 : 1.2,
        stagger: isMobile ? 0.06 : 0.14
      },
      0.1
    );

    if (heroFades.length) {
      intro.to(
        heroFades,
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.6 : 1,
          stagger: isMobile ? 0.06 : 0.12
        },
        0.35
      );
    }

    if (stage) {
      intro.to(
        stage,
        {
          autoAlpha: 1,
          duration: isMobile ? 0.65 : 1.2
        },
        0.25
      );
    }

    if (tilt && !isMobile) {
      intro.fromTo(
        tilt,
        { scale: 0.86 },
        {
          scale: 1,
          duration: 1.2
        },
        0.25
      );
    }
  } else {
    root.classList.remove("motion-pending");
  }

  /*
    5. 3D portrait interaction
  */

  const heroSection = document.querySelector(".hero-section");

  if (tilt && heroSection && finePointerQuery.matches && !isMobile) {
    const rotateY = gsap.quickTo(tilt, "rotationY", {
      duration: 1,
      ease: "power3.out"
    });

    const rotateX = gsap.quickTo(tilt, "rotationX", {
      duration: 1,
      ease: "power3.out"
    });

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

  /*
    6. Portrait orbit speed
  */

  if (stage && !isMobile) {
    const rate = { value: 1 };

    const setOrbitSpeed = (target) => {
      gsap.to(rate, {
        value: target,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          if (typeof stage.getAnimations !== "function") return;

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
        setOrbitSpeed(
          1 + Math.min(Math.abs(self.getVelocity()) / 700, 3.5)
        );
      }
    });

    ScrollTrigger.addEventListener("scrollEnd", () => {
      setOrbitSpeed(1);
    });
  }

  /*
    7. Typewriter headings
  */

  const typewriterHeadings = document.querySelectorAll(
    ".section-content h2, .quote-inner h2, .quote-label"
  );

  if (TextPlugin && typewriterHeadings.length > 0) {
    typewriterHeadings.forEach((heading) => {
      const originalHTML = heading.innerHTML;
      const originalText = heading.textContent || "";

      heading.setAttribute("aria-label", originalText);
      heading.classList.add("typewriter-cursor");
      heading.innerHTML = "";

      ScrollTrigger.create({
        trigger: heading,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(heading, {
            duration: Math.max(0.4, originalText.length * 0.025),
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

  /*
    8. Cinematic curtain reveals
  */

  const reveals = document.querySelectorAll(
    ".photo-band, .works-index"
  );

  reveals.forEach((section) => {
    if (isMobile) {
      gsap.fromTo(
        section,
        { autoAlpha: 0.6 },
        {
          autoAlpha: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            once: true
          }
        }
      );
    } else {
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
    }
  });

  /*
    9. Interactive velocity marquee
  */

  const marqueeTrack = document.querySelector(".marquee-track-js");

  if (marqueeTrack) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      repeat: -1,
      duration: isMobile ? 45 : 30,
      ease: "none"
    });

    if (!isMobile) {
      ScrollTrigger.create({
        trigger: ".marquee",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const direction = self.direction === 1 ? 1 : -1;

          marqueeTween.timeScale(
            direction * (1 + Math.abs(self.getVelocity()) / 1000)
          );
        }
      });
    }

    marqueeTrack.addEventListener("mouseenter", () => {
      marqueeTween.pause();
    });

    marqueeTrack.addEventListener("mouseleave", () => {
      marqueeTween.play();
    });
  }

  /*
    10. Section kicker fade-ups
  */

  gsap.utils.toArray(".section-kicker").forEach((kicker) => {
    gsap.from(kicker, {
      autoAlpha: 0,
      x: isMobile ? -10 : -24,
      duration: isMobile ? 0.55 : 1,
      scrollTrigger: {
        trigger: kicker,
        start: START,
        once: true
      }
    });
  });

  /*
    11. Supporting text fade-ups
  */

  gsap.utils
    .toArray(
      ".source-note, .section-subtitle, .closing-content p, .photo-band-caption"
    )
    .forEach((item) => {
      gsap.from(item, {
        autoAlpha: 0,
        y: isMobile ? 12 : 24,
        duration: isMobile ? 0.6 : 1,
        scrollTrigger: {
          trigger: item,
          start: START,
          once: true
        }
      });
    });

  /*
    12. Biography reveal
  */

  if (document.querySelector(".bio-body")) {
    gsap.from(".bio-body > *", {
      autoAlpha: 0,
      y: isMobile ? 14 : 36,
      duration: isMobile ? 0.6 : 1,
      stagger: isMobile ? 0.06 : 0.14,
      scrollTrigger: {
        trigger: ".bio-body",
        start: START,
        once: true
      }
    });
  }

  /*
    13. Works list reveal
  */

  if (document.querySelector(".work-item")) {
    gsap.from(".work-item", {
      autoAlpha: 0,
      y: isMobile ? 12 : 28,
      duration: isMobile ? 0.6 : 0.9,
      stagger: isMobile ? 0.05 : 0.09,
      clearProps: "opacity,visibility,transform",
      scrollTrigger: {
        trigger: ".works-index",
        start: START,
        once: true
      }
    });
  }

  /*
    14. Responsive timeline

    FIXED: Removed the !isMobile check so the 3D stack
    works on both desktop and mobile.
  */

  const timelineList = document.querySelector(".timeline-list");
  const milestones = gsap.utils.toArray(".milestone-item");

  if (timelineList) {
    milestones.forEach((item, i) => {
      const textElements = item.querySelectorAll("h3, p, time");

      gsap.from(textElements, {
        y: isMobile ? 10 : 20,
        autoAlpha: 0,
        duration: isMobile ? 0.55 : 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: isMobile ? "top 90%" : "top 85%",
          once: true
        }
      });

      // THIS NOW RUNS ON MOBILE TOO
      if (i < milestones.length - 1) {
        gsap.to(item, {
          scale: 0.9,
          autoAlpha: 0,
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: milestones[i + 1],
            start: "top bottom",
            end: "top 15vh",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }
    });
  }

  /*
    15. Quote animation
  */

  const quote = document.querySelector(".editorial-quote");
  const quoteSection = document.querySelector(".quote-section");

  if (quote && quoteSection) {
    if (!isMobile) {
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
    }

    gsap.fromTo(
      quote,
      { "--bar": 0 },
      {
        "--bar": 1,
        ease: "none",
        scrollTrigger: {
          trigger: quote,
          start: "top 85%",
          end: "bottom 45%",
          scrub: true
        }
      }
    );
  }

  /*
    16. Footer reveal
  */

  const footer = document.querySelector(".site-footer");

  if (footer) {
    const footerElements = footer.querySelectorAll(
      ".footer-inner > div, .footer-bottom"
    );

    if (footerElements.length) {
      gsap.from(footerElements, {
        autoAlpha: 0,
        y: isMobile ? 12 : 40,
        duration: isMobile ? 0.6 : 1,
        stagger: isMobile ? 0.06 : 0.15,
        scrollTrigger: {
          trigger: footer,
          start: "top 85%",
          once: true
        }
      });
    }
  }

  /*
    17. Scroll progress indicator
  */

  const progressBar = document.querySelector(".scroll-progress-bar");

  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      transformOrigin: "left center",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: isMobile ? 0.1 : 0.3
      }
    });
  }

  /*
    18. Refresh scroll measurements
  */

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
})();