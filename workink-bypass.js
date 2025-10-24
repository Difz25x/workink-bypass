/*
 * workink-bypass.js
 * Wait-for-sendMessage + detection wrapper, plus Work.ink / Volcano handlers
 * Owner: Difz25x
 *
 * NOTE: Debug panel positioned top-right as requested.
 */

(function () {
  "use strict";

  // -------------------------
  // Config & logging helpers
  // -------------------------
  const host = location.hostname;

  const safeLog = (...args) => { console.log("[Bypass]", ...args); };
  const safeWarn = (...args) => { console.warn("[Bypass WARN]", ...args); };
  const safeErr = (...args) => { console.error("[Bypass ERROR]", ...args); };

  // -------------------------
  // Modern debug panel (UI) - TOP RIGHT
  // -------------------------
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    top: "20px",          // moved to top
    right: "20px",        // moved to right
    zIndex: 999999,
    width: "340px",
    height: "100px",
    borderRadius: "14px",
    overflow: "hidden",
    fontFamily: "Inter, Segoe UI, sans-serif",
    boxShadow: "0 0 25px rgba(0,0,0,0.65)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .18s ease, opacity .18s ease"
  });

  const shadow = container.attachShadow ? container.attachShadow({ mode: "closed" }) : container;
  const panelStyle = document.createElement("style");
  panelStyle.textContent = `
    @keyframes shimmer { 0% { background-position: 0% 0% } 100% { background-position: 200% 200% } }
    .panelRoot {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 12px 14px;
      box-sizing: border-box;
      color: #e6eef0;
      background: linear-gradient(135deg,#0f0f10 0%,#1c1c1c 50%,#0f0f10 100%);
      background-size: 200% 200%;
      animation: shimmer 8s linear infinite;
      font-size: 13px;
    }
    .title { font-weight: 600; color: #66e2c3; font-size: 14px; margin-bottom: 6px; text-align:center; }
    .line { font-size: 13px; color: #cbd5da; line-height: 1.3; max-height: 58px; overflow:auto; word-break:break-word; }
    .line.info { color: #93c5fd; }
    .line.success { color: #86efac; }
    .line.warning { color: #ffd580; }
    .line.error { color: #ff9b9b; }
  `;
  const root = document.createElement("div");
  root.className = "panelRoot";
  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = "WorkInk Debug Panel";
  const contentEl = document.createElement("div");
  contentEl.className = "line info";
  contentEl.textContent = "Initializing...";

  root.appendChild(titleEl);
  root.appendChild(contentEl);
  if (shadow.appendChild) {
    shadow.appendChild(panelStyle);
    shadow.appendChild(root);
    document.documentElement.appendChild(container);
  } else {
    container.appendChild(panelStyle);
    container.appendChild(root);
    document.documentElement.appendChild(container);
  }

  function panelShow(key, type = "info", opts = {}) {
    const text = opts.text || ({
      pleaseSolveCaptcha: "Please solve the captcha first...",
      captchaSuccess: "Captcha solved successfully!",
      captchaSuccessBypassing: "Captcha solved. Bypassing...",
      redirectingToWork: "Redirecting to Work.Ink...",
      bypassSuccess: `Bypass success, redirecting in ${opts.time || 5}s...`,
      bypassSuccessCopy: "Copied key successfully!",
      backToCheckpoint: "Returning to checkpoint..."
    }[key] || key);
    try {
      contentEl.textContent = text;
      contentEl.className = `line ${type === "info" ? "info" : type === "success" ? "success" : type === "warning" ? "warning" : "error"}`;
    } catch (e) {}
    safeLog("[panel]", key, type, opts);
  }

  // -------------------------
  // Global captcha promise/resolver (exposed)
  // -------------------------
  try {
    if (typeof unsafeWindow !== "undefined") {
      unsafeWindow.__workink_captcha_promise = new Promise((res) => { unsafeWindow.__workink_captcha_resolve = res; });
    } else {
      window.__workink_captcha_promise = new Promise((res) => { window.__workink_captcha_resolve = res; });
    }
  } catch (e) {
    window.__workink_captcha_promise = new Promise((res) => { window.__workink_captcha_resolve = res; });
  }

  function resolveCaptcha(reason) {
    safeLog("Resolving captcha:", reason);
    panelShow("captchaSuccess", "success", { text: `Captcha resolved (${reason})` });
    try {
      if (typeof unsafeWindow !== "undefined" && typeof unsafeWindow.__workink_captcha_resolve === "function") {
        unsafeWindow.__workink_captcha_resolve();
      } else if (typeof window.__workink_captcha_resolve === "function") {
        window.__workink_captcha_resolve();
      }
    } catch (e) { safeWarn("resolveCaptcha call failed", e); }
  }

  // -------------------------
  // Hook helpers
  // -------------------------
  const CANDIDATE_SEND_NAMES = ["sendMessage", "sendMsg", "writeMessage", "writeMsg", "writMessage"];

  function wrapFunction(owner, name, wrapperFactory) {
    try {
      const orig = owner[name];
      if (typeof orig !== "function") return null;
      const wrapped = wrapperFactory(orig);
      owner[name] = wrapped;
      safeLog("Wrapped function:", name);
      return orig;
    } catch (e) {
      safeWarn("wrapFunction failed for", name, e);
      return null;
    }
  }

  // -------------------------
  // Primary watcher: wait for sendMessage (or any candidate) and wrap it
  // -------------------------
  (function waitForSendMessageAndWrap(timeoutMs = 30000, pollMs = 300) {
    let elapsed = 0;
    panelShow("pleaseSolveCaptcha", "info", { text: "Waiting for site sendMessage..." });

    const intervalId = setInterval(() => {
      elapsed += pollMs;
      try {
        for (const name of CANDIDATE_SEND_NAMES) {
          if (typeof window[name] === "function") {
            clearInterval(intervalId);
            installSendWrapper(window, name);
            return;
          }
        }

        const globals = Object.keys(window);
        for (const g of globals) {
          try {
            const val = window[g];
            if (val && typeof val === "object") {
              for (const name of CANDIDATE_SEND_NAMES) {
                if (typeof val[name] === "function") {
                  clearInterval(intervalId);
                  installSendWrapper(val, name);
                  return;
                }
              }
            }
          } catch (e) {}
        }

        if (elapsed >= timeoutMs) {
          clearInterval(intervalId);
          panelShow("pleaseSolveCaptcha", "warning", { text: "sendMessage not found — using fallback hooks" });
          installFallbackHooks();
        }
      } catch (e) {
        safeWarn("waitForSendMessageAndWrap poll error", e);
      }
    }, pollMs);

    function installSendWrapper(owner, name) {
      try {
        panelShow("pleaseSolveCaptcha", "info", { text: `Wrapping ${name}()` });
        const orig = owner[name];
        owner[name] = function (...args) {
          try {
            const msgType = args[0];
            const payload = args[1];
            safeLog("[sendMessage] ->", msgType, payload);
            if (typeof msgType === "string" && msgType.toLowerCase && msgType.toLowerCase().includes("turnstile")) {
              resolveCaptcha("via sendMessage");
            } else if (msgType === "c_turnstile_response" || (typeof msgType === "string" && msgType === "c_turnstile_response")) {
              resolveCaptcha("via sendMessage (exact)");
            }
          } catch (e) { safeWarn("send wrapper inner error", e); }
          return orig.apply(this, args);
        };
        safeLog("sendMessage wrapper installed on", name);
        installFallbackHooks();
      } catch (e) {
        safeWarn("installSendWrapper failed", e);
        installFallbackHooks();
      }
    }
  })();

  // -------------------------
  // Fallback hooks: WebSocket.send and fetch
  // -------------------------
  function installFallbackHooks() {
    try {
      if (window.WebSocket && window.WebSocket.prototype && typeof window.WebSocket.prototype.send === "function") {
        const wsProto = window.WebSocket.prototype;
        if (!wsProto._bypass_wrapped) {
          const origSend = wsProto.send;
          wsProto.send = function (data, ...rest) {
            try {
              const text = (typeof data === "string") ? data : (data && data.toString ? data.toString() : "");
              if (text && /turnstile|c_turnstile_response/i.test(text)) {
                resolveCaptcha("via WebSocket.send");
              }
            } catch (e) {}
            return origSend.apply(this, [data, ...rest]);
          };
          wsProto._bypass_wrapped = true;
          safeLog("Installed WebSocket.send fallback hook");
        }
      }
    } catch (e) { safeWarn("WebSocket fallback hook failed", e); }

    try {
      if (!window._bypass_fetch_wrapped && typeof window.fetch === "function") {
        const origFetch = window.fetch;
        window.fetch = function (...args) {
          try {
            const url = args[0] && args[0].toString ? args[0].toString() : "";
            if (url && /turnstile|cloudflare/i.test(url)) {
              resolveCaptcha("via fetch URL");
            }
          } catch (e) {}
          return origFetch.apply(this, args).then((resp) => resp);
        };
        window._bypass_fetch_wrapped = true;
        safeLog("Installed fetch fallback hook");
      }
    } catch (e) { safeWarn("fetch fallback hook failed", e); }
  }

  // -------------------------
  // WorkInk & Volcano handlers
  // -------------------------
  function handleVolcano() {
    const dtcAttempt = 40;
    const poll = 700;
    panelShow("pleaseSolveCaptcha", "info");

    function getContinue() {
      const buttons = document.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]');
      for (const btn of buttons) {
        const text = (btn.innerText || btn.value || "").trim().toLowerCase();
        if (text.includes("continue") || text.includes("next step")) {
          const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
          const style = getComputedStyle(btn);
          const visible = style.display !== "none" && style.visibility !== "hidden" && btn.offsetParent;
          if (visible && !disabled) return btn;
        }
      }
      return null;
    }

    function getCopy() {
      return document.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']");
    }

    let alreadyDoneContinue = false;
    let attempts = 0;

    function actOnCheckpoint() {
      if (!alreadyDoneContinue) {
        const btn = getContinue();
        if (btn) {
          alreadyDoneContinue = true;
          panelShow("captchaSuccess", "success");
          safeLog("[Volcano] Captcha solved");

          setTimeout(() => {
            try {
              btn.click();
              panelShow("redirectingToWork", "info");
              safeLog("[Volcano] Clicking Continue");
            } catch (err) { safeWarn("[Volcano] Click Continue error", err); }
          }, 300);
        }
      }

      const copyBtn = getCopy();
      if (copyBtn) {
        setTimeout(() => {
          try {
            copyBtn.click();
            panelShow("bypassSuccessCopy", "success");
            safeLog("[Volcano] Copy clicked");
          } catch (err) { safeWarn("[Volcano] Copy click error", err); }
        }, 150);
      }
    }

    function tryDetect() {
      attempts++;
      const btn = getContinue();
      const copyBtn = getCopy();
      if (btn || copyBtn) {
        safeLog(`[Volcano] Detect success (attempt ${attempts})`);
        actOnCheckpoint();
        return true;
      }
      if (attempts >= dtcAttempt) {
        safeLog("[Volcano] No more poll attempts.");
        return false;
      }
      return false;
    }

    setTimeout(tryDetect, 300);
    const pollInterval = setInterval(() => { if (!tryDetect()) clearInterval(pollInterval); }, poll);
    const mo = new MutationObserver(() => tryDetect());
    mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    safeLog("handleVolcano: waiting for captcha/continue");
  }

  function handleWorkInk() {
    panelShow("pleaseSolveCaptcha", "info");
    const startTime = Date.now();
    let sessionController = null;
    let sendMessageA = null;
    let onLinkInfoA = null;
    let onLinkDestinationA = null;
    let captchaDone = false;

    const map = {
      sendM: ["sendMessage", "sendMsg", "writeMessage", "writeMsg", "writMessage"],
      onLI: ["onLinkInfo"],
      onLD: ["onLinkDestination"],
    };
    const types = {
      mo: "c_monetization",
      ss: "c_social_started",
      tr: "c_turnstile_response",
      ad: "c_adblocker_detected",
    };

    (function main() {
      setupInterception();
      removeAds();
      safeLog("handleWorkInk: boot");
    })();

    function findMethod(obj, names) {
      for (const name of names) if (typeof obj[name] === "function") return { fn: obj[name], name };
      return { fn: null, name: null };
    }

    function spoofWorkink() {
      if (!sessionController || !sessionController.linkInfo) return;
      try {
        (sessionController.linkInfo.socials || []).forEach((social) => {
          try { sendMessageA.call(this, types.ss, { url: social.url }); } catch (e) {}
        });
      } catch (e) {}
      try {
        const monetizations = sessionController.linkInfo.monetizations || [];
        for (const idx in monetizations) {
          const monetization = monetizations[idx];
          try {
            switch (monetization) {
              case 22:
                sendMessageA.call(this, types.mo, { type: "readArticles2", payload: { event: "read" } });
                break;
              case 25:
                sendMessageA.call(this, types.mo, { type: "operaGX", payload: { event: "start" } });
                sendMessageA.call(this, types.mo, { type: "operaGX", payload: { event: "installClicked" } });
                try {
                  fetch("https://work.ink/_api/v2/callback/operaGX", {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ noteligible: true }),
                  }).catch(() => {});
                } catch (e) {}
                break;
              case 34:
                sendMessageA.call(this, types.mo, { type: "norton", payload: { event: "start" } });
                sendMessageA.call(this, types.mo, { type: "norton", payload: { event: "installClicked" } });
                break;
              case 71:
                sendMessageA.call(this, types.mo, { type: "externalArticles", payload: { event: "start" } });
                sendMessageA.call(this, types.mo, { type: "externalArticles", payload: { event: "installClicked" } });
                break;
              case 45:
                sendMessageA.call(this, types.mo, { type: "pdfeditor", payload: { event: "installed" } });
                break;
              case 57:
                sendMessageA.call(this, types.mo, { type: "betterdeals", payload: { event: "installed" } });
                break;
              default:
                safeLog("[WorkInk] Unknown monetization:", monetization);
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // Watchdog counters
    let captchaRetryCount = 0;
    let consecutiveStuck = 0;

    function clearSiteCookies() {
      try {
        const cookies = document.cookie ? document.cookie.split("; ") : [];
        for (const cookie of cookies) {
          const [name] = cookie.split("=");
          const n = (name || "").trim();
          if (!n) continue;
          try { document.cookie = encodeURIComponent(n) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;"; } catch (e) {}
          try { document.cookie = encodeURIComponent(n) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + (location.pathname || "/") + ";"; } catch (e) {}
        }
        safeLog("[WorkInk] Cleared cookies for", location.hostname);
      } catch (e) { safeWarn("clearSiteCookies failed", e); }
    }

    function createSendProxy() {
      return function (...args) {
        try {
          const [msgType] = args;
          safeLog("[WorkInk] Send this Message Types:", msgType, args[1]);
          if (msgType !== types.ad) safeLog("[WorkInk] Sent:", msgType, args[1]);

          if (captchaDone) return sendMessageA.apply(this, args);

          const start = Date.now();
          const interval = setInterval(() => {
            try {
              if (captchaDone) {
                clearInterval(interval);
                captchaRetryCount = 0;
                consecutiveStuck = 0;
                return;
              }

              // Primary detection: server-side turnstile message
              if (msgType === types.tr || (typeof msgType === "string" && msgType.toLowerCase && msgType.toLowerCase().includes("turnstile"))) {
                captchaDone = true;
                clearInterval(interval);
                safeLog("[WorkInk] Captcha bypassed via tr");
                panelShow("captchaSuccessBypassing", "success");
                spoofWorkink.call(this);
                captchaRetryCount = 0;
                consecutiveStuck = 0;
                resolveCaptcha("via createSendProxy (msgType)");
                return sendMessageA.apply(this, args);
              }

              // DOM fallback: "Go To Destination" button present
              const btn = document.querySelector(".button.large.accessBtn.pos-relative.svelte-bv7qlp");
              const elapsed = (Date.now() - start) / 1000;

              if (btn && btn.textContent && btn.textContent.includes("Go To Destination")) {
                captchaDone = true;
                clearInterval(interval);
                safeLog("[WorkInk] Captcha bypassed via DOM button");
                panelShow("captchaSuccessBypassing", "success");
                try { btn.click(); } catch (e) {}
                spoofWorkink.call(this);
                captchaRetryCount = 0;
                consecutiveStuck = 0;
                resolveCaptcha("via DOM button");
                return sendMessageA.apply(this, args);
              }

              if (elapsed > 5) {
                clearInterval(interval);
                captchaRetryCount++;
                consecutiveStuck++;
                safeWarn(`[WorkInk] Captcha timeout — retrying (#${captchaRetryCount}), consecutive stuck: ${consecutiveStuck}`);
                panelShow("pleaseSolveCaptcha", "warning", { text: `Captcha not detected, retrying... (#${captchaRetryCount})` });

                if (consecutiveStuck >= 2) {
                  safeWarn("[WorkInk] Captcha stuck twice — clearing cookies and reloading...");
                  clearSiteCookies();
                  setTimeout(() => window.location.reload(), 1000);
                  return;
                }

                setTimeout(() => {
                  try { createSendProxy().call(this, ...args); } catch (e) { safeErr("[WorkInk] Error retrying send proxy", e); }
                }, 300);
              }
            } catch (e) { /* ignore per-interval errors */ }
          }, 500);

          return sendMessageA.apply(this, args);
        } catch (e) {
          safeErr("createSendProxy outer error", e);
          try { return sendMessageA.apply(this, args); } catch (e2) {}
        }
      };
    }

    function createLinkInfoProxy() {
      return function (...args) {
        try {
          const [info] = args;
          safeLog("[WorkInk] Link info:", info);
          try {
            Object.defineProperty(info, "isAdblockEnabled", {
              get: () => false,
              set: () => {},
              configurable: false,
              enumerable: true,
            });
          } catch (e) {}
          return onLinkInfoA.apply(this, args);
        } catch (e) {
          safeErr("createLinkInfoProxy error", e);
          try { return onLinkInfoA.apply(this, args); } catch (e2) {}
        }
      };
    }

    function redirect(url) {
      try { window.location.href = url; } catch (e) { safeErr("redirect failed", e); }
    }

    function startCountdown(url, waitLeft) {
      try {
        safeLog("[WorkInk] Countdown started:", waitLeft, "seconds");
        panelShow("bypassSuccess", "warning", { time: Math.ceil(waitLeft) });
        const interval = setInterval(() => {
          waitLeft -= 1;
          if (waitLeft > 0) {
            safeLog("[WorkInk] Time remaining:", waitLeft);
            panelShow("bypassSuccess", "warning", { time: Math.ceil(waitLeft) });
          } else {
            clearInterval(interval);
            redirect(url);
          }
        }, 1000);
      } catch (e) { safeErr("startCountdown failed", e); }
    }

    function createDestinationProxy() {
      return function (...args) {
        try {
          const [data] = args;
          safeLog("[WorkInk] Destination:", data);
          const secondsPassed = (Date.now() - startTime) / 1000;
          const currentUrl = window.location.href;
          let waitTimeSeconds;
          if (currentUrl.includes("42rk6hcq")) waitTimeSeconds = 25;
          else if (currentUrl.includes("ito4wckq")) waitTimeSeconds = 25;
          else if (currentUrl.includes("pzarvhq1")) waitTimeSeconds = 25;
          else waitTimeSeconds = 5;

          if (secondsPassed >= waitTimeSeconds) {
            panelShow("backToCheckpoint", "info");
            redirect(data.url);
          } else {
            startCountdown(data.url, waitTimeSeconds - secondsPassed);
          }

          return onLinkDestinationA.apply(this, args);
        } catch (e) { safeErr("createDestinationProxy error", e); try { return onLinkDestinationA.apply(this, args); } catch (e2) {} }
      };
    }

    function setupProxies() {
      try {
        const send = findMethod(sessionController, map.sendM);
        const info = findMethod(sessionController, map.onLI);
        const dest = findMethod(sessionController, map.onLD);
        if (!send.fn || !info.fn || !dest.fn) return;

        sendMessageA = send.fn;
        onLinkInfoA = info.fn;
        onLinkDestinationA = dest.fn;

        try { Object.defineProperty(sessionController, send.name, { get: createSendProxy, set: (v) => (sendMessageA = v), configurable: false }); } catch (e) { try { sessionController[send.name] = createSendProxy; } catch (e2) {} }
        try { Object.defineProperty(sessionController, info.name, { get: createLinkInfoProxy, set: (v) => (onLinkInfoA = v), configurable: false }); } catch (e) { try { sessionController[info.name] = createLinkInfoProxy; } catch (e2) {} }
        try { Object.defineProperty(sessionController, dest.name, { get: createDestinationProxy, set: (v) => (onLinkDestinationA = v), configurable: false }); } catch (e) { try { sessionController[dest.name] = createDestinationProxy; } catch (e2) {} }

        safeLog("SessionController proxies installed:", send.name, info.name, dest.name);
      } catch (e) { safeWarn("setupProxies failed", e); }
    }

    function checkController(target, prop, value) {
      try {
        safeLog("[WorkInk] Checking:", prop, value);
        if (
          value &&
          typeof value === "object" &&
          findMethod(value, map.sendM).fn &&
          findMethod(value, map.onLI).fn &&
          findMethod(value, map.onLD).fn &&
          !sessionController
        ) {
          sessionController = value;
          safeLog("[WorkInk] Controller detected:", sessionController);
          setupProxies();
        }
      } catch (e) { safeErr("checkController failed", e); }
      return Reflect.set(target, prop, value);
    }

    function createComponentProxy(comp) {
      return new Proxy(comp, {
        construct(target, args) {
          const instance = Reflect.construct(target, args);
          try { if (instance.$$.ctx) instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController }); } catch (e) {}
          return instance;
        }
      });
    }

    function createNodeProxy(node) {
      return async (...args) => {
        const result = await node(...args);
        return new Proxy(result, {
          get: (t, p) => (p === "component" ? createComponentProxy(t.component) : Reflect.get(t, p))
        });
      };
    }

    function createKitProxy(kit) {
      try {
        if (!kit || !kit.start) return [false, kit];
        return [
          true,
          new Proxy(kit, {
            get(target, prop) {
              if (prop === "start") {
                return function (...args) {
                  try {
                    const [nodes, , opts] = args;
                    if (nodes?.nodes && opts?.node_ids) {
                      const idx = opts.node_ids[1];
                      if (nodes.nodes[idx]) nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                    }
                  } catch (e) {}
                  return kit.start.apply(this, args);
                };
              }
              return Reflect.get(target, prop);
            }
          }),
        ];
      } catch (e) { safeWarn("createKitProxy failed", e); return [false, kit]; }
    }

    function setupInterception() {
      try {
        const origPromise = Promise.all;
        let intercepted = false;
        Promise.all = async function (promises) {
          const result = origPromise.call(this, promises);
          if (!intercepted) {
            intercepted = true;
            return await new Promise((resolve) => {
              result.then(([kit, app, ...rest]) => {
                try {
                  const [success, created] = createKitProxy(kit);
                  if (success) Promise.all = origPromise;
                  resolve([created, app, ...rest]);
                } catch (e) { resolve(result); }
              }).catch(() => resolve(result));
            });
          }
          return result;
        };
      } catch (e) { safeWarn("setupInterception failed", e); }
    }

    function removeAds() {
      try {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              try {
                if (node.nodeType === 1) {
                  if (node.classList?.contains("adsbygoogle") || (node.id && /ad|container/i.test(node.id))) node.remove();
                  node.querySelectorAll?.(".adsbygoogle, [id*=ad], [id*=container]").forEach((ad) => {
                    try { ad.remove(); } catch (e) {}
                  });
                }
              } catch (e) {}
            }
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      } catch (e) { safeWarn("removeAds failed", e); }
    }
  } // end handleWorkInk

  // -------------------------
  // Start routing
  // -------------------------
  (function start() {
    try {
      if (host.includes("key.volcano.wtf")) {
        panelShow("pleaseSolveCaptcha", "info");
        safeLog("Starting handler: Volcano");
        handleVolcano();
      } else if (host.includes("work.ink")) {
        panelShow("pleaseSolveCaptcha", "info");
        safeLog("Starting handler: Work.ink");
        try { handleWorkInk(); } catch (e) { safeWarn("handleWorkInk start failed", e); }
      } else {
        safeLog("No handler for host:", host);
      }
    } catch (e) { safeErr("Start routing failed", e); }
  })();
})(); // IIFE end