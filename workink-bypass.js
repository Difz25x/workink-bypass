(function() {
    "use strict";

    const DEBUG = true;
    const host = location.hostname;

    let currentLanguage = localStorage.getItem('lang') || 'en';

    const translations = {
        vi: {
            title: "Difz25x Bypass",
            pleaseSolveCaptcha: "Vui lòng giải CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã thành công",
            redirectingToWork: "Đang qua Work.ink...",
            clickingContinue: "Đã click nút Continue",
            errorClickingContinue: "Lỗi khi click Continue",
            autoClickCopy: "Đã auto click nút copy key",
            bypassSuccessCopy: "Bypass thành công, đã Copy Key (bấm 'Cho Phép' nếu có)",
            errorCopy: "Lỗi khi copy key",
            copyButtonNotFound: "Không tìm thấy nút copy",
            waitingCaptcha: "Đang chờ CAPTCHA...",
            successDetected: "Đã detect success, chuẩn bị click...",
            bypassSuccess: "Bypass thành công, chờ {time}s...",
            backToCheckpoint: "Đang về lại Checkpoint...",
            captchaSuccessBypassing: "CAPTCHA đã thành công, đang bypass...",
            version: "Phiên bản v1.0.0.0",
            madeBy: "Được tạo bởi Difz25x"
        },
        en: {
            title: "Difz25x Bypass",
            pleaseSolveCaptcha: "Please solve the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            clickingContinue: "Continue button clicked",
            errorClickingContinue: "Error clicking the Continue button",
            autoClickCopy: "Automatically clicked the copy key button",
            bypassSuccessCopy: "Bypass successful! Key copied (click 'Allow' if prompted)",
            errorCopy: "Error copying the key",
            copyButtonNotFound: "Copy button not found",
            waitingCaptcha: "Waiting for CAPTCHA...",
            successDetected: "Success detected, preparing to click...",
            bypassSuccess: "Bypass successful, waiting {time}s...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            version: "Version v1.0.0.0",
            madeBy: "Made by Difz25x"
        },
        id: {
            title: "Difz25x Bypass",
            pleaseSolveCaptcha: "Silakan selesaikan CAPTCHA untuk melanjutkan",
            captchaSuccess: "CAPTCHA berhasil dipecahkan",
            redirectingToWork: "Mengalihkan ke Work.ink...",
            clickingContinue: "Tombol Lanjutkan diklik",
            errorClickingContinue: "Kesalahan saat mengklik tombol Lanjutkan",
            autoClickCopy: "Otomatis mengklik tombol salin kunci",
            bypassSuccessCopy: "Bypass berhasil! Kunci disalin (klik 'Izinkan' jika diminta)",
            errorCopy: "Kesalahan saat menyalin kunci",
            copyButtonNotFound: "Tombol salin tidak ditemukan",
            waitingCaptcha: "Menunggu CAPTCHA...",
            successDetected: "Keberhasilan terdeteksi, bersiap untuk mengklik...",
            bypassSuccess: "Bypass berhasil, menunggu {time}s...",
            backToCheckpoint: "Kembali ke titik pemeriksaan...",
            captchaSuccessBypassing: "CAPTCHA berhasil dipecahkan, melewati...",
            version: "Versi v1.0.0.0",
            madeBy: "Dibuat oleh Difz25x"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;
            this.statusText = null;
            this.statusDot = null;
            this.versionEl = null;
            this.creditEl = null;
            this.langBtns = [];
            this.currentMessageKey = null;
            this.currentType = 'info';
            this.currentReplacements = {};
            this.isMinimized = false;
            this.body = null;
            this.minimizeBtn = null;
            this.init();
        }

        init() {
            this.createPanel();
            this.setupEventListeners();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const style = document.createElement('style');
            style.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; }

                .panel-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 400px;
                    z-index: 2147483647;
                    font-family: 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif;
                }

                .panel {
                    background: linear-gradient(135deg, #000000 0%, #ff4500 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transition: all 0.3s ease;
                    border: 2px solid #ff4500;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }

                .header {
                    background: linear-gradient(135deg, #ff4500 0%, #8b0000 100%);
                    padding: 16px 20px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header::before {
                    content: '🎃';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    font-size: 24px;
                    opacity: 0.7;
                    z-index: 1;
                }

                .header::after {
                    content: '👻';
                    position: absolute;
                    top: 10px;
                    right: 50px;
                    font-size: 24px;
                    opacity: 0.7;
                    z-index: 1;
                }

                .title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    position: relative;
                    z-index: 1;
                }

                .minimize-btn {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    font-size: 20px;
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                }

                .minimize-btn:hover {
                    background: rgba(255,69,0,0.3);
                    transform: scale(1.1);
                }

                .status-section {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .status-box {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255,69,0,0.3);
                }

                .status-box::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,69,0,0.1), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                    z-index: 1;
                }

                .status-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                    box-shadow: 0 0 12px currentColor;
                    flex-shrink: 0;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.15); }
                }

                .status-dot.info { background: #60a5fa; }
                .status-dot.success { background: #4ade80; }
                .status-dot.warning { background: #facc15; }
                .status-dot.error { background: #f87171; }
                .status-dot.waiting { background: #8124fbff; }
                .status-dot.bypassing { background: #f65cf1ff; }

                .status-text {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;
                    flex: 1;
                    line-height: 1.5;
                }

                .panel-body {
                    max-height: 500px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    opacity: 1;
                }

                .panel-body.hidden {
                    max-height: 0;
                    opacity: 0;
                }

                .language-section {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .lang-toggle {
                    display: flex;
                    gap: 10px;
                }

                .lang-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,69,0,0.3);
                    color: #fff;
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .lang-btn:hover {
                    background: rgba(255,69,0,0.1);
                    transform: translateY(-2px);
                }

                .lang-btn.active {
                    background: linear-gradient(135deg, #ff4500 0%, #8b0000 100%);
                    border-color: #ff4500;
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.4);
                }

                .info-section {
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.3);
                }

                .version {
                    color: rgba(255,255,255,0.7);
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-align: center;
                }

                .credit {
                    color: rgba(255,255,255,0.7);
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .credit-author {
                    color: #ff4500;
                    font-weight: 700;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 11px;
                }

                .links a {
                    color: #ff4500;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .links a:hover {
                    color: #8b0000;
                }

                @media (max-width: 480px) {
                    .panel-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        width: auto;
                    }
                }
            `;

            this.shadow.appendChild(style);

            const panelHTML = `
                <div class="panel-container">
                    <div class="panel">
                        <div class="header">
                            <div class="title">${t('title')}</div>
                            <button class="minimize-btn" id="minimize-btn">−</button>
                        </div>
                        <div class="status-section">
                            <div class="status-box">
                                <div class="status-content">
                                    <div class="status-dot info" id="status-dot"></div>
                                    <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel-body" id="panel-body">
                            <div class="language-section">
                                <div class="lang-toggle">
                                    <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English</button>
                                    <button class="lang-btn ${currentLanguage === 'vi' ? 'active' : ''}" data-lang="vi">Tiếng Việt</button>
                                    <button class="lang-btn ${currentLanguage === 'id' ? 'active' : ''}" data-lang="id">Indonesia</button>
                                </div>
                            </div>
                            <div class="info-section">
                                <div class="version" id="version">${t('version')}</div>
                                <div class="credit" id="credit">
                                    ${t('madeBy')}
                                </div>
                                <div class="links">
                                    <a>YouTube</a>
                                    <a>Discord</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = panelHTML;
            this.shadow.appendChild(wrapper.firstElementChild);

            this.panel = this.shadow.querySelector('.panel');
            this.statusText = this.shadow.querySelector('#status-text');
            this.statusDot = this.shadow.querySelector('#status-dot');
            this.versionEl = this.shadow.querySelector('#version');
            this.creditEl = this.shadow.querySelector('#credit');
            this.langBtns = Array.from(this.shadow.querySelectorAll('.lang-btn'));
            this.body = this.shadow.querySelector('#panel-body');
            this.minimizeBtn = this.shadow.querySelector('#minimize-btn');

            document.documentElement.appendChild(this.container);
        }

        setupEventListeners() {
            this.langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentLanguage = btn.dataset.lang;
                    this.updateLanguage();
                });
            });

            this.minimizeBtn.addEventListener('click', () => {
                this.isMinimized = !this.isMinimized;
                this.body.classList.toggle('hidden');
                this.minimizeBtn.textContent = this.isMinimized ? '+' : '−';
            });
        }

        updateLanguage() {
            localStorage.setItem('lang', currentLanguage);

            this.langBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
            });

            this.shadow.querySelector('.title').textContent = t('title');
            this.versionEl.textContent = t('version');
            this.creditEl.textContent = t('madeBy');

            if (this.currentMessageKey) {
                this.show(this.currentMessageKey, this.currentType, this.currentReplacements);
            }
        }

        show(messageKey, type = 'info', replacements = {}) {
            this.currentMessageKey = messageKey;
            this.currentType = type;
            this.currentReplacements = replacements;

            const message = t(messageKey, replacements);
            this.statusText.textContent = message;
            this.statusDot.className = `status-dot ${type}`;
        }
    }

    let panel = null;
    setTimeout(() => {
        panel = new BypassPanel();
        panel.show('pleaseSolveCaptcha', 'info');
    }, 100);

    // ---------------------------
    // Debug logging wrapper
    // ---------------------------
    const oldLog = unsafeWindow.console.log;
    const oldWarn = unsafeWindow.console.warn;
    const oldError = unsafeWindow.console.error;

    // Wrapper functions prepend a tag and only log when DEBUG is true
    function log(...args) { if (DEBUG) oldLog("[BYPASS]", ...args); }
    function warn(...args) { if (DEBUG) oldWarn("[BYPASS]", ...args); }
    function error(...args) { if (DEBUG) oldError("[BYPASS]", ...args); }

    // ---------------------------
    // Volcano handler
    // ---------------------------
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
                    if (DEBUG) console.log('[Debug] Captcha Solved');

                    setTimeout(() => {
                        try {
                            btn.click();
                            if (panel) panel.show('redirectingToWork', 'info');
                            if (DEBUG) console.log('[Debug] Clicking Continue');
                        } catch (err) {
                            if (DEBUG) console.log('[Debug] No Continue Found', err);
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
                        if (DEBUG) console.log('[Debug] Copy button clicked (spam)');
                    } catch (err) {
                        if (DEBUG) console.log('[Debug] No Copy Found', err);
                    }
                }, 150);
            }
        }

        function tryDetect() {
            attempts++;
            const btn = getContinue();
            const copyBtn = getCopy();

            if (btn || copyBtn) {
                if (DEBUG) console.log(`[Debug] Detect success (attempt ${attempts})`);
                actOnCheckpoint();
                return true;
            }

            if (attempts >= dtcAttempt) {
                if (DEBUG) console.log('[Debug] No more poll attempts.');
                return false;
            }
            return false;
        }

        setTimeout(tryDetect, 300);

        const pollInterval = setInterval(() => {
            tryDetect();
        }, poll);

        const mo = new MutationObserver(() => {
            tryDetect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

        if (DEBUG) console.log('[Debug] Waiting Captcha');
    }

    // ---------------------------
    // Work.ink handler
    // ---------------------------
    function handleWorkInk() {
        const NAME_MAP = {
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

    function resolveWriteFunction(obj) {
        for (let i in obj) {
            if (typeof obj[i] == "function" && obj[i].length == 2) {
                return { fn: obj[i], name: i };
            }
        }
        return { fn: null, index: -1, name: null };
    }

    // Global state
    let _sessionController = undefined;
    let _sendMessage = undefined;
    let _onLinkInfo = undefined;
    let _onLinkDestination = undefined;

    // Constants
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

    const startTime = Date.now();

    function createSendMessageProxy() {
        const clientPacketTypes = getClientPacketTypes();

        return function(...args) {
            const packet_type = args[0];
            const packet_data = args[1];

            if (packet_type !== clientPacketTypes.PING) {
                log("Sent message:", packet_type, packet_data);
            }

            if (packet_type === clientPacketTypes.ADBLOCKER_DETECTED) {
                warn("Blocked adblocker detected message to avoid false positive.");
                return;
            }

            if (_sessionController.linkInfo && packet_type === clientPacketTypes.TURNSTILE_RESPONSE) {
                const ret = _sendMessage.apply(this, args);

                panel.show('captchaSuccessBypassing', 'bypassing');

                // Send bypass messages
                for (const social of _sessionController.linkInfo.socials) {
                    _sendMessage.call(this, clientPacketTypes.SOCIAL_STARTED, {
                        url: social.url
                    });
                }

                for (const monetizationIdx in _sessionController.linkInfo.monetizations) {
                    const monetization = _sessionController.linkInfo.monetizations[monetizationIdx];

                    switch (monetization) {
                        case 22: { // readArticles2
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "readArticles2",
                                payload: {
                                    event: "read"
                                }
                            });
                            break;
                        }

                        case 25: { // operaGX
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "operaGX",
                                payload: {
                                    event: "start"
                                }
                            });
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "operaGX",
                                payload: {
                                    event: "installClicked"
                                }
                            });
                            fetch('https://work.ink/_api/v2/callback/operaGX', {
                                method: 'POST',
                                mode: 'no-cors',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    'noteligible': true
                                })
                            });
                            break;
                        }

                        case 34: { // norton
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "norton",
                                payload: {
                                    event: "start"
                                }
                            });
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "norton",
                                payload: {
                                    event: "installClicked"
                                }
                            });
                            break;
                        }

                        case 71: { // externalArticles
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "externalArticles",
                                payload: {
                                    event: "start"
                                }
                            });
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "externalArticles",
                                payload: {
                                    event: "installClicked"
                                }
                            });
                            break;
                        }

                        case 45: { // pdfeditor
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "pdfeditor",
                                payload: {
                                    event: "installed"
                                }
                            });
                            break;
                        }

                        case 57: { // betterdeals
                            _sendMessage.call(this, clientPacketTypes.MONETIZATION, {
                                type: "betterdeals",
                                payload: {
                                    event: "installed"
                                }
                            });
                            break;
                        }

                        default: {
                            log("Unknown monetization type:", typeof monetization, monetization);
                            break;
                        }
                    }
                }

                return ret;
            }

            return _sendMessage.apply(this, args);
        };
    }

    function createOnLinkInfoProxy() {
        return function(...args) {
            const linkInfo = args[0];

            log("Link info received:", linkInfo);

            Object.defineProperty(linkInfo, "isAdblockEnabled", {
                get() { return false },
                set(newValue) {
                    log("Attempted to set isAdblockEnabled to:", newValue);
                },
                configurable: false,
                enumerable: true
            });

            return _onLinkInfo.apply(this, args);
        };
    }

    function updateHint(waitLeft) {
        panel.show(`bypassSuccess`, 'waiting', { time: Math.ceil(waitLeft) });
    }

    function redirect(url) {
        panel.show('backToCheckpoint', 'info');
        window.location.href = url;
    }

    function startCountdown(url, waitLeft) {
        if (DEBUG) console.log('[Debug] startCountdown: Started with', waitLeft, 'seconds');
        updateHint(waitLeft);

        const interval = setInterval(() => {
            waitLeft -= 1;
            if (waitLeft > 0) {
                if (DEBUG) console.log('[Debug] startCountdown: Time remaining:', waitLeft);
                updateHint(waitLeft);
            } else {
                clearInterval(interval);
                redirect(url);
            }
        }, 1000);
    }

    function createOnLinkDestinationProxy() {
            return function(...args) {
            const [data] = args;
            const secondsPassed = (Date.now() - startTime) / 1000;
            if (DEBUG) console.log('[Debug] Destination data:', data);

            let waitTimeSeconds = 5;
            const url = location.href;
            if (url.includes('42rk6hcq') || url.includes('ito4wckq') || url.includes('pzarvhq1')) {
                waitTimeSeconds = 38;
            }

            if (secondsPassed >= waitTimeSeconds) {
                if (panel) panel.show('backToCheckpoint', 'info');
                redirect(data.url);
            } else {
                startCountdown(data.url, waitTimeSeconds - secondsPassed);
            }
            return _onLinkDestination ? _onLinkDestination.apply(this, args): undefined;
        };
     }

    function setupSessionControllerProxy() {
        const sendMessage = resolveWriteFunction(_sessionController);
        const onLinkInfo = resolveName(_sessionController, NAME_MAP.onLinkInfo);
        const onLinkDestination = resolveName(_sessionController, NAME_MAP.onLinkDestination);

        _sendMessage = sendMessage.fn;
        _onLinkInfo = onLinkInfo.fn;
        _onLinkDestination = onLinkDestination.fn;

        const sendMessageProxy = createSendMessageProxy();
        const onLinkInfoProxy = createOnLinkInfoProxy();
        const onLinkDestinationProxy = createOnLinkDestinationProxy();

        // Patch the actual property name that exists
        Object.defineProperty(_sessionController, sendMessage.name, {
            get() { return sendMessageProxy },
            set(newValue) { _sendMessage = newValue },
            configurable: false,
            enumerable: true
        });

        Object.defineProperty(_sessionController, onLinkInfo.name, {
            get() { return onLinkInfoProxy },
            set(newValue) { _onLinkInfo = newValue },
            configurable: false,
            enumerable: true
        });

        Object.defineProperty(_sessionController, onLinkDestination.name, {
            get() { return onLinkDestinationProxy },
            set(newValue) { _onLinkDestination = newValue },
            configurable: false,
            enumerable: true
        });

        log(`SessionController proxies installed: ${sendMessage.name}, ${onLinkInfo.name}, ${onLinkDestination.name}`);
    }

    function checkForSessionController(target, prop, value, receiver) {
        log("Checking property set:", prop, value);

        if (
            value &&
            typeof value === "object" &&
            resolveWriteFunction(value).fn &&
            resolveName(value, NAME_MAP.onLinkInfo).fn &&
            resolveName(value, NAME_MAP.onLinkDestination).fn &&
            !_sessionController
        ) {
            _sessionController = value;
            log("Intercepted session controller:", _sessionController);
            setupSessionControllerProxy();
        }

        return Reflect.set(target, prop, value, receiver);
    }

    function createComponentProxy(component) {
        return new Proxy(component, {
            construct(target, args) {
                const result = Reflect.construct(target, args);
                log("Intercepted SvelteKit component construction:", target, args, result);

                result.$$.ctx = new Proxy(result.$$.ctx, {
                    set: checkForSessionController
                });

                return result;
            }
        });
    }

    function createNodeResultProxy(result) {
        return new Proxy(result, {
            get(target, prop, receiver) {
                if (prop === "component") {
                    return createComponentProxy(target.component);
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }

    function createNodeProxy(oldNode) {
        return async (...args) => {
            const result = await oldNode(...args);
            log("Intercepted SvelteKit node result:", result);
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
                    return function(...args) {
                        const appModule = args[0];
                        const options = args[2];

                        if (typeof appModule === "object" &&
                            typeof appModule.nodes === "object" &&
                            typeof options === "object" &&
                            typeof options.node_ids === "object") {

                            const oldNode = appModule.nodes[options.node_ids[1]];
                            appModule.nodes[options.node_ids[1]] = createNodeProxy(oldNode);
                        }

                        log("kit.start intercepted!", options);
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

        unsafeWindow.Promise.all = async function(promises) {
            const result = originalPromiseAll.call(this, promises);

            if (!intercepted) {
                intercepted = true;

                return await new Promise((resolve) => {
                    result.then(([kit, app, ...args]) => {
                        log("SvelteKit modules loaded");

                        const [success, wrappedKit] = createKitProxy(kit);
                        if (success) {
                            // Restore original Promise.all
                            unsafeWindow.Promise.all = originalPromiseAll;

                            log("Wrapped kit ready:", wrappedKit, app);
                        }

                        resolve([wrappedKit, app, ...args]);
                    });
                });
            }

            return await result;
        };
    }

    // Initialize the bypass
    setupSvelteKitInterception();

    // Remove injected ads
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) {
                    // Direct match
                    if (node.classList?.contains("adsbygoogle")) {
                        node.remove();
                        log("Removed injected ad:", node);
                    }
                    // Or children inside the node
                    node.querySelectorAll?.(".adsbygoogle").forEach((el) => {
                        el.remove();
                        log("Removed nested ad:", el);
                    });
                }
            }
        }
    });

    // Start observing the document for changes
    observer.observe(unsafeWindow.document.documentElement, { childList: true, subtree: true });
    }

    // ---------------------------
    // Auto-detect host
    // ---------------------------
    if(host.includes("key.volcano.wtf")) handleVolcano();
    else if(host.includes("work.ink")) handleWorkInk();
})();
