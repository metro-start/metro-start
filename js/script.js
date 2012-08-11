//globals (kinda?)
var total = ['links', 'apps', 'bookmarks', 'themes'];
var units = ['fahrenheit', 'celsius'];
var link_page = '';
var wrench = false;

var defaultTheme = {
	'options-color': '#ff0000',
	'main-color': '#ffffff',
	'title-color': '#4a4a4a',
	'background-color': '#000000'
};
	
$(function() {	
	//set defaults
	if(!localStorage.getItem('hide_weather')) {
		localStorage.setItem('hide_weather', false);
	}

	if(localStorage.getItem('active')) {
		var active = localStorage.getItem('active');
		//If the last page we were at  was the gallery, show the last page before that.
		if (active == 3) {
			if (localStorage.getItem('previous')) {
				active = localStorage.getItem('previous');
				localStorage.setItem('active', active);
			} else {
				active = 1;
			}
		}
		$('#menu').prop('selectedIndex', active);
	} else {
		localStorage.setItem('active', 1);
	}
	
	if(!localStorage.getItem('locat')) {
		localStorage.setItem('locat', '95123'); 
	}

	if(!localStorage.getItem('unit')) {
		localStorage.setItem('unit', 'fahrenheit');
	}

	if(!localStorage.getItem('themes')) {
		localStorage.setItem('themes', '[]');
	}

	if(localStorage.getItem('font')) {
		$('#font-chooser').prop('selectedIndex', localStorage.getItem('font'));
	} else {
		localStorage.setItem('font', 0);
	}

	$('#select-box').val(localStorage.getItem('unit'));

	//attach color pickers
	$.each(defaultTheme, function(key, value) {
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

	//Attaching event handlers
	//show all options on the page.
	$('#wrench').on('click', function() {		
		_gaq.push(['_trackEvent', 'Page Action', 'wrench clicked']);
		if (wrench){
			$('.option').hide('fast', function() {
				$(this).hide();
			});
			if(localStorage.getItem('active') == 3) {
				$('#menu-sel-' + localStorage.getItem('previous')).click();
			}
		} else {
			$('.option').show('fast');
		}
		wrench = !wrench;
		//handle guys that have states that can be activated AFTER wrench.
		$('.picker').fadeOut('fast');
		doneEditingTheme();

		$('#where').prop('contentEditable', 'false');
		if($('#url').length) $('#url').remove();
	});

	//Called when addding a new link to the links pages
	$('#add').on('click', function() {
		_gaq.push(['_trackEvent', 'Page Action', 'add clicked']);
		if ($('#url').length) {
			saveNewLink();
		} else {
			$('#add').text('done');
			var element = $('<span class="url" id="url" contentEditable="true">http://</span>');
			element.hide();
			$(this).parent().append(element);
			element.on('keydown', function(e) {
				if(e.keyCode == 13) {
					saveNewLink();
					return false;
				}
			});
			element.show('fast');
			element.focus();
			document.execCommand('selectAll',false,null);
		}
	});

	//toggles the weather on and off
	$('#hide_weather').on('click', function() {
		localStorage.setItem('hide_weather', localStorage.getItem('hide_weather') == 'false' ? 'true' : 'false');
		updateStyle(false);
		_gaq.push(['_trackEvent', 'Page Action', 'hide weather clicked']);
	});

	//handle clicking the edit link in weather section
	$('#edit').on('click', function() {
		_gaq.push(['_trackEvent', 'edit clicked']);

		var done = function() {
			var locat = $('#where').text();
			if(locat.trim() == '') {
				return;
			}
			$('#where').prop('contentEditable', 'false');
			localStorage.setItem('locat', locat);
			//updateWeather(true);
			$('#edit').text('edit');
		};

		if($('#where').prop('contentEditable') != 'true') {
			$('#where').prop('contentEditable', 'true');
			$('#where').focus();
			document.execCommand('selectAll', false, null);
			$('#where').on('keydown', function(e) {
				if(event.keyCode == 13) {
					e.preventDefault();
					done();
				}
			});
			$('#edit').text('done');
		} else {
			done();
		}
	});

	//clicking on the edit theme/done editing theme link
	$('#edit-theme').on('click', function() {
		$('#them-gallery:visible').fadeOut('fast');
		$('.picker').fadeToggle('fast');

		doneEditingTheme();
	});

	//show the right page and load list of apps on load
	//updateWeather(false);
	updateStyle(false);
	
	$('.option').hide();
	$('.picker').hide();
	$('#color-gallery').hide();
});


/**
	Adds items to the list of links.
	Used when adding new links, or when loading existing links.
*/
var addItem = function(name, url) {
	return;
	var page = {};
	var internal_selector = $('#internal_selector_links');
	var create_page = function() {
		link_page++;
		page = $('<div class="page" id="link_page_' + link_page + '"></div>');
		internal_selector.append(page);
	}

	if (link_page == 0) {
		create_page();
	} else {
		page = $('#link_page_' + link_page);
		if (page.children().length >= 5) {
			create_page();
		}
	}
	page.append('<div class="item"><span class="remove option options-color">remove</span> <a href="' + url + '">' + name + '</a></div>');
	updateStyle(false);
}


/**
  Done editing theme. Change name and save theme
  */
var doneEditingTheme = function() {
	//If the picker is visible, set the right name for the edit control.
	if ($('.picker:visible').length) {
		if($('#edit-theme').text().trim() == 'edit theme') {
			$('#edit-theme').text('done editing');
		} else {
			$('#edit-theme').text('edit theme');
		}

		//If the text still says untitled, don't save it.
		if($('#edit-title').text().trim() !== 'untitled') {
			var themes = JSON.parse(localStorage.getItem('themes'));
			themes.push({
				'title': $('#edit-title').text().trim(),
				'colors': {
					'options-color': localStorage.getItem('options-color'),
					'main-color': localStorage.getItem('main-color'),
					'title-color': localStorage.getItem('title-color'),
					'background-color': localStorage.getItem('background-color')
				}
			});
			localStorage.setItem('themes', JSON.stringify(themes));
			$('#edit-title').text('untitled');
		}
	}
};

/**
  Save the newly created link
  */
var saveNewLink = function() {
	var list = JSON.parse(localStorage.getItem('links'));
	var name = $('#url').text().toLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
	var url = $('#url').text();
	if(name.trim() == '') {
		$('#url').remove();
		$('#add').text('add');
		return;
	}
	if(!url.match(/https?\:\/\//)) {
		url = 'http://' + url;
	}
	if (list == null) {
		list = new Array();
	}
	list.push({'name': name, 'url': url});
	localStorage.setItem('links', JSON.stringify(list));

	$('#url').remove();
	$('#add').text('add');
	addItem(name, url);
};
