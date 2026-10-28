/* Rolling timeline prism: buttons, year chips and arrow keys. No autoplay. */
(function () {
  var widget = document.querySelector(".cube");
  if (!widget) return;

  var stage = widget.querySelector(".cube-stage");
  var box = widget.querySelector(".cube-box");
  var faces = Array.prototype.slice.call(box.children);
  var status = widget.querySelector(".cube-status");
  var n = faces.length;

  // Stay a plain list if the user prefers reduced motion or 3D is unsupported
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var has3d = window.CSS && CSS.supports("transform-style", "preserve-3d");
  if (reduce || !has3d || n < 3) return;

  var step = 360 / n;
  var turn = 0; // keeps counting up or down, so the box rolls on past the last face

  // One chip per face, built from each face's <time> text
  var chipList = document.createElement("ul");
  chipList.className = "cube-chips";
  var chips = faces.map(function (face, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cube-chip";
    b.textContent = face.querySelector("time").textContent;
    b.addEventListener("click", function () { goTo(i); });
    li.appendChild(b);
    chipList.appendChild(li);
    face.style.setProperty("--i", i);
    return b;
  });
  widget.querySelector(".cube-controls").appendChild(chipList);

  function current() { return ((turn % n) + n) % n; }

  function size() {
    // Distance from the box's centre to each face, from the face height
    var r = stage.clientHeight / 2 / Math.tan(Math.PI / n);
    widget.style.setProperty("--r", r + "px");
    render();
  }

  function render() {
    var cur = current();
    var r = getComputedStyle(widget).getPropertyValue("--r");
    box.style.transform = "translateZ(calc(" + r + " * -1)) rotateX(" + turn * step + "deg)";
    faces.forEach(function (face, i) {
      var off = (i - cur + n) % n;
      if (off > n / 2) off -= n;
      face.dataset.off = off;
      if (off === 0) face.setAttribute("aria-current", "true");
      else face.removeAttribute("aria-current");
      chips[i].setAttribute("aria-current", off === 0 ? "true" : "false");
    });
    status.textContent = "Showing " + chips[cur].textContent + ", milestone " + (cur + 1) + " of " + n + ".";
  }

  function goTo(i) {
    var d = (i - current() + n) % n;
    if (d > n / 2) d -= n; // take the shorter way round
    turn += d;
    render();
  }

  widget.querySelector('[data-cube="next"]').addEventListener("click", function () { turn += 1; render(); });
  widget.querySelector('[data-cube="prev"]').addEventListener("click", function () { turn -= 1; render(); });

  widget.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { turn += 1; render(); e.preventDefault(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { turn -= 1; render(); e.preventDefault(); }
  });

  window.addEventListener("resize", size);
  widget.classList.add("is-3d");
  widget.style.setProperty("--step", step + "deg");
  size();
})();