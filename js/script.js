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
	
	//laod cached results for weather or set default locat
	$('#where').html(localStorage.getItem('where'));
	$('#temp').html(localStorage.getItem('temp'));
	$('#condition').html(localStorage.getItem('condition'));
	$('#locat').val(localStorage.getItem('locat'));

	//attach color pickers
	$.each(defaultTheme, function(key, value) {
		$('#' + key).farbtastic(function(theme) {
			localStorage.setItem(key, theme);
			$('#' + key + '-display').text(theme);
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

	$('#font-chooser').metroSelect({
		'onchange': function() {
			localStorage.setItem('font', $('#font-chooser').attr('selectedIndex'));	
			updateStyle();
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
			updateWeather(true);
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

	//reset theme to default.
	$('#reset-theme').on('click', function() {
		_gaq.push(['_trackEvent', 'Page Action',  'theme reset']);
		changeTheme(defaultTheme);
	});

	//attaches a remove link to all remove elements for links
	$('#internal_selector_links').on('click', '.remove', function(event) {
		var links = JSON.parse(localStorage.getItem('links'));
		for(id in links) {
			if(links[id].url == $(event.target).parent().children('a').attr('href')) {
				_gaq.push(['_trackEvent', 'Page Action',  'removed a link']);
				links.splice(id, 1);
				localStorage.setItem('links', JSON.stringify(links));
				$(event.target).parent().remove();
				$('#internal_selector_links').empty();
				loadLinks();
				break;
			}
		}
	});

	//attaches a remove link to all remove elements in apps
	$('#internal_selector').on('click', '.remove', function(event) {
		chrome.management.uninstall($(this).prop('id'));
		$(this).parent().remove();
		$('#internal_selector').empty();
		loadApps(true);
		//reflow($('#internal_selector'));
	});

	//show the right page and load list of apps on load
	loadLinks();
	loadApps(false);
	loadBookmarks();
	loadThemes();
	updateWeather(false);
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
  Change to the newly provided theme.
  */
var changeTheme = function(newTheme) {
	$.each(newTheme, function(key, value) {
		localStorage.setItem(key, value);	
	});

	updateStyle(true);

	$.each(newTheme, function(key, value) {
		$.farbtastic('#' + key).setColor(value);
	});
};

/**
  Check for saved themes and load it
  */
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
	
	if(localStorage.getItem('font')) {
		font = localStorage.getItem('font');
		if(font == 0) {
			$('body').css('fontFamily', '"Segoe UI", Helvetica, Arial, sans-serif');
			$('body').css('fontWeight', 'normal');
		} else {
			$('body').css('fontFamily', 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif');
			$('body').css('fontWeight', 'bold');
		}
	}

	var background_color = localStorage.getItem('background-color');
	if (transition) {
		$('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
		$('::-webkit-scrollbar').css('background', 'rbga(255, 0, 0, 1)');
		$('.title-color').animate({'color': localStorage.getItem('title-color')}, {duration: 400, queue: false});

		$('body').animate({'color': localStorage.getItem('main-color')}, {duration: 400, queue: false});

		var options_color = localStorage.getItem('options-color');
		$('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
		$('::-webkit-scrollbar-thumb').css('background', options_color);
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

/**
  Loads exiting links from localStorage.
  */
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
	updateStyle(false);
}

/**
  Loads all saved themes as well as downloading themes from the online gallery.
  */
var loadThemes = function() {
	var index = 0;
	var internal_selector = $('#internal_selector_theme');
	internal_selector.empty();
	var myThemes = JSON.parse(localStorage.getItem('themes'));
	var page = $('<div class="page" id="page_' + index + '"></div>');
	page.append('<span class="options-color">my themes</span>');
	internal_selector.append(page);
	//for each of the local themes
	for(i in myThemes) {
		var elem = myThemes[i];
		var item = $('<div class="item"></div>');
		//attach remove handler to remove color from localStroage and view
		var remove = $('<span class="remove options-color small-text">remove</span>');
		var url = 'http://metro-start.appspot.com/newtheme?' + 
			'title=' + encodeURIComponent(elem.title) +
			'&maincolor=' + encodeURIComponent(elem.colors['main-color']) +
			'&optionscolor=' + encodeURIComponent(elem.colors['options-color']) +
			'&titlecolor=' + encodeURIComponent(elem.colors['title-color']) +
			'&backgroundcolor=' + encodeURIComponent(elem.colors['background-color']);

		var share = $('<a class="options-color small-text" href="' + url + '">share</a>');
		remove.on('click', function() {
			var themes = JSON.parse(localStorage.getItem('themes'));
			for(i = 0; i < themes.length; i++) {
				//if they are the same theme, remove it from list and localStorage
				if(themes[i].title === elem.title) {
					themes.splice(i, 1);
					$(this).parent().remove();
					localStorage.setItem('themes', JSON.stringify(themes));
					break;
				}
			}
		});
		//create the title and attach a handle to switch theme when clicked
		var title = $('<p> ' + elem.title + ' </p>');
		(function(colors) {
			title.on('click', function() {
				changeTheme(colors);
			});
		})(elem.colors);

		item.append(title);
		item.append(remove);
		item.append(share);
		//add the row item to the page
		page.append(item);
		if((parseInt(i) + 1) % 5 == 0) {
			index++;
			page = $('<div class="page" id="page_' + index + '"></div>');
			//adding a blank row at the top of every page
			page.append('<div class="options-color">&nbsp;</div>');
			internal_selector.append(page);
		}
	}
	changeView(localStorage.getItem('active'), true);	

	$.ajax({
		url: 'http://metro-start.appspot.com/themes.json',
		success: function(data) {
			data = JSON.parse(data);
			var page = $('<div class="page first-online" id="page_' + index + '"></div>');
			page.append('<span class="options-color">online themes</span>');
			internal_selector.append(page);
			for(i in data) {
				var elem = data[i];
				var item = $('<div class="item"></div>');
				var title = $('<p>' + elem.title + ' </p>');
				//Wrapping this in a closure to maintain the elem.colors binding
				(function(elem) {
					title.on('click', function() {
						colors = {
							'main-color': elem.main_color,
							'options-color': elem.options_color,
							'title-color': elem.title_color,
							'background-color': elem.background_color
						};
						changeTheme(colors);
					});
				})(elem)
				item.append(title);
				item.append('<a class="gallery-bio options-color" href="' + elem.website + '">' + elem.author + '</a></li>');
				page.append(item);
				if((parseInt(i) + 1) % 5 == 0) {
					index++;
					page = $('<div class="page" id="page_' + index + '"></div>');
					page.append('<div class="item"></div>');
					internal_selector.append(page);
				}
			}

			updateStyle(false);
			changeView(localStorage.getItem('active'), true);	
		}
	});
}

/**
  Get list of apps from chrome and filter out extensions
  */
var loadApps = function(reflow) {
    chrome.management.getAll(function(res) {
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

		updateStyle(false);
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
		updateStyle(false);
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
	//If we're changing to the gallery view, save the page we just came from.
	if (tar == 3) {
		if (cur == tar) {
			localStorage.setItem('previous', 1);
		} else {
			localStorage.setItem('previous', cur);
		}
	}
	//If the page should be switched instantly, do not slide.
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
			loadThemes();
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

/**
  Convert values from fahrenheit to celsius
  */
var toCelsius = function(fah) {
	return Math.floor(((parseFloat(fah) - 32) * 5) / 9);
}
