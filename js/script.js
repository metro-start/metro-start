//TODO: Review this section. Anyway to modify farbtastic to talk to angular?
$(function() {
	//attach color pickers
	$.each(defaultTheme, function(key, value) {
		return false;
		$('#' + key).farbtastic(function(color) {
			localStorage.setItem(key, color);
			$('#' + key + '-display').text(color);
			updateStyle(false);
		});

		//If you press enter in the text box, set it a the new color.
		$('#' + key + '-display').on('keydown', function(e) {
			if(e.keyCode == 13) {
				$.farbtastic('#' + key).setColor($(this).text());
				return false;
			}
		});

		$('#' + key + '-display').on('blur', function(e) {
			$.farbtastic('#' + key).setColor($(this).text());
		});

		if(localStorage.getItem(key)) {
			$.farbtastic('#' + key).setColor(localStorage.getItem(key));
		} else {
			$.farbtastic('#' + key).setColor(value);
		}
	});
});

//TODO: Review this section. Is there a way to avoid the FOUSC when launching first time?
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
