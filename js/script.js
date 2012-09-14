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

	$(window).resize(function() {
		var height = $('body').height() - ($('h1').outerHeight(true) + $('.page-chooser').outerHeight(true) + $('.footer').outerHeight(true));
		jss('.external', {
			'height': height
		});
		jss('.bookmark_page', {
			'height': height
		});

		scope.setPageItemCount(Math.floor((height) / 60) - 1);
	});
	$(window).resize();
});

//TODO: Review this section. Is there a way to avoid the FOUC when launching first time?
var updateStyle = function(transition) {
	var scope = angular.element(document.body).scope();

	var options_color = '#ff0000';
	var background_color = '#ff0000';
	var main_color = '#ff0000';
	var title_color = '#ff0000';

	if (scope.theme) {
		background_color = scope.theme.colors['background-color'];
		options_color = scope.theme.colors['options-color'];
		main_color = scope.theme.colors['main-color'];
		title_color = scope.theme.colors['title-color'];
	}

	var style = {};
	if(scope.font == 0) {
		jss('body', {
			'font-family': '"Segoe UI", Helvetica, Arial, sans-serif',
			'font-weight': 'normal'
		});
	} else { 
		jss('body', {
			'font-family': 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif',
			'font-weight': 'bold'
		});
	}

	jss('*', {
		'border-color': options_color
	});
	style += '* { border-color: ' + options_color + '}';
	jss('::-webkit-scrollbar', {
		'background': background_color
	});

	jss('::-webkit-scrollbar-thumb', {
		'background': options_color
	});

	jss('::-webkit-input-placeholder', {
		'background': main_color
	});

	// Transition the colors, but then we still add it to the DOM.
	if (transition) {
		$('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
		$('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
		$('body').animate({'color': main_color}, {duration: 400, queue: false});
		$('input').animate({'color': main_color}, {duration: 400, queue: false});
		$('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
	}

	jss('.background-color', { 
		'background-color': background_color
	});
	jss('body', { 
		'color': main_color
	});
	jss('input', { 
		'color': main_color
	});
	jss('.options-color', { 
		'color': options_color
	});
}
