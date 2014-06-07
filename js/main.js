require.config({
	paths: {
        domReady: '../lib/requirejs-domready/domReady',
		jquery: '../lib/jquery/dist/jquery',
        jqueryMigrate: '../lib/jquery-migrate/jquery-migrate',
        jqueryUI: '../lib/jquery-ui/ui/minified/jquery-ui.min',
        angular: '../lib/angular/angular',
        jss: '../lib/jss/jss',
        farbtastic: '../lib/farbtastic/src/farbtastic',
	},
    shim: {
        angular: {
			deps: ['jquery'],
            exports: 'angular'
        },
		jqueryMigrate: ['jquery'],
		farbtastic: ['jquery', 'jqueryMigrate'],
		jss: {
			deps: ['jquery'],
			exports: 'jss'
		}
    },
	priority: [
		"angular"
	],
    // // kick start application
    // deps: ['./bootstrap']
});

require(['jquery'], function(jquery) {
	jquery.migrateMute = true;
});

require(['angular', 'storage', 'app', 'controllers/home'], function(angular) {
	'use strict';

	require(['domReady!'], function (document) {
		angular.bootstrap(document, ['app']);
	});
});
