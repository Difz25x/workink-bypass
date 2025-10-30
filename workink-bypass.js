(function () {
    'use strict';

    const host = location.hostname; // check host
    const debug = true // enable debug logs (console)
    const otherTime = 24
    const normalTime = 60 // normal time if do without bypass

    let currentLanguage = localStorage.getItem('lang') || 'en'; // default language: en/vi/id
    let currentTheme = localStorage.getItem('theme') || 'orange';

    const themes = {
        orange: {
            primary: '#ff4500',
            secondary: '#cc1616ff',
            primaryRGBA: '255, 69, 0, 1',
            secondaryRGBA: '204, 22, 22, 1',
            background: 'linear-gradient(415deg, #000000 0%, #ff4500 100%)'
        },
        purple: {
            primary: '#800080',
            secondary: '#4b0082',
            primaryRGBA: '128, 0, 128, 1',
            secondaryRGBA: '75, 0, 130, 1',
            background: 'radial-gradient(circle, #800080 0%, #000000 100%)'
        },
        blue: {
            primary: '#0080ffff',
            secondary: '#005a8bff',
            primaryRGBA: '0, 128, 255, 1',
            secondaryRGBA: '0, 90, 139, 1',
            background: 'linear-gradient(415deg, #0080ffff 0%, #000000 100%)'
        },
        rgb: {
            primary: '#ff4500',
            secondary: '#cc1616ff',
            primaryRGBA: '255, 69, 0, 1',
            secondaryRGBA: '204, 22, 22, 1',
            background: 'linear-gradient(415deg, #000000 0%, #ff4500 100%)',
            isRGB: true
        }
    };

    // Translations
    const translations = {
        vi: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Vui lòng hoàn thành CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã được xác minh thành công",
            redirectingToWork: "Đang chuyển hướng đến Work.ink...",
            clickingContinue: "Đã nhấp nút Tiếp tục",
            errorClickingContinue: "Lỗi khi nhấp nút Tiếp tục",
            autoClickCopy: "Đã tự động nhấp nút sao chép khóa",
            gettingLinkDestination: "Lấy đích liên kết thành công!",
            gettingLinkInfo: "Lấy thông tin liên kết thành công!",
            bypassSuccessCopy: "Bypass thành công! Khóa đã được sao chép (nhấn 'Cho phép' nếu được yêu cầu)",
            errorCopy: "Lỗi khi sao chép khóa",
            copyButtonNotFound: "Không tìm thấy nút sao chép",
            waitingCaptcha: "Đang chờ CAPTCHA...",
            successDetected: "Đã phát hiện thành công, chuẩn bị nhấp...",
            bypassSuccess: "Bypass thành công, vui lòng đợi {time}s...",
            backToCheckpoint: "Đang quay lại điểm kiểm tra...",
            captchaSuccessBypassing: "CAPTCHA đã thành công, đang tiến hành bypass...",
            loaderBtn: "Nút chưa tải, vui lòng tải lại trang",
            expiredLink: "Liên kết của bạn không hợp lệ hoặc đã hết hạn, được chuyển hướng đến đây. Hãy lấy liên kết mới.",
            version: "Phiên bản 1.0.4.0",
            madeBy: "Được tạo bởi Difz25x (dựa trên IHaxU)"
        },
        en: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Please complete the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            clickingContinue: "Continue button clicked",
            errorClickingContinue: "Error clicking the Continue button",
            autoClickCopy: "Automatically clicked the copy key button",
            gettingLinkDestination: "Getting link destination successful!",
            gettingLinkInfo: "Getting link info successful!",
            bypassSuccessCopy: "Bypass successful! Key copied (click 'Allow' if prompted)",
            errorCopy: "Error copying the key",
            copyButtonNotFound: "Copy button not found",
            waitingCaptcha: "Waiting for CAPTCHA...",
            successDetected: "Success detected, preparing to click...",
            bypassSuccess: "Bypass successful, bypassing waiting...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            expiredLink: "Your link is invalid or expired, redirected here. Get a new one.",
            loaderBtn: "Button not loaded, please reload the page",
            version: "Version 1.0.4.0",
            madeBy: "Made by Difz25x (based on IHaxU)"
        },
        id: {
            title: "Difz25x",
            pleaseSolveCaptcha: "Harap lengkapi CAPTCHA untuk melanjutkan",
            captchaSuccess: "CAPTCHA berhasil diselesaikan",
            redirectingToWork: "Mengalihkan ke Work.ink...",
            clickingContinue: "Tombol Lanjutkan diklik",
            errorClickingContinue: "Kesalahan mengklik tombol Lanjutkan",
            autoClickCopy: "Otomatis mengklik tombol salin kunci",
            gettingLinkDestination: "Mendapatkan tujuan tautan berhasil!",
            gettingLinkInfo: "Mendapatkan info tautan berhasil!",
            bypassSuccessCopy: "Bypass berhasil! Kunci disalin (klik 'Izinkan' jika diminta)",
            errorCopy: "Kesalahan menyalin kunci",
            copyButtonNotFound: "Tombol salin tidak ditemukan",
            waitingCaptcha: "Menunggu CAPTCHA...",
            successDetected: "Keberhasilan terdeteksi, mempersiapkan klik...",
            bypassSuccess: "Bypass berhasil, melewati waktu tunggu...",
            backToCheckpoint: "Kembali ke checkpoint...",
            captchaSuccessBypassing: "CAPTCHA berhasil diselesaikan, melewati...",
            expiredLink: "Tautan Anda tidak valid atau kedaluwarsa, dialihkan ke sini. Dapatkan yang baru.",
            loaderBtn: "Tombol belum dimuat, harap muat ulang halaman",
            version: "Versi 1.0.4.0",
            madeBy: "Dibuat oleh Difz25x (berdasarkan IHaxU)"
        }
    };

    // Translation function
    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    function log(...args) {
        if (debug) console.log('[DEBUG]', ...args);
    }

    // Bypass Panel (UI)
    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;

            this.statusText = null;
            this.statusDot = null;

            this.timeSavedEl = null;
            this.redirectingEl = null;

            this.waitSlider = null;
            this.waitValueEl = null;
            this.progressFill = null;

            this.versionEl = null;
            this.creditEl = null;

            // Timer state
            this.timerStart = null;
            this.timerDuration = null;
            this.timerRAF = null;
            this.remaining = 0;
            this.isRunning = false;

            this.savedTime = 0; // example "time saved" counter

            this.init();
        }

        init() {
            this.createPanel();
            this.attachEvents();

            // set default wait time based on host, but do not start timer yet
            const defaultTime = otherTime;
            this.setWaitValue(defaultTime);
        }

        createPanel() {
            // create host container + closed shadow to avoid clash
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'open' });

            const style = document.createElement('style');
            style.textContent = `
                :host { all: initial; }
                * { box-sizing: border-box; font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; }
                .panel-container {
                    position: fixed;
                    bottom: 18px;
                    right: 18px;
                    width: 450px;
                    max-height: 80vh;
                    z-index: 2147483647;
                    cursor: default;
                }
                .panel {
                    background: linear-gradient(135deg, #0f1113 0%, #1a1d20 100%);
                    border-radius: 16px;
                    padding: 16px;
                    color: #e5e7eb;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                .header {
                    display:flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 6px;
                    margin-bottom: 8px;
                }
                .title {
                    font-weight: 700;
                    font-size: 16px;
                    color: #f3f4f6;
                }
                .controls {
                    display: flex;
                    gap: 8px;
                }
                .control-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #d7d7d7;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .control-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                .version {
                    font-size: 11px;
                    color: rgba(255,255,255,0.45);
                }
                .status-section {
                    margin: 6px 0 12px 0;
                }
                .status-box {
                    background: #121418;
                    border-radius: 10px;
                    padding: 12px;
                    border: 1px solid rgba(255,255,255,0.02);
                    display:flex;
                    gap:10px;
                    align-items:center;
                }
                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #60a5fa;
                    box-shadow: 0 0 8px rgba(58,130,247,0.18);
                    flex-shrink: 0;
                }
                .status-text {
                    font-size: 13px;
                    color: #e6e7e8;
                    line-height: 1.3;
                }

                .grid-2 {
                    display:flex;
                    gap:12px;
                    margin: 12px 0;
                }
                .info-card {
                    flex:1;
                    background: #0e1012;
                    border-radius: 10px;
                    padding: 12px;
                    text-align:center;
                    border: 1px solid rgba(255,255,255,0.02);
                }
                .info-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #dbeafe; /* slightly bluish for emphasis */
                }
                .info-label {
                    font-size: 11px;
                    color: rgba(255,255,255,0.45);
                    margin-top:6px;
                    letter-spacing: 1px;
                }

                .wait-section {
                    margin-top: 6px;
                    background: transparent;
                }
                .wait-header {
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:8px;
                }
                .wait-title { font-size:13px; color:#d7d7d7; }
                .wait-value { font-size:13px; color:rgba(255,255,255,0.55); }

                /* slider main */
                .slider-wrap {
                    padding: 10px 6px 18px 6px;
                    background: #0f1113;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.02);
                }
                .slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    background: rgba(255,255,255,0.06);
                    border-radius: 999px;
                    outline: none;
                    position: relative;
                }
                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    background: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    border: 3px solid #1f2937;
                    margin-top: -6px;
                }
                .slider::-moz-range-thumb {
                    width: 20px; height: 20px; border-radius:50%;
                    background: #cbd5e1; border: 3px solid #1f2937;
                }

                /* progress fill under slider (thin bar) */
                .progress-track {
                    height: 6px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 6px;
                    margin-top: 8px;
                    position: relative;
                    overflow: hidden;
                }
                .progress-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 0%;
                    background: linear-gradient(90deg, #131212ff 0% #111010 100%);
                    box-shadow: 0 6px 18px rgba(18, 17, 17, 0.12);
                    border-radius: 6px;
                    transition: width 0.1s linear;
                }

                .wait-footer {
                    display:flex; justify-content:space-between; font-size:11px; color:rgba(255,255,255,0.35);
                    margin-top:8px;
                }

                .footer {
                    margin-top: 10px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    font-size:11px;
                    color:rgba(255,255,255,0.45);
                }

                @media (max-width: 460px) {
                    .panel-container { left:12px; right:12px; width:auto; top:12px; }
                }
            `;

            this.shadow.appendChild(style);

            const html = `
                <div class="panel-container" id="difz25x-panel">
                    <div class="panel">
                        <div class="header">
                            <div>
                                <div class="title">${t('title')}</div>
                            </div>
                            <div class="controls">
                                <button id="lang-btn" class="control-btn">EN</button>
                                <button id="theme-btn" class="control-btn">GRAY</button>
                            </div>
                        </div>

                        <div class="status-section">
                            <div class="status-box">
                                <div class="status-dot" id="status-dot"></div>
                                <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                            </div>
                        </div>

                        <div class="grid-2">
                            <div class="info-card">
                                <div class="info-value" id="time-saved">--</div>
                                <div class="info-label">TIME SAVED</div>
                            </div>
                            <div class="info-card">
                                <div class="info-value" id="redirecting-in">--</div>
                                <div class="info-label">REDIRECTING IN</div>
                            </div>
                        </div>

                        <div class="wait-section">
                            <div class="wait-header">
                                <div class="wait-title">Wait Time</div>
                                <div class="wait-value" id="wait-value">15s</div>
                            </div>

                            <div class="slider-wrap">
                                <input type="range" id="wait-slider" class="slider" min="1" max="30" step="1" value="15" />
                                <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
                                <div class="wait-footer">
                                    <div>0s</div>
                                    <div>30s</div>
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="version">${t('version')}</div>
                            <div class="credit">${t('madeBy')}</div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            this.shadow.appendChild(wrapper.firstElementChild);

            // store references
            this.statusText = this.shadow.querySelector('#status-text');
            this.statusDot = this.shadow.querySelector('#status-dot');
            this.timeSavedEl = this.shadow.querySelector('#time-saved');
            this.redirectingEl = this.shadow.querySelector('#redirecting-in');
            this.waitSlider = this.shadow.querySelector('#wait-slider');
            this.waitValueEl = this.shadow.getElementById('wait-value');
            this.progressFill = this.shadow.querySelector('#progress-fill');
            this.versionEl = this.shadow.querySelectorAll('.version');
            this.creditEl = this.shadow.querySelectorAll('.credit');
            this.langBtn = this.shadow.querySelector('#lang-btn');
            this.themeBtn = this.shadow.querySelector('#theme-btn');
            this.titleEl = this.shadow.querySelector('.title');

            // Initialize button texts
            this.langBtn.textContent = currentLanguage.toUpperCase();
            this.themeBtn.textContent = currentTheme.toUpperCase();

            // Add theme style element for dynamic theming
            this.themeStyle = document.createElement('style');
            this.themeStyle.id = 'theme-style';
            this.shadow.appendChild(this.themeStyle);

            // Apply initial theme
            this.applyTheme();

            document.documentElement.appendChild(this.container);
            log('Panel created');
        }

        attachEvents() {
            // slider change: update wait time and restart
            this.waitSlider.addEventListener('input', (e) => {
                const sec = parseInt(e.target.value);
                console.log('Slider input:', sec);
                this.setWaitValue(sec);
            });

            this.langBtn.addEventListener('click', (e) => {
                const langs = ['en', 'vi', 'id'];
                const currentIndex = langs.indexOf(currentLanguage);
                const nextIndex = (currentIndex + 1) % langs.length;
                currentLanguage = langs[nextIndex];
                localStorage.setItem('lang', currentLanguage);
                this.langBtn.textContent = currentLanguage.toUpperCase();
                // Re-translate the UI elements
                this.titleEl.textContent = t('title');
                this.statusText.textContent = t(this.currentMessageKey, this.currentReplacements);
                this.versionEl.forEach(el => el.textContent = t('version'));
                this.creditEl.forEach(el => el.textContent = t('madeBy'));
            });

            this.themeBtn.addEventListener('click', (e) => {
                const themeKeys = Object.keys(themes);
                const currentIndex = themeKeys.indexOf(currentTheme);
                const nextIndex = (currentIndex + 1) % themeKeys.length;
                currentTheme = themeKeys[nextIndex];
                localStorage.setItem('theme', currentTheme);
                this.themeBtn.textContent = currentTheme.toUpperCase();
                this.applyTheme();
            });
        }

        setWaitValue(seconds) {
            this.waitValueEl.textContent = `${seconds}s`;
            this.waitSlider.value = seconds;
        }

        // main timer: duration in seconds
        startTimer(duration) {
            // stop any existing
            this.stopTimer();

            if (!duration || duration <= 0) {
                log('Invalid duration for timer:', duration);
                this.redirectingEl.textContent = `--`;
                this.progressFill.style.width = '0%';
                return;
            }

            this.timerDuration = duration;
            this.timerStart = performance.now();
            this.isRunning = true;
            this.remaining = duration;

            // disable slider when timer starts
            this.waitSlider.disabled = true;

            // update UI immediately
            this.updateRedirectingUI(duration);

            const loop = (now) => {
                if (!this.isRunning) return;
                const elapsed = (now - this.timerStart) / 1000; // seconds
                const progress = Math.min(1, elapsed / this.timerDuration);
                const percent = progress * 100;
                // smooth fill
                this.progressFill.style.width = `${percent}%`;

                // compute remaining seconds (ceil down)
                const rem = Math.max(0, Math.ceil(this.timerDuration - elapsed));
                this.remaining = rem;
                this.redirectingEl.textContent = `${rem}s`;

                // when complete
                if (progress >= 1) {
                    this.finishTimer();
                    return;
                }

                this.timerRAF = requestAnimationFrame(loop);
            };

            this.timerRAF = requestAnimationFrame(loop);
            log('Timer started for', duration, 's');
        }

        stopTimer() {
            if (this.timerRAF) {
                cancelAnimationFrame(this.timerRAF);
                this.timerRAF = null;
            }
            this.isRunning = false;
        }

        restartTimer(duration) {
            this.progressFill.style.width = '0%';
            this.startTimer(duration);
        }

        updateRedirectingUI(sec) {
            this.redirectingEl.textContent = `${sec}s`;
            this.statusText.textContent = t('pleaseSolveCaptcha');
        }

        finishTimer() {
            this.stopTimer();
            this.progressFill.style.width = '100%';
            this.redirectingEl.textContent = `0s`;
            this.isRunning = false;
        }

        applyTheme() {
            const theme = themes[currentTheme];
            if (!theme) return;

            let css = `
                :host {
                    --primary-color: ${theme.primary};
                    --secondary-color: ${theme.secondary};
                    --primary-rgba: ${theme.primaryRGBA};
                    --secondary-rgba: ${theme.secondaryRGBA};
                    --background-gradient: ${theme.background};
                }
                .panel {
                    background: var(--background-gradient);
                }
                .status-dot.success {
                    background: var(--primary-color);
                    box-shadow: 0 0 8px rgba(var(--primary-rgba));
                }
                .control-btn:hover {
                    background: rgba(var(--primary-rgba), 0.2);
                }
                .slider::-webkit-slider-thumb {
                    background: var(--primary-color);
                    border-color: var(--secondary-color);
                }
                .progress-fill {
                    background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                }
            `;

            if (theme.isRGB) {
                css += `
                    .panel {
                        animation: rgb-shift 2s linear infinite;
                    }
                    @keyframes rgb-shift {
                        0% { filter: hue-rotate(0deg); }
                        100% { filter: hue-rotate(360deg); }
                    }
                `;
            }

            this.themeStyle.textContent = css;
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

    if (host.includes("volcano.wtf")) console.log("[DEBUG] Detected invalid Volcano URL");

    // Check host and run corresponding handlers
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("volcano.wtf")) handleVolcanoV2();
    else if (host.includes("work.ink")) handleWorkInk();

    function handleVolcanoV2() {
        if (panel) {
            panel.show('expiredLink', 'info');
        } else {
            handleVolcanoV2();
        }
    }

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
        let destinationReceived = false;
        let destinationProcessed = false;

        const map = {
            onLI: ["onLinkInfo"],
            onLD: ["onLinkDestination"]
        };

        function getFunction(obj, candidates = null) {
            if (!WebGLVertexArrayObject) {
                if (debug) console.log('[Debug] getFunction: obj is null/undefined');
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

            if (debug) console.log('[Debug] Phase 1: Firing initial 10x spoof burst');
            for (let i = 0; i < 10; i++) {
                spoofWorkink();
            }

            setTimeout(() => {
                if (!destinationReceived) {
                    if (debug) console.log('[Debug] Phase 2: 10s passed, no destination. Firing fallback burst');
                    for (let i = 0; i < 10; i++) {
                        spoofWorkink();
                    }
                } else {
                    if (debug) console.log('[Debug] Phase 2: Destination already received, skipping fallback');
                }
            }, 10000);
            if (debug) console.log('[Debug] Waiting for server to send destination data...');
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) {
                if (debug) console.log('[Debug] spoof Workink skipped: no sessionController.linkInfo');
                return;
            }
            if (debug) console.log('[Debug] spoof Workink starting, linkInfo:', sessionController.linkInfo);

            const socials = sessionController.linkInfo.socials || [];
            if (debug) console.log('[Debug] Total socials to fake:', socials.length);

            for (let i = 0; i < socials.length; i++) {
                const soc = socials[i];
                try {
                    if (sendMessageA) {
                        sendMessageA.call(this, types.ss, { url: soc.url });
                        if (debug) console.log(`[Debug] Faked social [${i+1}/${socials.length}]:`, soc.url);
                    } else {
                        if (debug) console.warn(`[Debug] No send message for social [${i+1}/${socials.length}]:`, soc.url);
                    }
                } catch (e) {
                    if (debug) console.error(`[Debug] Error faking social [${i+1}/${socials.length}]:`, soc.url, e);
                }
            }

            const monetizations = sessionController.linkInfo.monetizations || [];
            if (debug) console.log('[Debug] Total monetizations to fake:', monetizations.length);

            for (let i = 0; i < monetizations.length; i++) {
                const monetization = monetizations[i];
                try {
                    switch (monetization) {
                        case 22:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'readArticles2', payload: { event: 'read' } });
                            if (debug) console.log(`[Debug] Faked readArticles2 [${i+1}/${monetizations.length}]`);
                            break;
                        case 25:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'operaGX', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'operaGX', payload: { event: 'installClicked' } });
                            fetch('https://work.ink/_api/v2/callback/operaGX', {
                                method: 'POST',
                                mode: 'no-cors',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ noteligible: true })
                            }).catch((e) => { if (debug) console.warn('[Debug] operaGX fetch failed:', e); });
                            if (debug) console.log(`[Debug] Faked operaGX [${i+1}/${monetizations.length}]`);
                            break;
                        case 34:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'norton', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'norton', payload: { event: 'installClicked' } });
                            if (debug) console.log(`[Debug] Faked norton [${i+1}/${monetizations.length}]`);
                            break;
                        case 71:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'externalArticles', payload: { event: 'start' } });
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'externalArticles', payload: { event: 'installClicked' } });
                            if (debug) console.log(`[Debug] Faked externalArticles [${i+1}/${monetizations.length}]`);
                            break;
                        case 45:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'pdfeditor', payload: { event: 'installed' } });
                            if (debug) console.log(`[Debug] Faked pdfeditor [${i+1}/${monetizations.length}]`);
                            break;
                        case 57:
                            sendMessageA && sendMessageA.call(this, types.mo, { type: 'betterdeals', payload: { event: 'installed' } });
                            if (debug) console.log(`[Debug] Faked betterdeals [${i+1}/${monetizations.length}]`);
                            break;
                        default:
                            if (debug) console.log(`[Debug] Unknown monetization [${i+1}/${monetizations.length}]:`, monetization);
                    }
                } catch (e) {
                    if (debug) console.error(`[Debug] Error faking monetization [${i+1}/${monetizations.length}]:`, monetization, e);
                }
            }

            if (debug) console.log('[Debug] spoof Workink completed');
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
            return async function(...args) {
                const [info] = args;
                if (panel) panel.show('gettingLinkInfo', 'info')
                await wait(1);
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
            if (panel) panel.show('bypassSuccess', 'warning');

            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (debug) console.log('[Debug] startCountdown: Time remaining:', waitLeft);
                    if (panel) panel.show('bypassSuccess', 'warning');
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function checkUrl(url) {
            if (url.includes('42rk6hcq') || url.includes('ito4wckq') || url.includes('pzarvhq1')) {
                return true
            } else {
                return false
            }
        }

        function wait(second){
            second = second * 1000;
            return new Promise(resolve => setTimeout(resolve, second));
        }

        function createDestinationProxy() {
            return async function(...args) {
                const [data] = args;
                destinationReceived = true;
                if (panel) panel.show('gettingLinkDestination', 'info')
                await wait(1);
                if (debug) console.log('[Debug] Destination data:', data);

                if (!destinationProcessed) {
                    destinationProcessed = true;
                    const waitTimeSeconds = parseInt(panel.waitSlider.value);
                    startCountdown(data.url, waitTimeSeconds);
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

        window.googletag = {cmd: [], _loaded_: true};

        const blockedClasses = [
            "adsbygoogle",
            "adsense-wrapper",
            "inline-ad",
            "gpt-billboard-container"
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
                                if (debug) console.log('[Debug]: Removed ad by class:', cls, node);
                            }
                            node.querySelectorAll?.(`.${cls}`).forEach((el) => {
                                el.remove();
                                if (debug) console.log('[Debug]: Removed nested ad by class:', cls, el);
                            });
                        });

                        blockedIds.forEach((id) => {
                            if (node.id === id) {
                                node.remove();
                                if (debug) console.log('[Debug]: Removed ad by id:', id, node);
                            }
                            node.querySelectorAll?.(`#${id}`).forEach((el) => {
                                el.remove();
                                if (debug) console.log('[Debug]: Removed nested ad by id:', id, el);
                            });
                        });

                        if (node.matches('.button.large.accessBtn.pos-relative.svelte-bv7qlp') && node.textContent.includes('Go To Destination')) {
                            if (debug) console.log('[Debug] GTD button detected');

                            if (!bypassTriggered) {
                                if (debug) console.log('[Debug] GTD: Waiting for linkInfo...');

                                let gtdRetryCount = 0;

                                function checkAndTriggerGTD() {
                                    const ctrl = sessionController;
                                    const dest = getFunction(ctrl, map.onLD);

                                    if (ctrl && ctrl.linkInfo && dest.fn) {
                                        triggerBypass('gtd');
                                        if (debug) console.log('[Debug] Captcha bypassed via GTD after', gtdRetryCount, 'seconds');
                                    } else {
                                        gtdRetryCount++;
                                        if (debug) console.log(`[Debug] GTD retry ${gtdRetryCount}s: Still waiting for linkInfo...`);
                                        if (panel) panel.show('loaderBtn', 'info');
                                        setTimeout(checkAndTriggerGTD, 1000);
                                    }
                                }

                                checkAndTriggerGTD();

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
