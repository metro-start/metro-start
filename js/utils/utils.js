define(['./util', './modal', './storage', './defaults', './script'],
    (util, modal, storage, defaults, script) => {
        let utils = {
            util: util,
            storage: storage,
            defaults: defaults,
            script: script,
            modal: modal,

            modules: [util, storage, defaults, script, modal],

            init: function() {
                this.modules.forEach((module) => {
                    module.init(document);
                });
            },
        };
        return utils;
    });
