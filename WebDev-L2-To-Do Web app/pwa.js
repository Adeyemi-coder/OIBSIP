/**
 * TaskPulse - pwa.js  (load LAST, after extras.js)
 * Offline support, install button, update prompt, theme-colour sync.
 */
(() => {
  "use strict";

  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let deferredPrompt = null;

  /* ---------- Install buttons (top bar + settings) ---------- */
  const DL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>';
  const topBtn = el("button", "btn btn-glass btn-sm install-btn");
  topBtn.type = "button";
  topBtn.hidden = true;
  topBtn.innerHTML = `${DL_ICON}<span>Install</span>`;
  $("settings-btn").before(topBtn);

  const section = document.createElement("section");
  section.className = "settings-section";
  section.innerHTML = '<h3>App</h3><p class="meta-line" id="pwa-note"></p>' +
    `<div class="data-actions"><button type="button" class="btn btn-glass btn-sm install-btn" id="pwa-install" hidden>${DL_ICON}<span>Install TaskPulse</span></button></div>`;
  $("settings-dialog").querySelector(".settings-form").append(section);
  const setBtn = $("pwa-install");

  function refreshInstallUI() {
    const note = $("pwa-note");
    if (isStandalone()) {
      topBtn.hidden = true;
      setBtn.hidden = true;
      note.textContent = "Installed. TaskPulse works offline and saves everything on this device.";
      return;
    }
    const canInstall = Boolean(deferredPrompt) || isIOS;
    topBtn.hidden = !canInstall;
    setBtn.hidden = !canInstall;
    note.textContent = isIOS
      ? "On iPhone or iPad: tap Share, then “Add to Home Screen”."
      : deferredPrompt
        ? "Install TaskPulse like a normal app: its own icon, its own window, works offline."
        : "To install, use your browser's menu (“Install app” or “Add to Home screen”). Works offline once loaded.";
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      refreshInstallUI();
    } else if (isIOS) {
      toast("Tap the Share button, then “Add to Home Screen”.", { timeout: 10000 });
    }
  }
  topBtn.addEventListener("click", install);
  setBtn.addEventListener("click", install);

  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; refreshInstallUI(); });
  window.addEventListener("appinstalled", () => { deferredPrompt = null; refreshInstallUI(); toast("TaskPulse is installed."); });
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", refreshInstallUI);
  refreshInstallUI();

  /* ---------- Offline / online notices ---------- */
  window.addEventListener("offline", () => toast("You're offline. Everything still works and saves on this device. Voice needs internet.", { timeout: 7000 }));
  window.addEventListener("online", () => toast("Back online."));

  /* ---------- Keep the browser bar colour in sync with the theme ---------- */
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) { metaTheme = document.createElement("meta"); metaTheme.name = "theme-color"; document.head.append(metaTheme); }
  function syncThemeColor() {
    const rgb = getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g);
    if (!rgb || rgb.length < 3) return;
    const alpha = rgb[3] === undefined ? 1 : Number(rgb[3]);
    if (alpha === 0) return;
    metaTheme.content = `#${rgb.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("")}`;
  }
  new MutationObserver(syncThemeColor).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  syncThemeColor();

  /* ---------- Tab icon: add it if index.html doesn't already have one ---------- */
  if (!document.querySelector('link[rel~="icon"]')) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.href = "icons/favicon-48.png";
    document.head.append(icon);
  }

  /* ---------- Local-first data should survive low-storage clean-ups ---------- */
  navigator.storage?.persist?.().catch(() => {});

  /* ---------- Service worker ---------- */
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });

  navigator.serviceWorker.register("./sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          toast("A new version of TaskPulse is ready.", {
            actionLabel: "Update",
            timeout: 20000,
            onAction: () => worker.postMessage({ type: "SKIP_WAITING" }),
          });
        }
      });
    });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch((err) => console.error("TaskPulse: offline support could not start.", err));

  navigator.serviceWorker.ready.then(() => {
    try {
      if (localStorage.getItem("taskpulse:offline-ready")) return;
      localStorage.setItem("taskpulse:offline-ready", "1");
    } catch { /* ignore */ }
    toast("TaskPulse is ready to work offline.");
  });
})();