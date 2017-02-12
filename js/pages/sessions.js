define([ 'jquery', '../pagebase/pagebase_grouped', '../utils/util'],
function(jquery, pagebase_grouped, util) {
    var sessions = {
        name: 'sessions',

        data: {},

        elems: {},

        sessions: {},

        templates: {
            itemFragment: util.createElement('<div class="session_item"></div>'),
            titleFragment: util.createElement('<span class="title clickable"></span>'),
        },

        // Initialize this module.
        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_sessions');
            this.sessions = new pagebase_grouped();
            this.sessions.init(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.loadSessions();
        },
        
        sortChanged: function (newSort) {
            this.sessions.sortChanged(newSort, false);
        },

        // Loads the available sessions from local and web storage
        loadSessions: function() {
            var that = this;
            chrome.sessions.getDevices(null, function(devices) {
                for (var i in devices) {
                    var data = [];
                    for (var j in devices[i].sessions) {
                        if (!!devices[i].sessions[j].tab) {
                            data = data.concat(devices[i].sessions[j]);
                        } else if (!!devices[i].sessions[j].window) {
                            data = data.concat(devices[i].sessions[j].window.tabs);
                        }
                    }
                    that.sessions.addAll({
                        'heading': devices[i].deviceName,
                        'data': data
                    });
                }
            });
        },

        templateFunc: function(tab) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.id = 'session_' + tab.id;
            title.firstElementChild.textContent = tab.title;
            title.firstElementChild.addEventListener('click', this.openTab.bind(this, tab));
            fragment.appendChild(title);

            return fragment;
        },

        openTab: function(session) {
        }
    };

    return sessions;
});
