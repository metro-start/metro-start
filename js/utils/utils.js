define(['./util', './storage', './defaults', './script'], function Utils(util, storage, defaults, script) {
    var utils = {
        util: util,
        storage: storage,
        defaults: defaults,
        script: script,

        modules: [util, storage, defaults, script],

        init: function () {
            this.modules.forEach(function (module) {
                module.init(document);
            });
        }
    };
    return utils;
});
