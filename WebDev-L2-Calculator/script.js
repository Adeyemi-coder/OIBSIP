/* VERDANT - Calculator Engine */

"use strict";

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const coarsePointer = window.matchMedia("(pointer: coarse)");

// ---------------------------------------------------------
// 1. STATE MANAGEMENT
// ---------------------------------------------------------
const OPERATORS = { add: "+", subtract: "−", multiply: "×", divide: "÷" };
const MAX_DIGITS = 12;
const MAX_EXPR = 80; 

const state = {
  current: "0",          // Kept as string to preserve decimals like "5." or "0.50"
  previous: null,
  operator: null,        // 'add', 'subtract', 'multiply', 'divide'
  expression: "",        // The running line above the result
  waiting: false,        // True after an operator: next digit starts a new number
  justEvaluated: false,  // True after '=': next digit starts a fresh calculation
  hasError: false,
  lastOperator: null,    // For repeated '=' presses
  lastOperand: null,
  fresh: false,          // True after memory recall/percent: next digit replaces the screen
  memory: 0
};

const sci = {            // Scientific mode state
  expr: "",
  preview: "0",
  result: null,
  justEvaluated: false,
  error: ""
};

let mode = "basic";      // 'basic' | 'sci' | 'nursing' | 'convert'

// Safe storage wrapper (handles private mode or file:// blocking localStorage)
const store = {
  get: function (key, fallback) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (error) { return fallback; }
  },
  set: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }
};
state.memory = Number(store.get("verdant.memory", 0)) || 0;

// ---------------------------------------------------------
// 2. CORE MATH & PARSING
// ---------------------------------------------------------

// Basic mode arithmetic (No eval)
function calculate(a, operator, b) {
  switch (operator) {
    case "add":      return a + b;
    case "subtract": return a - b;
    case "multiply": return a * b;
    case "divide":   return b === 0 ? null : a / b;
    default:         return b;
  }
}

function safeCalculate(a, operator, b) {
  const result = calculate(a, operator, b);
  if (result === null) { showError("Error", "Cannot divide by zero"); return null; }
  if (!Number.isFinite(result)) { showError("Overflow", "Result too large"); return null; }
  return result;
}

// Removes JS float artifacts (0.1 + 0.2 = 0.3 instead of 0.30000000000000004)
function formatNumber(n) {
  const rounded = Number(n.toPrecision(12));
  if (rounded === 0) return "0";
  const abs = Math.abs(rounded);
  if (abs >= 1e12 || abs < 1e-9) return rounded.toExponential(6).replace(/\.?0+e/, "e");
  return String(rounded);
}

// Sci Mode Parser (Handles brackets, exponents, and implicit multiplication without eval)
function evaluateExpression(source) {
  const text = source.replace(/\s+/g, "");
  if (text === "") return { ok: false, empty: true, message: "Nothing to calculate" };
  
  const tokens = [];
  const pattern = /([0-9]+\.?[0-9]*|\.[0-9]+)|([+−×÷^()√πe])/y;
  let position = 0;
  
  while (position < text.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(text);
    if (!match) return { ok: false, message: "Check the expression" };
    tokens.push(match[1] !== undefined ? { t: "n", v: parseFloat(match[1]) } : { t: match[2] });
    position = pattern.lastIndex;
  }
  
  let i = 0;
  const peek = function () { return tokens[i]; };
  const startsValue = function (tok) {
    return !!tok && (tok.t === "n" || tok.t === "(" || tok.t === "√" || tok.t === "π" || tok.t === "e");
  };

  function parseExpr() {
    let value = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "−")) {
      const op = tokens[i++].t;
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseUnary();
    for (;;) {
      const tok = peek();
      if (!tok) break;
      if (tok.t === "×") { i++; value *= parseUnary(); }
      else if (tok.t === "÷") {
        i++;
        const right = parseUnary();
        if (right === 0) throw new Error("Cannot divide by zero");
        value /= right;
      } else if (startsValue(tok)) { value *= parseUnary(); } // Implicit multiplication: 2(3)
      else break;
    }
    return value;
  }

  function parseUnary() {
    const tok = peek();
    if (tok && tok.t === "−") { i++; return -parseUnary(); }
    if (tok && tok.t === "+") { i++; return parseUnary(); }
    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();
    const tok = peek();
    if (tok && tok.t === "^") {
      i++;
      const exponent = parseUnary(); 
      if (base === 0 && exponent < 0) throw new Error("Cannot divide by zero");
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePrimary() {
    const tok = tokens[i++];
    if (!tok) throw new Error("Incomplete expression");
    if (tok.t === "n") return tok.v;
    if (tok.t === "π") return Math.PI;
    if (tok.t === "e") return Math.E;
    if (tok.t === "(") {
      const value = parseExpr();
      if (!peek() || peek().t !== ")") throw new Error("Missing closing bracket");
      i++;
      return value;
    }
    if (tok.t === "√") {
      const operand = parsePrimary();
      if (operand < 0) throw new Error("Square root of a negative number");
      return Math.sqrt(operand);
    }
    throw new Error("Check the expression");
  }

  try {
    const value = parseExpr();
    if (i < tokens.length) throw new Error("Check the expression");
    if (Number.isNaN(value)) throw new Error("Not a real number");
    if (!Number.isFinite(value)) throw new Error("Result too large");
    return { ok: true, value: value };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function balanceParens(expr) { 
  const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
  return open > 0 ? expr + ")".repeat(open) : expr;
}

// ---------------------------------------------------------
// 3. BASIC MODE INPUT RULES
// ---------------------------------------------------------
function resetAll() {
  Object.assign(state, { 
    current: "0", previous: null, operator: null, expression: "", waiting: false,
    justEvaluated: false, hasError: false, lastOperator: null, lastOperand: null, fresh: false 
  });
}

function showError(display, message) {
  resetAll();
  state.hasError = true;
  state.current = display;
  state.expression = message;
  speak(message);
}

function prepareForNumber() {
  if (state.hasError || state.justEvaluated) resetAll();
  if (state.waiting || state.fresh) { state.current = "0"; state.waiting = false; state.fresh = false; }
}

function inputDigit(digit) {
  prepareForNumber();
  if (state.current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
  state.current = state.current === "0" ? digit : state.current + digit;
}

function inputDecimal() {
  prepareForNumber();
  if (state.current.includes(".")) return;
  state.current += ".";
}

function chooseOperator(name) {
  if (state.hasError) return;
  const symbol = OPERATORS[name];
  state.fresh = false;
  
  if (state.waiting && state.operator) {
    state.operator = name;
    state.expression = state.expression.slice(0, -1) + symbol;
    return;
  }
  
  if (state.justEvaluated) {
    state.previous = Number(state.current);
    state.expression = state.current + " " + symbol;
    state.justEvaluated = false;
  } else if (state.operator) {
    const result = safeCalculate(state.previous, state.operator, Number(state.current));
    if (result === null) return;
    state.expression += " " + state.current.replace(/\.$/, "") + " " + symbol;
    state.previous = result;
    state.current = formatNumber(result);
  } else {
    state.previous = Number(state.current);
    state.expression = state.current.replace(/\.$/, "") + " " + symbol;
  }
  
  state.operator = name;
  state.waiting = true;
}

function pressEquals() {
  if (state.hasError) return;
  let a, operator, b, expression;
  
  if (state.operator) {
    a = state.previous; operator = state.operator; b = Number(state.current);
    expression = state.expression + " " + state.current.replace(/\.$/, "");
  } else if (state.justEvaluated && state.lastOperator) {
    a = Number(state.current); operator = state.lastOperator; b = state.lastOperand;
    expression = state.current + " " + OPERATORS[operator] + " " + formatNumber(b);
  } else {
    return;
  }
  
  const result = safeCalculate(a, operator, b);
  if (result === null) return;
  const text = formatNumber(result);
  
  Object.assign(state, { 
    lastOperator: operator, lastOperand: b, previous: null, operator: null,
    waiting: false, fresh: false, justEvaluated: true, current: text, expression: expression + " =" 
  });
  finishEvaluation(expression, text);
}

function backspace() {
  if (state.hasError) { resetAll(); return; }
  if (state.justEvaluated || state.waiting || state.fresh) return;
  state.current = state.current.slice(0, -1);
  if (state.current === "" || state.current === "-") state.current = "0";
}

function negate() {
  if (state.hasError || state.waiting || Number(state.current) === 0) return;
  state.current = state.current.startsWith("-") ? state.current.slice(1) : "-" + state.current;
}

function percent() {
  if (state.hasError || state.waiting) return;
  const value = Number(state.current);
  // Shop till behavior: 200 + 10% = 220. Otherwise just divide by 100.
  const ofBase = state.operator && state.previous !== null && (state.operator === "add" || state.operator === "subtract");
  state.current = formatNumber(ofBase ? state.previous * value / 100 : value / 100);
  state.fresh = true;
}

function memoryAction(action) {
  if (action === "mc") {
    state.memory = 0;
    speak("Memory cleared");
  } else if (action === "mr") {
    if (state.memory === 0) { speak("Memory is empty"); return; }
    if (state.hasError) resetAll();
    if (state.justEvaluated) { state.previous = null; state.operator = null; state.expression = ""; state.justEvaluated = false; }
    state.current = formatNumber(state.memory);
    state.waiting = false;
    state.fresh = true;
    speak("Memory recalled, " + state.current);
  } else {
    if (state.hasError) return;
    const value = Number(state.current);
    if (!Number.isFinite(value)) return;
    state.memory = Number((state.memory + (action === "mplus" ? value : -value)).toPrecision(12));
    state.fresh = true;
    speak("Memory is now " + formatNumber(state.memory));
  }
  store.set("verdant.memory", state.memory);
}

// ---------------------------------------------------------
// 4. SCI MODE INPUT RULES
// ---------------------------------------------------------
const SCI_OPS = "+−×÷^";

function sciReset() {
  sci.expr = ""; sci.preview = "0"; sci.result = null; sci.justEvaluated = false; sci.error = "";
}

function sciInput(value) {
  if (sci.error) sciReset();
  const isOperator = value.length === 1 && SCI_OPS.includes(value);
  
  if (sci.justEvaluated) {
    const carried = sci.result ? sci.result.replace("-", "−") : "";
    sci.expr = isOperator && /^−?[0-9.]+$/.test(carried) ? carried : "";
    sci.justEvaluated = false;
    sci.result = null;
  }
  
  let expr = sci.expr;
  const last = expr.slice(-1);
  if (expr.length + value.length > MAX_EXPR) return;
  
  if (isOperator) {
    if (expr === "") { if (value !== "−") return; }
    else if (last === "(") { if (value !== "−") return; }
    else if (SCI_OPS.includes(last)) {
      if (!(value === "−" && "×÷^".includes(last))) expr = expr.slice(0, -1);
    }
  } else if (value === ".") {
    const number = expr.match(/[0-9.]*$/)[0];
    if (number.includes(".")) return;
    if (number === "") value = "0.";
  } else if (value === ")") {
    const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    if (open <= 0 || expr === "" || last === "(" || SCI_OPS.includes(last)) return;
  }
  sci.expr = expr + value;
}

function sciBackspace() {
  if (sci.error) { sciReset(); return; }
  if (sci.justEvaluated) return;
  sci.expr = sci.expr.slice(0, -1);
}

function sciInsertValue(text) { 
  if (sci.error) sciReset();
  if (sci.justEvaluated) { sci.expr = ""; sci.justEvaluated = false; sci.result = null; }
  if (/e/i.test(text)) return; 
  let part = text.replace("-", "−");
  if (part.startsWith("−") && sci.expr !== "") part = "(" + part + ")";
  if (sci.expr.length + part.length <= MAX_EXPR) sci.expr += part;
}

function updateSciPreview() {
  if (!sci.expr) { sci.preview = "0"; return; }
  const outcome = evaluateExpression(balanceParens(sci.expr));
  if (outcome.ok) sci.preview = formatNumber(outcome.value);
}

function sciEquals() {
  if (sci.error || sci.justEvaluated || !sci.expr) return;
  const closed = balanceParens(sci.expr);
  const outcome = evaluateExpression(closed);
  if (!outcome.ok) { sci.error = outcome.message; speak(outcome.message); return; }
  const text = formatNumber(outcome.value);
  sci.expr = closed;
  sci.result = text;
  sci.preview = text;
  sci.justEvaluated = true;
  finishEvaluation(closed, text, [tail(closed, 18), "=", text]);
}

function handleAction(action, data) {
  feedback(action);
  switch (action) {
    case "digit":     inputDigit(data.value); break;
    case "decimal":   inputDecimal(); break;
    case "operator":  chooseOperator(data.operator); break;
    case "equals":    pressEquals(); break;
    case "clear":     resetAll(); break;
    case "backspace": backspace(); break;
    case "negate":    negate(); break;
    case "percent":   percent(); break;
    case "mc": case "mr": case "mplus": case "mminus": memoryAction(action); break;
    case "sci-input":  sciInput(data.value); updateSciPreview(); break;
    case "sci-back":   sciBackspace(); updateSciPreview(); break;
    case "sci-clear":  sciReset(); break;
    case "sci-equals": sciEquals(); break;
  }
  render();
}

function useValue(text) {
  const clean = String(text).trim();
  if (!/^-?[0-9]*\.?[0-9]+(e[+-]?[0-9]+)?$/i.test(clean)) return;
  if (mode === "sci") {
    sciInsertValue(clean);
    updateSciPreview();
  } else {
    if (mode !== "basic") setMode("basic");
    if (state.hasError) resetAll();
    state.current = clean;
    state.fresh = true;
    state.waiting = false;
    if (!(state.operator && state.previous !== null)) {
      state.previous = null; state.operator = null; state.expression = ""; state.justEvaluated = false;
    }
  }
  speak("Loaded " + clean);
  render();
}

// ---------------------------------------------------------
// 5. RENDERING & DISPLAY
// ---------------------------------------------------------
const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const memBadge = document.getElementById("mem-badge");
const operatorKeys = document.querySelectorAll("#keypad .key--operator");

function tail(text, length) {
  return text.length > length ? "…" + text.slice(-(length - 1)) : text;
}

// Helper to add commas to the display without breaking the math engine
function formatDisplayWithCommas(val) {
  if (val === "Error" || val === "Overflow" || val.includes("e")) return val; 
  const parts = val.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function render() {
  let value, line, isError, isPreview = false;
  
  if (mode === "sci") {
    isError = sci.error !== "";
    value = isError ? "Error" : formatDisplayWithCommas(sci.preview);
    line = isError ? sci.error : tail(sci.expr, 30) + (sci.justEvaluated ? " =" : "");
    isPreview = !isError && !sci.justEvaluated && sci.expr !== "";
  } else {
    isError = state.hasError;
    value = formatDisplayWithCommas(state.current);
    line = state.expression;
  }
  
  resultEl.textContent = value;
  const length = value.length;
  if (length > 9) resultEl.dataset.size = "sm";
  else if (length > 7) resultEl.dataset.size = "md";
  else delete resultEl.dataset.size;
  
  resultEl.classList.toggle("is-error", isError);
  resultEl.classList.toggle("is-preview", isPreview);
  expressionEl.textContent = line;
  memBadge.hidden = state.memory === 0;
  
  operatorKeys.forEach(function (key) {
    key.classList.toggle("is-active", state.waiting && key.dataset.operator === state.operator);
  });
}

// ---------------------------------------------------------
// 6. HISTORY, ANNOUNCER & TOAST
// ---------------------------------------------------------
const announcer = document.getElementById("announcer");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const clearHistoryButton = document.querySelector('[data-action="clear-history"]');
const ringLayer = document.getElementById("echo-layer");
const toastEl = document.getElementById("toast");
const HISTORY_KEY = "verdant.history";
const HISTORY_MAX = 20;
const rings = [];
let ringCount = 0;
let toastTimer = null;
let historyData = store.get(HISTORY_KEY, []); 

if (!Array.isArray(historyData)) historyData = [];
historyData = historyData.filter(function (entry) {
  return entry && typeof entry.t === "string" && typeof entry.r === "string";
}).slice(0, HISTORY_MAX);

function toSpoken(text) {
  return text.replace(/\s*\+\s*/g, " plus ").replace(/\s*−\s*/g, " minus ").replace(/\s*×\s*/g, " times ")
             .replace(/\s*÷\s*/g, " divided by ").replace(/\^2/g, " squared ").replace(/\^/g, " to the power of ")
             .replace(/√/g, " square root of ").replace(/π/g, " pi ").replace(/\(/g, " open bracket ")
             .replace(/\)/g, " close bracket ").replace(/(^|\s)-(?=\d)/g, "$1negative ").replace(/\s+/g, " ").trim();
}

function speak(message) {
  announcer.textContent = "";
  setTimeout(function () { announcer.textContent = message; }, 50);
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
}

function finishEvaluation(expression, resultText, tokens) {
  resultEl.classList.remove("is-revealed");
  void resultEl.offsetWidth; // Force CSS animation restart
  resultEl.classList.add("is-revealed");
  speak(toSpoken(expression) + " equals " + toSpoken(resultText));
  addHistory(expression + " = " + resultText, resultText);
  createRing(tokens || expression.split(" ").concat(["=", resultText]));
}

function record(text, resultText, tokens, spoken) {
  addHistory(text, resultText);
  if (tokens && tokens.length) createRing(tokens);
  speak(spoken || text);
  toast("Saved to history");
}

function historyItem(entry) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "history__item";
  button.dataset.result = entry.r;
  button.textContent = entry.t;
  button.setAttribute("aria-label", "Use result " + entry.r + " from " + toSpoken(entry.t));
  item.append(button);
  return item;
}

function renderHistory() {
  historyList.replaceChildren.apply(historyList, historyData.map(historyItem));
  updateHistoryUI();
}

function addHistory(text, result) {
  if (result === undefined) {
    const at = text.lastIndexOf(" = ");
    result = at >= 0 ? text.slice(at + 3) : "";
  }
  historyData.unshift({ t: text, r: String(result) });
  if (historyData.length > HISTORY_MAX) historyData.length = HISTORY_MAX;
  store.set(HISTORY_KEY, historyData);
  renderHistory();
}

function updateHistoryUI() {
  const hasItems = historyData.length > 0;
  historyEmpty.hidden = hasItems;
  clearHistoryButton.hidden = !hasItems;
}

// Creates the 3D floating rings for equations
function createRing(tokens) {
  const count = tokens.length, step = 360 / count, base = (ringCount * 53) % 360;
  const ring = document.createElement("div");
  ring.className = "ring";
  
  tokens.forEach(function (token, k) {
    const glyph = document.createElement("span");
    glyph.className = k === count - 1 ? "glyph glyph--result" : "glyph";
    glyph.textContent = token;
    glyph.style.setProperty("--a", (base + k * step) + "deg");
    glyph.style.setProperty("--z", (-(count - 1 - k) * 36) + "px");
    glyph.style.setProperty("--k", k);
    ring.append(glyph);
  });
  
  ringLayer.append(ring);
  rings.push(ring);
  ringCount++;
  
  // Limit rings based on device performance
  const max = root.classList.contains("lite") ? 2 : (window.innerWidth < 600 ? 3 : 6);
  while (rings.length > max) rings.shift().remove();
  rings.forEach(function (r, i) { r.style.setProperty("--age", rings.length - 1 - i); });
}

function copyText(text) {
  const formattedText = formatDisplayWithCommas(text); // Format before copying
  
  const done = function () { toast("Copied " + formattedText); speak("Copied " + formattedText); };
  const fallback = function () {
    const area = document.createElement("textarea");
    area.value = formattedText; // Use formatted text here
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    document.body.append(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    area.remove();
    if (copied) done(); else toast("Copy is not available here");
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(formattedText).then(done, fallback);
  else fallback();
}

// ---------------------------------------------------------
// 7. MODES & TABS
// ---------------------------------------------------------
const calculatorEl = document.getElementById("calculator");
const displayEl = document.querySelector(".display");
const tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
const panels = {
  basic: document.getElementById("panel-basic"),
  sci: document.getElementById("panel-sci"),
  nursing: document.getElementById("panel-nursing"),
  convert: document.getElementById("panel-convert")
};

function setMode(next, moveFocus) {
  if (!panels[next]) return;
  mode = next;
  tabs.forEach(function (tab) {
    const on = tab.dataset.tab === next;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
    if (on && moveFocus) tab.focus();
  });
  Object.keys(panels).forEach(function (name) { panels[name].hidden = name !== next; });
  calculatorEl.dataset.mode = next;
  displayEl.hidden = next === "nursing" || next === "convert";
  render();
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () { setMode(tab.dataset.tab); });
  tab.addEventListener("keydown", function (event) {
    const index = tabs.indexOf(tab);
    let target = -1;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    if (target < 0) return;
    event.preventDefault();
    setMode(tabs[target].dataset.tab, true);
  });
});

// ---------------------------------------------------------
// 8. EVENT LISTENERS
// ---------------------------------------------------------
function onKeyClick(event) {
  const button = event.target.closest("button[data-action]");
  if (button) handleAction(button.dataset.action, button.dataset);
}

document.querySelectorAll(".keypad, .memrow").forEach(function (group) { 
  group.addEventListener("click", onKeyClick); 
});

clearHistoryButton.addEventListener("click", function () {
  historyData = [];
  store.set(HISTORY_KEY, historyData);
  renderHistory();
});

historyList.addEventListener("click", function (event) {
  const button = event.target.closest(".history__item");
  if (button) useValue(button.dataset.result);
});

document.getElementById("copy-result").addEventListener("click", function () {
  const text = resultEl.textContent;
  if (!text || resultEl.classList.contains("is-error")) { toast("Nothing to copy"); return; }
  copyText(text);
});

const KEY_OPERATORS = { "+": "add", "-": "subtract", "*": "multiply", "x": "multiply", "/": "divide" };
const SCI_KEYS = { "+": "+", "-": "−", "*": "×", "x": "×", "/": "÷", "^": "^", "(": "(", ")": ")",
                   "p": "π", "e": "e", "r": "√(" };

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest("input, select, textarea")) return;
  if (mode === "nursing" || mode === "convert") return;
  const key = event.key;
  if (key === "Enter" && event.target.closest("button, summary, a")) return;
  
  let action = null, data = {};
  
  if (mode === "sci") {
    if (/^[0-9]$/.test(key))                 { action = "sci-input"; data = { value: key }; }
    else if (key === "." || key === ",")     { action = "sci-input"; data = { value: "." }; }
    else if (SCI_KEYS[key])                  { action = "sci-input"; data = { value: SCI_KEYS[key] }; }
    else if (key === "Enter" || key === "=") action = "sci-equals";
    else if (key === "Backspace")            action = "sci-back";
    else if (key === "Escape")               action = "sci-clear";
  } else {
    if (/^[0-9]$/.test(key))      { action = "digit"; data = { value: key }; }
    else if (key === "." || key === ",") action = "decimal";
    else if (KEY_OPERATORS[key])  { action = "operator"; data = { operator: KEY_OPERATORS[key] }; }
    else if (key === "Enter" || key === "=") action = "equals";
    else if (key === "Backspace") action = "backspace";
    else if (key === "Escape")    action = "clear";
    else if (key === "%")         action = "percent";
  }
  
  if (!action) return;
  event.preventDefault();
  handleAction(action, data);
  flashKey(action, data);
});

function flashKey(action, data) {
  let selector;
  if (action === "sci-input") selector = '[data-action="sci-input"][data-value="' + data.value + '"]';
  else if (data.value) selector = '[data-action="digit"][data-value="' + data.value + '"]';
  else if (data.operator) selector = '[data-operator="' + data.operator + '"]';
  else selector = '[data-action="' + action + '"]';
  
  const key = document.querySelector(".key" + selector);
  if (!key) return;
  
  key.classList.add("is-pressed");
  setTimeout(function () { key.classList.remove("is-pressed"); }, 120);
}

// ---------------------------------------------------------
// 9. ENVIRONMENT, SOUND & PERFORMANCE
// ---------------------------------------------------------
const sceneToggle = document.getElementById("scene-toggle");
sceneToggle.addEventListener("click", function () {
  sceneToggle.setAttribute("aria-pressed", document.body.classList.toggle("calm"));
});

document.querySelectorAll("#panel-basic .key").forEach(function (key, i) { 
  key.style.setProperty("--i", i); 
});
setTimeout(function () { root.classList.add("is-ready"); }, 2800);

const soundToggle = document.getElementById("sound-toggle");
const prefs = { sound: store.get("verdant.sound", false) === true };
let audioContext = null;

function beep(frequency) {
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    audioContext = audioContext || new Context();
    if (audioContext.state === "suspended") audioContext.resume();
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  } catch (error) {}
}

function feedback(action) {
  const isEquals = action === "equals" || action === "sci-equals";
  if (coarsePointer.matches && typeof navigator.vibrate === "function") navigator.vibrate(isEquals ? 14 : 7);
  if (prefs.sound) beep(isEquals ? 660 : 880);
}

soundToggle.setAttribute("aria-pressed", prefs.sound ? "true" : "false");
soundToggle.addEventListener("click", function () {
  prefs.sound = !prefs.sound;
  soundToggle.setAttribute("aria-pressed", prefs.sound ? "true" : "false");
  store.set("verdant.sound", prefs.sound);
  if (prefs.sound) beep(660);
});

// Monitor FPS and drop to 'lite' mode if device is struggling
(function watchFrameRate() {
  if (reducedMotion.matches || root.classList.contains("lite")) return;
  const gaps = [];
  let last = 0, begin = 0;
  function tick(time) {
    if (!begin) begin = time;
    if (last) gaps.push(time - last);
    last = time;
    if (time - begin < 3000 && !document.hidden) { requestAnimationFrame(tick); return; }
    if (gaps.length < 20) return;
    gaps.sort(function (a, b) { return a - b; });
    if (gaps[gaps.length >> 1] > 26) root.classList.add("lite");
  }
  setTimeout(function () { requestAnimationFrame(tick); }, 300);
})();

// Pause background animations during scroll to save frames
(function pauseSceneWhileScrolling() {
  let scrolling = false, timer = null;
  window.addEventListener("scroll", function () {
    if (!scrolling) { scrolling = true; root.classList.add("is-scrolling"); }
    clearTimeout(timer);
    timer = setTimeout(function () { scrolling = false; root.classList.remove("is-scrolling"); }, 180);
  }, { passive: true });
})();

// Mouse Parallax (Desktop only)
if (!reducedMotion.matches && finePointer.matches) {
  let targetX = 0, targetY = 0, x = 0, y = 0, frame = null;
  const step = function () {
    x += (targetX - x) * 0.08; 
    y += (targetY - y) * 0.08;
    root.style.setProperty("--px", x.toFixed(3));
    root.style.setProperty("--py", y.toFixed(3));
    const moving = Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001;
    frame = moving ? requestAnimationFrame(step) : null;
  };
  window.addEventListener("pointermove", function (event) {
    if (window.innerWidth < 1024 || root.classList.contains("lite") || root.classList.contains("is-scrolling")) return;
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(step);
  }, { passive: true });
}

// PWA Install & Offline Support
const installButton = document.getElementById("install-btn");
let installPrompt = null;

window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", function () {
  if (!installPrompt) return;
  installPrompt.prompt();
  Promise.resolve(installPrompt.userChoice).catch(function () {}).then(function () {
    installPrompt = null;
    installButton.hidden = true;
  });
});

window.addEventListener("appinstalled", function () { installButton.hidden = true; });

if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

// ---------------------------------------------------------
// 10. EXPORTS & MOBILE TOGGLE
// ---------------------------------------------------------
window.Verdant = {
  useValue: useValue,
  record: record,
  speak: speak,
  toast: toast,
  setMode: setMode,
  formatNumber: formatNumber,
  evaluate: evaluateExpression
};

// Mobile Text Toggle (Runs immediately since script is deferred)
const mobileInfoBtn = document.getElementById("mobile-info-btn");
const collapsibleSections = document.querySelectorAll(".mobile-collapsible");

if (mobileInfoBtn) {
  mobileInfoBtn.addEventListener("click", () => {
    const isExpanded = mobileInfoBtn.getAttribute("aria-expanded") === "true";
    mobileInfoBtn.setAttribute("aria-expanded", !isExpanded);
    
    mobileInfoBtn.querySelector("span").textContent = isExpanded 
      ? "Read Project Info" 
      : "Hide Project Info";

    collapsibleSections.forEach(section => {
      section.classList.toggle("is-open");
    });
  });
}
// ---------------------------------------------------------
// 11. THEME TOGGLE (DARK MODE)
// ---------------------------------------------------------
const themeToggle = document.getElementById("theme-toggle");
const currentTheme = store.get("verdant.theme", "light");

// Apply saved theme on load
if (currentTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.setAttribute("aria-pressed", "true");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.setAttribute("aria-pressed", "false");
      store.set("verdant.theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.setAttribute("aria-pressed", "true");
      store.set("verdant.theme", "dark");
    }
  });
}
// Initial render
render();
renderHistory();