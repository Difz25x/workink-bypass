(function () {
    'use strict';

    const host = location.hostname; // check host
    const debug = true // enable debug logs (console)

    let currentLanguage = localStorage.getItem('lang') || 'en'; // default language: vi/en
    let currentTheme = localStorage.getItem('theme') || 'orange';

    const themes = {
        orange: {
            primary: '#ff4500',
            secondary: '#8b0000',
            primaryRGB: '255,69,0',
            secondaryRGB: '139,0,0'
        },
        purple: {
            primary: '#800080',
            secondary: '#4b0082',
            primaryRGB: '128,0,128',
            secondaryRGB: '75,0,130'
        },
        blue: {
            primary: '#0080ffff',
            secondary: '#005a8bff',
            primaryRGB: '0,0,255',
            secondaryRGB: '0,0,139'
        }
    };

    // Translations
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
            version: "Phiên bản v1.0.2.1",
            madeBy: "Được tạo bởi Difz25x (dựa trên IHaxU)"
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
            version: "Version v1.0.2.1",
            madeBy: "Made by Difz25x (based on IHaxU)"
        },
        id: {
            title: "Bypass Difz25x",
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
            version: "Versi v1.0.2.1",
            madeBy: "Dibuat oleh Difz25x (berdasarkan IHaxU)"
        },
    };

    // Translation function
    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    // Bypass Panel (UI)
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
            this.themeBtns = [];
            this.currentMessageKey = null;
            this.currentType = 'info';
            this.currentReplacements = {};
            this.isMinimized = false;
            this.body = null;
            this.minimizeBtn = null;
            this.theme = currentTheme;
            this.init();
        }

        init() {
            this.createPanel();
            this.setupEventListeners();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const currentThemeData = themes[currentTheme];

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
                    background: linear-gradient(135deg, #000000 0%, var(--primary) 100%);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    transition: all 0.3s ease;
                    border: 2px solid var(--primary);
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
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
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
                    background: rgba(var(--primary-rgb), 0.3);
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
                    border: 1px solid rgba(var(--primary-rgb), 0.3);
                }

                .status-box::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.1), transparent);
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
                .status-dot.waiting { background: #d66515ff; }
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

                .theme-section {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .theme-toggle {
                    display: flex;
                    gap: 10px;
                }

                .theme-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(var(--primary-rgb), 0.3);
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

                .theme-btn:hover {
                    background: rgba(var(--primary-rgb), 0.1);
                    transform: translateY(-2px);
                }

                .theme-btn.active {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    border-color: var(--primary);
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.4);
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
                    border: 2px solid rgba(var(--primary-rgb), 0.3);
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
                    background: rgba(var(--primary-rgb), 0.1);
                    transform: translateY(-2px);
                }

                .lang-btn.active {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    border-color: var(--primary);
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.4);
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
                    color: var(--primary);
                    font-weight: 700;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    font-size: 11px;
                }

                .links a {
                    color: var(--primary);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .links a:hover {
                    color: var(--secondary);
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

            // Set initial theme variables on shadow root for closed shadow DOM
            document.documentElement.style.setProperty('--primary', currentThemeData.primary);
            document.documentElement.style.setProperty('--secondary', currentThemeData.secondary);
            document.documentElement.style.setProperty('--primary-rgb', currentThemeData.primaryRGB);
            document.documentElement.style.setProperty('--secondary-rgb', currentThemeData.secondaryRGB);

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
                            <div class="theme-section">
                                <div class="theme-toggle">
                                    <button class="theme-btn ${currentTheme === 'orange' ? 'active' : ''}" data-theme="orange">Orange</button>
                                    <button class="theme-btn ${currentTheme === 'purple' ? 'active' : ''}" data-theme="purple">Purple</button>
                                    <button class="theme-btn ${currentTheme === 'blue' ? 'active' : ''}" data-theme="blue">Blue</button>
                                </div>
                            </div>
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
            this.themeBtns = Array.from(this.shadow.querySelectorAll('.theme-btn'));
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

            this.themeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentTheme = btn.dataset.theme;
                    this.updateTheme();
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

        updateTheme() {
            localStorage.setItem('theme', currentTheme);
            this.theme = currentTheme;

            this.themeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === currentTheme);
            });

            const currentThemeData = themes[this.theme];
            document.documentElement.style.setProperty('--primary', currentThemeData.primary);
            document.documentElement.style.setProperty('--secondary', currentThemeData.secondary);
            document.documentElement.style.setProperty('--primary-rgb', currentThemeData.primaryRGB);
            document.documentElement.style.setProperty('--secondary-rgb', currentThemeData.secondaryRGB);
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

    // Check host and run corresponding handlers
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    // Handler for VOLCANO
    function handleVolcano() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');
        if (debug) console.log('[Debug] Waiting Captcha');

        let alreadyDoneContinue = false;
        let alreadyDoneCopy = false;

        function actOnCheckpoint(node) {
            if (!alreadyDoneContinue) {
                const buttons = node && node.nodeType === 1
                    ? node.matches('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                        ? [node]
                        : node.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                    : document.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]');
                for (const btn of buttons) {
                    const text = (btn.innerText || btn.value || "").trim().toLowerCase();
                    if (text.includes("continue") || text.includes("next step")) {
                        const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
                        const style = getComputedStyle(btn);
                        const visible = style.display !== "none" && style.visibility !== "hidden" && btn.offsetParent !== null;
                        if (visible && !disabled) {
                            alreadyDoneContinue = true;
                            if (panel) panel.show('captchaSuccess', 'success');
                            if (debug) console.log('[Debug] Captcha Solved');

                            for (const btn of buttons) {
                                const currentBtn = btn;
                                const currentPanel = panel;

                                setTimeout(() => {
                                    try {
                                        currentBtn.click();
                                        if (currentPanel) currentPanel.show('redirectingToWork', 'info');
                                        if (debug) console.log('[Debug] Clicking Continue');
                                    } catch (err) {
                                        if (debug) console.log('[Debug] No Continue Found', err);
                                    }
                                }, 300);
                            }
                            return true;
                        }
                    }
                }
            }

            const copyBtn = node && node.nodeType === 1
                ? node.matches("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                    ? node
                    : node.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                : document.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']");
            if (copyBtn) {
                setInterval(() => {
                    try {
                        copyBtn.click();
                        if (debug) console.log('[Debug] Copy button spam click');
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                    } catch (err) {
                        if (debug) console.log('[Debug] No Copy Found', err);
                    }
                }, 500);
                return true;
            }

            return false;
        }

        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (actOnCheckpoint(node)) {
                                if (alreadyDoneCopy) {
                                    mo.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
                if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                    if (actOnCheckpoint(mutation.target)) {
                        if (alreadyDoneCopy) {
                            mo.disconnect();
                            return;
                        }
                    }
                }
            }
        });

        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'style'] });

        if (actOnCheckpoint()) {
            if (alreadyDoneCopy) {
                mo.disconnect();
            }
        }
    }
    // Handler for WORK.INK
    function handleWorkInk() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

        const startTime = Date.now();
        let sessionController = undefined;
        let sendMessageA = undefined;
        let onLinkInfoA = undefined;
        let onLinkDestinationA = undefined;
        let bypassTriggered = false;
        //
        const map = {
            onLI: ["onLinkInfo"],
            onLD: ["onLinkDestination"]
        };

        function getFunction(obj, candidates = null) {
            if (candidates) {
                for (let i = 0; i < candidates.length; i++) {
                    const name = candidates[i];
                    if (typeof obj[name] === "function") {
                        return { fn: obj[name], index: i, name };
                    }
                }
            } else {
                for (let i in obj) {
                    if (typeof obj[i] == "function" && obj[i].length == 2) {
                        return { fn: obj[i], name: i };
                    }
                }
            }
            return { fn: null, index: -1, name: null };
        }

        const types = {
            mo: 'c_monetization',
            ss: 'c_social_started',
            tr: 'c_turnstile_response',
            ad: 'c_adblocker_detected'
        };

        function triggerBypass(reason) {
            if (bypassTriggered) {
                if (debug) console.log('[Debug] trigger Bypass skipped, already triggered');
                return;
            }
            bypassTriggered = true;
            if (debug) console.log('[Debug] trigger Bypass via:', reason);
            if (panel) panel.show('captchaSuccessBypassing', 'success');
            
            if (debug) console.log('[Debug] Phase 1: Firing initial 5x spoof burst');
            for (let i = 0; i < 5; i++) {
                spoofWorkink();
            }
            
            setTimeout(() => {
                const dest = getFunction(sessionController, map.onLD);
                if (dest.fn && !sessionController?.linkDestination) {
                    if (debug) console.log('[Debug] Phase 2: 5s passed, no destination. Firing fallback burst');
                    for (let i = 0; i < 5; i++) {
                        spoofWorkink();
                    }
                } else {
                    if (debug) console.log('[Debug] Phase 2: Destination already received, skipping fallback');
                }
            }, 5000);         
            if (debug) console.log('[Debug] Waiting for server to send destination data...');
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) {
                if (debug) console.log('[Debug] spoof Workink skipped: no sessionController.linkInfo');
                return;
            }
            if (debug) console.log('[Debug] spoof Workink starting, linkInfo:', sessionController.linkInfo);
            for (const soc of sessionController.linkInfo.socials || []) {
                if (sendMessageA) {
                    sendMessageA.call(this, types.ss, { url: soc.url });
                    if (debug) console.log('[Debug] Faked social:', soc.url);
                } else {
                    if (debug) console.warn('[Debug] No send message for social:', soc.url);
                }
            }
            for (const monetization of sessionController.linkInfo.monetizations || []) {
                let type, payload;
                switch (monetization) {
                    case 22:
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'readArticles2', payload: { event: 'read' } });
                        if (debug) console.log('[Debug] Faked readArticles2');
                        break;
                    case 25:
                        type = 'operaGX'; payload = { event: 'installClicked' };
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'operaGX', payload: { event: 'start' } });
                        fetch('https://work.ink/_api/v2/callback/operaGX', {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ noteligible: true })
                        }).catch((e) => { if (debug) console.warn('[Debug] operaGX fetch failed:', e); });
                        if (debug) console.log('[Debug] Faked operaGX');
                        break;
                    case 34:
                        type = 'norton'; payload = { event: 'installClicked' };
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'norton', payload: { event: 'start' } });
                        if (debug) console.log('[Debug] Faked norton install');
                        break;
                    case 71:
                        type = 'externalArticles'; payload = { event: 'installClicked' };
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'externalArticles', payload: { event: 'start' } });
                        if (debug) console.log('[Debug] Faked externalArticles');
                        break;
                    case 45:
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'pdfeditor', payload: { event: 'installed' } });
                        if (debug) console.log('[Debug] Faked pdfeditor install');
                        break;
                    case 57:
                        sendMessageA && sendMessageA.call(this, types.mo, { type: 'betterdeals', payload: { event: 'installed' } });
                        if (debug) console.log('[Debug] Faked betterdeals install');
                        break;
                    default:
                        if (debug) console.log('[Debug] Unknown monetization:', monetization);
                }
            }
        }

        function trm() {
            return function(...a) {
                const [msgType] = a;
                if (msgType === types.ad) {
                    if (debug) console.log('[Debug] trm: Skipping adblocker message');
                    return;
                }
                if (sessionController?.linkInfo && msgType === types.tr) {
                    if (debug) console.log('[Debug] Captcha bypassed via TR');
                    triggerBypass('tr');
                }
                return sendMessageA ? sendMessageA.apply(this, a): undefined;
            };
        }

        function createLinkInfoProxy() {
            return function(...args) {
                const [info] = args;
                if (debug) console.log('[Debug] Link info:', info);
                try {
                    Object.defineProperty(info, 'isAdblockEnabled', {
                        get: () => false,
                        set: () => {},
                        configurable: false,
                        enumerable: true
                    });
                    if (debug) console.log('[Debug] Adblock disabled in linkInfo');
                } catch (e) {
                    if (debug) console.warn('[Debug] Define Property failed:', e);
                }
                return onLinkInfoA ? onLinkInfoA.apply(this, args): undefined;
            };
        }

        function redirect(url) {
            if (debug) console.log('[Debug] Redirecting to:', url);
            window.location.href = url;
        }

        function startCountdown(url, waitLeft) {
            if (debug) console.log('[Debug] startCountdown: Started with', waitLeft, 'seconds');
            if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });

            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (debug) console.log('[Debug] startCountdown: Time remaining:', waitLeft);
                    if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function createDestinationProxy() {
            return function(...args) {
                const [data] = args;
                const secondsPassed = (Date.now() - startTime) / 1000;
                if (debug) console.log('[Debug] Destination data:', data);

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
                return onLinkDestinationA ? onLinkDestinationA.apply(this, args): undefined;
            };
        }

        function triggerBp() {
            if (sessionController?.linkDestination) {
                createDestinationProxy().call(sessionController, sessionController.linkDestination);
            }
        }

        function setupProxies() {
            const send = getFunction(sessionController);
            const info = getFunction(sessionController, map.onLI);
            const dest = getFunction(sessionController, map.onLD);

            if (!send.fn || !info.fn || !dest.fn) return;

            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;

            try {
                Object.defineProperty(sessionController, send.name, {
                    get: trm,
                    set: v => (sendMessageA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, info.name, {
                    get: createLinkInfoProxy,
                    set: v => (onLinkInfoA = v),
                    configurable: true
                });
                Object.defineProperty(sessionController, dest.name, {
                    get: createDestinationProxy,
                    set: v => (onLinkDestinationA = v),
                    configurable: true
                });
                if (debug) console.log('[Debug] setupProxies: Proxies set successfully');
            } catch (e) {
                if (debug) console.warn('[Debug] setupProxies: Failed to set proxies:', e);
            }
        }

        function checkController(target, prop, value) {
            if (value &&
                typeof value === 'object' &&
                getFunction(value).fn &&
                getFunction(value, map.onLI).fn &&
                getFunction(value, map.onLD).fn &&
                !sessionController) {
                sessionController = value;
                if (debug) console.log('[Debug] Controller detected:', sessionController);
                setupProxies();
            } else {
                if (debug) console.log('[Debug] checkController: No controller found for prop:', prop);
            }
            return Reflect.set(target, prop, value);
        }

        function createComponentProxy(comp) {
            return new Proxy(comp, {
                construct(target, args) {
                    const instance = Reflect.construct(target, args);
                    if (instance.$$.ctx) {
                        instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
                    }
                    return instance;
                }
            });
        }

        function createNodeProxy(node) {
            return async (...args) => {
                const result = await node(...args);
                return new Proxy(result, {
                    get: (t, p) => p === 'component' ? createComponentProxy(t.component) : Reflect.get(t, p)
                });
            };
        }

        function createKitProxy(kit) {
            if (!kit?.start) return [false, kit];
            return [
                true,
                new Proxy(kit, {
                    get(target, prop) {
                        if (prop === 'start') {
                            return function(...args) {
                                const [nodes, , opts] = args;
                                if (nodes?.nodes && opts?.node_ids) {
                                    const idx = opts.node_ids[1];
                                    if (nodes.nodes[idx]) {
                                        nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                                    }
                                }
                                return kit.start.apply(this, args);
                            };
                        }
                        return Reflect.get(target, prop);
                    }
                })
            ];
        }

        function setupInterception() {
            const origPromiseAll = unsafeWindow.Promise.all;
            let intercepted = false;

            unsafeWindow.Promise.all = async function(promises) {
                const result = origPromiseAll.call(this, promises);
                if (!intercepted) {
                    intercepted = true;
                    return await new Promise((resolve) => {
                        result.then(([kit, app, ...args]) => {
                            if (debug) console.log('[Debug]: Set up Interception!');

                            const [success, created] = createKitProxy(kit);
                            if (success) {
                                unsafeWindow.Promise.all = origPromiseAll;
                                if (debug) console.log('[Debug]: Kit ready', created, app);
                            }
                            resolve([created, app, ...args]);
                        });
                    });
                }
                return await result;
            };
        }

        setupInterception();

        const ob = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.classList?.contains("adsbygoogle")) {
                            node.remove();
                            if (debug) console.log('[Debug]: Removed injected ad', node);
                        }
                        node.querySelectorAll?.('.adsbygoogle, [id*=ad], [id*=container]').forEach((el) => {
                            el.remove();
                            if (debug) console.log('[Debug]: Removed nested ad', el);
                        });
                        if (node.matches('.button.large.accessBtn.pos-relative.svelte-bv7qlp') && node.textContent.includes('Go To Destination')) {
                            if (debug) console.log('[Debug] GTD button detected');

                            if (!bypassTriggered) {
                                if (sessionController && getFunction(sessionController, map.onLD).fn) {
                                    triggerBypass('gtd');
                                    if (debug) console.log('[Debug] Captcha bypassed via GTD:', node);
                                } else {
                                    if (debug) console.log('[Debug] GTD detected but sessionController not ready, waiting for TR instead');
                                }
                            } else {
                                if (debug) console.log('[Debug] GTD ignored: bypass already triggered via TR');
                            }
                        }
                    }
                }
            }
        });
        ob.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
