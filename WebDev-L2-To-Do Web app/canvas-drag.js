/**
 * canvas-drag.js — free-form draggable pinboard for TaskPulse
 * Attach AFTER app.js boots. Exposes window.taskpulseDrag
 */
(() => {
  "use strict";

  const POS_KEY = "taskpulse:positions:v1";
  const SNAP_PX = 26;              // magnetic distance
  const ZONE_STAT_LEFT = 220;      // px from left that counts as STAT strip
  const ZONE_TOP = 120;            // px from board top = "now" strip

  /** @type {Record<string, {x:number,y:number}>} */
  let positions = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(POS_KEY) || "{}") || {}; }
    catch { return {}; }
  }
  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(POS_KEY, JSON.stringify(positions)); } catch {}
    }, 220);
  }

  const board = document.getElementById("board");
  if (!board) return;

  // ---- Spatial layer ----
  // Make board a positioned container so notes can live at absolute coords.
  const layer = document.createElement("div");
  layer.className = "drag-layer";
  board.parentElement.insertBefore(layer, board);
  board.classList.add("is-freeform");
  layer.appendChild(board);

  function boardRect() { return board.getBoundingClientRect(); }

  // ---- Public helpers ----
  const api = {
    get(id) { return positions[id]; },
    set(id, x, y) { positions[id] = { x, y }; save(); },
    clear() { positions = {}; save(); applyAll(); },
  };

  // ---- Attach positions when notes appear ----
  const seen = new WeakSet();
  function adopt(note) {
    if (seen.has(note)) return;
    seen.add(note);
    const id = note.dataset.id;
    const p = positions[id];
    if (p) {
      note.classList.add("is-placed");
      note.style.setProperty("--dx", `${p.x}px`);
      note.style.setProperty("--dy", `${p.y}px`);
      note.style.zIndex = String(Math.round(p.y / 8) + 10);
    }
    note.addEventListener("pointerdown", onDown, { passive: false });
  }

  function applyAll() {
    document.querySelectorAll("#board .note").forEach((n) => {
      const p = positions[n.dataset.id];
      if (!p) return;
      n.classList.add("is-placed");
      n.style.setProperty("--dx", `${p.x}px`);
      n.style.setProperty("--dy", `${p.y}px`);
    });
  }

  // ---- Drag machinery ----
  let drag = null;
  let raf = 0;
  let pending = null;

  function onDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (e.target.closest("button, a, input, textarea, [contenteditable]")) return;
    const note = e.currentTarget;
    if (note.closest(".drag-ghost")) return;

    const rect = note.getBoundingClientRect();
    const br = boardRect();
    const p = positions[note.dataset.id] || { x: 0, y: 0 };

    drag = {
      note,
      id: note.dataset.id,
      startX: e.clientX,
      startY: e.clientY,
      baseX: p.x,
      baseY: p.y,
      rect: { w: rect.width, h: rect.height },
      board: { w: br.width, h: br.height },
      moved: false,
      pointerId: e.pointerId,
    };

    note.setPointerCapture(e.pointerId);
    note.classList.add("is-dragging");
    note.style.zIndex = "9999";
    document.body.classList.add("is-note-dragging");

    note.addEventListener("pointermove", onMove, { passive: false });
    note.addEventListener("pointerup", onUp);
    note.addEventListener("pointercancel", onUp);
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    e.preventDefault();

    // Rubber-band at edges (soft clamp past boundary)
    const maxX = drag.board.w - drag.rect.w - 8;
    const maxY = drag.board.h - drag.rect.h - 8;
    const rawX = drag.baseX + dx;
    const rawY = drag.baseY + dy;

    const nx = softClamp(rawX, 0, maxX, 60);
    const ny = softClamp(rawY, 0, maxY, 60);

    // Magnetic snap to zones
    const snap = snapFor(nx, ny, drag.rect);

    pending = { x: snap.x, y: snap.y, zone: snap.zone };
    if (!raf) raf = requestAnimationFrame(flush);
  }

  function flush() {
    raf = 0;
    if (!drag || !pending) return;
    const { note } = drag;
    note.style.setProperty("--dx", `${pending.x}px`);
    note.style.setProperty("--dy", `${pending.y}px`);
    note.style.zIndex = String(Math.round(pending.y / 8) + 10);
    note.dataset.zone = pending.zone || "";
    pending = null;
  }

  function onUp(e) {
    if (!drag) return;
    const { note, id, pointerId } = drag;
    note.releasePointerCapture?.(pointerId);
    note.removeEventListener("pointermove", onMove);
    note.removeEventListener("pointerup", onUp);
    note.removeEventListener("pointercancel", onUp);
    note.classList.remove("is-dragging");
    document.body.classList.remove("is-note-dragging");

    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (pending) flush();

    if (drag.moved) {
      const x = parseFloat(note.style.getPropertyValue("--dx")) || 0;
      const y = parseFloat(note.style.getPropertyValue("--dy")) || 0;
      positions[id] = { x, y };
      save();
      note.classList.add("is-placed");

      // Release any snap → commit via the model so the app stays source-of-truth
      const zone = note.dataset.zone;
      if (zone === "stat" && !note.classList.contains("is-stat")) {
        try { window.taskpulse?.store?.updateTask?.(id, { isStat: true }); } catch {}
        window.taskpulse?.debug?.noteEls; // no-op, force reflow
        document.dispatchEvent(new CustomEvent("taskpulse:change"));
      }
      // Suppress the click that follows a drag (prevents opening the editor)
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); note.removeEventListener("click", swallow, true); };
      note.addEventListener("click", swallow, true);

      // FLIP re-layout for siblings so the board stays coordinated
      relayout(id);
    }
    drag = null;
  }

  // ---- Coordinated reflow: others get pushed out of the drag target ----
  function relayout(draggedId) {
    const notes = [...board.querySelectorAll(".note")];
    const d = notes.find((n) => n.dataset.id === draggedId);
    if (!d) return;
    const dr = d.getBoundingClientRect();

    for (const n of notes) {
      if (n === d) continue;
      const r = n.getBoundingClientRect();
      const overlap =
        Math.min(dr.right, r.right) - Math.max(dr.left, r.left) > 0 &&
        Math.min(dr.bottom, r.bottom) - Math.max(dr.top, r.top) > 0;
      if (!overlap) continue;

      // Only nudge notes that don't already have a deliberate position
      if (positions[n.dataset.id]) continue;
      const push = Math.min(dr.bottom - r.top, 40) + 8;
      n.animate(
        [{ translate: `0 ${-push}px` }, { translate: "0 0" }],
        { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
  }

  // ---- Snap zones ----
  function snapFor(x, y, rect) {
    const br = boardRect();
    const localX = x - (rect.left ?? 0) + (br.left ?? 0);
    const zone = { x, y, zone: "" };
    if (x < ZONE_STAT_LEFT && y < 400) {
      zone.x = 12;
      zone.zone = "stat";
    } else if (y < ZONE_TOP) {
      zone.y = 8;
      zone.zone = "top";
    }
    // Magnetic pull toward grid rows (every 24px)
    if (Math.abs(zone.y % 24) < SNAP_PX / 2) zone.y = Math.round(zone.y / 24) * 24;
    return zone;
  }

  function softClamp(v, lo, hi, soft) {
    if (v < lo) return lo - Math.min(soft, (lo - v) * 0.3);
    if (v > hi) return hi + Math.min(soft, (v - hi) * 0.3);
    return v;
  }

  // ---- Adopt on every render (MutationObserver so you don't touch app.js) ----
  const mo = new MutationObserver(() => {
    board.querySelectorAll(".note").forEach(adopt);
  });
  mo.observe(board, { childList: true, subtree: true });
  board.querySelectorAll(".note").forEach(adopt);

  // Reset positions when tasks are deleted so the map doesn't grow forever
  window.addEventListener("storage", (e) => {
    if (e.key === POS_KEY) positions = load();
  });

  // Re-place on resize (keep relative-ish)
  let resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(applyAll, 150);
  });

  window.taskpulseDrag = api;
})();