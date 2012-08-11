/**
  Change the view to the active tab
  */
//function changeView(tar, instant) {
function changeViews() {
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

	style += '::-webkit-scrollbar { background: ' + background_color + '}';
	style += '::-webkit-scrollbar-thumb { background: ' + options_color + '}';

	if (transition) {
		$('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
		$('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
		$('body').animate({'color': main_color}, {duration: 400, queue: false});
		$('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
	} else {
		$('.background-color').css('backgroundColor', background_color);
		$('.title-color').css('color', title_color);
		$('body').css('color', main_color);
		$('.options-color').css('color', options_color);
	}

	$('body').children('style').remove();
	$('body').append('<style>' + style + '</style>');
}

/**
  Convert values from fahrenheit to celsius
  */
var toCelsius = function(fah) {
	return Math.floor(((parseFloat(fah) - 32) * 5) / 9);
}