/**
 * TaskPulse - upgrade.js
 * Loads AFTER app.js. Adds, without touching your existing code:
 *  1. Filters dropdown (declutters the board)
 *  2. Everyday / Healthcare mode (wording + features switch)
 *  3. Click a note -> read-only preview first; Edit opens the editor
 *  4. Auto-refresh of "Late" badges
 */
(() => {
  "use strict";

  const isGeneral = () => settings.mode !== "clinical";
  const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };
  const boardEl = $("board");

  /* ---------------- 1. Filters dropdown ---------------- */
  const toolbar = document.querySelector(".toolbar");
  toolbar.id = "filter-panel";
  toolbar.hidden = true;

  const bar = el("div", "filter-bar");
  const filterBtn = el("button", "btn btn-glass btn-sm filter-toggle");
  filterBtn.type = "button";
  filterBtn.setAttribute("aria-expanded", "false");
  filterBtn.setAttribute("aria-controls", "filter-panel");
  filterBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>' +
    '<span>Filters</span><span class="filter-count" hidden></span>' +
    '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const clearBtn = el("button", "link-btn", "Clear filters");
  clearBtn.type = "button";
  clearBtn.hidden = true;
  bar.append(filterBtn, clearBtn);
  toolbar.before(bar);

  const setPanel = (open) => {
    toolbar.hidden = !open;
    filterBtn.setAttribute("aria-expanded", String(open));
    if (open) $("search-input").focus({ preventScroll: true });
  };
  filterBtn.addEventListener("click", () => setPanel(toolbar.hidden));
  clearBtn.addEventListener("click", () => { resetFilters(); renderAll(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !toolbar.hidden && !document.querySelector("dialog[open]")) {
      setPanel(false);
      filterBtn.focus();
    }
  });

  function updateFilterBadge() {
    const n = (state.category !== "all") + (state.status !== "all") + (state.query.trim() ? 1 : 0);
    const badge = filterBtn.querySelector(".filter-count");
    badge.textContent = String(n);
    badge.hidden = n === 0;
    clearBtn.hidden = n === 0;
  }

  /* ---------------- 2. Everyday / Healthcare mode ---------------- */
  const HINT_CLINICAL = "Add details inline:  !  STAT   ·   #clinical   ·   @14:00-15:00   ·   >Sam   ·   [Bed 4]   ·   tomorrow  +2d  ~fri";
  const HINT_GENERAL = "Add details inline:  !  Urgent   ·   #work   ·   @14:00-15:00   ·   >Sam   ·   [Client]   ·   tomorrow  +2d  ~fri";

  function decorate() {
    const g = isGeneral();
    const u = g ? "Urgent" : "STAT";
    document.body.dataset.mode = g ? "general" : "clinical";

    $$(".badge.stat, .qchip.stat, .fchip.stat > span:first-child").forEach((n) => setText(n, u));
    $$(".now-cell .tag").forEach((n) => { if (/^(STAT|Urgent)$/.test(n.textContent)) setText(n, u); });
    setText(document.querySelector(".dash-card.is-stat .dash-label"), g ? "Urgent open" : "STAT open");
    $("nav-stat-count").title = g ? "Urgent tasks still open" : "STAT tasks still open";

    const reportLink = document.querySelector('[data-view-link="report"]');
    setText(reportLink.querySelector(".nav-label"), g ? "Summary" : "Handover");
    reportLink.setAttribute("aria-label", g ? "Daily summary" : "Handover report");
    setText($("report-title"), g ? "Daily summary" : "Shift handover");
    setText(document.querySelector(".report-who .field-label"), g ? "Prepared by" : "Handed over by");
    $$(".shortcuts dd").forEach((d) => { if (/^Board/.test(d.textContent)) setText(d, g ? "Board · Summary" : "Board · Handover report"); });

    $$('[name="isStat"]').forEach((i) => setText(i.nextElementSibling, g ? "Mark as urgent" : "Mark as STAT (urgent)"));
    $$('[name="contextTag"]').forEach((i) => {
      setText(i.previousElementSibling, g ? "Project / client" : "Context");
      i.placeholder = g ? "Client or project" : "Ward B / Bed 4";
    });
    $$('[name="title"]').forEach((i) => { i.placeholder = g ? "Send the client update" : "Check Bed 4 vitals"; });
    $("quick-input").placeholder = g
      ? "Pin something…  Send invoice @14:00 !urgent #work"
      : "Pin something…  Check Bed 4 vitals @14:00 !stat #clinical";
    const hint = document.querySelector(".quick-chips .hint");
    if (hint) setText(hint, g ? HINT_GENERAL : HINT_CLINICAL);

    $$(".is-preview .note-title").forEach((n) => { if (/^(Check Bed 4 vitals|Send the client update)$/.test(n.textContent)) setText(n, g ? "Send the client update" : "Check Bed 4 vitals"); });
    $$(".is-preview .note-context").forEach((n) => { if (/^(Ward B \/ Bed 4|Client or project)$/.test(n.textContent)) setText(n, g ? "Client or project" : "Ward B / Bed 4"); });

    $$('select[name="category"] option[value="Clinical"]').forEach((o) => { o.hidden = g; });
    $$('.fchip[data-key="Clinical"]').forEach((c) => { c.hidden = g; });
    $$("#legend li").forEach((li) => { li.hidden = g && li.textContent.trim() === "Clinical"; });

    $$("#mode-seg button").forEach((b) => {
      const on = b.dataset.mode === (g ? "general" : "clinical");
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-checked", String(on));
    });
    setText($("mode-note"), g
      ? "Urgent flag, projects & clients, and a daily summary. Clinical tools are hidden."
      : "Adds STAT priority, ward/bed context, the Clinical category and the shift handover report.");
    updateFilterBadge();
  }

  function setMode(mode) {
    settings.mode = mode === "clinical" ? "clinical" : "general";
    saveSettings();
    if (isGeneral() && state.category === "Clinical") state.category = "all";
    renderAll();
  }

  // Wrap renderers so wording is always right after any redraw.
  const baseRenderAll = window.renderAll;
  const baseRenderBoard = window.renderBoard;
  window.renderBoard = function () { baseRenderBoard(); decorate(); };
  window.renderAll = function () { baseRenderAll(); decorate(); };

  // Plain-text report: Everyday wording, no shift line.
  const baseReport = store.generateHandoverReport.bind(store);
  store.generateHandoverReport = (opts = {}) => {
    if (!isGeneral()) return baseReport(opts);
    return baseReport({ ...opts, shift: "" })
      .replace("TASKPULSE - SHIFT HANDOVER", "TASKPULSE - DAILY SUMMARY")
      .replace("STAT - NEEDS ACTION FIRST", "URGENT - DO FIRST")
      .replace(/\[STAT\]/g, "[URGENT]")
      .replace(/\((\d+) STAT\)/, "($1 urgent)");
  };

  ["quick-input", "task-form"].forEach((id) => {
    const node = $(id);
    node.addEventListener("input", decorate);
    node.addEventListener("change", decorate);
  });

  // Settings: mode switch
  const modeSection = document.createElement("section");
  modeSection.className = "settings-section";
  modeSection.innerHTML =
    '<h3>Mode</h3>' +
    '<div class="seg" id="mode-seg" role="radiogroup" aria-label="App mode">' +
    '<button type="button" role="radio" data-mode="general">Everyday</button>' +
    '<button type="button" role="radio" data-mode="clinical">Healthcare</button></div>' +
    '<p class="meta-line" id="mode-note"></p>';
  $("settings-dialog").querySelector(".settings-form").prepend(modeSection);
  $("mode-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-mode]");
    if (b) setMode(b.dataset.mode);
  });

  // First-run chooser
  function showModeChooser() {
    const dlg = document.createElement("dialog");
    dlg.className = "dialog";
    dlg.setAttribute("aria-labelledby", "mode-dialog-title");
    dlg.innerHTML =
      '<div class="dialog-head"><h2 id="mode-dialog-title">How will you use TaskPulse?</h2></div>' +
      '<div class="dialog-body"><p class="meta-line">Pick the closest fit. You can change it any time in Settings.</p>' +
      '<div class="mode-cards">' +
      '<button type="button" class="mode-card" data-pick="general"><b>Everyday</b><small>Freelancers, students and anyone planning their day. Urgent flag, projects &amp; clients, daily summary.</small></button>' +
      '<button type="button" class="mode-card" data-pick="clinical"><b>Healthcare</b><small>Nurses and clinicians. STAT priority, ward/bed context, Clinical category and shift handover.</small></button>' +
      '</div></div>';
    document.body.append(dlg);
    dlg.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pick]");
      if (!b) return;
      setMode(b.dataset.pick);
      dlg.close();
    });
    dlg.addEventListener("close", () => { if (!settings.mode) setMode("general"); dlg.remove(); });
    dlg.showModal();
  }

  /* ---------------- 3. Preview before edit ---------------- */
  const pv = document.createElement("dialog");
  pv.className = "dialog";
  pv.setAttribute("aria-labelledby", "pv-title");
  pv.innerHTML =
    '<div class="dialog-head"><h2>Note details</h2><button type="button" class="icon-btn" id="pv-close" aria-label="Close">' + ICONS.x + '</button></div>' +
    '<div class="dialog-body" id="pv-body"></div>' +
    '<div class="dialog-foot"><button type="button" class="btn btn-danger btn-sm" id="pv-delete">Remove</button><span class="spacer"></span>' +
    '<button type="button" class="btn btn-glass btn-sm" id="pv-toggle"></button><button type="button" class="btn btn-primary btn-sm" id="pv-edit">Edit</button></div>';
  document.body.append(pv);
  let previewId = null;

  function row(dl, label, value) {
    dl.append(el("dt", "", label), el("dd", "", value));
  }

  function drawPreview() {
    const t = store.getTask(previewId);
    if (!t) { pv.close(); return; }
    const done = t.status === STATUS.COMPLETED;
    const body = $("pv-body");

    const badges = el("div", "pv-badges");
    if (t.isStat) badges.append(el("span", "badge stat", isGeneral() ? "Urgent" : "STAT"));
    if (store.isOverdue(t)) badges.append(el("span", "badge late", "Late"));
    badges.append(el("span", "note-chip", done ? "Done" : "Open"));

    const title = el("h3", `pv-title${done ? " done" : ""}`, t.title);
    title.id = "pv-title";

    const dl = el("dl", "pv-grid");
    row(dl, "Day", dayLabel(t.date, { long: true }));
    row(dl, "Time", t.timeBlock ? t.timeBlock.replace("-", " – ") : "Anytime");
    if (t.contextTag) row(dl, isGeneral() ? "Project / client" : "Context", t.contextTag);
    row(dl, "Category", t.category);
    row(dl, "Assigned to", t.assignee);

    const parts = [badges, title, dl];

    if (t.checklist.length) {
      const finished = t.checklist.filter((i) => i.done).length;
      parts.push(el("p", "pv-label", `Checklist · ${finished}/${t.checklist.length}`));
      const ul = el("ul", "cl-list");
      for (const item of t.checklist) {
        const li = el("li", `cl-item${item.done ? " done" : ""}`);
        const box = el("input");
        box.type = "checkbox";
        box.checked = item.done;
        box.setAttribute("aria-label", `Done: ${item.text}`);
        box.addEventListener("change", () => {
          const live = store.getTask(previewId);
          if (!live) return;
          store.updateTask(previewId, { checklist: live.checklist.map((i) => (i.id === item.id ? { ...i, done: box.checked } : i)) });
          renderAll();
          drawPreview();
        });
        li.append(box, el("span", "", item.text));
        ul.append(li);
      }
      parts.push(ul);
    }

    if (t.notes) parts.push(el("p", "pv-label", "Notes"), el("p", "pv-notes", t.notes));

    const bits = [`Created ${new Date(t.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`];
    if (t.carryCount) bits.push(`carried over ${t.carryCount}×`);
    if (t.completedAt) bits.push(`done ${new Date(t.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    parts.push(el("p", "meta-line", bits.join(" · ")));

    body.replaceChildren(...parts);
    $("pv-toggle").textContent = done ? "Reopen" : "Mark done";
  }

  function openPreview(id) {
    if (!store.getTask(id)) return;
    previewId = id;
    drawPreview();
    if (!pv.open) pv.showModal();
  }

  $("pv-close").addEventListener("click", () => pv.close());
  pv.addEventListener("click", (e) => { if (e.target === pv) pv.close(); });
  $("pv-edit").addEventListener("click", () => { const id = previewId; pv.close(); openEditor(id); });
  $("pv-delete").addEventListener("click", () => { const id = previewId; pv.close(); requestDelete(id); });
  $("pv-toggle").addEventListener("click", () => { toggleTask(previewId); drawPreview(); });

  // Capture phase: runs before your board handlers, so a click on the note body
  // shows the preview. The edit / done / delete icon buttons still work as before.
  boardEl.addEventListener("click", (e) => {
    const note = e.target.closest(".note");
    if (!note || e.target.closest("[data-action]")) return;
    e.stopImmediatePropagation();
    const id = note.dataset.id;
    if (busy.has(id) || deleting.has(id)) return;
    openPreview(id);
  }, true);

  boardEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList?.contains("note")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openPreview(e.target.dataset.id);
    }
  }, true);

  /* ---------------- 4. Keep "Late" badges fresh ---------------- */
  setInterval(() => {
    if (document.hidden || busy.size || document.querySelector("dialog[open]")) return;
    renderBoard();
    renderNavBadge();
  }, 60000);

  /* ---------------- Start ---------------- */
  renderAll();
  if (!settings.mode) showModeChooser();
})();