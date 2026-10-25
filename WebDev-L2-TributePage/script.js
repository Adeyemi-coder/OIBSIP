document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Side Navigator Widget Logic
  const widget = document.querySelector('.side-nav-widget');
  const toggleBtn = document.querySelector('.side-nav-toggle');

  if (toggleBtn && widget) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = widget.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // 2. Active Nav Link based on URL
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.site-nav a, .side-nav-menu a, .nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // 3. Premium Header Scroll Effect
  const header = document.querySelector(".site-header");

  if (header) {
    if (window.scrollY > 50) {
      header.classList.add("is-scrolled");
    }

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  // 4. Smooth Page Transitions (Curtain)
  const transitionCurtain = document.querySelector(".transition-curtain");
  
  if (transitionCurtain && window.gsap) {
    // Reveal the page when it loads
    gsap.to(transitionCurtain, {
      scaleY: 0,
      transformOrigin: "top",
      duration: 1,
      ease: "power4.inOut"
    });

    // Animate the curtain down when clicking internal links
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    
    internalLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (link.href === window.location.href) return;
        
        e.preventDefault();
        const targetUrl = link.href;

        gsap.to(transitionCurtain, {
          scaleY: 1,
          transformOrigin: "bottom",
          duration: 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            window.location.href = targetUrl;
          }
        });
      });
    });
  }

  // 5. Custom Cursor & Magnetic Effects
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".custom-cursor-follower");
  const cursorText = document.querySelector(".cursor-text");

  if (cursor && follower && window.matchMedia("(hover: hover)").matches && window.gsap) {
    // Smooth Cursor Follow
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
    const followerX = gsap.quickTo(follower, "x", { duration: 0.4, ease: "power3" });
    const followerY = gsap.quickTo(follower, "y", { duration: 0.4, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      followerX(e.clientX);
      followerY(e.clientY);
    });

    // Hover States (Images & Buttons)
    const interactiveElements = document.querySelectorAll("a, button, .portrait-photo");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        follower.classList.add("is-hovering");
        if (el.classList.contains("portrait-photo")) {
          cursorText.textContent = "View";
        } else {
          cursorText.textContent = "Click";
        }
      });
      el.addEventListener("mouseleave", () => {
        follower.classList.remove("is-hovering");
        cursorText.textContent = "";
      });
    });

    // Magnetic Buttons
    const magneticElements = document.querySelectorAll(".text-link, .nav-link");
    magneticElements.forEach((el) => {
      el.classList.add("magnetic");
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      });
    });
  }

  // 6. Editorial Letter Hover Lift
  const splitTextElements = document.querySelectorAll(".nav-link, .text-link");
  
  splitTextElements.forEach((el) => {
    if (!window.gsap) return;

    const text = el.textContent;
    el.innerHTML = "";
    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char; 
      span.style.display = "inline-block";
      span.style.willChange = "transform";
      el.appendChild(span);
    });

    el.addEventListener("mouseenter", () => {
      gsap.to(el.querySelectorAll("span"), {
        y: -4,
        duration: 0.3,
        stagger: 0.02,
        ease: "back.out(2)",
        overwrite: true
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el.querySelectorAll("span"), {
        y: 0,
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.out",
        overwrite: true
      });
    });
  });

}); // <--- The DOMContentLoaded listener safely closes here