import util from './util';
import modal from './modal';
import storage from './storage';
import defaults from './defaults';
import script from './script';

export default {
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
