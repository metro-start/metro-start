var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25604585-1']);
_gaq.push(['_trackPageview']);

define(['domReady!', 'storage', 'script'], function (document, storage, script) {
        'use strict';

        var app = {
            bootstrap: function() {
                script.init();
            }
        };

        return app;
    });
