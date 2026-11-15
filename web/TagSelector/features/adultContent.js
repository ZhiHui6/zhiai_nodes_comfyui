import { getState, setState, ADULT_MAX_FAILED_ATTEMPTS, ADULT_LOCKOUT_DURATION, ADULT_STORAGE_SALT } from '../core/state.js';
import { showToast } from '../utils/dom.js';
import { getLocale } from '../utils/helpers.js';

const ADULT_STORAGE_KEY = 'zhiai_adult_settings';

function _adultStorageHash(data) {
    let hash = 5381;
    const str = data + ADULT_STORAGE_SALT;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(36);
}

function _generateVerificationCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function loadAdultContentSettings() {
    try {
        const raw = localStorage.getItem(ADULT_STORAGE_KEY);
        if (!raw) return { enabled: false, unlocked: false };
        const parsed = JSON.parse(raw);
        const expectedHash = _adultStorageHash(
            String(parsed.enabled) + String(parsed.unlocked) + String(parsed.timestamp || 0)
        );
        if (parsed._sig !== expectedHash) {
            localStorage.removeItem(ADULT_STORAGE_KEY);
            return { enabled: false, unlocked: false };
        }

        const enabled = parsed.enabled || false;
        const unlocked = parsed.unlocked || false;
        const timestamp = parsed.timestamp || 0;

        setState({
            adultContentEnabled: enabled,
            adultContentUnlocked: unlocked,
            adultUnlockTimestamp: timestamp
        });

        return { enabled, unlocked };
    } catch (e) {
        localStorage.removeItem(ADULT_STORAGE_KEY);
        return { enabled: false, unlocked: false };
    }
}

function saveAdultContentSettings() {
    try {
        const state = getState();
        const data = {
            enabled: state.adultContentEnabled,
            unlocked: state.adultContentUnlocked,
            timestamp: state.adultUnlockTimestamp || 0
        };
        data._sig = _adultStorageHash(
            String(data.enabled) + String(data.unlocked) + String(data.timestamp)
        );
        localStorage.setItem(ADULT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
}

function isAdultContentEnabled() {
    return getState('adultContentEnabled');
}

function isAdultContentUnlocked() {
    return getState('adultContentUnlocked');
}

function enableAdultContent() {
    setState('adultContentEnabled', true);
    saveAdultContentSettings();
}

function disableAdultContent() {
    setState({
        adultContentEnabled: false,
        adultContentUnlocked: false,
        adultUnlockTimestamp: 0
    });
    saveAdultContentSettings();
}

function toggleAdultContent() {
    const current = getState('adultContentEnabled');
    setState('adultContentEnabled', !current);
    saveAdultContentSettings();
    return !current;
}

function unlockAdultContent() {
    setState({
        adultContentUnlocked: true,
        adultContentEnabled: true,
        adultUnlockTimestamp: Date.now()
    });
    saveAdultContentSettings();
}

function showAdultUnlockDialog(onUnlock) {
    const state = getState();
    if (state.adultLockoutUntil > Date.now()) {
        const remaining = Math.ceil((state.adultLockoutUntil - Date.now()) / 1000);
        const locale = getLocale();
        showToast(locale === 'zh' ? `验证已锁定，请 ${remaining} 秒后再试` : `Locked, try again in ${remaining}s`, 'error');
        return;
    }

    const verificationCode = _generateVerificationCode();
    const locale = getLocale();
    const isZh = locale === 'zh';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #1a1a2e;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = isZh ? '⚠️ 成人内容风险提示' : '⚠️ Adult Content Warning';
    title.style.cssText = `
        color: #fcd34d;
        margin: 0 0 16px 0;
        font-size: 18px;
    `;

    const warningText = document.createElement('p');
    warningText.textContent = isZh
        ? '您即将开启成人内容显示功能。此功能包含可能不适合所有用户的敏感内容。请确认您已年满18周岁，并自愿选择查看此类内容。'
        : 'You are about to enable adult content display. This feature contains sensitive content. Please confirm you are 18 years or older.';
    warningText.style.cssText = `
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
    `;

    const verificationLabel = document.createElement('label');
    verificationLabel.innerHTML = isZh
        ? `请输入验证码：<span style="color:#ef4444;font-size:18px;font-weight:700;background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:4px;letter-spacing:3px;font-family:monospace;">${verificationCode}</span>`
        : `Enter verification code: <span style="color:#ef4444;font-size:18px;font-weight:700;background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:4px;letter-spacing:3px;font-family:monospace;">${verificationCode}</span>`;
    verificationLabel.style.cssText = `
        color: #e2e8f0;
        display: block;
        margin-bottom: 8px;
    `;

    const verificationInput = document.createElement('input');
    verificationInput.type = 'text';
    verificationInput.autocomplete = 'off';
    verificationInput.spellcheck = false;
    verificationInput.placeholder = isZh ? '请输入上方验证码' : 'Enter the code above';
    verificationInput.style.cssText = `
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        margin-bottom: 8px;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
    `;
    verificationInput.onpaste = (e) => e.preventDefault();
    verificationInput.oncopy = (e) => e.preventDefault();
    verificationInput.oncut = (e) => e.preventDefault();
    verificationInput.oncontextmenu = (e) => e.preventDefault();
    verificationInput.oninput = function() {
        verificationInput.value = verificationInput.value.toUpperCase();
        errorMsg.style.display = 'none';
    };

    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `color: #ef4444; font-size: 12px; margin-bottom: 12px; min-height: 18px; display: none;`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = isZh ? '取消' : 'Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        background: #4b5563;
        color: #fff;
        cursor: pointer;
    `;
    cancelButton.onclick = () => overlay.remove();

    const confirmButton = document.createElement('button');
    confirmButton.textContent = isZh ? '确认开启' : 'Confirm';
    confirmButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        background: #ef4444;
        color: #fff;
        cursor: pointer;
    `;
    confirmButton.onclick = () => {
        if (verificationInput.value.trim().toUpperCase() !== verificationCode) {
            const currentState = getState();
            const failedAttempts = (currentState.adultFailedAttempts || 0) + 1;
            setState('adultFailedAttempts', failedAttempts);

            errorMsg.textContent = isZh
                ? `验证码错误，剩余尝试次数: ${ADULT_MAX_FAILED_ATTEMPTS - failedAttempts}`
                : `Invalid code, attempts remaining: ${ADULT_MAX_FAILED_ATTEMPTS - failedAttempts}`;
            errorMsg.style.display = 'block';
            verificationInput.value = '';
            verificationInput.style.borderColor = '#ef4444';

            if (failedAttempts >= ADULT_MAX_FAILED_ATTEMPTS) {
                setState({
                    adultLockoutUntil: Date.now() + ADULT_LOCKOUT_DURATION,
                    adultFailedAttempts: 0
                });
                overlay.remove();
                showToast(isZh ? '验证失败次数过多，已锁定30秒' : 'Too many failed attempts, locked for 30s', 'error');
            }
            return;
        }

        setState('adultFailedAttempts', 0);
        unlockAdultContent();
        overlay.remove();
        if (onUnlock) onUnlock();
        showToast(isZh ? '成人内容已启用' : 'Adult content enabled', 'success');
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    dialog.appendChild(title);
    dialog.appendChild(warningText);
    dialog.appendChild(verificationLabel);
    dialog.appendChild(verificationInput);
    dialog.appendChild(errorMsg);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);

    document.body.appendChild(overlay);
}

export {
    loadAdultContentSettings,
    saveAdultContentSettings,
    isAdultContentEnabled,
    isAdultContentUnlocked,
    enableAdultContent,
    disableAdultContent,
    toggleAdultContent,
    unlockAdultContent,
    showAdultUnlockDialog
};