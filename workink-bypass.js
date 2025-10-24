const DEBUG = true;

const oldLog = unsafeWindow.console.log;
const oldWarn = unsafeWindow.console.warn;
const oldError = unsafeWindow.console.error;

function log(...args) { if (DEBUG) oldLog("[UnShortener]", ...args); }
function warn(...args) { if (DEBUG) oldWarn("[UnShortener]", ...args); }
function error(...args) { if (DEBUG) oldError("[UnShortener]", ...args); }

if (DEBUG) unsafeWindow.console.clear = function () {};

// === Modern Debug Panel ===
const container = unsafeWindow.document.createElement("div");
Object.assign(container.style, {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  zIndex: 999999,
  width: "320px",
  height: "90px",
  borderRadius: "14px",
  overflow: "hidden",
  fontFamily: "Inter, Segoe UI, sans-serif",
  boxShadow: "0 0 25px rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)"
});

const shadow = container.attachShadow({ mode: "closed" });

const style = document.createElement("style");
style.textContent = `
  @keyframes shimmer {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 200%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background: linear-gradient(45deg, #1a1a1a, #2a2a2a, #1a1a1a);
    background-size: 200% 200%;
    animation: shimmer 6s linear infinite, fadeIn 0.4s ease;
    padding: 14px 18px;
    color: #e0e0e0;
  }

  .panel::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.04) 75%, transparent 75%, transparent);
    background-size: 40px 40px;
    mix-blend-mode: overlay;
    animation: shimmer 8s linear infinite;
    z-index: 0;
  }

  .panel h2 {
    margin: 0;
    font-size: 15px;
    color: #00ffd5;
    text-shadow: 0 0 6px rgba(0,255,213,0.5);
  }

  .panel span {
    font-size: 13px;
    opacity: 0.9;
  }

  .pulse {
    position: absolute;
    bottom: 10px;
    right: 14px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #00ffd5;
    box-shadow: 0 0 8px #00ffd5;
    animation: pulseAnim 1.8s infinite;
  }

  @keyframes pulseAnim {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.4); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.8; }
  }
`;

const panel = document.createElement("div");
panel.className = "panel";

const title = document.createElement("h2");
title.textContent = "WorkInk Debug Panel";

const message = document.createElement("span");
message.textContent = "🔒 Please solve the captcha to continue";

const pulse = document.createElement("div");
pulse.className = "pulse";

panel.appendChild(title);
panel.appendChild(message);
panel.appendChild(pulse);
shadow.appendChild(style);
shadow.appendChild(panel);
unsafeWindow.document.documentElement.appendChild(container);

// === Core logic ===
const NAME_MAP = {
  sendMessage: ["sendMessage", "sendMsg", "writeMessage", "writeMsg", "writMessage"],
  onLinkInfo: ["onLinkInfo"],
  onLinkDestination: ["onLinkDestination"]
};

function resolveName(obj, candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const name = candidates[i];
    if (typeof obj[name] === "function") {
      return { fn: obj[name], index: i, name };
    }
  }
  return { fn: null, index: -1, name: null };
}

let _sessionController;
let _sendMessage;
let _onLinkInfo;
let _onLinkDestination;

function getClientPacketTypes() {
  return {
    ANNOUNCE: "c_announce",
    MONETIZATION: "c_monetization",
    SOCIAL_STARTED: "c_social_started",
    RECAPTCHA_RESPONSE: "c_recaptcha_response",
    HCAPTCHA_RESPONSE: "c_hcaptcha_response",
    TURNSTILE_RESPONSE: "c_turnstile_response",
    ADBLOCKER_DETECTED: "c_adblocker_detected",
    FOCUS_LOST: "c_focus_lost",
    OFFERS_SKIPPED: "c_offers_skipped",
    FOCUS: "c_focus",
    WORKINK_PASS_AVAILABLE: "c_workink_pass_available",
    WORKINK_PASS_USE: "c_workink_pass_use",
    PING: "c_ping"
  };
}

function updateHint(text) {
  message.textContent = text;
}

function redirect(url) {
  updateHint("🎉 Redirecting to your destination...");
  window.location.href = url;
}

function startCountdown(url, waitLeft) {
  updateHint(`⏳ Destination found, redirecting in ${waitLeft}s`);
  const interval = setInterval(() => {
    waitLeft--;
    if (waitLeft > 0) {
      updateHint(`⏳ Destination found, redirecting in ${waitLeft}s`);
    } else {
      clearInterval(interval);
      redirect(url);
    }
  }, 1000);
}

function createSendMessageProxy() {
  const clientPacketTypes = getClientPacketTypes();
  return function (...args) {
    const packet_type = args[0];
    const packet_data = args[1];

    if (packet_type !== clientPacketTypes.PING)
      log("Sent message:", packet_type, packet_data);

    if (packet_type === clientPacketTypes.ADBLOCKER_DETECTED) {
      warn("Blocked adblocker detected message.");
      return;
    }

    if (_sessionController.linkInfo && packet_type === clientPacketTypes.TURNSTILE_RESPONSE) {
      const ret = _sendMessage.apply(this, args);
      updateHint("⏳ Captcha solved, bypassing...");
      for (const social of _sessionController.linkInfo.socials)
        _sendMessage.call(this, clientPacketTypes.SOCIAL_STARTED, { url: social.url });
      return ret;
    }

    return _sendMessage.apply(this, args);
  };
}

function createOnLinkInfoProxy() {
  return function (...args) {
    const linkInfo = args[0];
    log("Link info received:", linkInfo);
    Object.defineProperty(linkInfo, "isAdblockEnabled", {
      get() { return false },
      set(v) { log("Attempted to set isAdblockEnabled to:", v); },
      configurable: false,
      enumerable: true
    });
    return _onLinkInfo.apply(this, args);
  };
}

function createOnLinkDestinationProxy() {
  return function (...args) {
    const payload = args[0];
    log("Link destination received:", payload);
    startCountdown(payload.url, 30);
    return _onLinkDestination.apply(this, args);
  };
}

function setupSessionControllerProxy() {
  const sendMessage = resolveName(_sessionController, NAME_MAP.sendMessage);
  const onLinkInfo = resolveName(_sessionController, NAME_MAP.onLinkInfo);
  const onLinkDestination = resolveName(_sessionController, NAME_MAP.onLinkDestination);

  _sendMessage = sendMessage.fn;
  _onLinkInfo = onLinkInfo.fn;
  _onLinkDestination = onLinkDestination.fn;

  const sendMessageProxy = createSendMessageProxy();
  const onLinkInfoProxy = createOnLinkInfoProxy();
  const onLinkDestinationProxy = createOnLinkDestinationProxy();

  Object.defineProperty(_sessionController, sendMessage.name, { get() { return sendMessageProxy }, set(v) { _sendMessage = v } });
  Object.defineProperty(_sessionController, onLinkInfo.name, { get() { return onLinkInfoProxy }, set(v) { _onLinkInfo = v } });
  Object.defineProperty(_sessionController, onLinkDestination.name, { get() { return onLinkDestinationProxy }, set(v) { _onLinkDestination = v } });
  log("SessionController proxies installed.");
}

function checkForSessionController(target, prop, value, receiver) {
  if (
    value && typeof value === "object" &&
    resolveName(value, NAME_MAP.sendMessage).fn &&
    resolveName(value, NAME_MAP.onLinkInfo).fn &&
    resolveName(value, NAME_MAP.onLinkDestination).fn &&
    !_sessionController
  ) {
    _sessionController = value;
    log("Intercepted session controller.");
    setupSessionControllerProxy();
  }
  return Reflect.set(target, prop, value, receiver);
}

function createComponentProxy(component) {
  return new Proxy(component, {
    construct(target, args) {
      const result = Reflect.construct(target, args);
      result.$$.ctx = new Proxy(result.$$.ctx, { set: checkForSessionController });
      return result;
    }
  });
}

function createNodeResultProxy(result) {
  return new Proxy(result, {
    get(target, prop, receiver) {
      if (prop === "component") return createComponentProxy(target.component);
      return Reflect.get(target, prop, receiver);
    }
  });
}

function createNodeProxy(oldNode) {
  return async (...args) => {
    const result = await oldNode(...args);
    return createNodeResultProxy(result);
  };
}

function createKitProxy(kit) {
  if (typeof kit !== "object" || !kit) return [false, kit];
  const originalStart = "start" in kit && kit.start;
  if (!originalStart) return [false, kit];
  const kitProxy = new Proxy(kit, {
    get(target, prop, receiver) {
      if (prop === "start") {
        return function (...args) {
          const appModule = args[0];
          const options = args[2];
          if (typeof appModule === "object" && typeof appModule.nodes === "object" &&
              typeof options === "object" && typeof options.node_ids === "object") {
            const oldNode = appModule.nodes[options.node_ids[1]];
            appModule.nodes[options.node_ids[1]] = createNodeProxy(oldNode);
          }
          log("kit.start intercepted!");
          return originalStart.apply(this, args);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  return [true, kitProxy];
}

function setupSvelteKitInterception() {
  const originalPromiseAll = unsafeWindow.Promise.all;
  let intercepted = false;
  unsafeWindow.Promise.all = async function (promises) {
    const result = originalPromiseAll.call(this, promises);
    if (!intercepted) {
      intercepted = true;
      return await new Promise(resolve => {
        result.then(([kit, app, ...args]) => {
          const [success, wrappedKit] = createKitProxy(kit);
          if (success) unsafeWindow.Promise.all = originalPromiseAll;
          resolve([wrappedKit, app, ...args]);
        });
      });
    }
    return await result;
  };
}

setupSvelteKitInterception();

const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType === 1) {
        if (node.classList?.contains("adsbygoogle")) node.remove();
        node.querySelectorAll?.(".adsbygoogle").forEach(el => el.remove());
      }
    }
  }
});

observer.observe(unsafeWindow.document.documentElement, { childList: true, subtree: true });