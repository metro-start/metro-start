define(['jquery', './util'],
    (jquery, util) => {
        let storage = {
            cache: {},
            deferred: undefined,

            init: function() {
                if (!this.deferred) {
                    this.deferred = new jquery.Deferred();
                    let that = this;
                    chrome.storage.sync.get(null, (container) => {
                        that.cache = jquery.extend(that.cache, container);
                        that.deferred.resolve(that);
                    });
                }

                return this.deferred.promise();
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

                let obj = {};
                obj[key] = value;
                chrome.storage.sync.set(obj);
            },

            /**
             * Gets a value from the cache; note that chrome.storage.sync always wins.
             *
             * @param {any} key The key to be retrieved.
             * @param {any} defaultValue The value to initialize all storages if the key does not exist.
             * @return {any} True if the value of the key if one exists exists; defaultValue otherwise.
             */
            get: function get(key, defaultValue) {
                return util.isEmpty(this.cache[key]) ? defaultValue : this.cache[key];
            },
        };

        return storage;
    });
