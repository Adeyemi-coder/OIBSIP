/**
 * TaskPulse — app.js
 */
"use strict";

const store = new TaskStore();

const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const slug = (v) => String(v || "").trim().toLowerCase();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}
const tiltFor = (id) => `${((hashOf(id) % 31) / 10 - 1.5).toFixed(1)}deg`;

function initials(name) {
  return String(name || "Me").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function avatarFor(name) {
  const label = name || "Me";
  const node = el("span", "avatar", initials(label));
  node.style.setProperty("--hue", String(hashOf(label) % 360));
  node.title = label;
  node.setAttribute("aria-label", `Assigned to ${label}`);
  return node;
}

function dayLabel(key, { long = false } = {}) {
  const today = toDateKey();
  const d = parseDateKey(key) ?? new Date();
  const base = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  if (key === today) return long ? `Today · ${base}` : "Today";
  if (key === addDays(today, 1)) return long ? `Tomorrow · ${base}` : "Tomorrow";
  if (key === addDays(today, -1)) return long ? `Yesterday · ${base}` : "Yesterday";
  return base;
}

const SVG = (paths, w = 2.4) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
  check: SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.8),
  reopen: SVG('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  edit: SVG('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  trash: SVG('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>'),
  x: SVG('<path d="M6 6l12 12M18 6L6 18"/>', 2.6),
};

const THEMES = [
  { id: "canvas", label: "Canvas", bg: "#0f172a", dot: "#60a5fa" },
  { id: "blueprint", label: "Blueprint", bg: "#0b2a4a", dot: "#7dd3fc" },
  { id: "midnight", label: "Midnight", bg: "#18181b", dot: "#a78bfa" },
  { id: "pastel", label: "Pastel paper", bg: "#fdf2f8", dot: "#be185d" },
  { id: "sand", label: "Warm sand", bg: "#fefce8", dot: "#b45309" },
  { id: "cork", label: "Cork board", bg: "#b98a58", dot: "#8b3a1a" },
];
const SETTINGS_KEY = "taskpulse:settings:v1";
const DEFAULT_SETTINGS = { theme: "canvas", motion: "auto", skin: "tone2", reminders: false, name: "", shift: "" };

function loadSettings() {
  let saved = {};
  let legacyTheme = null;
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {}; } catch { /* use defaults */ }
  try { legacyTheme = localStorage.getItem("taskpulse-theme"); } catch { /* ignore */ }
  const s = { ...DEFAULT_SETTINGS, ...(legacyTheme && !saved.theme ? { theme: legacyTheme } : {}), ...saved };
  if (!THEMES.some((t) => t.id === s.theme)) s.theme = DEFAULT_SETTINGS.theme;
  if (!["auto", "full", "off"].includes(s.motion)) s.motion = "auto";
  s.reminders = Boolean(s.reminders);
  s.name = String(s.name || "").slice(0, 40);
  s.shift = String(s.shift || "");
  return s;
}
const settings = loadSettings();
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* storage blocked */ }
}

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
function motionOn() {
  return settings.motion === "full" || (settings.motion === "auto" && !reduceMotionQuery.matches);
}
function applyTheme() { document.body.dataset.theme = settings.theme; }
function applyMotion() { document.body.dataset.motion = settings.motion; }

function toast(message, { actionLabel, onAction, timeout = 6000, tone } = {}) {
  const region = $("toast-region");
  const node = el("div", `toast${tone ? ` ${tone}` : ""}`);
  node.append(el("span", "", message));
  const dismiss = () => {
    clearTimeout(timer);
    node.classList.add("leaving");
    setTimeout(() => node.remove(), 260);
  };
  if (actionLabel) {
    const button = el("button", "", actionLabel);
    button.type = "button";
    button.addEventListener("click", () => { onAction?.(); dismiss(); });
    node.append(button);
  }
  const timer = setTimeout(dismiss, timeout);
  region.append(node);
  while (region.children.length > 3) region.firstElementChild.remove();
  return dismiss;
}

function createChecklistEditor(root) {
  let items = [];
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn());

  const list = el("ul", "cl-list");
  const input = el("input");
  input.type = "text";
  input.maxLength = LIMITS.checkItem;
  input.placeholder = "Add a step…";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "New checklist step");
  const addButton = el("button", "btn btn-glass btn-sm", "Add");
  addButton.type = "button";
  const row = el("div", "cl-add");
  row.append(input, addButton);
  root.replaceChildren(list, row);

  function draw() {
    list.replaceChildren(...items.map((item) => {
      const li = el("li", `cl-item${item.done ? " done" : ""}`);
      const box = el("input");
      box.type = "checkbox";
      box.checked = item.done;
      box.setAttribute("aria-label", `Done: ${item.text}`);
      box.addEventListener("change", () => { item.done = box.checked; li.classList.toggle("done", item.done); notify(); });
      const remove = el("button", "icon-btn");
      remove.type = "button";
      remove.innerHTML = ICONS.x;
      remove.setAttribute("aria-label", `Remove step: ${item.text}`);
      remove.addEventListener("click", () => { items = items.filter((i) => i !== item); draw(); notify(); });
      li.append(box, el("span", "", item.text), remove);
      return li;
    }));
  }

  function add({ refocus = true } = {}) {
    const text = input.value.trim();
    if (!text || items.length >= LIMITS.checkItems) return;
    items.push({ id: uid(), text: text.slice(0, LIMITS.checkItem), done: false });
    input.value = "";
    draw();
    notify();
    if (refocus) input.focus();
  }

  addButton.addEventListener("click", () => add());
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });

  return {
    get: () => items.map((i) => ({ ...i })),
    set: (arr) => { items = (arr || []).map((i) => ({ ...i })); input.value = ""; draw(); },
    flush: () => add({ refocus: false }),
    onChange: (fn) => listeners.push(fn),
  };
}

function fieldsHTML() {
  const cats = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  return `
    <label class="field"><span class="field-label">Title</span>
      <input type="text" name="title" maxlength="${LIMITS.title}" placeholder="Check Bed 4 vitals" autocomplete="off"></label>
    <div class="grid-2-col">
      <label class="field"><span class="field-label">Context</span>
        <input type="text" name="contextTag" maxlength="${LIMITS.context}" placeholder="Ward B / Bed 4" autocomplete="off"></label>
      <label class="field"><span class="field-label">Assignee</span>
        <input type="text" name="assignee" maxlength="${LIMITS.assignee}" placeholder="Me" autocomplete="off"></label>
    </div>
    <div class="grid-2-col">
      <label class="field"><span class="field-label">Category</span><select name="category">${cats}</select></label>
      <label class="field"><span class="field-label">Day</span><input type="date" name="date"></label>
    </div>
    <div class="field" role="group" aria-label="Time block">
      <span class="field-label">Time block (optional)</span>
      <div class="time-inputs">
        <label><span class="visually-hidden">Start</span><input type="time" name="start"></label>
        <span class="time-sep">–</span>
        <label><span class="visually-hidden">End</span><input type="time" name="end"></label>
      </div>
    </div>
    <label class="check"><input type="checkbox" name="isStat"><span>Mark as STAT (urgent)</span></label>
    <label class="field"><span class="field-label">Notes</span>
      <textarea name="notes" maxlength="${LIMITS.notes}" placeholder="Anything the next person should know"></textarea></label>
    <div class="field" role="group" aria-label="Checklist"><span class="field-label">Checklist</span><div data-checklist></div></div>`;
}

function createTaskFields(container) {
  container.innerHTML = fieldsHTML();
  const f = (name) => container.querySelector(`[name="${name}"]`);
  const editor = createChecklistEditor(container.querySelector("[data-checklist]"));

  return {
    editor,
    field: f,
    reset(day = state.viewDate) {
      f("title").value = "";
      f("contextTag").value = "";
      f("assignee").value = "";
      f("category").value = "General";
      f("date").value = day;
      f("start").value = "";
      f("end").value = "";
      f("isStat").checked = false;
      f("notes").value = "";
      editor.set([]);
    },
    write(task) {
      f("title").value = task.title;
      f("contextTag").value = task.contextTag;
      f("assignee").value = task.assignee === "Me" ? "" : task.assignee;
      f("category").value = task.category;
      f("date").value = task.date;
      const block = parseBlock(task.timeBlock);
      f("start").value = block?.start ?? "";
      f("end").value = block?.end ?? "";
      f("isStat").checked = task.isStat;
      f("notes").value = task.notes;
      editor.set(task.checklist);
    },
    read() {
      editor.flush();
      const start = f("start").value;
      const end = f("end").value;
      return {
        title: f("title").value,
        contextTag: f("contextTag").value,
        assignee: f("assignee").value,
        category: f("category").value,
        date: f("date").value,
        timeBlock: start && end ? `${start}-${end}` : "",
        isStat: f("isStat").checked,
        notes: f("notes").value,
        checklist: editor.get(),
        _start: start,
        _end: end,
      };
    },
  };
}

function checkFormValues(v) {
  if (!v.title.trim()) return "A task needs a title.";
  if (!v.date) return "Pick a day for this task.";
  if ((v._start && !v._end) || (!v._start && v._end)) return "Add both a start and an end time.";
  if (v._start && v._end && v._end <= v._start) return "The end time must be after the start time.";
  return "";
}

const state = { view: "board", viewDate: toDateKey(), category: "all", status: "all", query: "" };
const noteEls = new Map();      
const busy = new Set();         
const pendingPin = new Set();   
let lastDeleted = null;
let lastToday = toDateKey();

const board = $("board");
const handLayer = $("hand-layer");

function passesFilters(t) {
  if (state.status === "open" && t.status !== STATUS.PENDING) return false;
  if (state.status === "done" && t.status !== STATUS.COMPLETED) return false;
  if (state.category === "stat" && !t.isStat) return false;
  if (state.category !== "all" && state.category !== "stat" && t.category !== state.category) return false;
  const q = state.query.trim().toLowerCase();
  if (q) {
    const hay = [t.title, t.contextTag, t.assignee, t.notes, t.category, ...t.checklist.map((i) => i.text)];
    if (!hay.some((s) => s.toLowerCase().includes(q))) return false;
  }
  return true;
}

function sortTasks(list) {
  return list.sort((a, b) => {
    const doneA = a.status === STATUS.COMPLETED;
    const doneB = b.status === STATUS.COMPLETED;
    if (doneA !== doneB) return doneA ? 1 : -1;
    if (a.isStat !== b.isStat) return a.isStat ? -1 : 1;
    return startKey(a).localeCompare(startKey(b)) || a.createdAt.localeCompare(b.createdAt);
  });
}

function actionButton(action, label, iconSvg) {
  const b = el("button", "icon-btn");
  b.type = "button";
  b.dataset.action = action;
  b.innerHTML = iconSvg;
  b.title = label;
  b.setAttribute("aria-label", label);
  return b;
}

function fillNote(note, task, { overdue = false, preview = false } = {}) {
  const done = task.status === STATUS.COMPLETED;
  note.dataset.id = task.id;
  note.dataset.category = slug(task.category);
  note.dataset.overdue = String(overdue);
  note.style.setProperty("--tilt", preview ? "-1.5deg" : tiltFor(task.id));
  note.classList.toggle("is-stat", task.isStat);
  note.classList.toggle("is-done", done);
  if (!preview) {
    note.tabIndex = 0;
    const when = task.timeBlock ? `, ${task.timeBlock.replace("-", " to ")}` : "";
    note.setAttribute("aria-label", `${task.isStat ? "STAT. " : ""}${task.title}${when}. ${done ? "Done" : "Open"}. Press Enter to edit.`);
  }

  const top = el("div", "note-top");
  top.append(el("span", "note-time", task.timeBlock ? task.timeBlock.replace("-", " – ") : "Anytime"));
  const badges = el("div", "badges");
  if (task.isStat) badges.append(el("span", "badge stat", "STAT"));
  if (overdue) badges.append(el("span", "badge late", "Late"));
  if (task.carryCount) {
    const carry = el("span", "badge carry", `↻ ${task.carryCount}`);
    carry.title = `Carried over ${task.carryCount} time${task.carryCount === 1 ? "" : "s"}`;
    badges.append(carry);
  }
  top.append(badges);

  const children = [el("span", "pin"), top, el("p", "note-title", task.title)];
  if (task.contextTag) children.push(el("p", "note-context", task.contextTag));

  if (task.checklist.length) {
    const finished = task.checklist.filter((i) => i.done).length;
    const bar = el("div", "note-progress");
    const track = el("div", "track");
    const fill = el("div", "fill");
    fill.style.width = `${Math.round((finished / task.checklist.length) * 100)}%`;
    track.append(fill);
    bar.append(track, el("span", "", `${finished}/${task.checklist.length}`));
    bar.setAttribute("aria-label", `${finished} of ${task.checklist.length} steps done`);
    children.push(bar);
  }
  if (task.notes) children.push(el("p", "note-memo", "✎ has notes"));

  const foot = el("div", "note-foot");
  const meta = el("div", "note-meta");
  meta.append(avatarFor(task.assignee), el("span", "note-chip", task.category));
  foot.append(meta);
  if (!preview) {
    const actions = el("div", "note-actions");
    actions.append(
      actionButton("toggle", done ? "Reopen" : "Mark done", done ? ICONS.reopen : ICONS.check),
      actionButton("edit", "Edit note", ICONS.edit),
      actionButton("delete", "Unpin and remove", ICONS.trash),
    );
    foot.append(actions);
  }
  children.push(foot);

  if (done) {
    const stamp = el("span", "stamp", "DONE");
    stamp.setAttribute("aria-hidden", "true");
    children.push(stamp);
  }
  note.replaceChildren(...children);
}

const noteSignature = (task, overdue) => JSON.stringify([
  task.title, task.contextTag, task.category, task.date, task.timeBlock, task.isStat, task.assignee,
  task.notes, task.checklist, task.status, task.carryCount, overdue,
]);

function renderBoard() {
  const now = new Date();
  const boardVisible = board.offsetParent !== null;

  const before = new Map();
  if (boardVisible && motionOn()) {
    for (const [id, rec] of noteEls) if (rec.el.isConnected && !busy.has(id)) before.set(id, rec.el.getBoundingClientRect());
  }

  const dayTasks = store.getTasks().filter((t) => t.date === state.viewDate);
  const tasks = sortTasks(dayTasks.filter(passesFilters));
  const seen = new Set();

  tasks.forEach((task, index) => {
    const overdue = store.isOverdue(task, now);
    let rec = noteEls.get(task.id);
    if (!rec) {
      rec = { el: el("article", "note"), sig: "", fresh: true };
      noteEls.set(task.id, rec);
    }
    const sig = noteSignature(task, overdue);
    if (rec.sig !== sig) { fillNote(rec.el, task, { overdue }); rec.sig = sig; }
    if (rec.fresh) {
      rec.fresh = false;
      if (pendingPin.has(task.id)) {
        pendingPin.delete(task.id);
        rec.el.classList.add("awaiting-pin");
      } else {
        rec.el.style.setProperty("--enter-delay", `${Math.min(index * 0.045, 0.5)}s`);
        rec.el.classList.add("is-entering");
        rec.el.addEventListener("animationend", () => rec.el.classList.remove("is-entering"), { once: true });
      }
    }
    seen.add(task.id);
  });

  for (const [id, rec] of noteEls) {
    if (!seen.has(id) && !busy.has(id)) { rec.el.remove(); noteEls.delete(id); }
  }

  tasks.forEach((task, i) => {
    const node = noteEls.get(task.id).el;
    if (board.children[i] !== node) board.insertBefore(node, board.children[i] ?? null);
  });

  if (before.size) {
    for (const [id, r0] of before) {
      const rec = noteEls.get(id);
      if (!rec || !rec.el.isConnected || busy.has(id)) continue;
      const r1 = rec.el.getBoundingClientRect();
      const dx = r0.left - r1.left;
      const dy = r0.top - r1.top;
      if (Math.abs(dx) + Math.abs(dy) < 2) continue;
      rec.el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    }
  }

  const empty = $("empty-state");
  const filtering = state.category !== "all" || state.status !== "all" || state.query.trim() !== "";
  empty.hidden = tasks.length > 0;
  if (!tasks.length) {
    $("empty-title").textContent = dayTasks.length && filtering ? "No notes match these filters" : "Nothing pinned yet";
    $("empty-sub").textContent = dayTasks.length && filtering
      ? `${dayTasks.length} note${dayTasks.length === 1 ? " is" : "s are"} hidden by your filters.`
      : state.viewDate === toDateKey()
        ? "Type in the bar above and press Enter — a hand will pin your first note."
        : `Nothing is planned for ${dayLabel(state.viewDate, { long: true })}. Type above to add something.`;
    $("empty-clear").hidden = !(dayTasks.length && filtering);
  }
}

const chipDefs = [
  { key: "all", label: "All", test: () => true },
  { key: "stat", label: "STAT", cls: "stat", test: (t) => t.isStat },
  ...CATEGORIES.map((c) => ({ key: c, label: c, test: (t) => t.category === c })),
];
function buildFilterChips() {
  const host = $("filter-chips");
  host.replaceChildren(...chipDefs.map((def) => {
    const b = el("button", `fchip${def.cls ? ` ${def.cls}` : ""}`);
    b.type = "button";
    b.dataset.key = def.key;
    b.append(el("span", "", def.label), el("span", "n", "0"));
    def.node = b;
    return b;
  }));
  host.addEventListener("click", (e) => {
    const b = e.target.closest(".fchip");
    if (!b) return;
    state.category = state.category === b.dataset.key ? "all" : b.dataset.key;
    renderAll();
  });
}
function updateFilterChips() {
  const dayTasks = store.getTasks().filter((t) => t.date === state.viewDate);
  for (const def of chipDefs) {
    def.node.setAttribute("aria-pressed", String(state.category === def.key));
    def.node.lastChild.textContent = String(dayTasks.filter(def.test).length);
  }
  $$("#status-seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.status === state.status)));
}
function resetFilters() {
  state.category = "all"; state.status = "all"; state.query = "";
  $("search-input").value = "";
}

function renderHeader() {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = settings.name.trim().split(/\s+/)[0];
  $("greeting-hello").textContent = first ? `${hello}, ${first}` : hello;

  const isToday = state.viewDate === toDateKey();
  $("board-title").textContent = isToday ? "What are we going to do today?" : dayLabel(state.viewDate, { long: true });
  $("date-text").textContent = dayLabel(state.viewDate, { long: true });
  $("date-input").value = state.viewDate;
  $("date-today").hidden = isToday;
}

function renderNowBar() {
  const bar = $("nowbar");
  if (state.viewDate !== toDateKey()) { bar.hidden = true; return; }
  const { now: current, next } = store.getNowNext(new Date());
  const statOpen = store.getStats(state.viewDate).statOpen;

  const cell = (tag, text, when, isStat) => {
    const c = el("div", `now-cell${isStat ? " stat" : ""}`);
    c.append(el("span", "tag", tag), el("span", "txt", text));
    if (when) c.append(el("span", "when", when));
    return c;
  };
  const cells = [];
  if (current.length) {
    const t = current[0];
    cells.push(cell("Now", t.title + (current.length > 1 ? `  +${current.length - 1} more` : ""), `until ${parseBlock(t.timeBlock).end}`, t.isStat));
  }
  if (next) cells.push(cell("Next", next.title, `at ${parseBlock(next.timeBlock).start}`, next.isStat));
  if (statOpen) cells.push(cell("STAT", `${statOpen} still open`, "", true));
  bar.replaceChildren(...cells);
  bar.hidden = cells.length === 0;
}

function renderCarry() {
  const today = toDateKey();
  const count = state.viewDate === today ? store.getOpenBefore(today).length : 0;
  $("carry-banner").hidden = count === 0;
  $("carry-text").textContent = `${count} unfinished task${count === 1 ? "" : "s"} from earlier days.`;
}

function renderNavBadge() {
  const open = store.getStats(toDateKey()).statOpen;
  const badge = $("nav-stat-count");
  badge.textContent = String(open);
  badge.classList.toggle("show", open > 0);
}

function renderReport() {
  const s = store.getStats(state.viewDate);
  $("stat-pending").textContent = s.pending;
  $("stat-done").textContent = s.done;
  $("stat-stat").textContent = s.statOpen;
  $("stat-carried").textContent = s.carried;
  $("bar-pending").style.width = `${s.total ? (s.pending / s.total) * 100 : 0}%`;
  $("bar-done").style.width = `${s.total ? (s.done / s.total) * 100 : 0}%`;
  $("report-sub").textContent = `Report for ${dayLabel(state.viewDate, { long: true })}. Change the day on the Board.`;
  $("report-preview").textContent = store.generateHandoverReport({ date: state.viewDate, from: settings.name, shift: settings.shift });
}

function renderAll() {
  renderHeader();
  updateFilterChips();
  renderBoard();
  renderNowBar();
  renderCarry();
  renderNavBadge();
  renderReport();
}

function goToDate(key) {
  state.viewDate = key;
  renderAll();
}

/* ============================================================
   THE HAND — Layered SVG (Restored for guaranteed reliability)
   ============================================================ */
const HAND_PINCH = { x: 121, y: 80 };
let handSerial = 0;

function handSVG(n) {
  const edge = 'style="stroke:var(--skin-line)" stroke-width="1.4" stroke-linejoin="round"';
  const skin = `fill="url(#skin-${n})"`;
  return `
<svg viewBox="0 0 260 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skin-${n}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" style="stop-color:var(--skin-hi)"/><stop offset="0.5" style="stop-color:var(--skin-mid)"/><stop offset="1" style="stop-color:var(--skin-lo)"/>
    </linearGradient>
    <linearGradient id="sleeve-${n}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4f7191"/><stop offset="0.5" stop-color="#7b9db9"/><stop offset="1" stop-color="#365570"/>
    </linearGradient>
    <radialGradient id="pin-${n}" cx="0.35" cy="0.28" r="0.8">
      <stop offset="0" stop-color="#fff"/><stop offset="0.42" style="stop-color:var(--pin)"/><stop offset="1" stop-color="#0f172a"/>
    </radialGradient>
    <radialGradient id="shade-${n}" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- wrist + sleeve -->
  <path d="M92 346 L92 296 L168 296 L168 346 Z" ${skin} ${edge}/>
  <path d="M64 420 L76 338 Q130 354 184 338 L196 420 Z" fill="url(#sleeve-${n})"/>
  <path d="M76 338 Q130 354 184 338" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="2"/>
  <path d="M84 372 Q130 386 176 372" fill="none" stroke="#1e3a52" stroke-opacity="0.35" stroke-width="3"/>

  <!-- curled fingers -->
  <rect x="159" y="186" width="25" height="46" rx="12" ${skin} ${edge}/>
  <rect x="136" y="173" width="26" height="54" rx="12.5" ${skin} ${edge}/>
  <rect x="113" y="167" width="26" height="58" rx="13" ${skin} ${edge}/>

  <!-- back of hand -->
  <path d="M92 340 C80 314 66 291 68 262 C70 236 78 214 92 204 L170 206 C183 211 188 228 186 252 C184 288 177 314 168 340 Z" ${skin} ${edge}/>
  <ellipse cx="124" cy="252" rx="38" ry="54" fill="url(#shade-${n})"/>
  <path d="M104 224 Q100 262 106 304 M126 222 Q124 264 128 306 M148 224 Q151 264 146 306 M168 230 Q168 264 160 302" fill="none" style="stroke:var(--skin-line)" stroke-opacity="0.22" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M116 210 Q126 205 137 210 M140 210 Q150 205 160 211" fill="none" style="stroke:var(--skin-line)" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round"/>

  <!-- thumb base -->
  <ellipse cx="82" cy="262" rx="26" ry="38" transform="rotate(-8 82 262)" ${skin} ${edge}/>

  <!-- pin -->
  <g class="h-pin">
    <ellipse cx="121" cy="91" rx="14" ry="5" style="fill:var(--pin)" stroke="#0f172a" stroke-opacity="0.45" stroke-width="1"/>
    <circle cx="121" cy="80" r="11.5" fill="url(#pin-${n})" stroke="#0f172a" stroke-opacity="0.35" stroke-width="1"/>
    <ellipse cx="117" cy="75" rx="4.5" ry="3" fill="#fff" fill-opacity="0.75"/>
  </g>

  <!-- thumb -->
  <g class="h-thumb">
    <path d="M60 268 C60 216 82 150 99 98 A11.5 11.5 0 0 1 121 103 C116 160 96 222 89 274 Z" ${skin} ${edge}/>
    <path d="M70 232 Q82 238 94 230 M78 190 Q90 195 101 187" fill="none" style="stroke:var(--skin-line)" stroke-opacity="0.3" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M112 108 Q119 104 121 110 L118 124 Q113 126 110 122 Z" style="fill:var(--skin-nail)" stroke="#000" stroke-opacity="0.12" stroke-width="0.8"/>
  </g>

  <!-- index finger -->
  <g class="h-index">
    <path d="M87 208 C87 160 100 112 111 83 A10.5 10.5 0 0 1 131 87 C128 130 118 180 113 212 Z" ${skin} ${edge}/>
    <path d="M115.5 92 Q121 87 126.5 92 L125.5 107 Q121 110 116.5 107 Z" style="fill:var(--skin-nail)" stroke="#000" stroke-opacity="0.14" stroke-width="0.8"/>
    <path d="M118 94 Q121 92 124 94" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M96 150 Q106 154 117 150 M101 122 Q110 126 119 122" fill="none" style="stroke:var(--skin-line)" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</svg>`;
}

const handScale = () => Math.max(0.6, Math.min(0.92, window.innerWidth / 1300));
const handT = (x, y, r = 0, s = 1) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;

function createHand({ pinColor, holding = false, open = false }) {
  const scale = handScale();
  const root = el("div", "hand");
  
  // Restored: Layered SVG injection
  root.dataset.skin = settings.skin || "tone2";
  root.style.setProperty("--pin", pinColor || "#3b82f6");
  root.style.width = `${260 * scale}px`;
  root.style.height = `${420 * scale}px`;
  root.style.transformOrigin = `${HAND_PINCH.x * scale}px ${HAND_PINCH.y * scale}px`;
  root.innerHTML = handSVG(++handSerial);
  
  root.classList.toggle("is-holding", holding);
  root.classList.toggle("is-open", open);

  let awayX = 0;
  let awayY = 0;
  const rest = handT(0, 0, -3);
  const away = () => handT(awayX, awayY, 16);

  const run = (keyframes, options) => root.animate(keyframes, { fill: "forwards", ...options }).finished.catch(() => {});

  const api = {
    root,
    place(x, y) {
      // Lock body scroll to prevent coordinate drift
      document.body.classList.add("is-hand-busy");
      
      root.style.left = `${x - HAND_PINCH.x * scale}px`;
      root.style.top = `${y - HAND_PINCH.y * scale}px`;
      awayX = 150 * scale;
      awayY = window.innerHeight - y + 110 * scale;
      root.style.transform = away();
      handLayer.append(root);
    },
    setOpen(v) { root.classList.toggle("is-open", v); },
    setHolding(v) { root.classList.toggle("is-holding", v); },
    moveIn() {
      return run([
        { transform: away(), offset: 0 },
        { transform: handT(awayX * 0.28, awayY * 0.2, 7), offset: 0.7 },
        { transform: rest, offset: 1 },
      ], { duration: Math.min(900, 480 + awayY * 0.4), easing: "cubic-bezier(0.25, 0.8, 0.3, 1)" });
    },
    press() {
      return run([{ transform: rest }, { transform: handT(0, 3, -3, 0.985) }, { transform: rest }], { duration: 170, easing: "ease-in-out" });
    },
    moveOut() {
      return run([{ transform: rest }, { transform: away() }], { duration: 540, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)" });
    },
    pullAway() {
      return run([
        { transform: rest, offset: 0 },
        { transform: handT(3, -7, -3, 1.07), offset: 0.2 },
        { transform: away(), offset: 1 },
      ], { duration: 720, easing: "cubic-bezier(0.4, 0, 0.9, 0.5)" });
    },
    remove() { 
      root.remove(); 
      // Unlock body scroll
      document.body.classList.remove("is-hand-busy");
    },
  };
  return api;
}

const pinColorOf = (note) => getComputedStyle(note).getPropertyValue("--pin-bg").trim() || "#3b82f6";
const resetTilt = (note) => { note.style.setProperty("--rx", "0deg"); note.style.setProperty("--ry", "0deg"); };

function pinCenter(note) {
  const pin = note.querySelector(".pin");
  const r = (pin ?? note).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: pin ? r.top + r.height / 2 : r.top };
}

async function settleView(note) {
  const view = note.closest(".view");
  await Promise.allSettled((view?.getAnimations() ?? []).map((a) => a.finished));
  note.scrollIntoView({ block: "nearest", behavior: "instant" });
  await nextFrame();
  await nextFrame();
}

let handQueue = Promise.resolve();
function queueHand(job) {
  handQueue = handQueue.then(job).catch((err) => console.error("TaskPulse: hand animation failed.", err));
  return handQueue;
}

async function pinIn(id) {
  const note = noteEls.get(id)?.el;
  if (!note) return;
  busy.add(id);
  let hand = null;
  try {
    await settleView(note);
    resetTilt(note);
    note.classList.add("awaiting-pin");
    const target = pinCenter(note);
    hand = createHand({ pinColor: pinColorOf(note), holding: true, open: false });
    hand.place(target.x, target.y - 1);

    await hand.moveIn();
    await hand.press();
    hand.setHolding(false);
    note.classList.remove("awaiting-pin");
    note.classList.add("pin-pop");
    const ring = el("span", "ripple");
    note.append(ring);
    setTimeout(() => ring.remove(), 700);
    setTimeout(() => note.classList.remove("pin-pop"), 600);
    await wait(90);
    hand.setOpen(true);
    await wait(200);
    await hand.moveOut();
  } finally {
    hand?.remove();
    note.classList.remove("awaiting-pin");
    busy.delete(id);
  }
}

async function unpinOut(id) {
  const note = noteEls.get(id)?.el;
  if (!note || !store.getTask(id)) return;
  busy.add(id);
  let hand = null;
  try {
    await settleView(note);
    resetTilt(note);
    note.classList.add("is-leaving");
    const target = pinCenter(note);
    hand = createHand({ pinColor: pinColorOf(note), holding: false, open: true });
    hand.place(target.x, target.y - 1);

    await hand.moveIn();
    hand.setOpen(false);               
    await wait(240);
    note.classList.add("pin-out");     
    hand.setHolding(true);             
    const rect = note.getBoundingClientRect();
    const tilt = getComputedStyle(note).getPropertyValue("--tilt").trim() || "0deg";
    note.style.transformOrigin = "50% 10px";
    const fall = note.animate([
      { transform: `rotate(${tilt}) translateY(0)`, opacity: 1, offset: 0 },
      { transform: `rotate(calc(${tilt} + 7deg)) translateY(8px)`, opacity: 1, offset: 0.25 },
      { transform: `rotate(24deg) translateY(${Math.min(window.innerHeight - rect.top + 80, 800)}px)`, opacity: 0, offset: 1 },
    ], { duration: 760, delay: 140, easing: "cubic-bezier(0.45, 0, 0.9, 0.6)", fill: "forwards" }).finished.catch(() => {});
    await Promise.all([hand.pullAway(), fall]);
  } finally {
    hand?.remove();
    busy.delete(id);
  }
  finalizeDelete(id);
}

function presentWithHand(task) {
  if (!passesFilters(task)) resetFilters();
  const animate = motionOn();
  if (animate) pendingPin.add(task.id);
  renderAll();
  if (animate) queueHand(() => pinIn(task.id));
}

function pinNewTask(fields, { jump = false } = {}) {
  let task;
  try { task = store.addTask(fields); } catch (err) { toast(err.message, { tone: "alert" }); return null; }
  if (jump) state.viewDate = task.date;
  if (task.date !== state.viewDate) {
    renderAll();
    toast(`Pinned for ${dayLabel(task.date, { long: true })}`, { actionLabel: "Go there", onAction: () => goToDate(task.date) });
    return task;
  }
  presentWithHand(task);
  return task;
}

function finalizeDelete(id) {
  const removed = store.deleteTask(id);
  if (!removed) { renderAll(); return; }
  lastDeleted = { task: removed, at: Date.now() };
  renderAll();
  toast(`Removed “${truncate(removed.title, 40)}”`, { actionLabel: "Undo", timeout: 8000, onAction: () => undoDelete(removed) });
}

function undoDelete(task) {
  const restored = store.restoreTask(task);
  if (!restored) return;
  lastDeleted = null;
  state.viewDate = restored.date;
  showView("board");
  presentWithHand(restored);
}

const deleting = new Set();
function requestDelete(id) {
  if (deleting.has(id) || !store.getTask(id)) return;
  deleting.add(id);
  const done = () => deleting.delete(id);
  if (motionOn() && noteEls.has(id)) {
    queueHand(() => unpinOut(id)).then(done, done);
  } else {
    finalizeDelete(id);
    done();
  }
}

function toggleTask(id) {
  const task = store.toggleStatus(id);
  if (!task) return;
  const done = task.status === STATUS.COMPLETED;
  renderAll();
  const note = noteEls.get(id)?.el;
  if (!note) return;
  if (motionOn()) {
    if (done) { note.classList.add("just-done"); setTimeout(() => note.classList.remove("just-done"), 700); }
    note.animate([{ scale: 1 }, { scale: 0.93 }, { scale: 1.04 }, { scale: 1 }], { duration: 380, easing: "ease-out" });
  }
  note.querySelector('[data-action="toggle"]')?.focus({ preventScroll: true });
}

function initBoardEvents() {
  board.addEventListener("click", (e) => {
    const note = e.target.closest(".note");
    if (!note) return;
    const id = note.dataset.id;
    if (busy.has(id) || deleting.has(id)) return;
    const btn = e.target.closest("[data-action]");
    if (!btn) { openEditor(id); return; }
    const action = btn.dataset.action;
    if (action === "toggle") toggleTask(id);
    else if (action === "edit") openEditor(id);
    else if (action === "delete") requestDelete(id);
  });

  board.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList?.contains("note")) { e.preventDefault(); openEditor(e.target.dataset.id); }
  });

  let raf = 0;
  board.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !motionOn()) return;
    const note = e.target.closest?.(".note");
    if (!note || busy.has(note.dataset.id) || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = note.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      note.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
      note.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
    });
  });
  board.addEventListener("pointerout", (e) => {
    const note = e.target.closest?.(".note");
    if (note && !note.contains(e.relatedTarget)) resetTilt(note);
  });

  $("empty-clear").addEventListener("click", () => { resetFilters(); renderAll(); });
  $("carry-btn").addEventListener("click", () => {
    const count = store.carryOver(toDateKey());
    renderAll();
    if (count) toast(`Brought ${count} task${count === 1 ? "" : "s"} to today.`);
  });

  $("status-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-status]");
    if (!b) return;
    state.status = b.dataset.status;
    renderAll();
  });
  $("search-input").addEventListener("input", (e) => { state.query = e.target.value; renderAll(); });

  $("date-prev").addEventListener("click", () => goToDate(addDays(state.viewDate, -1)));
  $("date-next").addEventListener("click", () => goToDate(addDays(state.viewDate, 1)));
  $("date-today").addEventListener("click", () => goToDate(toDateKey()));
  $("date-input").addEventListener("change", (e) => { if (parseDateKey(e.target.value)) goToDate(e.target.value); });
}

function initQuickAdd() {
  const input = $("quick-input");
  const chips = $("quick-chips");

  const update = () => {
    const p = TaskStore.parseQuickAdd(input.value);
    $("quick-submit").disabled = !p.title;
    if (!input.value.trim()) {
      chips.replaceChildren(el("span", "hint", "Add details inline:  !  STAT   ·   #clinical   ·   @14:00-15:00   ·   >Sam   ·   [Bed 4]   ·   tomorrow  +2d  ~fri"));
      return;
    }
    const list = [];
    if (p.isStat) list.push(el("span", "qchip stat", "STAT"));
    if (p.category) list.push(el("span", "qchip", p.category));
    if (p.timeBlock) list.push(el("span", "qchip", p.timeBlock.replace("-", " – ")));
    if (p.date) list.push(el("span", "qchip", dayLabel(p.date, { long: true })));
    if (p.assignee) list.push(el("span", "qchip", `→ ${p.assignee}`));
    if (p.contextTag) list.push(el("span", "qchip", p.contextTag));
    chips.replaceChildren(...list);
  };

  input.addEventListener("input", update);
  input.addEventListener("keydown", (e) => { if (e.key === "Escape") { input.value = ""; update(); input.blur(); } });
  $("quick-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = TaskStore.parseQuickAdd(input.value);
    if (!p.title) return;
    const task = pinNewTask({
      title: p.title, contextTag: p.contextTag, assignee: p.assignee, category: p.category || "General",
      date: p.date || state.viewDate, timeBlock: p.timeBlock, isStat: p.isStat,
    });
    if (task) { input.value = ""; update(); }
  });
  update();
}

let newFields;
function initNewForm() {
  newFields = createTaskFields($("new-fields"));
  newFields.reset();
  const form = $("task-form");
  const previewNote = el("article", "note is-preview");
  $("preview-slot").append(previewNote);

  const updatePreview = () => {
    const v = readWithoutFlush();
    fillNote(previewNote, {
      id: "preview", title: v.title.trim() || "Check Bed 4 vitals", contextTag: v.contextTag || "Ward B / Bed 4",
      assignee: v.assignee.trim() || "Me", category: v.category, timeBlock: parseBlock(v.timeBlock) ? v.timeBlock : "",
      isStat: v.isStat, notes: v.notes, checklist: v.checklist, status: STATUS.PENDING, carryCount: 0,
    }, { preview: true });
  };
  const readWithoutFlush = () => {
    const f = newFields.field;
    const start = f("start").value; const end = f("end").value;
    return {
      title: f("title").value, contextTag: f("contextTag").value, assignee: f("assignee").value, category: f("category").value,
      timeBlock: start && end ? `${start}-${end}` : "", isStat: f("isStat").checked, notes: f("notes").value, checklist: newFields.editor.get(),
    };
  };

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  newFields.editor.onChange(updatePreview);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = newFields.read();
    const error = checkFormValues(v);
    const box = $("form-error");
    box.textContent = error;
    box.hidden = !error;
    if (error) return;
    showView("board");
    if (pinNewTask(v, { jump: true })) {
      newFields.reset();
      updatePreview();
    }
  });
  updatePreview();
}

let noteFields;
let editingId = null;
let editorDirty = false;
const noteDialog = $("note-dialog");

function openEditor(id) {
  const task = store.getTask(id);
  if (!task) return;
  editingId = id;
  editorDirty = false;
  noteFields.write(task);
  $("note-error").hidden = true;
  const created = new Date(task.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const bits = [`Created ${created}`];
  if (task.carryCount) bits.push(`carried over ${task.carryCount}×`);
  if (task.completedAt) bits.push(`done ${new Date(task.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  $("note-meta").textContent = bits.join(" · ");
  noteDialog.showModal();
  noteFields.field("title").focus();
}

function initDialogs() {
  noteFields = createTaskFields($("note-fields"));
  const form = $("note-form");
  form.addEventListener("input", () => { editorDirty = true; });
  noteFields.editor.onChange(() => { editorDirty = true; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = noteFields.read();
    const error = checkFormValues(v);
    const box = $("note-error");
    if (error) { box.textContent = error; box.hidden = false; return; }
    try {
      store.updateTask(editingId, v);
    } catch (err) { box.textContent = err.message; box.hidden = false; return; }
    noteDialog.close();
    if (v.date !== state.viewDate) toast(`Moved to ${dayLabel(v.date, { long: true })}`, { actionLabel: "Go there", onAction: () => goToDate(v.date) });
    renderAll();
  });

  $("note-delete").addEventListener("click", () => { const id = editingId; noteDialog.close(); requestDelete(id); });
  noteDialog.addEventListener("click", (e) => { if (e.target === noteDialog && !editorDirty) noteDialog.close(); });

  $$("dialog [data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
  $("settings-dialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
}

function initSettings() {
  const dialog = $("settings-dialog");
  $("settings-btn").addEventListener("click", () => dialog.showModal());

  const themeGrid = $("theme-grid");
  const paintThemes = () => $$(".theme-tile", themeGrid).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.id === settings.theme)));
  for (const t of THEMES) {
    const b = el("button", "theme-tile");
    b.type = "button"; b.dataset.id = t.id; b.setAttribute("role", "radio");
    const sw = el("span", "sw");
    sw.style.setProperty("--sw", t.bg); sw.style.setProperty("--dot", t.dot);
    b.append(sw, el("span", "", t.label));
    b.addEventListener("click", () => { settings.theme = t.id; saveSettings(); applyTheme(); paintThemes(); });
    themeGrid.append(b);
  }
  paintThemes();

  const motionSeg = $("motion-seg");
  const paintMotion = () => $$("button", motionSeg).forEach((b) => {
    const on = b.dataset.motion === settings.motion;
    b.setAttribute("aria-checked", String(on)); b.setAttribute("aria-pressed", String(on));
  });
  motionSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-motion]");
    if (!b) return;
    settings.motion = b.dataset.motion; saveSettings(); applyMotion(); paintMotion();
  });
  paintMotion();

  const nameInput = $("set-name");
  nameInput.value = settings.name;
  nameInput.addEventListener("input", () => { settings.name = nameInput.value; $("report-name").value = settings.name; saveSettings(); renderHeader(); renderReport(); });

  const remind = $("set-reminders");
  remind.checked = settings.reminders;
  remind.addEventListener("change", async () => {
    settings.reminders = remind.checked;
    saveSettings();
    if (remind.checked && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
    if (remind.checked && (!("Notification" in window) || Notification.permission !== "granted")) {
      toast("Browser notifications are off, so reminders will appear inside TaskPulse only.");
    }
  });

  $("export-btn").addEventListener("click", () => {
    download(`taskpulse-backup-${toDateKey()}.json`, JSON.stringify(store.exportData(), null, 2), "application/json");
    toast("Backup downloaded.");
  });
  $("import-input").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = store.importData(JSON.parse(await file.text()));
      renderAll();
      toast(`Imported ${result.added} task${result.added === 1 ? "" : "s"}${result.skipped ? ` (${result.skipped} skipped)` : ""}.`);
    } catch (err) {
      toast(err instanceof SyntaxError ? "That file isn't valid JSON." : err.message, { tone: "alert" });
    }
  });
  const clear = $("clear-btn");
  let armed = 0;
  clear.addEventListener("click", () => {
    if (!armed) {
      clear.textContent = "Click again to confirm";
      armed = setTimeout(() => { armed = 0; clear.textContent = "Delete everything"; }, 4000);
      return;
    }
    clearTimeout(armed); armed = 0;
    clear.textContent = "Delete everything";
    store.clearAll();
    renderAll();
    toast("All tasks deleted. Export a backup first next time!");
  });
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = el("a");
  a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const area = el("textarea");
  area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
  document.body.append(area); area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
}

function initReport() {
  const legend = $("legend");
  legend.replaceChildren(...CATEGORIES.map((c) => {
    const li = el("li");
    const chip = el("span", "chip");
    chip.dataset.category = slug(c);
    li.append(chip, document.createTextNode(c));
    return li;
  }));

  const name = $("report-name");
  const shift = $("report-shift");
  name.value = settings.name;
  shift.value = settings.shift;
  name.addEventListener("input", () => { settings.name = name.value; $("set-name").value = name.value; saveSettings(); renderHeader(); renderReport(); });
  shift.addEventListener("change", () => { settings.shift = shift.value; saveSettings(); renderReport(); });

  const copy = $("copy-report");
  const label = copy.textContent;
  copy.addEventListener("click", async () => {
    try { await copyText(store.generateHandoverReport({ date: state.viewDate, from: settings.name, shift: settings.shift })); copy.textContent = "Copied ✓"; }
    catch { copy.textContent = "Copy failed"; }
    setTimeout(() => { copy.textContent = label; }, 2000);
  });
  $("download-report").addEventListener("click", () =>
    download(`handover-${state.viewDate}.txt`, $("report-preview").textContent, "text/plain"));
  $("print-report").addEventListener("click", () => window.print());
}

const VIEW_NAMES = ["board", "new", "report"];
function currentHashView() {
  const name = location.hash.replace("#", "");
  return VIEW_NAMES.includes(name) ? name : "board";
}
function showView(name, { focus = false } = {}) {
  state.view = name;
  $$("[data-view]").forEach((v) => { v.hidden = v.dataset.view !== name; });
  $$("[data-view-link]").forEach((l) => {
    if (l.dataset.viewLink === name) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
  });
  if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
  if (name === "report") renderReport();
  if (name === "board") renderBoard();
  if (focus) {
    window.scrollTo(0, 0);
    if (name === "new") { newFields.field("date").value ||= state.viewDate; setTimeout(() => newFields.field("title").focus(), 80); }
    else $("main").focus({ preventScroll: true });
  }
}
function initRouter() {
  window.addEventListener("hashchange", () => showView(currentHashView(), { focus: true }));
  if (!location.hash) history.replaceState(null, "", "#board");
  showView(currentHashView());
}

const reminded = new Set();
try { JSON.parse(sessionStorage.getItem("taskpulse:reminded") || "[]").forEach((id) => reminded.add(id)); } catch { /* ignore */ }

function checkReminders() {
  if (!settings.reminders) return;
  const now = new Date();
  const today = toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const t of store.getTasks()) {
    if (t.status !== STATUS.PENDING || t.date !== today || reminded.has(t.id)) continue;
    const block = parseBlock(t.timeBlock);
    if (!block) continue;
    const away = minutesOf(block.start) - nowMin;
    if (away < 0 || away > (t.isStat ? 15 : 10)) continue;
    reminded.add(t.id);
    try { sessionStorage.setItem("taskpulse:reminded", JSON.stringify([...reminded])); } catch { /* ignore */ }
    const text = `${away === 0 ? "Starting now" : `In ${away} min`}: ${t.title}${t.contextTag ? ` (${t.contextTag})` : ""}`;
    toast(text, { tone: t.isStat ? "alert" : undefined, timeout: 12000, actionLabel: "Open", onAction: () => { showView("board"); openEditor(t.id); } });
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(t.isStat ? `STAT — ${t.title}` : t.title, { body: text }); } catch { /* ignore */ }
    }
  }
}

function tick() {
  const today = toDateKey();
  let dayChanged = false;

  if (today !== lastToday) {          
    if (state.viewDate === lastToday) state.viewDate = today;
    lastToday = today;
    dayChanged = true;
  }
  
  if (dayChanged) {
    renderAll();
  } else {
    renderNowBar();
  }
  
  checkReminders();
}

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    const typing = t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) {
      if (lastDeleted && Date.now() - lastDeleted.at < 60000) { e.preventDefault(); undoDelete(lastDeleted.task); }
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
    const go = (name) => { e.preventDefault(); showView(name, { focus: true }); };
    switch (e.key) {
      case "/": go("board"); $("quick-input").focus(); break;
      case "n": go("new"); break;
      case "b": go("board"); break;
      case "r": go("report"); break;
      case "t": if (state.view === "board") goToDate(toDateKey()); break;
      case "[": if (state.view === "board") goToDate(addDays(state.viewDate, -1)); break;
      case "]": if (state.view === "board") goToDate(addDays(state.viewDate, 1)); break;
      case "?": e.preventDefault(); $("settings-dialog").showModal(); break;
      default:
    }
  });
}

function boot() {
  applyTheme();
  applyMotion();
  buildFilterChips();
  initBoardEvents();
  initQuickAdd();
  initNewForm();
  initDialogs();
  initSettings();
  initReport();
  initKeyboard();
  initRouter();

  store.onChange((e) => {
    if (e.type === "external") renderAll();
    if (e.type === "save-error") toast("Couldn't save — browser storage may be full or blocked.", { tone: "alert", timeout: 10000 });
  });
  if (!store.persistent) toast("Browser storage is blocked, so tasks won't be kept after you close this tab.", { tone: "alert", timeout: 12000 });
  if (store.recovered) toast("Some saved data couldn't be read. A copy was kept in your browser storage.", { tone: "alert", timeout: 12000 });

  renderAll();
  setInterval(tick, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  checkReminders();
}

boot();
window.taskpulse = { store, state, settings, debug: { createHand, pinIn, unpinOut, noteEls, queueHand } };