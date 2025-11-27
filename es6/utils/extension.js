/* global chrome, browser, safari */

// Unified extension API shim for Chrome, Firefox (browser) and Safari.
// Exposes a chrome-like API (callback style) while using browser.* promises when available.

function _wrapPromiseCall(promise, callback) {
    if (typeof callback === 'function') {
        promise.then((res) => callback(res)).catch((err) => {
            // Try to follow chrome callback behavior (no error param) but log
            console.error('Extension API error', err);
        });
        return;
    }
    return promise;
}

function _hasBrowser() {
    return typeof browser !== 'undefined';
}
function _hasChrome() {
    return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined';
}
function _hasSafari() {
    return typeof safari !== 'undefined' && safari && safari.extension;
}

// Storage shim: expose storage.sync.get(keys, cb) and storage.sync.set(obj, cb)
const storage = {
    sync: {
        get: function (keys, callback) {
            if (_hasBrowser()) {
                return _wrapPromiseCall(browser.storage.sync.get(keys), callback);
            }
            if (_hasChrome()) {
                // chrome API expects callback
                try {
                    return chrome.storage.sync.get(keys, callback);
                } catch (e) {
                    // some contexts might not allow chrome.storage
                    console.error(e);
                    if (typeof callback === 'function') callback({});
                }
            }
            if (_hasSafari()) {
                // Safari legacy extension fallback: use localStorage
                try {
                    const keysToReturn = {};
                    if (!keys) {
                        // return all stored keys
                        for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i);
                            try { keysToReturn[k] = JSON.parse(localStorage.getItem(k)); } catch { keysToReturn[k] = localStorage.getItem(k); }
                        }
                    } else if (Array.isArray(keys)) {
                        keys.forEach(k => {
                            try { keysToReturn[k] = JSON.parse(localStorage.getItem(k)); } catch { keysToReturn[k] = localStorage.getItem(k); }
                        });
                    } else if (typeof keys === 'object') {
                        // keys is an object with default values
                        Object.keys(keys).forEach(k => {
                            const val = localStorage.getItem(k);
                            keysToReturn[k] = val === null ? keys[k] : (function () { try { return JSON.parse(val); } catch { return val; } })();
                        });
                    } else {
                        const val = localStorage.getItem(keys);
                        try { keysToReturn[keys] = JSON.parse(val); } catch { keysToReturn[keys] = val; }
                    }
                    if (typeof callback === 'function') callback(keysToReturn);
                    return Promise.resolve(keysToReturn);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') callback({});
                    return Promise.resolve({});
                }
            }
            // No storage available
            const empty = {};
            if (typeof callback === 'function') callback(empty);
            return Promise.resolve(empty);
        },
        set: function (obj, callback) {
            if (_hasBrowser()) {
                return _wrapPromiseCall(browser.storage.sync.set(obj), callback);
            }
            if (_hasChrome()) {
                try {
                    return chrome.storage.sync.set(obj, callback);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') callback();
                }
            }
            if (_hasSafari()) {
                try {
                    Object.keys(obj).forEach(k => {
                        try { localStorage.setItem(k, JSON.stringify(obj[k])); } catch { localStorage.setItem(k, String(obj[k])); }
                    });
                    if (typeof callback === 'function') callback();
                    return Promise.resolve();
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') callback();
                    return Promise.resolve();
                }
            }
            if (typeof callback === 'function') callback();
            return Promise.resolve();
        }
    }
};

// Permissions shim: request, remove, getAll
const permissions = {
    request: function (permObj, callback) {
        if (_hasBrowser()) return _wrapPromiseCall(browser.permissions.request(permObj), callback);
        if (_hasChrome()) return chrome.permissions.request(permObj, callback);
        // Safari: no explicit permissions API for web extensions; resolve as true
        if (_hasSafari()) { if (typeof callback === 'function') callback(true); return Promise.resolve(true); }
        if (typeof callback === 'function') callback(true); return Promise.resolve(true);
    },
    remove: function (permObj, callback) {
        if (_hasBrowser()) return _wrapPromiseCall(browser.permissions.remove(permObj), callback);
        if (_hasChrome()) return chrome.permissions.remove(permObj, callback);
        if (_hasSafari()) { if (typeof callback === 'function') callback(true); return Promise.resolve(true); }
        if (typeof callback === 'function') callback(true); return Promise.resolve(true);
    },
    getAll: function (callback) {
        if (_hasBrowser()) return _wrapPromiseCall(browser.permissions.getAll(), callback);
        if (_hasChrome()) return chrome.permissions.getAll(callback);
        if (_hasSafari()) { if (typeof callback === 'function') callback({permissions: [], origins: []}); return Promise.resolve({permissions: [], origins: []}); }
        if (typeof callback === 'function') callback({permissions: [], origins: []}); return Promise.resolve({permissions: [], origins: []});
    }
};

// Management shim (enable/disable/uninstall)
const management = {
    getAll: function (callback) {
        if (_hasBrowser() && browser.management && browser.management.getAll) return _wrapPromiseCall(browser.management.getAll(), callback);
        if (_hasChrome() && chrome.management && chrome.management.getAll) return chrome.management.getAll(callback);
        if (typeof callback === 'function') callback([]); return Promise.resolve([]);
    },
    setEnabled: function (id, enabled, callback) {
        if (_hasBrowser() && browser.management && browser.management.setEnabled) return _wrapPromiseCall(browser.management.setEnabled(id, enabled), callback);
        if (_hasChrome() && chrome.management && chrome.management.setEnabled) return chrome.management.setEnabled(id, enabled, callback);
        if (typeof callback === 'function') callback(); return Promise.resolve();
    },
    uninstall: function (id, options, callback) {
        // chrome.management.uninstall accepts (id, options, callback) or (id, callback)
        if (_hasBrowser() && browser.management && browser.management.uninstall) return _wrapPromiseCall(browser.management.uninstall(id, options), callback);
        if (_hasChrome() && chrome.management && chrome.management.uninstall) {
            try { return chrome.management.uninstall(id, options, callback); } catch { try { return chrome.management.uninstall(id, callback); } catch { if (typeof callback === 'function') callback(); } }
        }
        if (typeof callback === 'function') callback(); return Promise.resolve();
    }
};

// Bookmarks shim
const bookmarks = {
    getTree: function (callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.getTree) return _wrapPromiseCall(browser.bookmarks.getTree(), callback);
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.getTree) return chrome.bookmarks.getTree(callback);
        if (typeof callback === 'function') callback([]); return Promise.resolve([]);
    },
    getChildren: function (id, callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.getChildren) return _wrapPromiseCall(browser.bookmarks.getChildren(id), callback);
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.getChildren) return chrome.bookmarks.getChildren(id, callback);
        if (typeof callback === 'function') callback([]); return Promise.resolve([]);
    },
    removeTree: function (id, callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.removeTree) return _wrapPromiseCall(browser.bookmarks.removeTree(id), callback);
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.removeTree) return chrome.bookmarks.removeTree(id, callback);
        if (typeof callback === 'function') callback(); return Promise.resolve();
    }
};

// Sessions shim
const sessions = {
    getRecentlyClosed: function (optionsOrCallback, callback) {
        // Accept (null, cb) or (cb)
        let opts = null;
        let cb = callback;
        if (typeof optionsOrCallback === 'function') { cb = optionsOrCallback; }
        else opts = optionsOrCallback;

        if (_hasBrowser() && browser.sessions && browser.sessions.getRecentlyClosed) return _wrapPromiseCall(browser.sessions.getRecentlyClosed(opts), cb);
        if (_hasChrome() && chrome.sessions && chrome.sessions.getRecentlyClosed) return chrome.sessions.getRecentlyClosed(opts, cb);
        if (typeof cb === 'function') cb([]); return Promise.resolve([]);
    },
    getDevices: function (optionsOrCallback, callback) {
        let opts = null; let cb = callback;
        if (typeof optionsOrCallback === 'function') { cb = optionsOrCallback; }
        else opts = optionsOrCallback;

        if (_hasBrowser() && browser.sessions && browser.sessions.getDevices) return _wrapPromiseCall(browser.sessions.getDevices(opts), cb);
        if (_hasChrome() && chrome.sessions && chrome.sessions.getDevices) return chrome.sessions.getDevices(opts, cb);
        if (typeof cb === 'function') cb([]); return Promise.resolve([]);
    }
};

// Expose runtime and tabs too in a minimal way
const runtime = {
    sendMessage: function (message, callback) {
        if (_hasBrowser()) return _wrapPromiseCall(browser.runtime.sendMessage(message), callback);
        if (_hasChrome()) return chrome.runtime.sendMessage(message, callback);
        if (typeof callback === 'function') callback(); return Promise.resolve();
    },
    onMessage: (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) || (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) || { addListener: function () {} }
};

const tabs = {
    query: function (queryInfo, callback) {
        if (_hasBrowser()) return _wrapPromiseCall(browser.tabs.query(queryInfo), callback);
        if (_hasChrome()) return chrome.tabs.query(queryInfo, callback);
        if (typeof callback === 'function') callback([]); return Promise.resolve([]);
    }
};

export default {
    storage,
    permissions,
    management,
    bookmarks,
    sessions,
    runtime,
    tabs
};
