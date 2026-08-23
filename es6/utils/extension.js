/* global chrome, browser */

// Unified extension API shim for Chrome and Firefox (browser).
// Exposes a chrome-like API (callback style) while using browser.* promises when available.

const _wrapPromiseCall = (promise, callback, errorValue) => {
    if (typeof callback === 'function') {
        promise
            .then((res) => callback(res))
            .catch((err) => {
                console.error('Extension API error', err);
                callback(errorValue);
            });
        return;
    }
    return promise;
};

const _hasChrome = () => typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined';
const _hasBrowser = () => typeof browser !== 'undefined';

const _normalizeList = (value) => (Array.isArray(value) ? value : []);
// Storage shim: expose storage.sync.get(keys, cb) and storage.sync.set(obj, cb)
// Falls back to localStorage for browser environments without extension APIs
const storage = {
    sync: {
        get(keys, callback) {
            if (_hasChrome() && chrome.storage && chrome.storage.sync) {
                try {
                    return chrome.storage.sync.get(keys, callback);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') {callback({});}
                }
            }
            if (_hasBrowser() && browser.storage && browser.storage.sync) {
                try {
                    return _wrapPromiseCall(browser.storage.sync.get(keys), callback);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') {callback({});}
                }
            }

            // Fallback to localStorage (demo mode, or any non-extension environment)
            try {
                const keysToReturn = {};
                if (!keys) {
                    // return all stored keys
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        try {
                            keysToReturn[k] = JSON.parse(localStorage.getItem(k));
                        } catch {
                            keysToReturn[k] = localStorage.getItem(k);
                        }
                    }
                } else if (Array.isArray(keys)) {
                    keys.forEach((k) => {
                        try {
                            keysToReturn[k] = JSON.parse(localStorage.getItem(k));
                        } catch {
                            keysToReturn[k] = localStorage.getItem(k);
                        }
                    });
                } else if (typeof keys === 'object') {
                    // keys is an object with default values
                    Object.keys(keys).forEach((k) => {
                        const val = localStorage.getItem(k);
                        keysToReturn[k] = val === null ? keys[k] : (() => {
                            try {
                                return JSON.parse(val);
                            } catch {
                                return val;
                            }
                        })();
                    });
                } else {
                    const val = localStorage.getItem(keys);
                    try {
                        keysToReturn[keys] = JSON.parse(val);
                    } catch {
                        keysToReturn[keys] = val;
                    }
                }
                if (typeof callback === 'function') {callback(keysToReturn);}
                return Promise.resolve(keysToReturn);
            } catch (e) {
                console.error(e);
                if (typeof callback === 'function') {callback({});}
                return Promise.resolve({});
            }
        },
        set(obj, callback) {
            if (_hasChrome() && chrome.storage && chrome.storage.sync) {
                try {
                    return chrome.storage.sync.set(obj, callback);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') {callback();}
                }
            }
            if (_hasBrowser() && browser.storage && browser.storage.sync) {
                try {
                    return _wrapPromiseCall(browser.storage.sync.set(obj), callback);
                } catch (e) {
                    console.error(e);
                    if (typeof callback === 'function') {callback();}
                }
            }

            // Fallback to localStorage (demo mode, or any non-extension environment)
            try {
                Object.keys(obj).forEach((k) => {
                    try {
                        localStorage.setItem(k, JSON.stringify(obj[k]));
                    } catch {
                        localStorage.setItem(k, String(obj[k]));
                    }
                });
                if (typeof callback === 'function') {callback();}
                return Promise.resolve();
            } catch (e) {
                console.error(e);
                if (typeof callback === 'function') {callback();}
                return Promise.resolve();
            }
        },
    },
};

// Permissions shim: request, remove, getAll
const permissions = {
    request(permObj, callback) {
        if (_hasChrome() && chrome.permissions && chrome.permissions.request) {
            try {
                return chrome.permissions.request(permObj, callback);
            } catch (e) {
                console.error(e);
            }
        }
        if (_hasBrowser()) {
            try {
                return _wrapPromiseCall(browser.permissions.request(permObj), callback, false);
            } catch (e) {
                console.error(e);
                if (typeof callback === 'function') {callback(true);}
                return Promise.resolve(true);
            }
        }
        // Demo: no explicit permissions API; resolve as granted
        if (typeof callback === 'function') {callback(true);}
        return Promise.resolve(true);
    },
    remove(permObj, callback) {
        if (_hasChrome() && chrome.permissions && chrome.permissions.remove) {
            try {
                return chrome.permissions.remove(permObj, callback);
            } catch (e) {
                console.error(e);
            }
        }
        if (_hasBrowser()) {
            try {
                return _wrapPromiseCall(browser.permissions.remove(permObj), callback, false);
            } catch (e) {
                console.error(e);
                if (typeof callback === 'function') {callback(true);}
                return Promise.resolve(true);
            }
        }
        // Demo: no explicit permissions API; resolve as granted
        if (typeof callback === 'function') {callback(true);}
        return Promise.resolve(true);
    },
    getAll(callback) {
        if (_hasChrome() && chrome.permissions && chrome.permissions.getAll) {
            return chrome.permissions.getAll(callback);
        }
        if (_hasBrowser() && browser.permissions && browser.permissions.getAll) {
            try {
                return _wrapPromiseCall(
                    browser.permissions.getAll(),
                    callback,
                    {permissions: [], origins: []}
                );
            } catch (e) {
                console.error(e);
                if (typeof callback === 'function') {callback({permissions: [], origins: []});}
                return Promise.resolve({permissions: [], origins: []});
            }
        }
        // Demo: no permissions API; return empty
        if (typeof callback === 'function') {callback({permissions: [], origins: []});}
        return Promise.resolve({permissions: [], origins: []});
    },
};

// Management shim (enable/disable/uninstall)
const management = {
    getAll(callback) {
        if (_hasBrowser() && browser.management && browser.management.getAll) {
            return _wrapPromiseCall(browser.management.getAll(), (items) => {
                const normalized = _normalizeList(items);
                if (typeof callback === 'function') {callback(normalized);}
                return normalized;
            });
        }
        if (_hasChrome() && chrome.management && chrome.management.getAll) {
            return chrome.management.getAll((items) => {
                const normalized = _normalizeList(items);
                if (typeof callback === 'function') {callback(normalized);}
            });
        }
        if (typeof callback === 'function') {callback([]);}
        return Promise.resolve([]);
    },
    setEnabled(id, enabled, callback) {
        if (_hasBrowser() && browser.management && browser.management.setEnabled) {
            return _wrapPromiseCall(browser.management.setEnabled(id, enabled), callback);
        }
        if (_hasChrome() && chrome.management && chrome.management.setEnabled) {
            return chrome.management.setEnabled(id, enabled, callback);
        }
        if (typeof callback === 'function') {callback();}
        return Promise.resolve();
    },
    uninstall(id, options, callback) {
        if (_hasBrowser() && browser.management && browser.management.uninstall) {
            return _wrapPromiseCall(browser.management.uninstall(id, options), callback);
        }
        if (_hasChrome() && chrome.management && chrome.management.uninstall) {
            try {
                return chrome.management.uninstall(id, options, callback);
            } catch {
                try {
                    return chrome.management.uninstall(id, callback);
                } catch {
                    if (typeof callback === 'function') {callback();}
                }
            }
        }
        if (typeof callback === 'function') {callback();}
        return Promise.resolve();
    },
};

// Bookmarks shim
const bookmarks = {
    getTree(callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.getTree) {
            return _wrapPromiseCall(browser.bookmarks.getTree(), callback);
        }
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.getTree) {
            return chrome.bookmarks.getTree(callback);
        }
        if (typeof callback === 'function') {callback([]);}
        return Promise.resolve([]);
    },
    getChildren(id, callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.getChildren) {
            return _wrapPromiseCall(browser.bookmarks.getChildren(id), callback);
        }
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.getChildren) {
            return chrome.bookmarks.getChildren(id, callback);
        }
        if (typeof callback === 'function') {callback([]);}
        return Promise.resolve([]);
    },
    removeTree(id, callback) {
        if (_hasBrowser() && browser.bookmarks && browser.bookmarks.removeTree) {
            return _wrapPromiseCall(browser.bookmarks.removeTree(id), callback);
        }
        if (_hasChrome() && chrome.bookmarks && chrome.bookmarks.removeTree) {
            return chrome.bookmarks.removeTree(id, callback);
        }
        if (typeof callback === 'function') {callback();}
        return Promise.resolve();
    },
};

// Sessions shim
const sessions = {
    getRecentlyClosed(optionsOrCallback, callback) {
        // Accept (null, cb) or (cb)
        let opts = null;
        let cb = callback;
        if (typeof optionsOrCallback === 'function') {
            cb = optionsOrCallback;
        } else {
            opts = optionsOrCallback;
        }

        if (_hasBrowser() && browser.sessions && browser.sessions.getRecentlyClosed) {
            return _wrapPromiseCall(browser.sessions.getRecentlyClosed(opts), (items) => {
                const normalized = _normalizeList(items);
                if (typeof cb === 'function') {cb(normalized);}
                return normalized;
            });
        }
        if (_hasChrome() && chrome.sessions && chrome.sessions.getRecentlyClosed) {
            return chrome.sessions.getRecentlyClosed(opts, (items) => {
                const normalized = _normalizeList(items);
                if (typeof cb === 'function') {cb(normalized);}
            });
        }
        if (typeof cb === 'function') {cb([]);}
        return Promise.resolve([]);
    },
    getDevices(optionsOrCallback, callback) {
        let opts = null;
        let cb = callback;
        if (typeof optionsOrCallback === 'function') {
            cb = optionsOrCallback;
        } else {
            opts = optionsOrCallback;
        }

        if (_hasBrowser() && browser.sessions && browser.sessions.getDevices) {
            return _wrapPromiseCall(browser.sessions.getDevices(opts), (items) => {
                const normalized = _normalizeList(items);
                if (typeof cb === 'function') {cb(normalized);}
                return normalized;
            });
        }
        if (_hasChrome() && chrome.sessions && chrome.sessions.getDevices) {
            return chrome.sessions.getDevices(opts, (items) => {
                const normalized = _normalizeList(items);
                if (typeof cb === 'function') {cb(normalized);}
            });
        }
        if (typeof cb === 'function') {cb([]);}
        return Promise.resolve([]);
    },
};

// Expose runtime and tabs too in a minimal way
const runtime = {
    sendMessage(message, callback) {
        if (_hasBrowser() && browser.runtime && browser.runtime.sendMessage) {
            return _wrapPromiseCall(browser.runtime.sendMessage(message), callback);
        }
        if (_hasChrome() && chrome.runtime && chrome.runtime.sendMessage) {
            return chrome.runtime.sendMessage(message, callback);
        }
        if (typeof callback === 'function') {callback();}
        return Promise.resolve();
    },
    onMessage: (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) ||
        (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) ||
        {addListener: () => {}},
};

const tabs = {
    query(queryInfo, callback) {
        if (_hasBrowser()) {return _wrapPromiseCall(browser.tabs.query(queryInfo), callback);}
        if (_hasChrome()) {return chrome.tabs.query(queryInfo, callback);}
        if (typeof callback === 'function') {callback([]);}
        return Promise.resolve([]);
    },
};

export default {
    storage,
    permissions,
    management,
    bookmarks,
    sessions,
    runtime,
    tabs,
};
