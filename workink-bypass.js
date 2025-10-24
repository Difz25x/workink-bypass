// ======================================================
// 🌋 WorkInk & Volcano Unified Handler (Readable Version)
// ======================================================

(function() {
    const debug = true;
    const host = location.hostname;

    // ✅ Modern floating debug panel (black/gray with light animation)
    const container = document.createElement("div");
    Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 999999,
        width: "300px",
        height: "90px",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "Inter, Segoe UI, sans-serif",
        boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)"
    });

    const shadow = container.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
        @keyframes shimmer {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 200%; }
        }

        .panel {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #111 0%, #1c1c1c 50%, #111 100%);
            background-size: 300% 300%;
            animation: shimmer 8s linear infinite;
            color: #e0e0e0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            padding: 10px 14px;
            box-sizing: border-box;
        }

        .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: #76c7ff;
        }

        .panel-text {
            margin-top: 5px;
            font-size: 13px;
            color: #bbb;
        }

        .panel-success { color: #76ffb4; }
        .panel-warning { color: #ffc878; }
        .panel-error { color: #ff7e7e; }
    `;

    const hint = document.createElement("div");
    hint.className = "panel";
    hint.innerHTML = `
        <div class="panel-title">WorkInk Bypass Debug</div>
        <div class="panel-text">Waiting captcha...</div>
    `;

    shadow.append(style, hint);
    document.documentElement.appendChild(container);

    const panel = {
        show(key, type = "info", opts = {}) {
            const text = opts.text || ({
                pleaseSolveCaptcha: "Please solve the captcha first...",
                captchaSuccess: "Captcha solved successfully!",
                captchaSuccessBypassing: "Captcha solved. Bypassing...",
                redirectingToWork: "Redirecting to Work.Ink...",
                bypassSuccess: `Bypass success, redirecting in ${opts.time || 5}s...`,
                bypassSuccessCopy: "Copied key successfully!",
                backToCheckpoint: "Returning to checkpoint...",
            }[key] || key);

            hint.innerHTML = `
                <div class="panel-title">[${type.toUpperCase()}]</div>
                <div class="panel-text panel-${type}">${text}</div>
            `;
        }
    };

    // ======================================================
    // 🌋 Volcano Handler
    // ======================================================
    function handleVolcano() {
        const dtcAttempt = 40, poll = 700;
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

        function getContinue() {
            const buttons = document.querySelectorAll(
                '#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]'
            );
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
                    if (panel) panel.show('captchaSuccess', 'success');
                    if (debug) console.log('[Debug] Captcha Solved');

                    setTimeout(() => {
                        try {
                            btn.click();
                            if (panel) panel.show('redirectingToWork', 'info');
                            if (debug) console.log('[Debug] Clicking Continue');
                        } catch (err) {
                            if (debug) console.log('[Debug] No Continue Found', err);
                        }
                    }, 300);
                }
            }

            const copyBtn = getCopy();
            if (copyBtn) {
                setTimeout(() => {
                    try {
                        copyBtn.click();
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                        if (debug) console.log('[Debug] Copy button clicked');
                    } catch (err) {
                        if (debug) console.log('[Debug] No Copy Found', err);
                    }
                }, 150);
            }
        }

        function tryDetect() {
            attempts++;
            const btn = getContinue();
            const copyBtn = getCopy();

            if (btn || copyBtn) {
                if (debug) console.log(`[Debug] Detect success (attempt ${attempts})`);
                actOnCheckpoint();
                return true;
            }

            if (attempts >= dtcAttempt) {
                if (debug) console.log('[Debug] No more poll attempts.');
                return false;
            }
            return false;
        }

        setTimeout(tryDetect, 300);

        const pollInterval = setInterval(() => {
            if (!tryDetect()) clearInterval(pollInterval);
        }, poll);

        const mo = new MutationObserver(() => {
            tryDetect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

        if (debug) console.log('[Debug] Waiting Captcha');
    }

    // ======================================================
    // ⚙️ WorkInk Handler
    // ======================================================
    function handleWorkInk() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');
        let sessionController = null;

        const map = {
            sendM: ['sendMessage', 'sendMsg', 'writeMessage', 'writeMsg', 'writMessage'],
            onLI: ['onLinkInfo'],
            onLD: ['onLinkDestination']
        };

        const types = {
            mo: 'c_monetization',
            ss: 'c_social_started',
            tr: 'c_turnstile_response'
        };

        let sendMessageA, onLinkInfoA, onLinkDestinationA, captchaDone = false;

        function findMethod(obj, names) {
            for (const name of names) if (typeof obj[name] === 'function') return { fn: obj[name], name };
            return { fn: null, name: null };
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) return;
            sessionController.linkInfo.socials.forEach(social => {
                sendMessageA.call(this, types.ss, { url: social.url });
            });
        }

        function createSendProxy() {
            return function (...args) {
                const [msgType] = args;
                if (msgType !== 'c_adblocker_detected' && debug)
                    console.log('[Debug] Sent:', msgType, args[1]);

                if (captchaDone) return sendMessageA.apply(this, args);

                if (msgType === types.tr) {
                    captchaDone = true;
                    if (panel) panel.show('captchaSuccessBypassing', 'success');
                    spoofWorkink.call(this);
                    return sendMessageA.apply(this, args);
                }
                return sendMessageA.apply(this, args);
            };
        }

        function setupProxies() {
            const send = findMethod(sessionController, map.sendM);
            const info = findMethod(sessionController, map.onLI);
            const dest = findMethod(sessionController, map.onLD);
            if (!send.fn || !info.fn || !dest.fn) return;

            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;

            Object.defineProperty(sessionController, send.name, {
                get: createSendProxy,
                set: v => sendMessageA = v
            });
        }

        function checkController(target, prop, value) {
            if (value &&
                typeof value === 'object' &&
                findMethod(value, map.sendM).fn &&
                findMethod(value, map.onLI).fn &&
                findMethod(value, map.onLD).fn &&
                !sessionController) {
                sessionController = value;
                setupProxies();
            }
            return Reflect.set(target, prop, value);
        }

        function setupInterception() {
            const origPromise = Promise.all;
            Promise.all = async function(promises) {
                const result = origPromise.call(this, promises);
                result.then(([kit, app, ...rest]) => {
                    if (kit?.start) {
                        kit.start = new Proxy(kit.start, {
                            apply(target, thisArg, args) {
                                const [nodes, , opts] = args;
                                if (nodes?.nodes && opts?.node_ids) {
                                    const idx = opts.node_ids[1];
                                    if (nodes.nodes[idx]) {
                                        const oldNode = nodes.nodes[idx];
                                        nodes.nodes[idx] = async (...a) => {
                                            const r = await oldNode(...a);
                                            if (r.component?.$$?.ctx)
                                                r.component.$$.ctx = new Proxy(r.component.$$.ctx, { set: checkController });
                                            return r;
                                        };
                                    }
                                }
                                return Reflect.apply(target, thisArg, args);
                            }
                        });
                    }
                });
                return result;
            };
        }

        setupInterception();
        if (debug) console.log('[Debug] WorkInk interception set.');
    }

    // ======================================================
    // 🚀 Start Logic
    // ======================================================
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();
})();