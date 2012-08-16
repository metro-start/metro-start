var Pages = function() {
	this.rows = 4;
	this.pages = [[]];

	this._compact = function() {
		var pages = this.pages;
		var rows = this.rows;
		for (index = 0; index < pages.length; index++) {
			while (pages[index].length < rows && index < pages.length - 1) {
				pages[index].push(pages[index + 1].shift());
			}
		}
		for (index = pages.length - 1; index >= 0; index--) {
			if (pages[index].length == 0) {
				pages.pop();
			} else {
				break;
			}
		}
		if (pages.length == 0) pages.push([]);
		if (pages[pages.length - 1].length == rows) pages.push([]);
	}

	this.add = function(row) {
		this._compact();
		this.pages[this.pages.length - 1].push(row);
	}

	this.remove = function(page, index) {
		this.pages[page].splice(index, 1);
		this._compact();
	}

	this.addAll = function(newRows) {
		for(index = 0; index < newRows.length; index++) {
			this.pages[this.pages.length - 1].push(newRows[index]);
		}
		this._compact();
	}

	this.flatten = function() {
		return this.pages.reduce(function(a, b) { return a.concat(b) });
	}
}

var updateStyle = function(transition) {
	if(localStorage.getItem('hide_weather') == 'true') {
		$('#hide_weather').text('show weather');
		if (transition) $('#weather').hide('fast');
		else $('#weather').hide();
	} else {
		$('#hide_weather').text('hide weather');
		if (transition) $('#weather').show('fast');
		else $('#weather').show();
	}
	
	var style = '';
	if(localStorage.getItem('font')) {
		font = localStorage.getItem('font');
		if(font == 0) {
			style += 'body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; }';
			style += 'body { font-weight: normal; }';
		} else { 
			style += 'body { font-family: Raleway, "Segoe UI", Helvetica, Arial, sans-serif; }';
			style += 'body { font-weight: bold; }';
		}
	}

	var background_color = localStorage.getItem('background-color');
	var options_color = localStorage.getItem('options-color');
	var main_color = localStorage.getItem('main-color');
	var title_color = localStorage.getItem('title-color');

	style += '* { border-color: ' + options_color + '}';
	style += '::-webkit-scrollbar { background: ' + background_color + '}';
	style += '::-webkit-scrollbar-thumb { background: ' + options_color + '}';

	if (transition) {
		$('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
		$('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
		$('body').animate({'color': main_color}, {duration: 400, queue: false});
		$('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
	} else {
		style += '.background-color { background-color: ' + background_color + '}';
		style += '.title-color { color: ' + title_color + '}';
		style += 'body { color: ' + main_color + '}';
		style += '.options-color { color: ' + options_color + '}';
	}

	$('#new-style').remove();
	$('body').append('<style id="new-style">' + style + '</style>');
}

/**
  Convert values from fahrenheit to celsius
  */
var toCelsius = function(fah) {
	return Math.floor(((parseFloat(fah) - 32) * 5) / 9);
}