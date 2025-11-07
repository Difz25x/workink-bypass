(function () {
    'use strict';

    const host = location.hostname;
    const defaultTime = 8;
    const normalTime = 60;
    const ver = "1.0.6.4";

    let currentLanguage = localStorage.getItem('lang') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'orange';
    let currentTime = localStorage.getItem('waitTime') || defaultTime;

    const themes = {
        orange: {
            primary: '#ff4500',
            secondary: '#cc1616ff',
            primaryRGBA: '255, 69, 0, 1',
            secondaryRGBA: '204, 22, 22, 1',
            background: 'linear-gradient(135deg, #4e2606ff 0%, #5f2e06ff 50%, #783004ff 100%)',
            glow: 'rgba(221, 127, 77, 1)'
        },
        purple: {
            primary: '#800080',
            secondary: '#4b0082',
            primaryRGBA: '128, 0, 128, 1',
            secondaryRGBA: '75, 0, 130, 1',
            background: 'linear-gradient(135deg, #25064eff 0%, #27065fff 50%, #320478ff 100%)',
            glow: 'rgba(164, 95, 225, 1)'
        },
        blue: {
            primary: '#0080ffff',
            secondary: '#005a8bff',
            primaryRGBA: '0, 128, 255, 1',
            secondaryRGBA: '0, 90, 139, 1',
            background: 'linear-gradient(135deg, #06304eff 0%, #063d5fff 50%, #044878ff 100%)',
            glow: 'rgba(0, 37, 139, 1)'
        },
        green: {
            primary: '#10b981',
            secondary: '#059669',
            primaryRGBA: '16, 185, 129, 1',
            secondaryRGBA: '5, 150, 105, 1',
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            glow: 'rgba(73, 209, 152, 1)'
        },
        rgb: {
            primary: '#ff4500',
            secondary: '#cc1616ff',
            primaryRGBA: '255, 69, 0, 1',
            secondaryRGBA: '204, 22, 22, 1',
            background: 'linear-gradient(135deg, #4e2606ff 0%, #5f2e06ff 50%, #783004ff 100%)',
            glow: '#e28757ff',
            isRGB: true
        }
    };

    const translations = {
        vi: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Vui lòng hoàn thành CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã được xác minh thành công",
            redirectingToWork: "Đang chuyển hướng đến Work.ink...",
            bypassSuccessCopy: "Bypass thành công! Khóa đã được sao chép",
            bypassSuccess: "Bỏ qua thành công, đang chờ...",
            backToCheckpoint: "Đang quay lại điểm kiểm tra...",
            captchaSuccessBypassing: "CAPTCHA đã thành công, đang tiến hành bypass...",
            expiredLink: "Liên kết của bạn không hợp lệ hoặc đã hết hạn",
            version: `Phiên bản ${ver}`,
            madeBy: "Được tạo bởi Difz25x",
            timeSaved: "THỜI GIAN TIẾT KIỆM",
            redirectIn: "CHUYỂN HƯỚNG SAU",
            waitTime: "Thời gian chờ",
            instant: "Tức thì"
        },
        en: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Please complete the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            bypassSuccessCopy: "Bypass successful! Key copied",
            bypassSuccess: "Bypass successful, waiting...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            expiredLink: "Your link is invalid or expired",
            version: `Version ${ver}`,
            madeBy: "Made by Difz25x",
            timeSaved: "TIME SAVED",
            redirectIn: "REDIRECT IN",
            waitTime: "Wait Time",
            instant: "Instant"
        },
        id: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Harap lengkapi CAPTCHA untuk melanjutkan",
            captchaSuccess: "CAPTCHA berhasil diselesaikan",
            redirectingToWork: "Mengalihkan ke Work.ink...",
            bypassSuccessCopy: "Bypass berhasil! Kunci disalin",
            bypassSuccess: "Bypass berhasil, menunggu...",
            backToCheckpoint: "Kembali ke checkpoint...",
            captchaSuccessBypassing: "CAPTCHA berhasil diselesaikan, melewati...",
            expiredLink: "Tautan Anda tidak valid atau kedaluwarsa",
            version: `Versi ${ver}`,
            madeBy: "Dibuat oleh Difz25x",
            timeSaved: "WAKTU TERSIMPAN",
            redirectIn: "ALIHKAN DALAM",
            waitTime: "Waktu Tunggu",
            instant: "Instan"
        }
    };

    function t(key) {
        return translations[currentLanguage][key] || key;
    }

    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.statusText = null;
            this.timeSavedEl = null;
            this.redirectingEl = null;
            this.waitSlider = null;
            this.progressFill = null;
            this.timerStart = null;
            this.timerDuration = null;
            this.timerRAF = null;
            this.isRunning = false;
            this.savedTime = 0;
            this.currentMessageKey = 'pleaseSolveCaptcha';
            this.init();
        }

        init() {
            this.createPanel();
            this.attachEvents();
            this.setWaitValue(currentTime);
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'open' });

            const style = document.createElement('style');
            style.textContent = `
                :host { all: initial; }
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

                .panel-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 520px;
                    z-index: 2147483647;
                }

                .panel {
                    background: var(--background-gradient);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5),
                                0 0 0 1px rgba(255,255,255,0.1) inset;
                    backdrop-filter: blur(20px);
                    position: relative;
                    overflow: hidden;
                }

                .panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg,
                        transparent,
                        var(--primary-color),
                        transparent);
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 20px var(--glow-color), 0.5);
                }

                .controls {
                    display: flex;
                    gap: 8px;
                }

                .control-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .control-btn:hover {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px var(--glow-color), 0.4);
                }

                .status-card {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .status-text {
                    font-size: 14px;
                    color: #fff;
                    font-weight: 500;
                    text-align: center;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .stat-card {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    overflow: hidden;
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg,
                        transparent,
                        var(--primary-color),
                        transparent);
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--primary-color);
                    text-shadow: 0 0 20px var(--glow-color), 2);
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 10px;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .slider-section {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .slider-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .slider-title {
                    font-size: 12px;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                }

                .slider-value {
                    font-size: 12px;
                    color: var(--primary-color);
                    font-weight: 700;
                }

                .slider {
                    width: 100%;
                    height: 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    outline: none;
                    -webkit-appearance: none;
                    margin-bottom: 12px;
                }

                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px var(--glow-color), 2);
                    transition: all 0.3s;
                }

                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 25px var(--glow-color), 0.8);
                }

                .slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 15px var(--glow-color), 0.6);
                }

                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                    border-radius: 10px;
                    transition: width 0.1s linear;
                    box-shadow: 0 0 15px var(--glow-color), 0.6);
                }

                .slider-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: rgba(255,255,255,0.4);
                }

                .footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 16px;
                    font-size: 11px;
                    color: rgba(255,255,255,0.4);
                }

                @media (max-width: 460px) {
                    .panel-container {
                        left: 12px;
                        right: 12px;
                        width: auto;
                        bottom: 12px;
                    }
                }

                @keyframes rgb-shift {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }

                .rgb-mode {
                    animation: rgb-shift 3s linear infinite;
                }
            `;

            this.shadow.appendChild(style);

            const html = `
                <div class="panel-container">
                    <div class="panel" id="main-panel">
                        <div class="header">
                            <div class="title" id="panel-title">${t('title')}</div>
                            <div class="controls">
                                <button id="lang-btn" class="control-btn">${currentLanguage.toUpperCase()}</button>
                                <button id="theme-btn" class="control-btn">${currentTheme.toUpperCase()}</button>
                            </div>
                        </div>

                        <div class="status-card">
                            <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" id="time-saved">0s</div>
                                <div class="stat-label" id="saved-label">${t('timeSaved')}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="redirect-time">--</div>
                                <div class="stat-label" id="redirect-label">${t('redirectIn')}</div>
                            </div>
                        </div>

                        <div class="slider-section">
                            <div class="slider-header">
                                <div class="slider-title" id="wait-title">${t('waitTime')}</div>
                                <div class="slider-value" id="wait-value">24s</div>
                            </div>
                            <input type="range" id="wait-slider" class="slider" min="0" max="30" value="15">
                            <div class="slider-labels">
                                <span id="instant-label">${t('instant')}</span>
                                <span>30s</span>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill"></div>
                            </div>
                        </div>

                        <div class="footer">
                            <span id="version-text">${t('version')}</span>
                            <span id="credit-text">${t('madeBy')}</span>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            this.shadow.appendChild(wrapper.firstElementChild);

            this.statusText = this.shadow.getElementById('status-text');
            this.timeSavedEl = this.shadow.getElementById('time-saved');
            this.redirectingEl = this.shadow.getElementById('redirect-time');
            this.waitSlider = this.shadow.getElementById('wait-slider');
            this.waitValueEl = this.shadow.getElementById('wait-value');
            this.progressFill = this.shadow.getElementById('progress-fill');
            this.mainPanel = this.shadow.getElementById('main-panel');

            this.themeStyle = document.createElement('style');
            this.shadow.appendChild(this.themeStyle);

            this.applyTheme();
            document.documentElement.appendChild(this.container);
        }

        attachEvents() {
            this.waitSlider.value = currentTime;
            this.setWaitValue(currentTime);

            this.waitSlider.addEventListener('input', (e) => {
                const sec = parseInt(e.target.value);
                this.setWaitValue(sec);
                localStorage.setItem('waitTime', sec);
                currentTime = sec;
            });

            this.shadow.getElementById('lang-btn').addEventListener('click', () => {
                const langs = ['en', 'vi', 'id'];
                const idx = langs.indexOf(currentLanguage);
                currentLanguage = langs[(idx + 1) % langs.length];
                localStorage.setItem('lang', currentLanguage);
                this.updateLanguage();
            });

            this.shadow.getElementById('theme-btn').addEventListener('click', () => {
                const themeKeys = Object.keys(themes);
                const idx = themeKeys.indexOf(currentTheme);
                currentTheme = themeKeys[(idx + 1) % themeKeys.length];
                localStorage.setItem('theme', currentTheme);
                this.applyTheme();
                this.shadow.getElementById('theme-btn').textContent = currentTheme.toUpperCase();
            });
        }

        updateLanguage() {
            this.shadow.getElementById('lang-btn').textContent = currentLanguage.toUpperCase();
            this.shadow.getElementById('panel-title').textContent = t('title');
            this.shadow.getElementById('status-text').textContent = t(this.currentMessageKey);
            this.shadow.getElementById('saved-label').textContent = t('timeSaved');
            this.shadow.getElementById('redirect-label').textContent = t('redirectIn');
            this.shadow.getElementById('wait-title').textContent = t('waitTime');
            this.shadow.getElementById('instant-label').textContent = t('instant');
            this.shadow.getElementById('version-text').textContent = t('version');
            this.shadow.getElementById('credit-text').textContent = t('madeBy');
        }

        setWaitValue(seconds) {
            this.waitValueEl.textContent = `${seconds}s`;
            this.waitSlider.value = seconds;
        }

        startTimer(duration) {
            this.stopTimer();
            if (!duration || duration <= 0) {
                this.redirectingEl.textContent = '--';
                this.progressFill.style.width = '0%';
                return;
            }

            this.timerDuration = duration;
            this.timerStart = performance.now();
            this.isRunning = true;
            this.waitSlider.disabled = true;

            const loop = (now) => {
                if (!this.isRunning) return;
                const elapsed = (now - this.timerStart) / 1000;
                const progress = Math.min(1, elapsed / this.timerDuration);
                this.progressFill.style.width = `${progress * 100}%`;
                const rem = Math.max(0, Math.ceil(this.timerDuration - elapsed));
                this.redirectingEl.textContent = `${rem}s`;

                if (progress >= 1) {
                    this.finishTimer();
                    return;
                }
                this.timerRAF = requestAnimationFrame(loop);
            };

            this.timerRAF = requestAnimationFrame(loop);
        }

        stopTimer() {
            if (this.timerRAF) {
                cancelAnimationFrame(this.timerRAF);
                this.timerRAF = null;
            }
            this.isRunning = false;
        }

        finishTimer() {
            this.stopTimer();
            this.progressFill.style.width = '100%';
            this.redirectingEl.textContent = '0s';
        }

        applyTheme() {
            const theme = themes[currentTheme];
            if (!theme) return;

            const css = `
                :host {
                    --primary-color: ${theme.primary};
                    --secondary-color: ${theme.secondary};
                    --primary-rgba: ${theme.primaryRGBA};
                    --secondary-rgba: ${theme.secondaryRGBA};
                    --background-gradient: ${theme.background};
                    --glow-color: ${theme.glow};
                }
            `;

            this.themeStyle.textContent = css;

            if (theme.isRGB) {
                this.mainPanel.classList.add('rgb-mode');
            } else {
                this.mainPanel.classList.remove('rgb-mode');
            }
        }

        show(messageKey, type = 'info') {
            this.currentMessageKey = messageKey;
            this.statusText.textContent = t(messageKey);
        }
    }

    let panel = null;
    setTimeout(() => {
        panel = new BypassPanel();
        panel.show('pleaseSolveCaptcha', 'info');
    }, 100);

    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    // Handler for VOLCANO
    function handleVolcano() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

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

                            for (const btn of buttons) {
                                const currentBtn = btn;
                                const currentPanel = panel;

                                setTimeout(() => {
                                    try {
                                        currentBtn.click();
                                        if (currentPanel) currentPanel.show('redirectingToWork', 'info');
                                    } catch (err) {
                                        setTimeout(actOnCheckpoint, 1000)
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
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                    } catch (err) {
                        copyBtn.click();
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
        let destinationReceived = false;
        let destinationProcessed = false;

        const map = {
            onLI: ["onLinkInfo"],
            onLD: ["onLinkDestination"]
        };

        function getFunction(obj, candidates = null) {
            if (!obj || typeof obj !== "object") {
                return { fn: null, index: -1, name: null };
            }

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
            an: 'c_announce',
            mo: 'c_monetization',
            ss: 'c_social_started',
            rr: 'c_recaptcha_response',
            hr: 'c_hcaptcha_response',
            tr: 'c_turnstile_response',
            ad: 'c_adblocker_detected',
            fl: 'c_focus_lost',
            os: 'c_offers_skipped',
            ok: 'c_offer_skipped',
            fo: 'c_focus',
            wp: 'c_workink_pass_available',
            wu: 'c_workink_pass_use',
            pi: 'c_ping',
            kk: 'c_keyapp_key'
        };


        function triggerBypass(reason) {
            if (bypassTriggered) {
                return;
            }
            bypassTriggered = true;
            console.log('[Debug] trigger Bypass via:', reason);
            if (panel) panel.show('captchaSuccessBypassing', 'success');
            let retryCount = 0;

            function keepSpoofing() {
                if (destinationReceived) {
                    return;
                }
                retryCount++;
                spoofWorkink();
                setTimeout(keepSpoofing, 3000);
            }
            keepSpoofing();
        }

        function spoofWorkink() {
            if (!onLinkInfoA) {
                return;
            }

            const socials = onLinkInfoA.socials || [];
            console.log('[Debug] Total socials to fake:', socials.length);

            for (let i = 0; i < socials.length; i++) {
                const soc = socials[i];
                try {
                    if (sendMessageA) {
                        sendMessageA.call(sessionController, types.ss, { url: soc.url });
                        console.log(`[Debug] Faked social [${i+1}/${socials.length}]:`, soc.url);
                    } else {
                        console.warn(`[Debug] No send message for social [${i+1}/${socials.length}]:`, soc.url);
                    }
                } catch (e) {
                    console.error(`[Debug] Error faking social [${i+1}/${socials.length}]:`, soc.url, e);
                }
            }

            const monetizations = sessionController?.monetizations || [];
            console.log('[Debug] Total monetizations to fake:', monetizations.length);

            for (let i = 0; i < monetizations.length; i++) {
                const monetization = monetizations[i];
                console.log(`[Debug] Processing monetization [${i+1}/${monetizations.length}]:`, monetization);
                const monetizationId = monetization.id;
                const monetizationSendMessage = monetization.sendMessage;
                try {
                    switch (monetizationId) {
                        case 22: {
                            monetizationSendMessage.call(monetization, { event: 'read' });
                            break;
                        }
                        case 25: {
                            monetizationSendMessage.call(monetization, { event: 'start' });
                            monetizationSendMessage.call(monetization, { event: 'installedClicked' });
                            monetizationSendMessage.call(monetization, { event: 'done' });
                            fetch('/_api/v2/affiliate/operaGX', { method: 'GET', mode: 'no-cors' });
                            setTimeout(() => {
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
                            }, 5000);
                            break;
                        }
                        case 34: {
                            monetizationSendMessage.call(monetization, { event: 'start' });
                            monetizationSendMessage.call(monetization, { event: 'installedClicked' });
                            break;
                        }
                        case 71: {
                            monetizationSendMessage.call(monetization, { event: 'start' });
                            monetizationSendMessage.call(monetization, { event: 'installed' });
                            break;
                        }
                        case 45: {
                            monetizationSendMessage.call(monetization, { event: 'installed' });
                            break;
                        }
                        case 57: {
                            monetizationSendMessage.call(monetization, { event: 'installed' });
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } catch (e) {
                    console.error(`[Debug] Error faking monetization [${i+1}/${monetizations.length}]:`, monetization, e);
                }
            }
        }

        function trm() {
            return function(...a) {
                const [msgType] = a;
                const packet_type = a[0];
                const packet_data = a[1];
                if (packet_type !== types.pi) {
                    console.log('[Debug] Message sent:', packet_type, packet_data);
                }
                if (packet_type === types.tr) {
                    triggerBypass('tr');
                }
                return sendMessageA ? sendMessageA.apply(this, a): undefined;
            };
        }

        function createLinkInfoProxy() {
            return async function(...args) {
                const [data] = args;
                console.log("[Debug] LinkInfo data: ", data)
                try {
                    Object.defineProperty(data, 'isAdblockEnabled', {
                        get: () => false,
                        set: () => {},
                        configurable: false,
                        enumerable: true
                    });
                } catch (e) {

                }
                return onLinkInfoA ? onLinkInfoA.apply(this, args): undefined;
            };
        }

        function redirect(url) {
            if (panel) panel.show('backToCheckpoint', 'info')
            window.location.href = url;
        }

        function startCountdown(url, waitLeft) {
            if (panel) panel.show('bypassSuccess', 'warning');

            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (panel) panel.show('bypassSuccess', 'warning');
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function createDestinationProxy() {
            return async function(...args) {
                const [data] = args;
                destinationReceived = true;
                console.log("[Debug] Destination data: ", data)

                if (!destinationProcessed) {
                    destinationProcessed = true;
                    const waitTimeSeconds = parseInt(panel.waitSlider.value);
                    if (waitTimeSeconds < 0){
                        redirect(data.url)
                    } else {
                        startCountdown(data.url, waitTimeSeconds);
                    }
                    panel.startTimer(waitTimeSeconds);
                    const savedTime = normalTime - waitTimeSeconds;
                    panel.savedTime += savedTime;
                    panel.timeSavedEl.textContent = `${panel.savedTime}s`;
                }
                return onLinkDestinationA ? onLinkDestinationA.apply(this, args): undefined;
            };
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
            } catch (e) {

            }
        }

        function checkController(target, prop, value) {
            if (value &&
                typeof value === 'object' &&
                getFunction(value).fn &&
                getFunction(value, map.onLI).fn &&
                getFunction(value, map.onLD).fn &&
                !sessionController
            ) {
                sessionController = value;
                setupProxies();
                console.log('[Debug] Controller detected:', sessionController);
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
                    return await new unsafeWindow.Promise((resolve) => {
                        result.then(([kit, app, ...args]) => {
                            const [success, created] = createKitProxy(kit);
                            if (success) {
                                unsafeWindow.Promise.all = origPromiseAll;
                            }
                            resolve([created, app, ...args]);
                        });
                    });
                }
                return await result;
            };
        }

        window.googletag = {cmd: [], _loaded_: true};

        const blockedClasses = [
            "adsbygoogle",
            "adsense-wrapper",
            "inline-ad",
            "gpt-billboard-container",
            "[&:not(:first-child)]:mt-12",
            "lg:block"
        ];

        const blockedIds = [
            "billboard-1",
            "billboard-2",
            "billboard-3",
            "sidebar-ad-1",
            "skyscraper-ad-1"
        ];

        setupInterception();

        const ob = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) {
                        blockedClasses.forEach((cls) => {
                            if (node.classList?.contains(cls)) {
                                node.remove();
                                console.log('[Debug]: Removed ad by class:', cls, node);
                            }
                            node.querySelectorAll?.(`.${CSS.escape(cls)}`).forEach((el) => {
                                el.remove();
                                console.log('[Debug]: Removed nested ad by class:', cls, el);
                            });
                        });

                        blockedIds.forEach((id) => {
                            if (node.id === id) {
                                node.remove();
                                console.log('[Debug]: Removed ad by id:', id, node);
                            }
                            node.querySelectorAll?.(`#${id}`).forEach((el) => {
                                el.remove();
                                console.log('[Debug]: Removed nested ad by id:', id, el);
                            });
                        });

                        let btnId = "1ao8oou"

                        if (node.matches(`.button.large.accessBtn.pos-relative.svelte-${btnId}`) && node.textContent.includes('Go To Destination')) {
                            triggerBypass('gtd');
                        }
                    }
                }
            }
        });
        ob.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }
})();
