require(['./app', './utils/storage'], function(app, deferredStorage) {
	'use strict';

	deferredStorage.init().done(function(storage) {
		app.init();
	});
});
