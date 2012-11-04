var data = '[ { website: "", title_color: "#4f4f4f", title: "metro blue", options_color: "#00b3ff", email: "", author: "pcb", date: null, main_color: "#ffffff", background_color: "#000000", approved: null }, { website: "http://gregdmathews.com", title_color: "#fa19de", title: "Birthday!", options_color: "#f9ff0a", email: "", author: "Greg Mathews", date: null, main_color: "#04f115", background_color: "#2354fb", approved: null }, { website: "http://chumannaji.com", title_color: "#feffd6", title: "bright skies", options_color: "#1eb7d2", email: "", author: "chustar", date: null, main_color: "#4243eb", background_color: "#b6ece8", approved: null }]';

$(function() {
//	$.get('http://www.metro-start.appspot.com/themes.json', function(data) {
	var themes = eval(data);
	//console.log(themes);
	for (var i = 0; i < themes.length; i++) {
		var theme = themes[i];
		var me = theme;
		var themeObj = $('<div class="theme">' +
				'<p class="title">' + theme.title + '</p>' +
				'<p class="author">' + (theme.website ? '<a class="website" href="'+ theme.website + '">' + theme.author + '</a>' : theme.author) + '</p>' +
				'</div>');
		themeObj.data('theme', theme);
		(function(theme) {
		themeObj.on('click', function() {
			$('.title-text').text('preview of ' + theme.title);
			$('.main-color').css('background-color', theme.main_color);
			$('.options-color').css('background-color', theme.options_color);
			$('.background-color').css('background-color', theme.background_color);
			$('.title-color').css('color', theme.title_color);
		});
		$('.themes').append(themeObj);
		})(theme);
	};
});
