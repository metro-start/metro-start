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
