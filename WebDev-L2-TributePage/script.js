const navigationLinks = document.querySelectorAll(".site-nav a");
const pageSections = document.querySelectorAll("main section[id]");

function updateActiveLink() {
  let currentSectionId = "";

  pageSections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 160) {
      currentSectionId = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${currentSectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", updateActiveLink, {
  passive: true
});

updateActiveLink();

// 3D portrait interaction
const portraitStage = document.querySelector("#portraitStage");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (portraitStage && finePointer.matches && !reducedMotion.matches) {
  let frame = null;

  portraitStage.addEventListener("pointermove", (event) => {
    const bounds = portraitStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      portraitStage.classList.add("is-active");
      portraitStage.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
      portraitStage.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    });
  });

  portraitStage.addEventListener("pointerleave", () => {
    if (frame) cancelAnimationFrame(frame);
    portraitStage.classList.remove("is-active");
    portraitStage.style.setProperty("--rx", "0deg");
    portraitStage.style.setProperty("--ry", "0deg");
  });
}