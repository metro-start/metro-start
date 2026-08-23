import ext from './extension';

export default {
    cache: {},
    initializing: undefined,

    init() {
        if (!this.initializing) {
            this.initializing = new Promise((resolve) => {
                ext.storage.sync.get(null, (container) => {
                    Object.assign(this.cache, container || {});
                    resolve(this);
                });
            });
        }

        return this.initializing;
    },

    /**
     * Saves the provided data to both local and shared stoarge.
     *
     * @param {any} key The name of the property to save.
     * @param {any} value The value to be saved.
     */
    save: function save(key, value) {
        if (this.cache) {
            this.cache[key] = value;
        }

        const obj = {};
        obj[key] = value;
        ext.storage.sync.set(obj);
    },

    /**
     * Gets a value from the cache; note that chrome.storage.sync always wins.
     *
     * @param {any} key The key to be retrieved.
     * @param {any} defaultValue The value to initialize all storages if the key does not exist.
     * @return {any} True if the value of the key if one exists exists; defaultValue otherwise.
     */
    get: function get(key, defaultValue) {
        const value = this.cache[key];
        return value === null || value === undefined ? defaultValue : value;
    },
};
