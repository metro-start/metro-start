require.config({
	paths: {
        domReady: '../lib/requirejs-domready/domReady',
		jquery: '../lib/jquery/dist/jquery',
        jqueryMigrate: '../lib/jquery-migrate/jquery-migrate',
        jqueryUI: '../lib/jquery-ui/ui/minified/jquery-ui.min',
        jss: '../lib/jss/jss',
        farbtastic: '../lib/farbtastic/src/farbtastic',
	},
    shim: {
		jqueryMigrate: ['jquery'],
		farbtastic: ['jquery', 'jqueryMigrate'],
		jss: {
			deps: ['jquery'],
			exports: 'jss'
		}
    },
    // // kick start application
    // deps: ['./bootstrap']
});

require(['jquery'], function(jquery) {
	jquery.migrateMute = true;
});

require(['app', 'storage'], function(app, deferredStorage) {
	'use strict';

	deferredStorage.getAll().done(function(storage) {
		app.bootstrap();
	});
});
