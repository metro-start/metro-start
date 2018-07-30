import jquery from 'jquery';

import Util from './util';

/**
 * Manages local and synced storage.
 *
 * @class Storage
 */
export default class Storage {
    /**
     *Creates an instance of Storage.
     * @memberof Storage
     */
    constructor() {
        chrome.storage.sync.get(null, (container) => {
            Storage.cache = jquery.extend(Storage.cache, container);
            Storage.deferred.resolve();
        });

        return Storage.deferred.promise();
    }

    /**
     * Writes the provided data to both local and shared stoarge.
     *
     * @param {any} key The name of the property to save.
     * @param {any} value The value to be saved.
     */
    static set(key, value) {
        if (Storage.cache) {
            Storage.cache[key] = value;
        }

        let obj = {};
        obj[key] = value;
        chrome.storage.sync.set(obj);
    }

    /**
     * Gets a value from the cache; note that chrome.storage.sync always wins.
     *
     * @param {any} key The key to be retrieved.
     * @param {any} defaultValue The value to initialize all storages if the key does not exist.
     * @return {any} True if the value of the key if one exists exists; defaultValue otherwise.
     */
    static get(key, defaultValue) {
        return Util.isEmpty(Storage.cache[key]) ? defaultValue : Storage.cache[key];
    }
}

Storage.cache = {};
Storage.deferred = new jquery.Deferred();
