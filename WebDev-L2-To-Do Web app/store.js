/**
 * TaskPulse — store.js
 * Local-first data engine: validated CRUD, dates, checklists, carry-over,
 * quick-add parsing, backup/restore and the shift-handover report.
 * No UI code lives in this file, so it can be tested on its own.
 */
"use strict";

const STATUS = Object.freeze({ PENDING: "Pending", COMPLETED: "Completed" });
const CATEGORIES = Object.freeze(["Work", "Clinical", "Study", "Personal", "General"]);
const LIMITS = Object.freeze({ title: 80, context: 60, assignee: 20, notes: 500, checkItem: 80, checkItems: 20 });
const WEEKDAYS = Object.freeze(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);

/* ---------- Small helpers (global so app.js can use them too) ---------- */
const pad2 = (n) => String(n).padStart(2, "0");

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Local calendar day as "YYYY-MM-DD" (never UTC, so late-night tasks stay on the right day). */
function toDateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseDateKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key ?? ""));
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const ok = d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
  return ok ? d : null;
}

function addDays(key, n) {
  const d = parseDateKey(key) ?? new Date();
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

const isValidTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s ?? ""));
const minutesOf = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

function addMinutes(hhmm, mins) {
  const total = Math.min(minutesOf(hhmm) + mins, 23 * 60 + 59);
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

/** "09:00-10:30" -> { start, end } or null. The end must be after the start. */
function parseBlock(block) {
  const m = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(String(block ?? ""));
  if (!m || !isValidTime(m[1]) || !isValidTime(m[2])) return null;
  if (minutesOf(m[2]) <= minutesOf(m[1])) return null;
  return { start: m[1], end: m[2] };
}

const startKey = (task) => parseBlock(task.timeBlock)?.start ?? "99:99";
const isIso = (s) => typeof s === "string" && !Number.isNaN(Date.parse(s));
const clampText = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** "2pm", "14:30", "930", "9am" -> "HH:MM" or null. */
function parseClock(str) {
  const m = /^(\d{1,2})(?::?(\d{2}))?(am|pm)?$/i.exec(String(str ?? ""));
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap) {
    if (h < 1 || h > 12) return null;
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
  }
  if (h > 23 || min > 59) return null;
  return `${pad2(h)}:${pad2(min)}`;
}

/** "14:00-15:30", "9am-10am", "14:00" (defaults to 30 minutes) -> "HH:MM-HH:MM" or null. */
function parseTimeSpec(spec) {
  const [a, b] = String(spec).split("-");
  const start = parseClock(a);
  if (!start) return null;
  const end = b ? parseClock(b) : addMinutes(start, 30);
  const block = end ? `${start}-${end}` : "";
  return parseBlock(block) ? block : null;
}

/** today | tomorrow | tmrw | +3d | ~fri  ->  "YYYY-MM-DD" or null. */
function resolveDateWord(word, now) {
  const w = word.toLowerCase();
  const base = toDateKey(now);
  if (w === "today") return base;
  if (w === "tomorrow" || w === "tmrw") return addDays(base, 1);
  const plus = /^\+(\d{1,3})d$/.exec(w);
  if (plus) return addDays(base, Number(plus[1]));
  if (w.startsWith("~") && w.length >= 4) {
    const idx = WEEKDAYS.findIndex((d) => d.startsWith(w.slice(1)));
    if (idx < 0) return null;
    return addDays(base, ((idx - now.getDay() + 6) % 7) + 1); // next occurrence, 1..7 days ahead
  }
  return null;
}

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

/* ---------- The store ---------- */
class TaskStore {
  static STORAGE_KEY = "taskpulse:tasks:v2";
  static LEGACY_KEY = "taskpulse:tasks:v1";

  #listeners = new Set();

  constructor(storageKey = TaskStore.STORAGE_KEY, { storage } = {}) {
    this.storageKey = storageKey;
    this.persistent = true;
    this.recovered = false;
    this.migrated = false;

    if (storage) {
      this.storage = storage;
    } else {
      try {
        this.storage = localStorage;
        this.storage.getItem(storageKey); // throws when storage is blocked
      } catch {
        this.storage = memoryStorage();
        this.persistent = false;
      }
    }

    this.tasks = this.#load();
    if (this.migrated) this.#save();

    // Keep several open tabs in sync.
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("storage", (e) => {
        if (e.key !== this.storageKey) return;
        this.tasks = this.#load();
        this.#emit({ type: "external" });
      });
    }
  }

  /* ----- events ----- */
  onChange(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }
  #emit(event) {
    for (const fn of this.#listeners) {
      try { fn(event); } catch (err) { console.error("TaskPulse: listener failed.", err); }
    }
  }

  /* ----- persistence ----- */
  #load() {
    let raw = null;
    try {
      raw = this.storage.getItem(this.storageKey);
      if (raw === null && this.storageKey === TaskStore.STORAGE_KEY) {
        const legacy = this.storage.getItem(TaskStore.LEGACY_KEY);
        if (legacy !== null) { raw = legacy; this.migrated = true; }
      }
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed?.tasks;
      if (!Array.isArray(list)) throw new Error("Saved data is not a task list.");
      const seen = new Set();
      return list.map((t) => this.#sanitize(t)).filter((t) => t && !seen.has(t.id) && seen.add(t.id));
    } catch (err) {
      console.error("TaskPulse: saved tasks were unreadable; a backup copy was kept.", err);
      this.#quarantine(raw);
      this.migrated = false;
      return [];
    }
  }

  /** Never overwrite data we couldn't read: copy it aside first. */
  #quarantine(raw) {
    this.recovered = true;
    if (!raw) return;
    try { this.storage.setItem(`${this.storageKey}:corrupt:${Date.now()}`, raw); } catch { /* storage full */ }
  }

  #save() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify({ version: 2, tasks: this.tasks }));
      return true;
    } catch (err) {
      console.error("TaskPulse: could not save tasks.", err);
      this.#emit({ type: "save-error" });
      return false;
    }
  }

  /** Turns anything (old v1 data, imports, form input) into a safe, complete task — or null. */
  #sanitize(raw) {
    if (!raw || typeof raw !== "object") return null;
    const title = clampText(raw.title, LIMITS.title);
    if (!title) return null;

    const createdAt = isIso(raw.createdAt) ? raw.createdAt : new Date().toISOString();
    const status = raw.status === STATUS.COMPLETED ? STATUS.COMPLETED : STATUS.PENDING;
    const category = CATEGORIES.find((c) => c.toLowerCase() === String(raw.category ?? "").toLowerCase()) ?? "General";
    const date = parseDateKey(raw.date) ? raw.date : toDateKey(new Date(createdAt));

    const checklist = Array.isArray(raw.checklist)
      ? raw.checklist.slice(0, LIMITS.checkItems).map((i) => ({
          id: typeof i?.id === "string" && i.id ? i.id.slice(0, 60) : uid(),
          text: clampText(i?.text, LIMITS.checkItem),
          done: Boolean(i?.done),
        })).filter((i) => i.text)
      : [];

    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
      title,
      contextTag: clampText(raw.contextTag, LIMITS.context),
      category,
      date,
      timeBlock: parseBlock(raw.timeBlock) ? raw.timeBlock : "",
      isStat: Boolean(raw.isStat),
      assignee: clampText(raw.assignee, LIMITS.assignee) || "Me",
      notes: String(raw.notes ?? "").replace(/\r/g, "").trim().slice(0, LIMITS.notes),
      checklist,
      status,
      createdAt,
      completedAt: status === STATUS.COMPLETED ? (isIso(raw.completedAt) ? raw.completedAt : new Date().toISOString()) : null,
      carryCount: Number.isInteger(raw.carryCount) && raw.carryCount > 0 ? raw.carryCount : 0,
      originDate: parseDateKey(raw.originDate) ? raw.originDate : date,
    };
  }

  /* ----- reading ----- */
  getTasks() { return [...this.tasks]; }
  getTask(id) { return this.tasks.find((t) => t.id === id) ?? null; }

  isOverdue(task, now = new Date()) {
    if (task.status !== STATUS.PENDING) return false;
    const today = toDateKey(now);
    if (task.date < today) return true;
    const block = parseBlock(task.timeBlock);
    return task.date === today && Boolean(block) && minutesOf(block.end) < now.getHours() * 60 + now.getMinutes();
  }

  /** Pending tasks from days before `key` (what needs carrying over). */
  getOpenBefore(key = toDateKey()) {
    return this.tasks.filter((t) => t.status === STATUS.PENDING && t.date < key);
  }

  getStats(key = toDateKey(), now = new Date()) {
    const day = this.tasks.filter((t) => t.date === key);
    const pending = day.filter((t) => t.status === STATUS.PENDING).length;
    const done = day.filter((t) => t.status === STATUS.COMPLETED).length;
    const total = pending + done;
    return {
      total, pending, done,
      percent: total ? Math.round((done / total) * 100) : 0,
      statOpen: this.tasks.filter((t) => t.isStat && t.status === STATUS.PENDING && t.date <= key).length,
      carried: this.getOpenBefore(key).length,
      overdue: this.tasks.filter((t) => t.date <= key && this.isOverdue(t, now)).length,
    };
  }

  /** What is happening right now, and what is next (today's timed, unfinished tasks). */
  getNowNext(now = new Date()) {
    const today = toDateKey(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const timed = this.tasks
      .filter((t) => t.status === STATUS.PENDING && t.date === today && parseBlock(t.timeBlock))
      .map((t) => ({ t, b: parseBlock(t.timeBlock) }))
      .sort((x, y) => Number(y.t.isStat) - Number(x.t.isStat) || x.b.start.localeCompare(y.b.start));
    return {
      now: timed.filter(({ b }) => minutesOf(b.start) <= nowMin && nowMin < minutesOf(b.end)).map(({ t }) => t),
      next: timed.filter(({ b }) => minutesOf(b.start) > nowMin).sort((x, y) => x.b.start.localeCompare(y.b.start))[0]?.t ?? null,
    };
  }

  /* ----- writing ----- */
  addTask(fields = {}) {
    if (!clampText(fields.title, LIMITS.title)) throw new Error("A task needs a title.");
    if (fields.timeBlock && !parseBlock(fields.timeBlock)) throw new Error("The end time must be after the start time.");
    if (fields.date && !parseDateKey(fields.date)) throw new Error("Pick a valid date.");

    const task = this.#sanitize({
      ...fields,
      id: undefined,
      date: fields.date || toDateKey(),
      status: STATUS.PENDING,
      createdAt: new Date().toISOString(),
      completedAt: null,
      carryCount: 0,
      originDate: undefined,
    });
    this.tasks.push(task);
    this.#save();
    this.#emit({ type: "add", task });
    return task;
  }

  updateTask(id, changes = {}) {
    const task = this.getTask(id);
    if (!task) return null;

    const allowed = ["title", "contextTag", "category", "date", "timeBlock", "isStat", "assignee", "notes", "checklist", "status"];
    const patch = {};
    for (const key of allowed) if (key in changes) patch[key] = changes[key];

    if ("title" in patch && !clampText(patch.title, LIMITS.title)) throw new Error("A task needs a title.");
    if ("timeBlock" in patch && patch.timeBlock && !parseBlock(patch.timeBlock)) throw new Error("The end time must be after the start time.");
    if ("date" in patch && !parseDateKey(patch.date)) throw new Error("Pick a valid date.");

    const nextStatus = patch.status === STATUS.COMPLETED ? STATUS.COMPLETED
      : patch.status === STATUS.PENDING ? STATUS.PENDING : task.status;
    const completedAt = nextStatus === STATUS.COMPLETED
      ? (task.status === STATUS.COMPLETED ? task.completedAt : new Date().toISOString())
      : null;

    const clean = this.#sanitize({ ...task, ...patch, status: nextStatus, completedAt });
    Object.assign(task, clean);
    this.#save();
    this.#emit({ type: "update", task });
    return task;
  }

  toggleStatus(id) {
    const task = this.getTask(id);
    if (!task) return null;
    return this.updateTask(id, { status: task.status === STATUS.COMPLETED ? STATUS.PENDING : STATUS.COMPLETED });
  }

  /** Returns the removed task so the UI can offer "Undo". */
  deleteTask(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index < 0) return null;
    const [removed] = this.tasks.splice(index, 1);
    this.#save();
    this.#emit({ type: "delete", task: removed });
    return removed;
  }

  restoreTask(task) {
    const clean = this.#sanitize(task);
    if (!clean || this.getTask(clean.id)) return null;
    this.tasks.push(clean);
    this.#save();
    this.#emit({ type: "restore", task: clean });
    return clean;
  }

  /** Move unfinished tasks from earlier days onto `toKey` (default: today). */
  carryOver(toKey = toDateKey(), ids) {
    let count = 0;
    for (const t of this.tasks) {
      if (t.status !== STATUS.PENDING || t.date >= toKey) continue;
      if (ids && !ids.includes(t.id)) continue;
      t.date = toKey;
      t.carryCount += 1;
      count += 1;
    }
    if (count) { this.#save(); this.#emit({ type: "carry", count }); }
    return count;
  }

  /* ----- backup & restore ----- */
  exportData() {
    return { app: "taskpulse", version: 2, exportedAt: new Date().toISOString(), tasks: JSON.parse(JSON.stringify(this.tasks)) };
  }

  importData(payload, { mode = "merge" } = {}) {
    const list = Array.isArray(payload) ? payload : payload?.tasks;
    if (!Array.isArray(list)) throw new Error("This file doesn't look like a TaskPulse backup.");
    const clean = list.map((t) => this.#sanitize(t)).filter(Boolean);

    let added = 0;
    if (mode === "replace") {
      this.tasks = clean;
      added = clean.length;
    } else {
      const ids = new Set(this.tasks.map((t) => t.id));
      for (const t of clean) {
        if (ids.has(t.id)) continue;
        this.tasks.push(t);
        ids.add(t.id);
        added += 1;
      }
    }
    this.#save();
    this.#emit({ type: "import", added });
    return { added, skipped: list.length - added };
  }

  clearAll() {
    this.tasks = [];
    this.#save();
    this.#emit({ type: "clear" });
  }

  /* ----- quick add: "Check Bed 4 vitals @14:00 !stat #clinical >Sam [Bed 4] tomorrow" ----- */
  static parseQuickAdd(input, now = new Date()) {
    const out = { title: "", contextTag: "", category: "", assignee: "", timeBlock: "", date: "", isStat: false };
    let text = ` ${String(input ?? "")} `;

    text = text.replace(/\[([^\]]{1,60})\]/, (_, c) => { out.contextTag = clampText(c, LIMITS.context); return " "; });
    text = text.replace(/\s(!stat|!urgent|!)(?=\s)/i, () => { out.isStat = true; return " "; });
    text = text.replace(/\s#([A-Za-z]+)(?=\s)/, (m, w) => {
      const hit = CATEGORIES.find((c) => c.toLowerCase().startsWith(w.toLowerCase()));
      if (!hit) return m;
      out.category = hit;
      return " ";
    });
    text = text.replace(/\s>(\S+)(?=\s)/, (_, n) => { out.assignee = clampText(n, LIMITS.assignee); return " "; });
    text = text.replace(/\s@(\S+)(?=\s)/, (m, spec) => {
      const block = parseTimeSpec(spec);
      if (!block) return m;
      out.timeBlock = block;
      return " ";
    });
    text = text.replace(/\s(today|tomorrow|tmrw|\+\d{1,3}d|~[a-z]+)(?=\s)/i, (m, word) => {
      const key = resolveDateWord(word, now);
      if (!key) return m;
      out.date = key;
      return " ";
    });

    out.title = clampText(text, LIMITS.title);
    return out;
  }

  /* ----- the handover report (plain text, safe to paste into any chat or email) ----- */
  generateHandoverReport({ date = toDateKey(), from = "", shift = "", now = new Date() } = {}) {
    const day = parseDateKey(date) ?? new Date();
    const sameDay = (iso) => Boolean(iso) && toDateKey(new Date(iso)) === date;
    const byTime = (a, b) => a.date.localeCompare(b.date) || startKey(a).localeCompare(startKey(b)) || a.createdAt.localeCompare(b.createdAt);

    const done = this.tasks.filter((t) => t.status === STATUS.COMPLETED && sameDay(t.completedAt))
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    const open = this.tasks.filter((t) => t.status === STATUS.PENDING && t.date <= date).sort(byTime);
    const statOpen = open.filter((t) => t.isStat);
    const otherOpen = open.filter((t) => !t.isStat);
    const later = this.tasks.filter((t) => t.status === STATUS.PENDING && t.date > date).length;

    const shortDay = (key) => (parseDateKey(key) ?? new Date()).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

    const line = (t, { detail = false } = {}) => {
      const parts = [t.status === STATUS.COMPLETED ? "[x]" : "[ ]"];
      if (t.isStat) parts.push("[STAT]");
      if (t.timeBlock) parts.push(t.timeBlock);
      parts.push(t.title);
      if (t.contextTag) parts.push(`(${t.contextTag})`);
      if (t.assignee && t.assignee !== "Me") parts.push(`> ${t.assignee}`);
      if (t.date < date && t.status === STATUS.PENDING) parts.push(`{from ${shortDay(t.date)}${t.carryCount ? `, carried ${t.carryCount}x` : ""}}`);
      const rows = [`  ${parts.join(" ")}`];
      if (detail) {
        for (const item of t.checklist.filter((i) => !i.done)) rows.push(`      - [ ] ${item.text}`);
        if (t.checklist.some((i) => i.done)) rows.push(`      (${t.checklist.filter((i) => i.done).length}/${t.checklist.length} steps done)`);
        if (t.notes) rows.push(`      Note: ${t.notes.replace(/\n+/g, " / ").slice(0, 240)}`);
      }
      return rows.join("\n");
    };

    const section = (title, list, opts) => [`${title} (${list.length})`, list.length ? list.map((t) => line(t, opts)).join("\n") : "  None.", ""];
    const who = [from.trim(), shift.trim() && `${shift.trim()} shift`].filter(Boolean).join(" - ");

    const out = [
      "TASKPULSE - SHIFT HANDOVER",
      day.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    ];
    if (who) out.push(`From: ${who}`);
    out.push("=".repeat(32), "");
    out.push(`Summary: ${done.length} done, ${open.length} still open (${statOpen.length} STAT)${later ? `, ${later} scheduled later` : ""}`, "");
    if (statOpen.length) out.push(...section("STAT - NEEDS ACTION FIRST", statOpen, { detail: true }));
    out.push(...section("STILL OPEN", otherOpen, { detail: true }));
    out.push(...section("COMPLETED", done));
    out.push(`Generated ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    return out.join("\n");
  }

  /** Kept for backwards compatibility with the first version of the app. */
  generateEndOfDayReport(date = new Date()) {
    return this.generateHandoverReport({ date: toDateKey(date), now: date });
  }
}

if (typeof window !== "undefined") window.TaskStore = TaskStore;
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TaskStore, STATUS, CATEGORIES, LIMITS, toDateKey, parseDateKey, addDays,
    parseBlock, minutesOf, parseClock, parseTimeSpec, memoryStorage,
  };
}