(function () {
    'use strict';

    const host = location.hostname;
    const debug = (typeof CONFIG !== 'undefined' && CONFIG.debug !== undefined)
        ? CONFIG.debug: false;

    let currentLanguage = localStorage.getItem('lang') || 'vi';
    
    const translations = {
        vi: {
            title: "Dyrian Bypass",
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
            version: "Phiên bản v1.6.0.3",
            madeBy: "Được tạo bởi DyRian (dựa trên IHaxU)"
        },
        en: {
            title: "Dyrian Bypass",
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
            version: "Version v1.6.0.3",
            madeBy: "Made by DyRian (based on IHaxU)"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = `text.replace({${placeholder}}, replacements[placeholder])`;
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
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transition: all 0.3s ease;
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
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 16px 20px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shine 3s infinite;
                }

                @keyframes shine {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
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
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }

                .status-section {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .status-box {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                }

                .status-box::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
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
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .lang-toggle {
                    display: flex;
                    gap: 10px;
                }

                .lang-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.1);
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
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }

                .lang-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .info-section {
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.2);
                }

                .version {
                    color: rgba(255,255,255,0.6);
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-align: center;
                }

                .credit {
                    color: rgba(255,255,255,0.6);
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .credit-author {
                    color: #667eea;
                    font-weight: 700;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 11px;
                }

                .links a {
                    color: #667eea;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .links a:hover {
                    color: #764ba2;
                    text-decoration: underline;
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
                                    <button class="lang-btn ${currentLanguage === 'vi' ? 'active' : ''}" data-lang="vi">Tiếng Việt</button>
                                    <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English</button>
                                </div>
                            </div>
                            <div class="info-section">
                                <div class="version" id="version">${t('version')}</div>
                                <div class="credit" id="credit">
                                    ${t('madeBy')}
                                </div>
                                <div class="links">
                                    <a href="https://www.youtube.com/@dyydeptry" target="_blank">YouTube</a>
                                    <a href="https://discord.gg/DWyEfeBCzY" target="_blank">Discord</a>
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
            this.statusDot.className = "status-dot ${type}";
        }
    }

    let panel = null;
    setTimeout(() => {
        panel = new BypassPanel();
        panel.show('pleaseSolveCaptcha', 'info');
    }, 100);

    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("ads.luarmor.net")) handleLuarmor();
    else if (host.includes("work.ink")) handleWorkInk();

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
                        if (debug) console.log('[Debug] Copy button clicked (spam)');
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
                if (debug) console.log("[Debug] Detect success (attempt ${attempts})");
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
            tryDetect();
        }, poll);

        const mo = new MutationObserver(() => {
            tryDetect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

        if (debug) console.log('[Debug] Waiting Captcha');
    }




    function handleWorkInk() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');
        
        const startTime = Date.now();
        let sessionController = null;
        let sendMessageA = null;
        let onLinkInfoA = null;
        let onLinkDestinationA = null;
        let captchaDone = false;

        const map = {
            sendM: ['sendMessage', 'sendMsg', 'writeMessage', 'writeMsg', 'writMessage'],
            onLI: ['onLinkInfo'],
            onLD: ['onLinkDestination']
        };
        const types = {
            mo: 'c_monetization',
            ss: 'c_social_started',
            tr: 'c_turnstile_response',
            ad: 'c_adblocker_detected'
        };

        (function main() {
            setupInterception();
            removeAds();
        })();

        function findMethod(obj, names) {
            for (const name of names) if (typeof obj[name] === 'function') return { fn: obj[name], name };
            return { fn: null, name: null };
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) return;
            sessionController.linkInfo.socials.forEach(social => {
                sendMessageA.call(this, types.ss, { url: social.url });
            });

            for (const idx in sessionController.linkInfo.monetizations) {
                const monetization = sessionController.linkInfo.monetizations[idx];
                switch (monetization) {
                    case 22:
                        sendMessageA.call(this, types.mo, {
                            type: 'readArticles2',
                            payload: { event: 'read' }
                        });
                        break;
                    case 25:
                        sendMessageA.call(this, types.mo, {
                            type: 'operaGX',
                            payload: { event: 'start' }
                        });
                        sendMessageA.call(this, types.mo, {
                            type: 'operaGX',
                            payload: { event: 'installClicked' }
                        });
                        fetch('https://work.ink/_api/v2/callback/operaGX', {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ noteligible: true })
                        }).catch(() => {});
                        break;
                    case 34:
                        sendMessageA.call(this, types.mo, {
                            type: 'norton',
                            payload: { event: 'start' }
                        });
                        sendMessageA.call(this, types.mo, {
                            type: 'norton',
                            payload: { event: 'installClicked' }
                        });
                        break;
                    case 71:
                        sendMessageA.call(this, types.mo, {
                            type: 'externalArticles',
                            payload: { event: 'start' }
                        });
                        sendMessageA.call(this, types.mo, {
                            type: 'externalArticles',
                            payload: { event: 'installClicked' }
                        });
                        break;
                    case 45:
                        sendMessageA.call(this, types.mo, {
                            type: 'pdfeditor',
                            payload: { event: 'installed' }
                        });
                        break;
                    case 57:
                        sendMessageA.call(this, types.mo, {
                            type: 'betterdeals',
                            payload: { event: 'installed' }
                        });
                        break;
                    default:
                        if (debug) console.log('[Debug] Unknown monetization:', monetization);
                }
            }
        }

        // watchdog counters
        let captchaRetryCount = 0;      // tổng số lần timeout (cumulative, optional)
        let consecutiveStuck = 0;       // số lần timeout liên tiếp (>=2 => clear cookies + reload)

        // Xoá cookies của domain hiện tại (chỉ cookies)
        function clearSiteCookies() {
            const cookies = document.cookie ? document.cookie.split('; ') : [];
            for (const cookie of cookies) {
                const [name] = cookie.split('=');
                // xóa cho path root
                document.cookie = "${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                // xóa cho path hiện tại (phòng trường hợp khác)
                document.cookie = "${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${location.pathname}";
            }
            if (debug) console.log("[Debug] Cleared cookies for ${location.hostname}");
        }

        function createSendProxy() {
            return function (...args) {
                const [msgType] = args;
                if (msgType !== types.ad && debug)
                    console.log('[Debug] Sent:', msgType, args[1]);

                // Nếu captcha đã done thì gửi bình thường
                if (captchaDone) return sendMessageA.apply(this, args);

                const start = Date.now();

                const interval = setInterval(() => {
                    if (captchaDone) {
                        clearInterval(interval);
                        // reset counters on success
                        captchaRetryCount = 0;
                        consecutiveStuck = 0;
                        return;
                    }

                    // Nếu server gửi turnstile response (thành công)
                    if (msgType === types.tr) {
                        captchaDone = true;
                        clearInterval(interval);
                        if (debug) console.log('[Debug] Captcha bypassed via tr');
                        if (panel) panel.show('captchaSuccessBypassing', 'success');
                        spoofWorkink.call(this);
                        // reset counters
                        captchaRetryCount = 0;
                        consecutiveStuck = 0;
                        return sendMessageA.apply(this, args);
                    }

                    // kiểm tra nút DOM "Go To Destination"
                    const btn = document.querySelector('.button.large.accessBtn.svelte-16n5fft');
                    const elapsed = (Date.now() - start) / 1000;

                    if (btn && btn.textContent.includes('Go To Destination')) {
                        captchaDone = true;
                        clearInterval(interval);
                        if (debug) console.log('[Debug] Captcha bypassed via DOM');
                        if (panel) panel.show('captchaSuccessBypassing', 'success');
                        spoofWorkink.call(this);
                        // reset counters
                        captchaRetryCount = 0;
                        consecutiveStuck = 0;
                        return sendMessageA.apply(this, args);
                    }

                    // timeout -> retry logic
                    if (elapsed > 5) {
                        clearInterval(interval);
                        captchaRetryCount++;
                        consecutiveStuck++;

                        if (debug)
                            console.warn("[Debug] Captcha timeout — retrying (#${captchaRetryCount}), consecutive stuck: ${consecutiveStuck}");
                        if (panel)
                            panel.show('pleaseSolveCaptcha', 'warning', {
                                text: `Captcha not detected, retrying... (#${captchaRetryCount})`
                            });

                        // Nếu lặp 2 lần liên tiếp mà vẫn chưa qua => clear cookies + reload
                        if (consecutiveStuck >= 2) {
                            if (debug) console.warn('[Debug] Captcha stuck twice — clearing cookies and reloading...');
                            clearSiteCookies();
                            // delay 1s để cookie kịp bị xóa
                            setTimeout(() => window.location.reload(), 1000);
                            return;
                        }

                        // Nếu chưa tới ngưỡng stuck, thì gọi lại sau 300ms để retry (không đệ quy sâu)
                        setTimeout(() => {
                            try {
                                createSendProxy().call(this, ...args);
                            } catch (e) {
                                if (debug) console.error('[Debug] Error retrying send proxy', e);
                            }
                        }, 300);
                    }
                }, 500);

                // gửi message ban đầu (vẫn gửi cho server)
                return sendMessageA.apply(this, args);
            };
        }

        function createLinkInfoProxy() {
            return function (...args) {
                const [info] = args;
                if (debug) console.log('[Debug] Link info:', info);
                Object.defineProperty(info, 'isAdblockEnabled', {
                    get: () => false,
                    set: () => {},
                    configurable: false,
                    enumerable: true
                });
                return onLinkInfoA.apply(this, args);
            };
        }

        function redirect(url) {
            window.location.href = url;
        }

        function startCountdown(url, waitLeft) {
            if (debug) console.log('[Debug] Countdown started:', waitLeft, 'seconds');
            if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
            
            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (debug) console.log('[Debug] Time remaining:', waitLeft);
                    if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function createDestinationProxy() {
            return function (...args) {
                const [data] = args;
                if (debug) console.log('[Debug] Destination:', data);
                const secondsPassed = (Date.now() - startTime) / 1000;

                const currentUrl = window.location.href;
                let waitTimeSeconds;

                if (currentUrl.includes('42rk6hcq')) {
                    waitTimeSeconds = 38;
                } else if (currentUrl.includes('ito4wckq')) {
                    waitTimeSeconds = 38;
                } else if (currentUrl.includes('pzarvhq1')) {
                    waitTimeSeconds = 38;
                } else {
                    waitTimeSeconds = 5;
                }

                if (secondsPassed >= waitTimeSeconds) {
                    if (panel) panel.show('backToCheckpoint', 'info');
                    redirect(data.url);
                } else {
                    startCountdown(data.url, waitTimeSeconds - secondsPassed);
                }
                return onLinkDestinationA.apply(this, args);
            };
        }

        function setupProxies() {
            const send = findMethod(sessionController, map.sendM),
                info = findMethod(sessionController, map.onLI),
                dest = findMethod(sessionController, map.onLD);

            if (!send.fn || !info.fn || !dest.fn) return;

            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;

            Object.defineProperty(sessionController, send.name, {
                get: createSendProxy,
                set: v => sendMessageA = v,
                configurable: false
            });
            Object.defineProperty(sessionController, info.name, {
                get: createLinkInfoProxy,
                set: v => onLinkInfoA = v,
                configurable: false
            });
            Object.defineProperty(sessionController, dest.name, {
                get: createDestinationProxy,
                set: v => onLinkDestinationA = v,
                configurable: false
            });
        }

        function checkController(target, prop, value) {
            if (debug) console.log('[Debug] Checking:', prop, value);
            if (value &&
                typeof value === 'object' &&
                findMethod(value, map.sendM).fn &&
                findMethod(value, map.onLI).fn &&
                findMethod(value, map.onLD).fn &&
                !sessionController) {
                sessionController = value;
                if (debug) console.log('[Debug] Controller detected:', sessionController);
                setupProxies();
            }
            return Reflect.set(target, prop, value);
        }

        function createComponentProxy(comp) {
            return new Proxy(comp, {
                construct(target, args) {
                    const instance = Reflect.construct(target, args);
                    if (instance.$$.ctx) instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
                    return instance;
                }
            });
        }

        function createNodeProxy(node) {
            return async (...args) => {
                const result = await node(...args);
                return new Proxy(result, {
                    get: (t, p) => p === 'component' ?
                        createComponentProxy(t.component) : Reflect.get(t, p)
                });
            };
        }

        function createKitProxy(kit) {
            if (!kit?.start) return [false, kit];
            return [true, new Proxy(kit, {
                get(target, prop) {
                    if (prop === 'start') {
                        return function (...args) {
                            const [nodes, , opts] = args;
                            if (nodes?.nodes && opts?.node_ids) {
                                const idx = opts.node_ids[1];
                                if (nodes.nodes[idx]) nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                            }
                            return kit.start.apply(this, args);
                        };
                    }
                    return Reflect.get(target, prop);
                }
            })];
        }

        function setupInterception() {
            const origPromise = Promise.all;
            let intercepted = false;
            Promise.all = async function (promises) {
                const result = origPromise.call(this, promises);
                if (!intercepted) {
                    intercepted = true;
                    return await new Promise(resolve => {
                        result.then(([kit, app, ...rest]) => {
                            const [success, created] = createKitProxy(kit);
                            if (success) Promise.all = origPromise;
                            resolve([created, app, ...rest]);
                        });
                    });
                }
                return result;
            };
        }

        function removeAds() {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (node.classList?.contains('adsbygoogle') || node.id.match(/ad|container/)) node.remove();
                            node.querySelectorAll?.('.adsbygoogle, [id*=ad], [id*=container]').forEach(ad => ad.remove());
                        }
                    }
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    }
})();