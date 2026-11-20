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
const DEFAULT_SETTINGS = { theme: "canvas", motion: "auto", skin: "tone2", reminders: false, name: "", shift: "", alertSounds: true, phone: false, phoneTopic: "", phoneTitles: false };

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
  s.alertSounds = s.alertSounds !== false;
  s.phone = Boolean(s.phone);
  s.phoneTopic = /^[A-Za-z0-9_-]{8,64}$/.test(String(s.phoneTopic || "")) ? String(s.phoneTopic) : "";
  s.phoneTitles = Boolean(s.phoneTitles);
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

const state = { view: "board", viewDate: toDateKey(), category: "all", status: "all", query: "", freeform: false };
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

  // ADDITIVE: tell the drag layer to re-adopt new notes
  document.dispatchEvent(new CustomEvent("taskpulse:rendered"));
}

/* ============================================================
   WEEK VIEW - Plan Your Week
   ============================================================ */
let weekOffset = 0;
let weekSelected = null;
const justDone = new Set();

const WEEK_CSS = `
body{--wk-surface:#ffffff;--wk-surface-2:#faf5f8;--wk-text:#1e1b2e;--wk-muted:#6b7280;--wk-line:rgba(30,27,46,.10);--wk-accent:#be185d;--wk-on-accent:#fff;--wk-ok:#16a34a;--wk-late:#dc2626;--wk-shadow:0 1px 2px rgba(15,23,42,.05),0 14px 28px -18px rgba(15,23,42,.35)}
body[data-theme="canvas"],body[data-theme="blueprint"],body[data-theme="midnight"]{--wk-surface:rgba(255,255,255,.07);--wk-surface-2:rgba(255,255,255,.05);--wk-text:#f1f5f9;--wk-muted:#9aa7bb;--wk-line:rgba(255,255,255,.13);--wk-on-accent:#0b1220;--wk-ok:#4ade80;--wk-late:#f87171;--wk-shadow:0 16px 32px -18px rgba(0,0,0,.7)}
body[data-theme="canvas"]{--wk-accent:#60a5fa}
body[data-theme="blueprint"]{--wk-accent:#7dd3fc}
body[data-theme="midnight"]{--wk-accent:#a78bfa}
body[data-theme="sand"]{--wk-accent:#b45309;--wk-surface-2:#fffbeb}
body[data-theme="cork"]{--wk-accent:#8b3a1a;--wk-surface:rgba(255,250,240,.94);--wk-surface-2:#fff3df}

#week-grid{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin:0 0 16px;overflow:visible}
.wk-day{appearance:none;position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 6px 18px;border-radius:20px;border:1px solid var(--wk-line);background:var(--wk-surface);color:var(--wk-text);font:inherit;cursor:pointer;box-shadow:var(--wk-shadow);overflow:hidden;transition:transform .18s,background .18s,border-color .18s,box-shadow .18s}
.wk-day:hover{transform:translateY(-2px)}
.wk-day:focus-visible{outline:2px solid var(--wk-accent);outline-offset:2px}
.wk-dn{font-size:.68rem;font-weight:800;letter-spacing:.14em;color:var(--wk-muted)}
.wk-dd{font-size:1.6rem;font-weight:800;line-height:1;letter-spacing:-.02em}
.wk-day.is-today .wk-dd{color:var(--wk-accent)}
.wk-day.is-today::after{content:"";position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;background:var(--wk-accent)}
.wk-day.is-selected{background:var(--wk-accent);border-color:transparent;color:var(--wk-on-accent);transform:translateY(-3px)}
.wk-day.is-selected .wk-dd,.wk-day.is-selected .wk-dn,.wk-day.is-selected .wk-dc{color:inherit}
.wk-day.is-selected .wk-dn,.wk-day.is-selected .wk-dc{opacity:.85}
.wk-day.is-selected::after{background:var(--wk-on-accent)}
.wk-day.drag-over{outline:2px dashed var(--wk-accent);outline-offset:3px}
.wk-dots{display:flex;gap:4px;min-height:10px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:100%}
.wk-dot{width:9px;height:9px;border-radius:50%;box-sizing:border-box;border:2px solid hsl(var(--hue,200) 70% 55%)}
.wk-dot.done{background:hsl(var(--hue,200) 70% 55%)}
.wk-day.is-selected .wk-dot{border-color:currentColor}
.wk-day.is-selected .wk-dot.done{background:currentColor}
.wk-more{font-size:.62rem;font-weight:800;opacity:.8}
.wk-dc{font-size:.72rem;font-weight:700;color:var(--wk-muted)}
.wk-dbar{position:absolute;left:0;bottom:0;height:4px;background:var(--wk-accent);border-radius:0 4px 0 0;transition:width .5s cubic-bezier(.2,.8,.2,1)}
.wk-dbar.is-complete{background:var(--wk-ok)}
.wk-day.is-selected .wk-dbar{background:var(--wk-on-accent);opacity:.8}
@media(max-width:560px){.wk-day{padding:10px 2px 14px;border-radius:14px}.wk-dd{font-size:1.15rem}.wk-dn{letter-spacing:.06em;font-size:.6rem}.wk-dot{width:7px;height:7px}}

.wk-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:18px 28px;margin:6px 0 18px;padding:18px 22px;border-radius:22px;background:var(--wk-surface);border:1px solid var(--wk-line);box-shadow:var(--wk-shadow);color:var(--wk-text);backdrop-filter:blur(10px)}
.wk-range{display:flex;flex-direction:column;gap:2px;min-width:170px}
.wk-range b{font-size:1.35rem;letter-spacing:-.02em}
.wk-range span{font-size:.8rem;color:var(--wk-muted);text-transform:uppercase;letter-spacing:.12em;font-weight:700}
.wk-nav{display:flex;gap:6px;align-items:center}
.wk-btn{appearance:none;border:1px solid var(--wk-line);background:var(--wk-surface-2);color:var(--wk-text);font:inherit;font-weight:700;font-size:.85rem;padding:9px 16px;border-radius:999px;cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s,opacity .15s}
.wk-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:var(--wk-shadow)}
.wk-btn:disabled{opacity:.4;cursor:not-allowed}
.wk-btn.icon{width:38px;height:38px;padding:0;display:grid;place-items:center;font-size:1.1rem}
.wk-btn.primary{background:var(--wk-accent);border-color:transparent;color:var(--wk-on-accent)}
.wk-btn.ghost{background:transparent}
.wk-progress{display:flex;align-items:center;gap:14px;flex:1;min-width:230px}
.wk-ring{position:relative;width:66px;height:66px;flex:none}
.wk-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.wk-ring circle{fill:none;stroke-width:6;stroke-linecap:round}
.wk-ring .bg{stroke:var(--wk-line)}
.wk-ring .fg{stroke:var(--wk-accent);transition:stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1),stroke .3s}
.wk-ring.is-complete .fg{stroke:var(--wk-ok)}
.wk-ring span{position:absolute;inset:0;display:grid;place-items:center;font-weight:800;font-size:.95rem}
.wk-stats{display:flex;flex-direction:column;gap:6px}
.wk-stats strong{font-size:1.05rem}
.wk-pills{display:flex;gap:6px;flex-wrap:wrap}
.wk-pill{font-size:.72rem;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--wk-surface-2);border:1px solid var(--wk-line);color:var(--wk-muted)}
.wk-pill.stat{color:var(--wk-late);border-color:var(--wk-late)}
.wk-pill.ok{color:var(--wk-ok);border-color:var(--wk-ok)}

.wk-backlog{margin:0 0 16px;padding:14px 16px;border-radius:18px;border:1.5px dashed var(--wk-line);background:var(--wk-surface-2);color:var(--wk-text)}
.wk-backlog h3,.wk-backlog-title{margin:0 0 10px;font-size:.78rem;text-transform:uppercase;letter-spacing:.12em;color:var(--wk-muted);font-weight:800}
#week-backlog-list{display:flex;flex-wrap:wrap;gap:8px}
#week-backlog-list .wk-card{width:240px}

.wk-panel{padding:22px 24px;border-radius:26px;background:var(--wk-surface);border:1px solid var(--wk-line);box-shadow:var(--wk-shadow);color:var(--wk-text);margin-bottom:18px;transition:border-color .2s,background .2s}
.wk-panel.drag-over{border-color:var(--wk-accent);background:color-mix(in srgb,var(--wk-accent) 10%,var(--wk-surface))}
.wk-panel-head{display:flex;flex-wrap:wrap;align-items:center;gap:12px 14px;margin-bottom:16px}
.wk-panel-title{display:flex;flex-direction:column;gap:2px;flex:1;min-width:200px}
.wk-panel-title b{font-size:1.55rem;letter-spacing:-.02em}
.wk-panel-title span{font-size:.82rem;color:var(--wk-muted);font-weight:700}
.wk-list{display:flex;flex-direction:column;gap:9px;margin-top:16px}
.wk-list .wk-card{padding:13px 12px 13px 18px}
.wk-list .wk-title{font-size:1rem}
.wk-hint{margin:8px 2px 0;font-size:.74rem;color:var(--wk-muted)}
@media(max-width:560px){.wk-panel{padding:16px 14px;border-radius:20px}}

.wk-card{position:relative;display:flex;gap:10px;align-items:flex-start;padding:10px 10px 10px 15px;border-radius:14px;background:var(--wk-surface-2);border:1px solid var(--wk-line);cursor:grab;overflow:hidden;transition:transform .15s,box-shadow .15s,opacity .2s}
.wk-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:hsl(var(--hue,200) 70% 55%)}
.wk-card.is-stat::before{background:var(--wk-late)}
.wk-card:hover{transform:translateY(-1px);box-shadow:var(--wk-shadow)}
.wk-card.dragging{opacity:.4;cursor:grabbing}
.wk-card.is-done{opacity:.7}
.wk-card.is-done .wk-title{text-decoration:line-through;color:var(--wk-muted)}
.wk-check{flex:none;appearance:none;width:22px;height:22px;margin-top:1px;border-radius:50%;border:2px solid var(--wk-muted);background:transparent;color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;transition:all .18s}
.wk-check svg{width:12px;height:12px;opacity:0;transform:scale(.4);transition:all .18s}
.wk-check:hover{border-color:var(--wk-ok);transform:scale(1.08)}
.is-done .wk-check{background:var(--wk-ok);border-color:var(--wk-ok)}
.is-done .wk-check svg{opacity:1;transform:none}
.wk-card.just .wk-check{animation:wkpop .5s cubic-bezier(.2,.9,.3,1.4)}
@keyframes wkpop{0%{transform:scale(.6)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
.wk-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.wk-title{font-weight:700;font-size:.9rem;line-height:1.25;word-break:break-word}
.wk-meta{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.wk-tag{font-size:.66rem;font-weight:800;padding:2px 7px;border-radius:99px;background:color-mix(in srgb,hsl(var(--hue,200) 70% 55%) 18%,transparent);color:var(--wk-text);letter-spacing:.02em}
.wk-tag.time{background:transparent;border:1px solid var(--wk-line);color:var(--wk-muted)}
.wk-tag.stat{background:var(--wk-late);color:#fff}
.wk-tag.late{background:transparent;border:1px solid var(--wk-late);color:var(--wk-late)}
.wk-edit{flex:none;appearance:none;border:0;background:transparent;color:var(--wk-muted);width:24px;height:24px;border-radius:8px;padding:3px;cursor:pointer;opacity:.55;transition:opacity .15s}
.wk-edit svg{width:100%;height:100%}
.wk-card:hover .wk-edit,.wk-edit:focus-visible{opacity:1}
.wk-edit:hover{color:var(--wk-text);background:var(--wk-line)}
@media(hover:none){.wk-edit{opacity:.7}}
.wk-empty{text-align:center;padding:30px 14px;border-radius:18px;border:1.5px dashed var(--wk-line);color:var(--wk-muted);font-size:.9rem;line-height:1.5}
.wk-empty b{display:block;color:var(--wk-text);font-size:1rem;margin-bottom:2px}

.wk-add{margin:0}
.wk-add input{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:16px;border:1.5px solid var(--wk-line);background:var(--wk-surface-2);color:var(--wk-text);font:inherit;font-size:.95rem;transition:border-color .15s,box-shadow .15s}
.wk-add input::placeholder{color:var(--wk-muted)}
.wk-add input:hover{border-color:var(--wk-muted)}
.wk-add input:focus{outline:none;border-color:var(--wk-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--wk-accent) 25%,transparent)}

.wk-summary{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:22px;padding:22px 24px;margin-bottom:18px;border-radius:26px;background:var(--wk-surface);border:1px solid var(--wk-line);box-shadow:var(--wk-shadow);color:var(--wk-text)}
@media(max-width:900px){.wk-summary{grid-template-columns:1fr;padding:16px 14px}}
.wk-sum-title{display:flex;flex-direction:column;gap:2px;margin-bottom:12px}
.wk-sum-title b{font-size:1.35rem;letter-spacing:-.02em}
.wk-sum-title span{font-size:.8rem;color:var(--wk-muted);font-weight:700}
.wk-insight{margin:0 0 14px;font-size:.92rem;line-height:1.5;color:var(--wk-muted)}
.wk-insight strong{color:var(--wk-text)}
.wk-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px}
.wk-kpi{padding:12px 14px;border-radius:16px;background:var(--wk-surface-2);border:1px solid var(--wk-line)}
.wk-kpi b{display:block;font-size:1.6rem;font-weight:800;letter-spacing:-.02em;line-height:1.1}
.wk-kpi span{font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--wk-muted)}
.wk-kpi.ok b{color:var(--wk-ok)}
.wk-rows{display:flex;flex-direction:column;margin-bottom:14px}
.wk-row{display:flex;justify-content:space-between;gap:12px;padding:8px 2px;border-bottom:1px solid var(--wk-line);font-size:.88rem}
.wk-row:last-child{border-bottom:0}
.wk-row span{color:var(--wk-muted)}
.wk-row b{text-align:right}
.wk-sub{margin:4px 0 8px;font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--wk-muted)}
.wk-cat{margin-bottom:9px}
.wk-cat-top{display:flex;justify-content:space-between;font-size:.82rem;font-weight:700;margin-bottom:4px}
.wk-cat-top span{color:var(--wk-muted)}
.wk-cat-bar{height:9px;border-radius:99px;background:var(--wk-line);overflow:hidden}
.wk-cat-bar i{display:block;height:100%;border-radius:99px;background:hsl(var(--hue,200) 70% 55% / .32);transition:width .5s cubic-bezier(.2,.8,.2,1)}
.wk-cat-bar i b{display:block;height:100%;border-radius:99px;background:hsl(var(--hue,200) 70% 55%)}

.wk3d-stage{position:relative;height:500px;align-self:start;perspective:1100px;border-radius:22px;border:1px solid var(--wk-line);background:radial-gradient(120% 90% at 50% 8%,color-mix(in srgb,var(--wk-accent) 16%,transparent),transparent 62%),var(--wk-surface-2);cursor:grab;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.wk3d-stage.grabbing{cursor:grabbing}
.wk3d-scene{position:absolute;left:50%;top:80%;width:0;height:0;transform-style:preserve-3d;will-change:transform}
.wk3d-floor{position:absolute;transform:rotateX(90deg);border-radius:18px;background:color-mix(in srgb,var(--wk-text) 7%,transparent);border:1px solid var(--wk-line)}
.wk3d-pad{position:absolute;transform:rotateX(90deg);border-radius:8px;background:color-mix(in srgb,var(--wk-text) 8%,transparent)}
.wk3d-pad.is-today{background:color-mix(in srgb,var(--wk-accent) 38%,transparent);box-shadow:0 0 0 2px var(--wk-accent)}
.wk3d-bar{position:absolute;transform-style:preserve-3d}
.wk3d-bar.rise{transform-origin:50% 100%;animation:wkrise .85s cubic-bezier(.2,.9,.3,1.08) both;animation-delay:var(--d,0s)}
@keyframes wkrise{from{transform:scaleY(.02)}to{transform:scaleY(1)}}
.wk3d-cube{position:absolute;left:0;transform-style:preserve-3d}
.wk3d-face{position:absolute;backface-visibility:hidden;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(0,0,0,.10)),var(--c);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.wk3d-cube.done{--c:var(--wk-ok)}
.wk3d-cube.todo{--c:var(--wk-accent)}
.wk3d-cube.free{--c:color-mix(in srgb,var(--wk-muted) 55%,transparent)}
.wk3d-face.right{filter:brightness(.8)}
.wk3d-face.left{filter:brightness(.66)}
.wk3d-face.back{filter:brightness(.6)}
.wk3d-face.top{filter:brightness(1.2)}
.wk3d-label{position:absolute;width:64px;text-align:center;font-size:12px;font-weight:800;letter-spacing:.06em;line-height:1.15;color:var(--wk-muted);pointer-events:none}
.wk3d-label small{display:block;font-size:11px;font-weight:700;opacity:.85}
.wk3d-label.is-today{color:var(--wk-accent)}
.wk3d-legend{position:absolute;left:14px;top:12px;display:flex;gap:10px;flex-wrap:wrap;font-size:.7rem;font-weight:800;color:var(--wk-muted);pointer-events:none}
.wk3d-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.wk3d-hint{position:absolute;left:14px;bottom:10px;font-size:.68rem;font-weight:700;color:var(--wk-muted);opacity:.85;pointer-events:none}
.wk3d-reset{position:absolute;right:12px;bottom:10px;padding:5px 11px;font-size:.7rem}
body[data-motion="off"] .wk3d-bar{animation:none!important}
@media(prefers-reduced-motion:reduce){body[data-motion="auto"] .wk3d-bar{animation:none!important}}

body[data-motion="off"] [class^="wk-"],body[data-motion="off"] [class*=" wk-"]{animation:none!important;transition:none!important}
@media(prefers-reduced-motion:reduce){body[data-motion="auto"] [class^="wk-"],body[data-motion="auto"] [class*=" wk-"]{animation:none!important;transition:none!important}}
`;

function injectWeekStyles() {
  if (document.getElementById("week-styles")) return;
  const style = el("style");
  style.id = "week-styles";
  style.textContent = WEEK_CSS;
  document.head.append(style);
}

function weekBounds() {
  const todayKey = toDateKey();
  const today = parseDateKey(todayKey) ?? new Date();
  const start = addDays(todayKey, -today.getDay() + weekOffset * 7);
  return { todayKey, start, days: Array.from({ length: 7 }, (_, i) => addDays(start, i)) };
}

function weekRelativeLabel() {
  if (weekOffset === 0) return "This week";
  if (weekOffset === 1) return "Next week";
  if (weekOffset === -1) return "Last week";
  return weekOffset > 0 ? `${weekOffset} weeks ahead` : `${-weekOffset} weeks ago`;
}

function setDoneMany(tasks, done) {
  const changed = [];
  for (const t of tasks) {
    if ((t.status === STATUS.COMPLETED) === done) continue;
    try { if (store.toggleStatus(t.id)) changed.push(t.id); } catch { /* skip */ }
  }
  return changed;
}

function bulkToggle(tasks, label) {
  const open = tasks.filter((t) => t.status !== STATUS.COMPLETED);
  const makeDone = open.length > 0;
  const changed = setDoneMany(makeDone ? open : tasks, makeDone);
  if (makeDone) changed.forEach((id) => justDone.add(id));
  renderAll();
  if (!changed.length) return;
  const n = changed.length;
  toast(`${makeDone ? "Completed" : "Reopened"} ${n} task${n === 1 ? "" : "s"} · ${label}`, {
    actionLabel: "Undo",
    onAction: () => { changed.forEach((id) => { try { store.toggleStatus(id); } catch { /* skip */ } }); renderAll(); },
  });
}

function toggleFromWeek(id) {
  const task = store.toggleStatus(id);
  if (!task) return;
  if (task.status === STATUS.COMPLETED) justDone.add(id);
  renderAll();
}

function weekCard(t, todayKey) {
  const done = t.status === STATUS.COMPLETED;
  const late = !done && t.date < todayKey;
  const card = el("div", `wk-card${t.isStat ? " is-stat" : ""}${done ? " is-done" : ""}${justDone.has(t.id) ? " just" : ""}`);
  card.draggable = true;
  card.dataset.id = t.id;
  card.style.setProperty("--hue", String(hashOf(t.category || "General") % 360));

  const check = el("button", "wk-check");
  check.type = "button";
  check.innerHTML = ICONS.check;
  check.setAttribute("aria-pressed", String(done));
  check.setAttribute("aria-label", `${done ? "Reopen" : "Mark done"}: ${t.title}`);
  check.addEventListener("click", (e) => { e.stopPropagation(); toggleFromWeek(t.id); });

  const meta = el("div", "wk-meta");
  if (t.isStat) meta.append(el("span", "wk-tag stat", "STAT"));
  if (late) meta.append(el("span", "wk-tag late", "Late"));
  if (t.timeBlock) meta.append(el("span", "wk-tag time", t.timeBlock.replace("-", " – ")));
  meta.append(el("span", "wk-tag", t.category));
  if (t.checklist?.length) meta.append(el("span", "wk-tag time", `${t.checklist.filter((i) => i.done).length}/${t.checklist.length}`));
  if (t.contextTag) meta.append(el("span", "wk-tag time", t.contextTag));

  const body = el("div", "wk-body");
  body.append(el("div", "wk-title", t.title), meta);

  const edit = el("button", "wk-edit");
  edit.type = "button";
  edit.innerHTML = ICONS.edit;
  edit.setAttribute("aria-label", `Edit: ${t.title}`);
  edit.addEventListener("click", (e) => { e.stopPropagation(); openEditor(t.id); });

  card.append(check, body, edit);
  card.addEventListener("click", () => openEditor(t.id));
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", t.id);
    e.dataTransfer.effectAllowed = "move";
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  return card;
}

function createWeekAddForm(dateKey, weekday) {
  const form = el("form", "wk-add");
  const input = el("input");
  input.type = "text";
  input.maxLength = LIMITS.title;
  input.placeholder = `Add a task for ${weekday}…  press Enter`;
  input.autocomplete = "off";
  input.setAttribute("aria-label", `Add a task for ${dayLabel(dateKey, { long: true })}`);
  form.append(input);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = TaskStore.parseQuickAdd(input.value);
    if (!p.title) return;
    try {
      store.addTask({
        title: p.title, contextTag: p.contextTag, assignee: p.assignee, category: p.category || "General",
        date: dateKey, timeBlock: p.timeBlock, isStat: p.isStat,
      });
    } catch (err) { toast(err.message, { tone: "alert" }); return; }
    playAlert("add");
    scanLate({ silent: true });
    input.value = "";
    renderAll(); // renderWeek restores focus to the new box
  });
  return form;
}

function attachWeekDrop(node, key) {
  node.addEventListener("dragover", (e) => { e.preventDefault(); node.classList.add("drag-over"); });
  node.addEventListener("dragleave", (e) => { if (!node.contains(e.relatedTarget)) node.classList.remove("drag-over"); });
  node.addEventListener("drop", (e) => {
    e.preventDefault();
    node.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    try { store.updateTask(id, { date: key ?? node.dataset.date }); } catch (err) { toast(err.message, { tone: "alert" }); }
    renderAll();
  });
}

function ensureWeekToolbar(grid, backlogBox) {
  let bar = document.getElementById("wk-toolbar");
  if (!bar) {
    bar = el("div", "wk-toolbar");
    bar.id = "wk-toolbar";
    const anchor = backlogBox && backlogBox.parentElement ? backlogBox : grid;
    anchor.parentElement.insertBefore(bar, anchor);
  }
  return bar;
}

function renderWeekToolbar(bar, { start, days, todayKey }, weekTasks) {
  const total = weekTasks.length;
  const done = weekTasks.filter((t) => t.status === STATUS.COMPLETED).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;
  const statOpen = weekTasks.filter((t) => t.isStat && t.status === STATUS.PENDING).length;
  const late = weekTasks.filter((t) => t.status === STATUS.PENDING && t.date < todayKey).length;

  const fmt = (key, opts) => (parseDateKey(key) ?? new Date()).toLocaleDateString(undefined, opts);
  const range = el("div", "wk-range");
  range.append(
    el("span", "", weekRelativeLabel()),
    el("b", "", `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(days[6], { month: "short", day: "numeric" })}`),
  );

  const nav = el("div", "wk-nav");
  const prev = el("button", "wk-btn icon", "‹"); prev.type = "button"; prev.setAttribute("aria-label", "Previous week");
  const next = el("button", "wk-btn icon", "›"); next.type = "button"; next.setAttribute("aria-label", "Next week");
  const now = el("button", "wk-btn ghost", "Today"); now.type = "button"; now.disabled = weekOffset === 0;
  prev.addEventListener("click", () => { weekOffset -= 1; renderWeek(); });
  next.addEventListener("click", () => { weekOffset += 1; renderWeek(); });
  now.addEventListener("click", () => { weekOffset = 0; renderWeek(); });
  nav.append(prev, now, next);

  const C = 2 * Math.PI * 28;
  const ring = el("div", `wk-ring${complete ? " is-complete" : ""}`);
  ring.innerHTML = `<svg viewBox="0 0 66 66" aria-hidden="true"><circle class="bg" cx="33" cy="33" r="28"/><circle class="fg" cx="33" cy="33" r="28" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(1)}"/></svg><span>${pct}%</span>`;
  ring.setAttribute("role", "img");
  ring.setAttribute("aria-label", `${pct} percent of this week's tasks done`);

  const stats = el("div", "wk-stats");
  stats.append(el("strong", "", total ? (complete ? "Week complete — nice work" : `${done} of ${total} tasks done`) : "Nothing planned yet"));
  const pills = el("div", "wk-pills");
  if (statOpen) pills.append(el("span", "wk-pill stat", `${statOpen} STAT open`));
  if (late) pills.append(el("span", "wk-pill stat", `${late} late`));
  if (complete) pills.append(el("span", "wk-pill ok", "All clear"));
  if (total && !statOpen && !late && !complete) pills.append(el("span", "wk-pill", `${total - done} to go`));
  stats.append(pills);
  const progress = el("div", "wk-progress");
  progress.append(ring, stats);

  const action = el("button", "wk-btn primary", complete ? "Reopen week" : "Complete week");
  action.type = "button";
  action.disabled = total === 0;
  action.addEventListener("click", () => bulkToggle(weekTasks, "week"));

  bar.replaceChildren(range, nav, progress, action);
}

/* ---------- Week summary + 3D chart ---------- */
const wk3d = { rx: -24, ry: -24, drag: null, running: false, stage: null, scene: null, key: "", t0: performance.now() };
const WK3D = { W: 30, D: 30, SP: 56, MAXH: 230 };

function fmtMinutes(m) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${r}m`;
}

function cuboid(w, d, h, cls, { noTop = false } = {}) {
  const box = el("div", `wk3d-cube ${cls}`);
  box.style.width = `${w}px`;
  box.style.height = `${h}px`;
  const face = (name, fw, fh, tf, left, top) => {
    const f = el("div", `wk3d-face ${name}`);
    f.style.cssText = `width:${fw}px;height:${fh}px;left:${left}px;top:${top}px;transform:${tf}`;
    return f;
  };
  box.append(
    face("front", w, h, `translateZ(${d / 2}px)`, 0, 0),
    face("back", w, h, `rotateY(180deg) translateZ(${d / 2}px)`, 0, 0),
    face("right", d, h, `rotateY(90deg) translateZ(${w / 2}px)`, (w - d) / 2, 0),
    face("left", d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, (w - d) / 2, 0),
  );
  if (!noTop) box.append(face("top", w, d, `rotateX(90deg) translateZ(${h / 2}px)`, 0, (h - d) / 2));
  return box;
}

function applyWk3d(now = performance.now()) {
  if (!wk3d.scene || !wk3d.stage) return;
  const width = wk3d.stage.clientWidth || 520;
  const scale = Math.max(0.55, Math.min(1.3, width / 500));
  const sway = motionOn() && !wk3d.drag ? Math.sin((now - wk3d.t0) / 1700) * 5 : 0;
  wk3d.scene.style.transform = `scale(${scale.toFixed(3)}) rotateX(${wk3d.rx.toFixed(1)}deg) rotateY(${(wk3d.ry + sway).toFixed(1)}deg)`;
}

function wk3dLoop(now) {
  if (!wk3d.stage || !wk3d.stage.isConnected || state.view !== "week") { wk3d.running = false; return; }
  applyWk3d(now);
  requestAnimationFrame(wk3dLoop);
}

function startWk3dLoop() {
  if (wk3d.running || state.view !== "week") return;
  wk3d.running = true;
  requestAnimationFrame(wk3dLoop);
}

function resetWk3d() { wk3d.rx = -24; wk3d.ry = -24; applyWk3d(); }

function ensureWeekSummary(anchor) {
  let root = document.getElementById("wk-summary");
  if (root) return root;
  root = el("section", "wk-summary");
  root.id = "wk-summary";

  const stage = el("div", "wk3d-stage");
  stage.setAttribute("role", "img");
  stage.setAttribute("aria-label", "3D bar chart of tasks per day this week. Drag to rotate.");
  const scene = el("div", "wk3d-scene");
  const legend = el("div", "wk3d-legend");
  legend.innerHTML = '<span><i style="background:var(--wk-ok)"></i>Done</span><span><i style="background:var(--wk-accent)"></i>To do</span>';
  const hint = el("div", "wk3d-hint", "Drag to rotate");
  const reset = el("button", "wk-btn ghost wk3d-reset", "Reset view");
  reset.type = "button";
  reset.addEventListener("pointerdown", (e) => e.stopPropagation());
  reset.addEventListener("click", resetWk3d);
  stage.append(scene, legend, hint, reset);

  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    wk3d.drag = { x: e.clientX, y: e.clientY, rx: wk3d.rx, ry: wk3d.ry };
    stage.classList.add("grabbing");
    try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  });
  stage.addEventListener("pointermove", (e) => {
    const d = wk3d.drag;
    if (!d) return;
    wk3d.ry = Math.max(-80, Math.min(80, d.ry + (e.clientX - d.x) * 0.45));
    wk3d.rx = Math.max(-62, Math.min(-6, d.rx + (e.clientY - d.y) * 0.3));
    applyWk3d();
  });
  const end = () => { wk3d.drag = null; stage.classList.remove("grabbing"); };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("dblclick", resetWk3d);

  wk3d.stage = stage;
  wk3d.scene = scene;
  const side = el("div", "wk-sum-side");
  root.append(stage, side);
  anchor.parentElement.insertBefore(root, anchor.nextSibling);
  return root;
}

function build3D(perDay, todayKey, rise) {
  const { W, D, SP, MAXH } = WK3D;
  const max = Math.max(1, ...perDay.map((d) => d.total));
  const unit = Math.min(46, MAXH / max);
  const nodes = [];

  const floor = el("div", "wk3d-floor");
  const fw = SP * 7 + 24;
  const fd = D + 96;
  floor.style.cssText = `width:${fw}px;height:${fd}px;left:${-fw / 2}px;top:${-fd / 2}px`;
  nodes.push(floor);

  perDay.forEach((day, i) => {
    const x = (i - 3) * SP;
    const isToday = day.key === todayKey;

    const pad = el("div", `wk3d-pad${isToday ? " is-today" : ""}`);
    pad.style.cssText = `width:${W + 12}px;height:${D + 12}px;left:${x - (W + 12) / 2}px;top:${-(D + 12) / 2}px;transform:rotateX(90deg) translateZ(0.5px)`;
    nodes.push(pad);

    const hd = day.done * unit;
    const ht = day.todo * unit;
    const H = day.total ? hd + ht : 3;
    const bar = el("div", `wk3d-bar${rise ? " rise" : ""}`);
    bar.style.cssText = `left:${x - W / 2}px;top:${-H}px;width:${W}px;height:${H}px;--d:${(i * 0.07).toFixed(2)}s`;
    bar.title = day.total ? `${dayLabel(day.key, { long: true })}: ${day.done} done, ${day.todo} to do` : `${dayLabel(day.key, { long: true })}: free`;
    if (!day.total) {
      const slab = cuboid(W, D, 3, "free");
      slab.style.bottom = "0";
      bar.append(slab);
    } else {
      if (day.done) {
        const c = cuboid(W, D, hd, "done", { noTop: day.todo > 0 });
        c.style.bottom = "0";
        bar.append(c);
      }
      if (day.todo) {
        const c = cuboid(W, D, ht, "todo");
        c.style.bottom = `${hd}px`;
        bar.append(c);
      }
    }
    nodes.push(bar);

    const label = el("div", `wk3d-label${isToday ? " is-today" : ""}`);
    label.style.cssText = `left:${x - 32}px;top:-14px;transform:translateZ(${D / 2 + 30}px) rotateX(90deg)`;
    label.append(document.createTextNode(dayLabelShort(day.key)), el("small", "", day.total ? `${day.done}/${day.total}` : "–"));
    nodes.push(label);
  });
  wk3d.scene.replaceChildren(...nodes);
}

function dayLabelShort(key) {
  return (parseDateKey(key) ?? new Date()).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
}

function renderWeekSummary(anchor, days, weekTasks, todayKey, startKey) {
  const root = ensureWeekSummary(anchor);
  const side = root.querySelector(".wk-sum-side");

  const perDay = days.map((key) => {
    const list = weekTasks.filter((t) => t.date === key);
    const done = list.filter((t) => t.status === STATUS.COMPLETED).length;
    return { key, total: list.length, done, todo: list.length - done };
  });
  const total = weekTasks.length;
  const done = perDay.reduce((n, d) => n + d.done, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const statTasks = weekTasks.filter((t) => t.isStat);
  const statOpen = statTasks.filter((t) => t.status === STATUS.PENDING).length;
  const late = weekTasks.filter((t) => t.status === STATUS.PENDING && t.date < todayKey).length;
  const carried = weekTasks.filter((t) => t.carryCount > 0).length;
  let minutes = 0;
  for (const t of weekTasks) {
    const b = parseBlock(t.timeBlock);
    if (b) minutes += Math.max(0, minutesOf(b.end) - minutesOf(b.start));
  }
  const busiest = perDay.reduce((best, d) => (d.total > (best?.total ?? 0) ? d : best), null);
  const bestDone = perDay.reduce((best, d) => (d.done > (best?.done ?? 0) ? d : best), null);
  const long = (key) => (parseDateKey(key) ?? new Date()).toLocaleDateString(undefined, { weekday: "long" });

  const fmt = (key) => (parseDateKey(key) ?? new Date()).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const title = el("div", "wk-sum-title");
  title.append(el("b", "", "Week summary"), el("span", "", `${weekRelativeLabel()} · ${fmt(days[0])} – ${fmt(days[6])}`));

  const insight = el("p", "wk-insight");
  if (!total) {
    insight.textContent = "Nothing is planned for this week yet. Add tasks to a day and your summary will build itself.";
  } else {
    const parts = [`<strong>${done} of ${total}</strong> tasks done (${pct}%).`];
    if (busiest) parts.push(`Busiest day is <strong>${long(busiest.key)}</strong> with ${busiest.total} task${busiest.total === 1 ? "" : "s"}.`);
    if (statOpen) parts.push(`<strong>${statOpen} STAT</strong> still open.`);
    else if (statTasks.length) parts.push("All STAT tasks are cleared.");
    if (late) parts.push(`${late} overdue.`);
    insight.innerHTML = parts.join(" ");
  }

  const kpis = el("div", "wk-kpis");
  const kpi = (value, label, cls = "") => { const k = el("div", `wk-kpi ${cls}`); k.append(el("b", "", value), el("span", "", label)); return k; };
  kpis.append(kpi(String(total), "Planned"), kpi(String(done), "Completed", "ok"), kpi(`${pct}%`, "Completion"), kpi(minutes ? fmtMinutes(minutes) : "–", "Time blocked"));

  const rows = el("div", "wk-rows");
  const row = (label, value) => { const r = el("div", "wk-row"); r.append(el("span", "", label), el("b", "", value)); return r; };
  rows.append(
    row("Busiest day", busiest ? `${long(busiest.key)} · ${busiest.total}` : "–"),
    row("Most done", bestDone && bestDone.done ? `${long(bestDone.key)} · ${bestDone.done}` : "–"),
    row("STAT tasks", statTasks.length ? `${statTasks.length - statOpen} of ${statTasks.length} cleared` : "None"),
    row("Overdue", String(late)),
    row("Carried over", String(carried)),
  );

  const cats = new Map();
  for (const t of weekTasks) {
    const c = cats.get(t.category) ?? { total: 0, done: 0 };
    c.total += 1;
    if (t.status === STATUS.COMPLETED) c.done += 1;
    cats.set(t.category, c);
  }
  const catList = [...cats.entries()].sort((a, b) => b[1].total - a[1].total);
  const catMax = Math.max(1, ...catList.map(([, c]) => c.total));
  const catBox = el("div", "wk-cats");
  if (catList.length) {
    catBox.append(el("div", "wk-sub", "By category"));
    catList.forEach(([name, c]) => {
      const wrap = el("div", "wk-cat");
      wrap.style.setProperty("--hue", String(hashOf(name || "General") % 360));
      const top = el("div", "wk-cat-top");
      top.append(el("div", "", name), el("span", "", `${c.done}/${c.total}`));
      const bar = el("div", "wk-cat-bar");
      const fill = el("i");
      fill.style.width = `${Math.round((c.total / catMax) * 100)}%`;
      const inner = el("b");
      inner.style.width = `${Math.round((c.done / c.total) * 100)}%`;
      fill.append(inner);
      bar.append(fill);
      wrap.append(top, bar);
      catBox.append(wrap);
    });
  }
  side.replaceChildren(title, insight, kpis, rows, catBox);

  const visible = wk3d.stage.offsetParent !== null;
  const key = `${startKey}`;
  const rise = visible && wk3d.key !== key;
  if (visible) wk3d.key = key;
  build3D(perDay, todayKey, rise);
  applyWk3d();
  startWk3dLoop();
}

function renderWeek() {
  const grid = $("week-grid");
  const backlog = $("week-backlog-list");
  if (!grid || !backlog) return;
  injectWeekStyles();

  // The old "Clear Unscheduled" button no longer applies: every task has a day.
  $$('[data-view="week"] button').forEach((b) => { if (/clear unscheduled/i.test(b.textContent)) b.style.display = "none"; });

  const backlogBox = backlog.parentElement;
  const bounds = weekBounds();
  const { todayKey, days } = bounds;
  const tasks = store.getTasks();
  const weekTasks = tasks.filter((t) => days.includes(t.date));
  if (!weekSelected || !days.includes(weekSelected)) weekSelected = days.includes(todayKey) ? todayKey : days[0];

  renderWeekToolbar(ensureWeekToolbar(grid, backlogBox), bounds, weekTasks);

  // ---- Day strip -------------------------------------------------------
  grid.replaceChildren();
  days.forEach((key) => {
    const d = parseDateKey(key) ?? new Date();
    const dayTasks = sortTasks(tasks.filter((t) => t.date === key));
    const doneN = dayTasks.filter((t) => t.status === STATUS.COMPLETED).length;
    const allDone = dayTasks.length > 0 && doneN === dayTasks.length;

    const tile = el("button", `wk-day${key === todayKey ? " is-today" : ""}${key === weekSelected ? " is-selected" : ""}`);
    tile.type = "button";
    tile.dataset.date = key;
    tile.setAttribute("aria-pressed", String(key === weekSelected));
    tile.setAttribute("aria-label", `${dayLabel(key, { long: true })}, ${dayTasks.length ? `${doneN} of ${dayTasks.length} done` : "no tasks"}`);

    const dots = el("span", "wk-dots");
    dayTasks.slice(0, 5).forEach((t) => {
      const dot = el("i", `wk-dot${t.status === STATUS.COMPLETED ? " done" : ""}`);
      dot.style.setProperty("--hue", String(hashOf(t.category || "General") % 360));
      dots.append(dot);
    });
    if (dayTasks.length > 5) dots.append(el("span", "wk-more", `+${dayTasks.length - 5}`));

    tile.append(
      el("span", "wk-dn", d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()),
      el("span", "wk-dd", String(d.getDate())),
      dots,
      el("span", "wk-dc", dayTasks.length ? `${doneN}/${dayTasks.length}` : "Free"),
    );
    if (dayTasks.length) {
      const bar = el("span", `wk-dbar${allDone ? " is-complete" : ""}`);
      bar.style.width = `${Math.round((doneN / dayTasks.length) * 100)}%`;
      tile.append(bar);
    }
    tile.addEventListener("click", () => { weekSelected = key; renderWeek(); });
    attachWeekDrop(tile, key);
    grid.append(tile);
  });

  // ---- Selected day panel ---------------------------------------------
  let panel = document.getElementById("wk-panel");
  if (!panel) {
    panel = el("section", "wk-panel");
    panel.id = "wk-panel";
    grid.parentElement.insertBefore(panel, grid.nextSibling);
  }
  const prevInput = panel.querySelector(".wk-add input");
  const hadFocus = Boolean(prevInput) && document.activeElement === prevInput;
  const keptValue = prevInput ? prevInput.value : "";

  const key = weekSelected;
  const d = parseDateKey(key) ?? new Date();
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const dayTasks = sortTasks(tasks.filter((t) => t.date === key));
  const doneN = dayTasks.filter((t) => t.status === STATUS.COMPLETED).length;
  const allDone = dayTasks.length > 0 && doneN === dayTasks.length;
  const rel = key === todayKey ? " · Today" : key === addDays(todayKey, 1) ? " · Tomorrow" : key === addDays(todayKey, -1) ? " · Yesterday" : "";

  const title = el("div", "wk-panel-title");
  title.append(el("b", "", weekday), el("span", "", `${d.toLocaleDateString(undefined, { month: "long", day: "numeric" })}${rel}`));
  const head = el("div", "wk-panel-head");
  head.append(title);
  if (dayTasks.length) head.append(el("span", `wk-pill${allDone ? " ok" : ""}`, allDone ? "All done" : `${doneN} of ${dayTasks.length} done`));
  const complete = el("button", `wk-btn${allDone ? "" : " primary"}`, allDone ? "Reopen day" : "Complete day");
  complete.type = "button";
  complete.disabled = dayTasks.length === 0;
  complete.addEventListener("click", () => bulkToggle(dayTasks, dayLabel(key)));
  const openBoard = el("button", "wk-btn ghost", "Open on Board");
  openBoard.type = "button";
  openBoard.addEventListener("click", () => { goToDate(key); showView("board", { focus: true }); });
  head.append(complete, openBoard);

  const form = createWeekAddForm(key, weekday);
  const hint = el("p", "wk-hint", "Tip:  ! STAT  ·  #category  ·  @09:00-10:00  ·  >name  ·  [context]");

  const list = el("div", "wk-list");
  if (dayTasks.length) {
    dayTasks.forEach((t) => list.append(weekCard(t, todayKey)));
  } else {
    const empty = el("div", "wk-empty");
    empty.append(el("b", "", key < todayKey ? "Nothing was planned" : "A free day"), document.createTextNode(key < todayKey ? "No tasks were set for this day." : "Add your first task above, or drag one here from another day."));
    list.append(empty);
  }
  panel.replaceChildren(head, form, hint, list);
  if (!panel.dataset.drop) { attachWeekDrop(panel, null); panel.dataset.drop = "1"; }
  panel.dataset.date = key;
  if (hadFocus) {
    const input = panel.querySelector(".wk-add input");
    input.value = keptValue;
    input.focus();
  }

  renderWeekSummary(panel, days, weekTasks, todayKey, bounds.start);

  // ---- Unfinished tasks from earlier days that aren't visible in this week
  backlog.replaceChildren();
  const leftovers = tasks.filter((t) => t.status === STATUS.PENDING && t.date < todayKey && !days.includes(t.date));
  leftovers.forEach((t) => backlog.append(weekCard(t, todayKey)));
  if (backlogBox) {
    backlogBox.classList.add("wk-backlog");
    const bt = [...backlogBox.children].find((c) => c !== backlog);
    if (bt) bt.textContent = "Carried over — drag onto a day";
    backlogBox.hidden = leftovers.length === 0;
    backlogBox.style.display = leftovers.length === 0 ? "none" : "";
  }

  justDone.clear();
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
  renderWeek(); // Renders the week grid
  // ADDITIVE: let drag layer re-apply saved positions after a full render
  if (window.taskpulseDrag?.applyAll) {
    try { window.taskpulseDrag.applyAll(); } catch { /* ignore */ }
  }
  queuePhoneSync();
}

function goToDate(key) {
  state.viewDate = key;
  renderAll();
}

/* ============================================================
   LIVE CLOCK
   ============================================================ */
function ensureClockEl() {
  let t = $("clock-text");
  if (t) return t;
  // Fallback: the page has no clock element, so draw a small clock pill.
  if (!document.getElementById("clock-style")) {
    const style = el("style");
    style.id = "clock-style";
    style.textContent = "#clock-widget{position:fixed;left:20px;bottom:20px;z-index:40;display:flex;align-items:baseline;gap:10px;padding:12px 20px;border-radius:999px;background:rgba(55,65,81,.92);color:#fff;font:700 17px/1 inherit;font-family:inherit;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);backdrop-filter:blur(8px);pointer-events:none}#clock-widget #clock-date{font-size:12px;font-weight:600;opacity:.75;letter-spacing:.04em}@media(max-width:520px){#clock-widget{left:12px;bottom:12px;padding:10px 14px}}@media print{#clock-widget{display:none}}";
    document.head.append(style);
  }
  const box = el("div");
  box.id = "clock-widget";
  box.setAttribute("aria-label", "Current time");
  t = el("span");
  t.id = "clock-text";
  box.append(t, el("span"));
  box.lastChild.id = "clock-date";
  document.body.append(box);
  return t;
}

function updateClock() {
  const clockEl = ensureClockEl();
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateEl = $("clock-date");
  if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function startClock() {
  try { updateClock(); } catch (err) { console.error("TaskPulse: clock failed.", err); }
  setInterval(() => { try { updateClock(); } catch { /* ignore */ } }, 1000);
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
  playAlert("add");
  scanLate({ silent: true });
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
  // ADDITIVE: forget any free-form position for this id
  try { window.taskpulseDrag?.remove?.(id); } catch { /* ignore */ }
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
    // ADDITIVE: if a drag just happened, ignore the follow-up click
    if (note.dataset.dragged === "1") {
      delete note.dataset.dragged;
      return;
    }
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
    scanLate({ silent: true });
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

  // ADDITIVE: focus-sound toggle (only wired if the checkbox exists in your HTML)
  const soundOn = $("set-sound");
  if (soundOn) {
    let savedSound = {};
    try { savedSound = JSON.parse(localStorage.getItem("taskpulse:sound:v1") || "{}") || {}; } catch { /* ignore */ }
    soundOn.checked = Boolean(savedSound.preset && savedSound.preset !== "off");
    soundOn.addEventListener("change", () => {
      if (!window.taskpulseSound) return;
      window.taskpulseSound.play(soundOn.checked ? (savedSound.preset && savedSound.preset !== "off" ? savedSound.preset : "rain") : "off");
    });
  }

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
    try { window.taskpulseDrag?.clear?.(); } catch { /* ignore */ }
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

const VIEW_NAMES = ["board", "week", "new", "report"];
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
  if (name === "week") renderWeek();
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
    playAlert("remind");
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(t.isStat ? `STAT — ${t.title}` : t.title, { body: text }); } catch { /* ignore */ }
    }
  }
}

/* ============================================================
   ALERTS: sounds, late detection, phone reminders (ntfy)
   ============================================================ */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTone(ctx, { freq, start = 0, dur = 0.18, type = "sine", gain = 0.14 }) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const ALERT_SOUNDS = {
  add: [{ freq: 660, dur: 0.14 }, { freq: 990, start: 0.09, dur: 0.24 }],
  remind: [{ freq: 880, dur: 0.12 }, { freq: 1175, start: 0.14, dur: 0.12 }, { freq: 1568, start: 0.28, dur: 0.3 }],
  late: [
    { freq: 523, type: "square", gain: 0.07, dur: 0.16 }, { freq: 392, start: 0.2, type: "square", gain: 0.07, dur: 0.16 },
    { freq: 523, start: 0.4, type: "square", gain: 0.07, dur: 0.16 }, { freq: 392, start: 0.6, type: "square", gain: 0.07, dur: 0.28 },
  ],
};

function playAlert(kind) {
  if (!settings.alertSounds) return;
  const ctx = getAudio();
  if (!ctx) return;
  try { (ALERT_SOUNDS[kind] || []).forEach((n) => playTone(ctx, n)); } catch { /* ignore */ }
}

const overdueSeen = new Set();
function scanLate({ silent = false } = {}) {
  const now = new Date();
  const fresh = [];
  for (const t of store.getTasks()) {
    let late = false;
    if (t.status === STATUS.PENDING) { try { late = Boolean(store.isOverdue(t, now)); } catch { late = false; } }
    if (!late) { overdueSeen.delete(t.id); continue; }
    if (!overdueSeen.has(t.id)) { overdueSeen.add(t.id); if (!silent) fresh.push(t); }
  }
  if (fresh.length) alertLate(fresh);
}

function alertLate(list) {
  const first = list[0];
  const text = list.length === 1 ? `Running late: ${truncate(first.title, 50)}` : `${list.length} tasks are running late`;
  toast(text, {
    tone: "alert", timeout: 12000, actionLabel: "Open",
    onAction: () => { goToDate(first.date); showView("board"); if (list.length === 1) openEditor(first.id); },
  });
  playAlert("late");
  if (settings.reminders && "Notification" in window && Notification.permission === "granted") {
    try { new Notification("TaskPulse: running late", { body: text }); } catch { /* ignore */ }
  }
  phoneLate(list);
}

/* ---- Phone reminders through ntfy.sh (free push service) ---- */
const PHONE_SERVER = "https://ntfy.sh";
const PHONE_KEY = "taskpulse:phone:v1";
let phoneSched = {};
try { phoneSched = JSON.parse(localStorage.getItem(PHONE_KEY) || "{}") || {}; } catch { phoneSched = {}; }
function savePhoneSched() { try { localStorage.setItem(PHONE_KEY, JSON.stringify(phoneSched)); } catch { /* ignore */ } }
const phoneReady = () => Boolean(settings.phone && settings.phoneTopic);

function newPhoneTopic() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `taskpulse-${[...bytes].map((b) => chars[b % chars.length]).join("")}`;
}

let phoneErrAt = 0;
function phoneError(err) {
  console.warn("TaskPulse phone reminders:", err);
  if (Date.now() - phoneErrAt > 600000) {
    phoneErrAt = Date.now();
    toast("Couldn't reach ntfy.sh, so phone reminders are paused for now.", { tone: "alert" });
  }
}

async function ntfyPost({ title, message, priority = 3, tags = "", at = 0 }) {
  const headers = { Title: title, Priority: String(priority) };
  if (tags) headers.Tags = tags;
  if (at) headers.Delay = String(Math.floor(at / 1000));
  const res = await fetch(`${PHONE_SERVER}/${settings.phoneTopic}`, { method: "POST", headers, body: message });
  if (!res.ok) throw new Error(`ntfy responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return data.id || "";
}

async function ntfyCancel(rec) {
  if (!rec || !rec.id) return;
  try { await fetch(`${PHONE_SERVER}/${rec.topic}/${rec.id}`, { method: "DELETE" }); } catch { /* best effort */ }
}

function phoneText(t, kind, leadMin) {
  const b = parseBlock(t.timeBlock);
  if (settings.phoneTitles) {
    return kind === "late" ? `Running late: ${t.title}` : `${t.title} starts at ${b ? b.start : "soon"}${leadMin ? ` (in ${leadMin} min)` : ""}`;
  }
  return kind === "late" ? "A task is running late. Open TaskPulse." : `A task starts at ${b ? b.start : "soon"}. Open TaskPulse for details.`;
}

function atTime(dateKey, hhmm) {
  const d = parseDateKey(dateKey);
  if (!d) return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function wantedPhoneJobs() {
  const jobs = new Map();
  const now = Date.now();
  const horizon = now + 71 * 3600 * 1000; // ntfy can hold a message for at most 3 days
  for (const t of store.getTasks()) {
    if (t.status !== STATUS.PENDING) continue;
    const b = parseBlock(t.timeBlock);
    if (!b) continue;
    const startAt = atTime(t.date, b.start);
    if (!Number.isFinite(startAt)) continue;
    const lead = t.isStat ? 15 : 10;
    const at = startAt - lead * 60000;
    if (at <= now + 30000 || at >= horizon) continue;
    jobs.set(t.id, {
      at, title: t.isStat ? "TaskPulse - STAT starting soon" : "TaskPulse - starting soon",
      message: phoneText(t, "start", lead), priority: t.isStat ? 5 : 3, tags: t.isStat ? "rotating_light" : "alarm_clock",
    });
  }
  return jobs;
}

let phoneSyncing = false;
let phoneSyncAgain = false;
async function syncPhone() {
  if (!phoneReady()) return;
  if (phoneSyncing) { phoneSyncAgain = true; return; }
  phoneSyncing = true;
  try {
    const wanted = wantedPhoneJobs();
    const now = Date.now();
    for (const [key, rec] of Object.entries(phoneSched)) {
      if (rec.at <= now) { delete phoneSched[key]; continue; } // already delivered
      const w = wanted.get(key);
      if (!w || Math.abs(w.at - rec.at) > 1000 || w.message !== rec.msg || rec.topic !== settings.phoneTopic) {
        await ntfyCancel(rec);
        delete phoneSched[key];
      }
    }
    for (const [key, w] of wanted) {
      if (phoneSched[key]) continue;
      const id = await ntfyPost(w);
      phoneSched[key] = { id, at: w.at, msg: w.message, topic: settings.phoneTopic };
    }
    savePhoneSched();
  } catch (err) {
    phoneError(err);
  } finally {
    phoneSyncing = false;
    if (phoneSyncAgain) { phoneSyncAgain = false; queuePhoneSync(); }
  }
}

let phoneTimer = 0;
function queuePhoneSync() {
  if (!phoneReady()) return;
  clearTimeout(phoneTimer);
  phoneTimer = setTimeout(syncPhone, 1500);
}

function cancelAllPhone() {
  const recs = Object.values(phoneSched);
  phoneSched = {};
  savePhoneSched();
  recs.forEach((r) => ntfyCancel(r));
}

function phoneLate(list) {
  if (!phoneReady()) return;
  list.slice(0, 3).forEach((t) => {
    ntfyPost({ title: "TaskPulse - running late", message: phoneText(t, "late"), priority: 4, tags: "warning" }).catch(phoneError);
  });
}

function initAlerts() {
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.addEventListener(ev, () => getAudio(), { once: true, passive: true }));
  scanLate({ silent: true }); // tasks that are already late at startup stay quiet
  queuePhoneSync();
}

function initAlertSettings() {
  const dialog = $("settings-dialog");
  if (!dialog) return;
  if (!document.getElementById("alert-settings-style")) {
    const style = el("style");
    style.id = "alert-settings-style";
    style.textContent = ".alert-settings{display:flex;flex-direction:column;gap:10px;margin:14px 0;padding:14px 0 4px;border-top:1px solid rgba(128,128,128,.3)}.alert-settings h4{margin:0;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;opacity:.7}.alert-settings .as-note{margin:0;font-size:.8rem;line-height:1.45;opacity:.75}.alert-settings .as-panel{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:12px;background:rgba(128,128,128,.12)}.alert-settings .as-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.alert-settings code{padding:3px 8px;border-radius:8px;background:rgba(128,128,128,.2);font-size:.8rem;word-break:break-all}.alert-settings ol{margin:0;padding-left:1.2em;font-size:.85rem;line-height:1.55}";
    document.head.append(style);
  }
  const host = el("div", "alert-settings");
  host.append(el("h4", "", "Sounds & phone"));

  const mkCheck = (id, text) => {
    const label = el("label", "check");
    const box = el("input");
    box.type = "checkbox";
    box.id = id;
    label.append(box, el("span", "", text));
    return { label, box };
  };
  const mkBtn = (text) => { const b = el("button", "btn btn-glass btn-sm", text); b.type = "button"; return b; };

  const snd = mkCheck("set-alert-sounds", "Play a sound for new, reminder and late tasks");
  snd.box.checked = settings.alertSounds;
  const tryIt = mkBtn("Try it");
  const sndRow = el("div", "as-row");
  sndRow.append(snd.label, tryIt);

  const phone = mkCheck("set-phone", "Send reminders to my phone");
  phone.box.checked = settings.phone;
  const panel = el("div", "as-panel");
  const steps = el("ol");
  ["Install the free ntfy app on your phone (Android or iPhone).", "In the app tap +, then subscribe to the topic below (leave the server as ntfy.sh).", "Press Send test. Your phone should buzz within seconds."].forEach((t) => steps.append(el("li", "", t)));
  const topicRow = el("div", "as-row");
  const topicCode = el("code");
  const copyBtn = mkBtn("Copy");
  const freshBtn = mkBtn("New topic");
  topicRow.append(topicCode, copyBtn, freshBtn);
  const titles = mkCheck("set-phone-titles", "Show task titles in phone alerts");
  titles.box.checked = settings.phoneTitles;
  const testRow = el("div", "as-row");
  const testBtn = mkBtn("Send test");
  const status = el("span", "as-note");
  testRow.append(testBtn, status);
  panel.append(
    steps, topicRow, titles.label,
    el("p", "as-note", "Keep titles off for private or patient details: with them off, your phone only shows the time. Anyone who knows your topic name can read its alerts, so keep it private. Reminders arrive 10 minutes before a time-blocked task (15 for STAT), even when this app is closed, for tasks in the next 3 days; open TaskPulse now and then so new tasks get scheduled."),
    testRow,
  );

  host.append(sndRow, phone.label, panel);
  const anchor = $("set-reminders");
  const anchorBox = anchor ? (anchor.closest("label") || anchor.parentElement) : null;
  if (anchorBox && anchorBox.parentElement) anchorBox.parentElement.insertBefore(host, anchorBox.nextSibling);
  else (dialog.querySelector("form") || dialog).append(host);

  const paint = () => { panel.hidden = !settings.phone; topicCode.textContent = settings.phoneTopic || "-"; };
  paint();

  snd.box.addEventListener("change", () => { settings.alertSounds = snd.box.checked; saveSettings(); if (snd.box.checked) playAlert("add"); });
  tryIt.addEventListener("click", () => {
    const was = settings.alertSounds;
    settings.alertSounds = true;
    playAlert("add");
    setTimeout(() => { playAlert("late"); settings.alertSounds = was; }, 700);
  });
  phone.box.addEventListener("change", () => {
    settings.phone = phone.box.checked;
    if (settings.phone && !settings.phoneTopic) settings.phoneTopic = newPhoneTopic();
    saveSettings();
    paint();
    if (settings.phone) syncPhone(); else cancelAllPhone();
  });
  freshBtn.addEventListener("click", () => {
    cancelAllPhone();
    settings.phoneTopic = newPhoneTopic();
    saveSettings();
    paint();
    status.textContent = "New topic created. Subscribe to it in the ntfy app.";
    syncPhone();
  });
  copyBtn.addEventListener("click", () => {
    copyText(settings.phoneTopic).then(() => toast("Topic copied."), () => toast("Couldn't copy. Select the topic and copy it by hand.", { tone: "alert" }));
  });
  titles.box.addEventListener("change", () => { settings.phoneTitles = titles.box.checked; saveSettings(); syncPhone(); });
  testBtn.addEventListener("click", async () => {
    status.textContent = "Sending…";
    try {
      await ntfyPost({ title: "TaskPulse - test", message: "Phone reminders are working.", tags: "white_check_mark" });
      status.textContent = "Sent. Check your phone.";
    } catch (err) {
      status.textContent = "Couldn't reach ntfy.sh. Check your connection.";
      console.warn(err);
    }
  });
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

  scanLate();
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
      case "w": go("week"); break;
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
  startClock();
  buildFilterChips();
  initBoardEvents();
  initQuickAdd();
  initNewForm();
  initDialogs();
  initSettings();
  initReport();
  initKeyboard();
  initRouter();
  
  try { if (typeof initPlayground === "function") initPlayground(); } catch (err) { console.error("TaskPulse: playground failed to start.", err); }
  initAlertSettings();
  initAlerts();

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
window.taskpulse = {
  store, state, settings,
  drag: window.taskpulseDrag,
  sound: window.taskpulseSound,
  debug: { createHand, pinIn, unpinOut, noteEls, queueHand },
};