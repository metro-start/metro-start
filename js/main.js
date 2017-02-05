require(['./utils/storage', './app'], function(deferredStorage, app) {
	'use strict';

	require(['domReady!'], function (document) {
		angular.bootstrap(document, ['app']);
	});
});
