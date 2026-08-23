import util from './util';
import modal from './modal';
import storage from './storage';
import defaults from './defaults';
import script from './script';

export default {
    util,
    storage,
    defaults,
    script,
    modal,

    modules: [util, storage, defaults, script, modal],

    init() {
        this.modules.forEach((module) => {
            module.init(document);
        });
    },
};
