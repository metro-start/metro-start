$(function() {
	/*
		Attaches the color pickers and binds them to $scope.
	*/
	var scope = angular.element(document.body).scope();
	$.each(defaultTheme.colors, function(key, value) {
		$('#' + key).farbtastic(function(color, scoped) {
			// If we are already in angularjs scope.
			if (scoped) {
				// Change the specific color and save it.
				scope.theme.colors[key] = color;
				saveTwice('theme', scope.theme);
			} else {
				scope.$apply(function() {
					scope.theme.colors[key] = color;
					saveTwice('theme', scope.theme);
				});
			}
			updateStyle(false);
		});

		// Add a listener to update farbtastic when a color is changed.
		scope.$watch('theme.colors["' + key + '"]', function(newVal, oldVal) {
			$.farbtastic('#' + key).setColor(newVal, true);
		});
	});

	var height = $(window).height() - ($('h1').outerHeight(true) + $('.page-chooser').outerHeight(true) + $('.footer').outerHeight(true));
	$('.external').height(height);

		var rows = Math.floor((height + $('.sort').outerHeight()) / 55);
		scope.setRows('links', rows - 1);
//		scope.links.setRows(rows - 1);
		//scope.apps.setRows(rows);
		//scope.localThemes.setRows(rows);
		//scope.onlineThemes.setRows(rows);
});

//TODO: Review this section. Is there a way to avoid the FOUC when launching first time?
var updateStyle = function(transition) {
	var scope = angular.element(document.body).scope();
	if (scope.theme) {
		var style = '';
		if(scope.font == 0) {
			style += 'body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; }';
			style += 'body { font-weight: normal; }';
		} else { 
			style += 'body { font-family: Raleway, "Segoe UI", Helvetica, Arial, sans-serif; }';
			style += 'body { font-weight: bold; }';
		}

		var background_color = scope.theme.colors['background-color'];
		var options_color = scope.theme.colors['options-color'];
		var main_color = scope.theme.colors['main-color'];
		var title_color = scope.theme.colors['title-color'];

		style += '* { border-color: ' + options_color + '}';
		style += '::-webkit-scrollbar { background: ' + background_color + '}';
		style += '::-webkit-scrollbar-thumb { background: ' + options_color + '}';
		style += '::-webkit-input-placeholder { color: ' + main_color + '; opacity: 0.3}';

		// Transition the colors, but then we still add it to the DOM.
		if (transition) {
			$('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
			$('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
			$('body').animate({'color': main_color}, {duration: 400, queue: false});
			$('input').animate({'color': main_color}, {duration: 400, queue: false});
			$('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
		}
		style += '.background-color { background-color: ' + background_color + '}';
		style += '.title-color { color: ' + title_color + '}';
		style += 'body { color: ' + main_color + '}';
		style += 'input { color: ' + main_color + '}';
		style += '.options-color { color: ' + options_color + '}';

		$('#new-style').remove();
		$('body').append('<style id="new-style">' + style + '</style>');
	}
}
