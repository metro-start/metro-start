//globals (kinda?)
var total = "linksapps";
var active = "";
var inactive = "";
var detached;

$(function() {	
	//get the currently active tab
	active = localStorage.getItem("active");
	if(active == null) {
		active = "links";
		inactive = "apps";
	} else {
		inactive = total.replace(active, "");
	}
	
	//get links from localStorage and ensure they're empty	
	var list = new Array();
	var links = localStorage.getItem("links");
	if(links) {
		links = JSON.parse(links);
	}
	else {
		links = new Array();
	}

	//load saved links or load default material
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

	/** 
	Attaching event handlers
	*/
	//handle clicking the links and apps ... links
	$("#links-menu").click(function(){
		changeView("links");
	});
	$("#apps-menu").click(function(){
		changeView("apps");
	});
	
	//mouse enters and leaves the menu area
	$(".menu").mouseenter(function(){
		$(".menu").append(detached);
		detached.show("fast");
	});

	$(".menu").mouseleave(function(){
		detached = $("#" + inactive + "-menu").hide("fast").detach();
	});

	//show all options on the page.
	$("#wrench").click(function(){		
		_gaq.push(['_trackEvent', 'wrench clicked']);
		$(".picker").hide("fast");
		$(".option").toggle("fast");
		$("#reset").hide();
	});
	
	$("#add").click(function(){
		_gaq.push(['_trackEvent', 'add clicked']);
		console.log("clicked");
		$("#add").hide("fast");
		$("#url").show("fast");
		$("#url").focus();
	});

	//handle clicking the edit link in weather section
	$("#edit").click(function(){
		_gaq.push(['_trackEvent', 'edit clicked']);
		console.log("clicked");
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
		console.log("show colors");
		$(".picker").toggle("fast");
		$("#reset").toggle("fast");
	});

	//reset all the colors to default.
	$("#reset").click(function(){
		_gaq.push(['_trackEvent', 'colors reset']);
		console.log("reset colors");
		
		localStorage.setItem("options-color", "#FF0000");	
		$.farbtastic("#picker-options").setColor("#FF0000");
		
		localStorage.setItem("main-color", "#FFFFFF");	
		$.farbtastic("#picker-main").setColor("#FFFFFF");
		
		localStorage.setItem("title-color", "#4A4A4A");	
		$.farbtastic("#picker-title").setColor("#4A4A4A");
		
		localStorage.setItem("background-color", "#000000");	
		$.farbtastic("#picker-background").setColor("#000000");
		
		updateStyle();
	});

	//when you leave the url field
	$("#url").blur(function() {
		console.log("blur called");
		$("#add").show();
		$("#url").hide();
	});

	//when you leave the zip field
	$("#zip").blur(function() {
		console.log("blur called");
		$("#edit").show();
		$("#where").show();
		$("#zip").hide();
	});

	//validate the url when the person hits enter
	$("#url").keyup(function(event){
		console.log("typed");
		if(event.keyCode == 13){
			console.log("submitting url to be stored");
			var list = JSON.parse(localStorage.getItem("links"));
			var name = $("#url").val().toLowerCase().replace(/^http\:\/\//i, "").replace(/^www\./i, "");
			var url = $("#url").val();
			if(url.trim() == "") {
				return;
			}
			if(!url.match(/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)) {
				console.log("Invalid URL");
				//handle invalid url
			}			
			if(!url.match(/http\:\/\//)) {
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
			console.log("submitting zip to be stored");
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
		console.log("removing the link:");
		console.log($(event.target).parent("li").children("a").attr("href"));
		for(id in links) {
			if(links[id].url == $(event.target).parent("li").children("a").attr("href")) {
				_gaq.push(['_trackEvent', 'removed a link']);
				links.splice(id, 1);
				console.log("id = " + id);
				localStorage.setItem("links", JSON.stringify(links));
				$(event.target).parent("li").remove();
				break;
			}
		}
	});
	
	$(".option").hide();
	$("input").hide();
	$(".picker").hide();
	detached = $("#" + inactive + "-menu").detach();
	
	//show the right page and load list of apps on load
	loadApps();
	updateWeather(false);
	updateStyle();	
	changeView(active);	
});

function addItem(name, url) {
	_gaq.push(['_trackEvent', 'added a link']);
	$("#links").append("<li><span class='remove option'>remove</span> <a href=\"" + url + "\">" + name + "</a></li>"); 
}

/**
Update the weather from yql. 
force: Bypasses the cache and force hits the server.
*/
function updateWeather(force) {
	var zip = localStorage.getItem("zip");
	var time = localStorage.getItem("time");
	var cTime = new Date();
	if(force || cTime.getTime() > time) {
		//delay for an hour
		localStorage.setItem("time", cTime.getTime() + 3600000);
		$.get(
			"http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D"+zip+"&format=json",
			function(data) {
				console.log("response from yql:")
				console.log(data);
				var result = data.query.results.channel;
				var city = result.location.city.toLowerCase() + ", "+ result.location.region.toLowerCase();
				localStorage.setItem("where", city);
				$("#where").html(city);
				localStorage.setItem("temp", result.item.condition.temp + " degrees fahrenheit");
				$("#temp").html(result.item.condition.temp + " degrees fahrenheit");
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
	console.log("update styles");
	if(localStorage.getItem("background-color")) {
		$("body").css("background-color", localStorage.getItem("background-color"));
	}
	
	if(localStorage.getItem("title-color")) {
		$("h1").css("color", localStorage.getItem("title-color"));
		$("h3").css("color", localStorage.getItem("title-color"));
	}
	
	if(localStorage.getItem("main-color")) {
		var main_color = localStorage.getItem("main-color");
		$("body").css("color", main_color);
		$("a").css("color", main_color);
		$("input").css("color", main_color);
		$("input").css("border-color", main_color);
	}
	
	if(localStorage.getItem("options-color")) {
		var options_color = localStorage.getItem("options-color");
		$(".option").css("color", options_color);
		$(".wrench").css("color", options_color);
		$("input").css("background-color", options_color);
		$(".menu").css("color", options_color);
	}	
}

/**
Get list of apps from chrome and filter out extensions
*/
function loadApps() {
	chrome.management.getAll(function(res){
		count = 0;
		for(i = 0; i < res.length; i++) {
			if(res[i].isApp) {
				$("#apps").append("<li><a href=\"" + res[i].appLaunchUrl + "\">" + res[i].name + "</a></li>");
				if(++count >= 6) break;
			}
		}
	});
}

/**
Change the view to the active tab
*/
function changeView(tar) {
	localStorage.setItem("active", tar);
	active = tar;
	inactive = total.replace(tar, "");
	$("." + inactive).hide("fast");
	$("." + active).show("fast");
}