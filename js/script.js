//globals (kinda?)
var total = ['links', 'apps', 'bookmarks'];
var units = ['fahrenheit', 'celsius'];

$(function() {	
    //get links from localStorage and ensure they're empty	
    var links = localStorage.getItem("links");
    if(links) links = JSON.parse(links);
    else links = new Array();

	if(!localStorage.getItem('hide_weather')) {
		localStorage.setItem('hide_weather', false);
	}

	if(localStorage.getItem('active')) {
		$('#menu').prop('selectedIndex', localStorage.getItem('active')); //saved links
	} else {
		localStorage.setItem('active', 1);
	}
	if(localStorage.getItem('font')) {
		$('#font-chooser').prop('selectedIndex', localStorage.getItem('font')); //saved links
	} else {
		localStorage.setItem('font', 0);
	}
	//load saved links or load default material
    var list = new Array();
	if(links == null || links.length == 0) {
		addItem("use the wrench to get started. . . ", "");
		list.push({"name": "use the wrench to get started. . . ", "url": ""});
		localStorage.setItem("links", JSON.stringify(list));
	}

	for (id in links) {
		addItem(links[id].name, links[id].url);
	}

	if(links != null && links.length >= 7) {
		$(".add").hide();
	}

	//laod cached results for weather or set default zip
	$("#where").html(localStorage.getItem("where"));
	$("#temp").html(localStorage.getItem("temp"));
	$("#condition").html(localStorage.getItem("condition"));

	if(!localStorage.getItem("zip")) {
		localStorage.setItem("zip", "95123"); 
	}

	if(!localStorage.getItem("unit")) {
		localStorage.setItem("unit", "fahrenheit");
	}
	$("#select-box").val(localStorage.getItem("unit"));

	//Attaching event handlers
	//show all options on the page.
	$("#wrench").click(function(){		
		_gaq.push(['_trackEvent', 'wrench clicked']);
		$(".picker").hide("fast");
		$(".option").toggle("fast");
		$("#reset").hide();
	});

	$("#add").click(function(){
		_gaq.push(['_trackEvent', 'add clicked']);
		$("#add").hide("fast");
		$("#url").show("fast");
		$("#url").focus();
	});

	//handle clicking the edit link in weather section
	$("#hide_weather").click(function(){
		localStorage.setItem('hide_weather', localStorage.getItem('hide_weather') == 'false' ? 'true' : 'false');
		updateStyle();
		_gaq.push(['_trackEvent', 'hide weather clicked']);
	});

	//handle clicking the edit link in weather section
	$("#edit").click(function(){
		_gaq.push(['_trackEvent', 'edit clicked']);
		$("#edit").hide("fast");
		$("#where").hide("fast");
		$("#zip").show("fast");
		$("#zip").focus();
	});

	//attach a picker for the background color and also set its default if it hasn't been changed yet
	$("#picker-background").farbtastic(function(color) {
		localStorage.setItem("background-color", color);
		updateStyle();
	});
	if(localStorage.getItem("background-color")) {
		$.farbtastic("#picker-background").setColor(localStorage.getItem("background-color"));
	} else {
		$.farbtastic("#picker-background").setColor("#000000")
	}

	//attach a picker for the title color and also set its default if it hasn't been changed yet
	$("#picker-title").farbtastic(function(color) {
		localStorage.setItem("title-color", color);
		updateStyle();
	});
	if(localStorage.getItem("title-color")) {
		$.farbtastic("#picker-title").setColor(localStorage.getItem("title-color"));
	} else {
		$.farbtastic("#picker-title").setColor("#4A4A4A")
	}

	//attach a picker for the main color and also set its default if it hasn't been changed yet
	$("#picker-main").farbtastic(function(color) {
		localStorage.setItem("main-color", color);
		updateStyle();
	});
	if(localStorage.getItem("main-color")) {
		$.farbtastic("#picker-main").setColor(localStorage.getItem("main-color"));
	} else {
		$.farbtastic("#picker-main").setColor("#FFFFFF")
	}

	//attach a picker for the options color and also set its default if it hasn't been changed yet
	$("#picker-options").farbtastic(function(color) {
		localStorage.setItem("options-color", color);
		updateStyle();
	});
	if(localStorage.getItem("options-color")) {
		$.farbtastic("#picker-options").setColor(localStorage.getItem("options-color"));
	} else {
		$.farbtastic("#picker-options").setColor("#FF0000");
	}

	//show the color pickers
	$("#colors").click(function(){
		_gaq.push(['_trackEvent', 'colors clicked']);
		$(".picker").toggle("fast");
		$("#reset").toggle("fast");
	});

	//reset all the colors to default.
	$("#reset").click(function(){
		_gaq.push(['_trackEvent', 'colors reset']);

		localStorage.setItem("options-color", "#FF0000");	
		$.farbtastic("#picker-options").setColor("#FF0000");

		localStorage.setItem("main-color", "#FFFFFF");	
		$.farbtastic("#picker-main").setColor("#FFFFFF");

		localStorage.setItem("title-color", "#4A4A4A");	
		$.farbtastic("#picker-title").setColor("#4A4A4A");

		localStorage.setItem("background-color", "#000000");	
		$.farbtastic("#picker-background").setColor("#000000");
	
		localStorage.setItem('font', 0)

		updateStyle();
	});

	//when you leave the url field
	$("#url").blur(function() {
		$("#add").show();
		$("#url").hide();
	});

	//when you leave the zip field
	$("#zip").blur(function() {
		$("#edit").show();
		$("#where").show();
		$("#zip").hide();
	});

	//validate the url when the person hits enter
	$("#url").keyup(function(event){
		if(event.keyCode == 13){
			var list = JSON.parse(localStorage.getItem("links"));
			var name = $("#url").val().toLowerCase().replace(/^https?\:\/\//i, "").replace(/^www\./i, "");
			var url = $("#url").val();
			if(url.trim() == "") {
				return;
			}
			if(!url.match(/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)) {
				//handle invalid url
			}			
			if(!url.match(/https?\:\/\//)) {
		url = "http://" + url;
		}
		if (list == null) {
			list = new Array();
		}
		list.push({"name": name, "url": url});
		localStorage.setItem("links", JSON.stringify(list));

		$("#url").blur();
		addItem(name, url);
		if(list.length >= 7) $(".add").hide();
		}
	});

	//force update the wheather when they hit enter after zip
	$("#zip").keyup(function(event){
		if(event.keyCode == 13){
			var zip = $("#zip").val();
			if(zip.trim() == "") {
				return;
			}
			localStorage.setItem("zip", zip);
			$("#zip").blur();
			updateWeather(true);
		}
	});

	//attaches a remove link to all <li>
	$("#links").delegate(".remove", "click", function(event){
		var links = JSON.parse(localStorage.getItem("links"));
		for(id in links) {
			if(links[id].url == $(event.target).parent("li").children("a").attr("href")) {
				_gaq.push(['_trackEvent', 'removed a link']);
				links.splice(id, 1);
				localStorage.setItem("links", JSON.stringify(links));
				$(event.target).parent("li").remove();
				break;
			}
		}
	});

	//attach the menu selectbox
	$("#menu").metroSelect({
		'onchange': function() {
			changeView($('#menu').attr('selectedIndex'));
		}
	});

	//attach the weather selectbox
	$("#select-box").metroSelect({
		'onchange': function() {
			localStorage.setItem("unit", units[$("#select-box").attr('selectedIndex')]);
			updateWeather(true);
		}
	});

	$('#font-chooser').metroSelect({
		'onchange': function() {
			localStorage.setItem('font', $('#font-chooser').attr('selectedIndex'));
			updateStyle();
		}
	});

	$(".option").hide();
	$("input").hide();
	$(".picker").hide();

	//show the right page and load list of apps on load
	loadApps();
	loadBookmarks();
	updateWeather(false);
	updateStyle();	
});

function addItem(name, url) {
    _gaq.push(['_trackEvent', 'added a link']);
    $("#links").append("<li><span class='remove option option-color'>remove</span> <a href=\"" + url + "\">" + name + "</a></li>"); 
}

/**
  Update the weather from yql. 
  force: Bypasses the cache and force hits the server.
  */
function updateWeather(force) {
    var unit = localStorage.getItem("unit")[0];
    var zip = localStorage.getItem("zip");
    var time = localStorage.getItem("time");
    var cTime = new Date();
    if(force || cTime.getTime() > time) {
        //delay for an hour
        localStorage.setItem("time", cTime.getTime() + 3600000);
        $.get(
				"http://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20weather.bylocation%20WHERE%20location%3D'" + zip + "'%20AND%20unit%3D%22" + unit + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
				function(data) {
					var result = data.query.results.weather.rss.channel;
					var city = result.location.city.toLowerCase() + ", "+ result.location.region.toLowerCase();
					localStorage.setItem("where", city);
					$("#where").html(city);
					localStorage.setItem("temp", result.item.condition.temp + "<span class='option-color'>&deg;" + unit + "</span> / " + result.item.forecast[0].high + " <span class='option-color'>hi</span> / " + result.item.forecast[0].low + " <span class='option-color'>lo</span>");
					$("#temp").html(result.item.condition.temp  + "<span class='option-color'>&deg;" + unit + "</span> / " + result.item.forecast[0].high + " <span class='option-color'>hi</span> / " + result.item.forecast[0].low + " <span class='option-color'>lo</span>");
					localStorage.setItem("condition", result.item.condition.text.toLowerCase());
					$("#condition").html(result.item.condition.text.toLowerCase());
				}
			 );
	}
}

/**
  Check for saved theme and load it
  */
function updateStyle() {
    var styles = "";
	if(localStorage.getItem('hide_weather') == 'true') {
		$('#hide_weather').text('show weather');
		$('#weather').hide('fast');
	} else {
		$('#hide_weather').text('hide weather');
		$('#weather').show('fast');
	}
	if(localStorage.getItem('font')) {
		font = localStorage.getItem('font');
		if(font == 0) {
			styles += 'body { font-family: Raleway, sans-serif}';
		} else {
			styles += 'body { font-family: "Segoe UI", Helvetica, sans-serif}';
		}
	}
    if(localStorage.getItem("background-color")) {
        var background_color = localStorage.getItem('background-color');
        styles += '.picker { background-color: ' + background_color+ '}';
        styles += 'body {background-color: ' + background_color + '}';
        styles += '::-webkit-scrollbar { background: ' + background_color + '}';
    }

    if(localStorage.getItem("title-color")) {
        styles += ('.title-color {color: ' + localStorage.getItem("title-color") + '}');
    }

    if(localStorage.getItem("main-color")) {
        var main_color = localStorage.getItem("main-color");
        styles += 'body {color: ' + main_color + '}';
        styles += 'input {color: ' + main_color + '}';
    }

    if(localStorage.getItem("options-color")) {
        var options_color = localStorage.getItem("options-color");
        styles += '.option-color {color: ' + options_color + '}';
        styles += '::-webkit-scrollbar-thumb {background: ' + options_color + '}';
    }	

    $("body > style").remove();
    $("body").append("<style type='text/css'>" + styles + "</style>");
}

/**
  Get list of apps from chrome and filter out extensions
  */
var loadApps = function() {
    chrome.management.getAll(function(res){
        var index = 0;
        var internal_selector = $("#internal_selector");
        var page = $('<div class="page" id="page_' + index + '"></div>');
        internal_selector.append(page);
        res = res.filter(function(item) { return item.isApp; });
        res.unshift({'name': 'Chrome Webstore', 'appLaunchUrl': 'https://chrome.google.com/webstore'})
        for(i in res) {
            var item = $('<div class="item"><a href="' + res[i].appLaunchUrl + '">' + res[i].name + '</a></div>');
            page.append(item);
            if((parseInt(i) + 1) % 5 == 0) {
                index++;
                page = $('<div class="page" id="page_' + index + '"></div>');
                internal_selector.append(page);
            }
        }

    	//load the list of links and change the view otherwise this stuff happens before the callback executes
    	changeView(localStorage.getItem("active"), true);	
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
		var item = $('<div class="item" id="bookmark_' + node.id + '">' + ellipses(node.title) + '<span class="option-color">/</span></div>');
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
      	var item = $('<div class="item" id="bookmark_' + node.id + '"><a href="' + node.url + '">' + (node.title.length > 22 ? node.title.substr(0, 17) + '...' : node.title) + '</a></div>');
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
			    $("." + total[i]).show();
			   } else {
			    $("." + total[i]).hide();
			}
		}
	//if the page is changing slowly, use a slide and 'fast' timer.
	} else {
		var direction = parseInt(cur) - parseInt(tar) > 0 ? 'left' : 'right';
		var oppose = direction == 'left' ? 'right' : 'left';
		$("." + total[cur]).hide('slide', {'direction': oppose}, 'fast');			
	 	$("." + total[tar]).show('slide', {'direction': direction}, 'fast');					
	}
}
