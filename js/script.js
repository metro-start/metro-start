//globals (kinda?)
var total = ['links', 'apps', 'bookmarks'];
var units = ['fahrenheit', 'celsius'];
var link_page = '';
var wrench = false;

var sampleOnline = 
[
	{
		'title': 'summer bliss',
		'author': 'chuma',
		'link': 'twitter.com/chustar',
		'colors': {
			'options-color': '#ff0000',
			'main-color': '#ffff00',
			'title-color': '#4a114a',
			'background-color': '#550000'
		}
	},
	{
		'title': 'midnight run',
		'author': 'nnaji',
		'link': 'chumannaji.com',
		'colors': {
			'options-color': '#bf0000',
			'main-color': '#ff8f00',
			'title-color': '#4a114a',
			'background-color': '#050000'
		}
	}
];

$(function() {	
	//set defaults
	var defaultColors = {
		'options-color': '#ff0000',
		'main-color': '#ffffff',
		'title-color': '#4a4a4a',
		'background-color': '#000000'
	};

	if(!localStorage.getItem('hide_weather')) {
		localStorage.setItem('hide_weather', false);
	}

	if(localStorage.getItem('active')) {
		$('#menu').prop('selectedIndex', localStorage.getItem('active')); //saved links
	} else {
		localStorage.setItem('active', 1);
	}
	
	if(!localStorage.getItem('locat')) {
		localStorage.setItem('locat', '95123'); 
	}

	if(!localStorage.getItem('unit')) {
		localStorage.setItem('unit', 'fahrenheit');
	}

	if(!localStorage.getItem('colors')) {
		localStorage.setItem('colors', '[]');
	}

	$('#select-box').val(localStorage.getItem('unit'));
	
	//laod cached results for weather or set default locat
	$('#where').html(localStorage.getItem('where'));
	$('#temp').html(localStorage.getItem('temp'));
	$('#condition').html(localStorage.getItem('condition'));
	$('#locat').val(localStorage.getItem('locat'));

	//Attaching event handlers
	//show all options on the page.
	$('#wrench').click(function(){		
		_gaq.push(['_trackEvent', 'Page Action', 'wrench clicked']);
		if (wrench) $('.option').hide('fast');
		else $('.option').show('fast');
		wrench = !wrench;
		
		//handle guys that have states that can be activated AFTER wrench.
		$('.picker').fadeOut('fast');
		$('#color-gallery').fadeOut('fast');
		$('#where').prop('contentEditable', 'false');
		if($('#url').length) $('#url').remove();

	});

	$('#add').click(function(){
		_gaq.push(['_trackEvent', 'Page Action', 'add clicked']);
		var save_link = function() {
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

		if ($('#url').length) {
			save_link();
		} else {
			$('#add').text('done');
			var element = $('<span class="url" id="url" contentEditable="true">http://</span>');
			element.hide();
			$(this).parent().append(element);
			element.on('keydown', function(e) {
				if(e.keyCode == 13) {
					save_link();
					return false;
				}
			});
			element.show('fast');
			element.focus();
			document.execCommand('selectAll',false,null);
		}
	});

	//handle clicking the edit link in weather section
	$('#hide_weather').click(function(){
		localStorage.setItem('hide_weather', localStorage.getItem('hide_weather') == 'false' ? 'true' : 'false');
		updateStyle(false);
		_gaq.push(['_trackEvent', 'Page Action', 'hide weather clicked']);
	});

	//handle clicking the edit link in weather section
	$('#edit').click(function(){
		_gaq.push(['_trackEvent', 'edit clicked']);

		var done = function() {
			var locat = $('#where').text();
			if(locat.trim() == '') {
				return;
			}
			$('#where').prop('contentEditable', 'false');
			localStorage.setItem('locat', locat);
			updateWeather(true);
			$('#edit').text('edit');
		};
		if($('#where').prop('contentEditable') != 'true') {
			$('#where').prop('contentEditable', 'true');
			$('#where').focus();
			document.execCommand('selectAll',false,null);
			$('#where').on('keydown', function(e) {
				if(event.keyCode == 13){
					e.preventDefault();
					done();
				}
			});
			$('#edit').text('done');
		} else {
			done();
		}
	});

	//attach a picker for the background color and also set its default if it hasn't been changed yet
	$.each(defaultColors, function(key, value) {
		$('#' + key).farbtastic(function(color) {
			localStorage.setItem(key, color);
			$('#' + key + '-display').text(color);
			updateStyle(false);
		});

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

	var doneEditing = function() {
		if($('#edit-colors').text().trim() == 'edit colors') {
			$('#edit-colors').text('done editing');
		} else {
			$('#edit-colors').text('edit colors');
		}

		if($('#edit-title').text().trim() !== 'untitled') {
			var colors = JSON.parse(localStorage.getItem('colors'));
			colors.push({
				'title': $('#edit-title').text().trim(),
				'colors': {
					'options-color': localStorage.getItem('options-color'),
					'main-color': localStorage.getItem('main-color'),
					'title-color': localStorage.getItem('title-color'),
					'background-color': localStorage.getItem('background-color')
				}
			});
			localStorage.setItem('colors', JSON.stringify(colors));
			$('#edit-title').text('untitled');
		}
	};

	$('#edit-colors').click(function() {
		$('#color-gallery:visible').fadeOut('fast');
		$('.picker').fadeToggle('fast');

		doneEditing();
	});

	$('#edit-colors').hide(function() {
		doneEditing();
	});

	$('#color-gallery-button').click(function() {
		$('.picker:visible').fadeOut('fast');
		$('#color-gallery').toggle();
		
		var myList = $('#my-items');
		myList.empty();
		var colors = JSON.parse(localStorage.getItem('colors'));
		$.each(colors, function(key, elem) {
			var title = $('<p class="gallery-title">' + elem.title + '</p>');
			title.on('click', function() {
				changeColors(elem.colors);
			});
			var li = $('<li class="gallery-item"></li>');
			li.append(title);
			myList.append(li);
		});

		var onlineList = $('#online-items');
		onlineList.empty();
		$.each(sampleOnline, function(key, elem) {
			var title = $('<p class="gallery-title">' + elem.title + '</p>');
			title.on('click', function() {
				changeColors(elem.colors);
			});
			var li = $('<li class="gallery-item"></li>');
			li.append(title);
			li.append('<a class="gallery-bio options-color" href="' + elem.link + '">' + elem.author + '</a></li>');
			onlineList.append(li);
		});
		updateStyle(false);
	});

	//reset all the colors to default.
	$('#reset-colors').click(function(){
		_gaq.push(['_trackEvent', 'Page Action',  'colors reset']);
		changeColors(defaultColors);
	});

	//attaches a remove link to all remove elements for links
	$('#internal_selector_links').on('click', '.remove', function(event){
		var links = JSON.parse(localStorage.getItem('links'));
		for(id in links) {
			if(links[id].url == $(event.target).parent().children('a').attr('href')) {
				_gaq.push(['_trackEvent', 'Page Action',  'removed a link']);
				links.splice(id, 1);
				localStorage.setItem('links', JSON.stringify(links));
				$(event.target).parent().remove();
				$('#internal_selector_links').empty();
				loadLinks();
				//reflow($('#internal_selector_links'));
				break;
			}
		}
	});

	//attaches a remove link to all remove elements in apps
	$('#internal_selector').on('click', '.remove', function(event){
		chrome.management.uninstall($(this).prop('id'));
		$(this).parent().remove();
		$('#internal_selector').empty();
		loadApps(true);
		//reflow($('#internal_selector'));
	});

	//attach the menu selectbox
	$('#menu').metroSelect({
		'onchange': function() {
			changeView($('#menu').attr('selectedIndex'));
		}
	});

	//attach the weather selectbox
	$('#select-box').metroSelect({
		'onchange': function() {
			localStorage.setItem('unit', units[$('#select-box').attr('selectedIndex')]);
			updateWeather(true);
		}
	});

	//show the right page and load list of apps on load
	loadLinks();
	loadApps(false);
	loadBookmarks();
	updateWeather(false);
	updateStyle(false);
	
	$('.option').hide();
	$('.picker').hide();
	$('#color-gallery').hide();
});


var addItem = function(name, url) {
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
	page.append('<div class="item"><span class="remove option options-color">remove</span> <a href="' + url + '">' + name + '</a></div>')
}

/**
  Update the weather from yql. 
  force: Bypasses the cache and force hits the server.
  */
var updateWeather = function(force) {
    var unit = localStorage.getItem('unit')[0];
    var locat = localStorage.getItem('locat');
    var time = localStorage.getItem('time');
    var cTime = new Date();
    if(force || cTime.getTime() > time) {
        //delay for an hour
        localStorage.setItem('time', cTime.getTime() + 3600000);
		var url = 'http://www.google.com/ig/api?weather=' + locat;
		var xml = new JKL.ParseXML(url);
		xml.async(function (data) {
			if (data.xml_api_reply && typeof(data.xml_api_reply) === 'object') {
				var weather = data.xml_api_reply.weather;
				var city = weather.forecast_information.city.data.toLowerCase();
				localStorage.setItem('where', city);
				$('#where').html(city);

				if (unit == 'f') {
					localStorage.setItem('temp', weather.current_conditions.temp_f.data + '<span class="options-color">&deg;' + unit + '</span> / ' + weather.forecast_conditions[0].high.data + ' <span class="options-color">hi</span> / ' + weather.forecast_conditions[0].low.data + ' <span class="options-color">lo</span>');
				} else {
					localStorage.setItem('temp', weather.current_conditions.temp_c.data + '<span class="options-color">&deg;' + unit + '</span> / ' + toCelsius(weather.forecast_conditions[0].high.data) + ' <span class="options-color">hi</span> / ' + toCelsius(weather.forecast_conditions[0].low.data) + ' <span class="options-color">lo</span>');
				}

				$('#temp').html(localStorage.getItem('temp'));
				localStorage.setItem('condition', weather.current_conditions.condition.data.toLowerCase());
				$('#condition').html(weather.current_conditions.condition.data.toLowerCase());
			}
			updateStyle(false);
		});
		xml.parse();
	}
}

/**
  Check for saved colors and load it
  */

var changeColors = function(newColors) {
	$.each(newColors, function(key, value) {
		localStorage.setItem(key, value);	
		$.farbtastic('#' + key).setColor(value);
	});
	updateStyle(true);
};

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
	
	var background_color = localStorage.getItem('background-color');
	if (transition) {
		$('.background-color').animate({'backgroundColor': background_color}, {duration: 200, queue: false});
		$('::-webkit-scrollbar').animate({'background': background_color}, {duration: 200, queue: false}); 
		$('.title-color').animate({'color': localStorage.getItem('title-color')}, {duration: 200, queue: false});

		$('body').animate({'color': localStorage.getItem('main-color')});

		var options_color = localStorage.getItem('options-color');
		$('.options-color').animate({'color': options_color}, {duration: 200, queue: false});
		$('::-webkit-scrollbar-thumb').animate({'background': options_color}, {duration: 200, queue: false});
	} else {
		$('.background-color').css('backgroundColor', background_color);
		$('::-webkit-scrollbar').css('background', background_color); 
		$('.title-color').css('color', localStorage.getItem('title-color'));

		$('body').css('color', localStorage.getItem('main-color'));

		var options_color = localStorage.getItem('options-color');
		$('.options-color').css('color', options_color);
		$('::-webkit-scrollbar-thumb').css('background', options_color);
	}
}

var loadLinks = function() {
	link_page = 0;
    //get links from localStorage and ensure they're empty	
    var links = localStorage.getItem('links');
    if(links) links = JSON.parse(links);
    else links = new Array();

	//load saved links or load default material
    var list = new Array();
	if(links == null || links.length == 0) {
		addItem('use the wrench to get started. . . ', '');
		list.push({'name': 'use the wrench to get started. . . ', 'url': ''});
		localStorage.setItem('links', JSON.stringify(list));
	}

	for (id in links) {
		addItem(links[id].name, links[id].url);
	}
}

/**
  Get list of apps from chrome and filter out extensions
  */
var loadApps = function(reflow) {
    chrome.management.getAll(function(res){
        var index = 0;
        var internal_selector = $('#internal_selector');
        var page = $('<div class="page" id="page_' + index + '"></div>');
        internal_selector.append(page);
        res = res.filter(function(item) { return item.isApp; });
        res.unshift({'name': 'Chrome Webstore', 'appLaunchUrl': 'https://chrome.google.com/webstore'})
        for(i in res) {
            var item = $('<div class="item"><span class="remove option options-color" id="' + res[i].id + '">uninstall</span> <a href="' + res[i].appLaunchUrl + '">' + res[i].name + '</a></div>');
			if (!reflow) item.children('.remove').hide();
            page.append(item);
            if((parseInt(i) + 1) % 5 == 0) {
                index++;
                page = $('<div class="page" id="page_' + index + '"></div>');
                internal_selector.append(page);
            }
        }

    	//load the list of links and change the view otherwise this stuff happens before the callback executes
    	changeView(localStorage.getItem('active'), true);	
    });
}

//Starts from the root of all bookmark elements and builds out all pages.
var loadBookmarks = function() {
	chrome.bookmarks.getTree(function(res) {
		var internal_sel = $('#internal_selector_book');
		var page = $('<div class="bookmark_page" id="bookmark_page_0"></div>'); //Creates the first page.
		internal_sel.append(page);
		for (j in res[0].children) {
			buildListOfBookmarks(0, res[0].children[j]);
		}
	});
}

//Given a bookmark folder, builds a list of all its children and puts it in a page element.
var buildListOfBookmarks = function(owner, node) {
	var internal_sel = $('#internal_selector_book');
	var page = $('#bookmark_page_' + owner);
	var ellipses = function(title) {
		return (title.length > 22 ? (title.substr(0, 17) + '...') : title);
	}

	//If the current node has any children, we need to add it as a directory.
	if(node.children) {
		var item = $('<div class="item" id="bookmark_' + node.id + '">' + ellipses(node.title) + '<span class="options-color">/</span></div>');
		page.append(item);
		item.on('click', function() {
			var page_id = $(this).prop('id').replace('bookmark_', '');
			var parent_id = parseInt($(this).parent().prop('id').replace('bookmark_page_', ''));

			//filter all the pages:
			//If the page we're looking at has a higher index than the page we're on,
			//it means that this new page is at a deeper index in the bookmark heirachy than
			//the one that is currently enabled (indexes are assigned essentially BFS).
			$('.bookmark_page').filter(function(index) {
				var my_id = parseInt($(this).prop('id').replace('bookmark_page_', ''));
				if(my_id == page_id) return false; //don't include the page we want to display
				return my_id > parseInt(parent_id); //include all pages with a higher index
			}).hide(); 
			$('#bookmark_page_' + page_id).show(); //show the page we selected.
		});

		//if the current node actually has children, lets add its children in their own page
		if(node.children.length > 0) {
			//create a new page to store its children, hide it and add it to the DOM
			var new_page = $('<div class="bookmark_page" id="bookmark_page_' + node.id + '"></div>');
			new_page.hide();
			internal_sel.append(new_page);
			for (i in node.children) {
				buildListOfBookmarks(node.id, node.children[i]);
			}
		}
	} else {
		//if the node has no children, then its just a link, so add it as a simple anchor.
      	var item = $('<div class="item" id="bookmark_' + node.id + '"><a href="' + node.url + '">' + (node.title.length > 22 ? node.title.substr(0, 16) + '...' : node.title) + '</a></div>');
		page.append(item);
	}
}

/**
  Change the view to the active tab
  */
function changeView(tar, instant) {
	var cur = localStorage.getItem('active');
    localStorage.setItem('active', tar);
	//If the page should be switched instantly, do not set change time
	if(instant) {
		for(i in total) {
			if(i == tar) {
			    $('.' + total[i]).show();
			   } else {
			    $('.' + total[i]).hide();
			}
		}
	//if the page is changing slowly, use a slide and 'fast' timer.
	} else {
		var direction = parseInt(cur) - parseInt(tar) > 0 ? 'left' : 'right';
		var oppose = direction == 'left' ? 'right' : 'left';
		$('.' + total[cur]).hide('slide', {'direction': oppose}, 'fast');			
	 	$('.' + total[tar]).show('slide', {'direction': direction}, 'fast');					
	}
}

function toCelsius(fah) {
	return Math.floor(((parseFloat(fah) - 32) * 5) / 9);
}
