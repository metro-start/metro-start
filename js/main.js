require(['./utils/storage', './app'], function(deferredStorage, app) {
	'use strict';

	deferredStorage.init().done(function(storage) {
		app.init();
	});
});
