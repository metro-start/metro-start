var link_page = '';

	
$(function() {	
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
