require.config({
	paths: {
        'domReady': '../../lib/requirejs-domready/domReady',
		'jquery': '../../lib/jquery/dist/jquery',
        'jqueryMigrate': '../../lib/jquery-migrate/jquery-migrate',
        'jqueryUI': '../../lib/jquery-ui/ui/minified/jquery-ui.min',
        'jss': '../../lib/jss/jss',
        'farbtastic': '../../lib/farbtastic/src/farbtastic',
		'metro-select': '../../lib/metro-select/metro-select',
	},
    shim: {
		jqueryMigrate: ['jquery'],
		metroSelect: ['metro-select'],
		farbtastic: ['jquery', 'jqueryMigrate'],
		jss: {
			deps: ['jquery'],
			exports: 'jss'
		}
    },
});

require(['jquery'], function(jquery) {
	jquery.migrateMute = true;
});

require(['app', 'utils/storage'], function(app, deferredStorage) {
	'use strict';

	deferredStorage.init().done(function(storage) {
		app.init();
	});
});
