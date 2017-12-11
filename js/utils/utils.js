define(['./util', './modal', './storage', './defaults', './script'], function Utils(util, modal, storage, defaults, script) {
    var utils = {
        util: util,
        storage: storage,
        defaults: defaults,
        script: script,
        modal: modal,

        modules: [util, storage, defaults, script, modal],

        init: function () {
            this.modules.forEach(function (module) {
                module.init(document);
            });
        }
    };
    return utils;
});
