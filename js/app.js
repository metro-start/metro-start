function MetroStart($scope, $http) {
	$scope.defaultTheme = {
		'options-color': '#ff0000',
		'main-color': '#ffffff',
		'title-color': '#4a4a4a',
		'background-color': '#000000'
	};

	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];
	$scope.units = ['fahrenheit', 'celsius'];

	//Load defaults
	(function() {
		if(!localStorage.getItem('hide_weather')) {
			localStorage.setItem('hide_weather', false);
		}
		
		if(!localStorage.getItem('locat')) {
			localStorage.setItem('locat', '95123'); 
		}

		if(!localStorage.getItem('unit')) {
			localStorage.setItem('unit', '0');
		}

		if(!localStorage.getItem('themes')) {
			localStorage.setItem('themes', '[]');
		}

		if(!localStorage.getItem('links')) {
			localStorage.setItem('links', '[]');
		}

		if(!localStorage.getItem('active')) {
			localStorage.setItem('active', '0');
			localStorage.setItem('previous', '0');
		}

		if(!localStorage.getItem('font')) {
			localStorage.setItem('font', '0');
		}

		if(!localStorage.getItem('unit')) {
			localStorage.setItem('unit', '0');
		} else {
			if(localStorage.getItem('unit') == 'fahrenheit') localStorage.setItem('unit', '0');
			else if(localStorage.getItem('unit') == 'celcius') localStorage.setItem('unit', '1');
		}

	}());

	// Load list of links
	(function() {
	    var links = localStorage.getItem('links');
	    links = JSON.parse(links);
	    
		if (links == []) {
			links.push({'name': 'use the wrench to get started. . . ', 'url': ''});
			localStorage.setItem('links', JSON.stringify(links));
		}
		$scope.links = links;
	}());

	// Load list of apps
	(function() {
		$scope.apps = [{
			'name': 'Chrome Webstore', 
			'appLaunchUrl': 'https://chrome.google.com/webstore'
		}];
	    chrome.management.getAll(function(res) {
	        res = res.filter(function(item) { return item.isApp; });
			$scope.$apply(function() {
				$scope.apps = $scope.apps.concat(res);
			});
			updateStyle(false);
		//	changeView(localStorage.getItem('active'), true);	
	    });
	}());

	// Load list of bookmarks
	(function() {
		chrome.bookmarks.getTree(function(data) {
			$scope.$apply(function() {
				$scope.pages = [data[0].children];
			});
			updateStyle(false);
		});
	}());

	// Load themes
	(function() {
		// Load local themes from localstorage
		$scope.localThemes = JSON.parse(localStorage.getItem('themes'));

		// Load online themes from website
		$http.get('http://metro-start.appspot.com/themes.json').success(function(data) {
			for (i in data) {
				colors = {};
				data[i].colors = {
					'options-color': data[i]['options_color'],
					'main-color': data[i]['main_color'],
					'title-color': data[i]['title_color'],
					'background-color': data[i]['background_color'],
				}
			}
			$scope.onlineThemes = data;
		});
	}());

	// Load first page
	(function() {
		var active = localStorage.getItem('active');
		//If the last page we were at  was the gallery, show the last page before that.
		if (active == 3) {
			if (localStorage.getItem('previous')) {
				localStorage.setItem('active', localStorage.getItem('previous'));
				localStorage.setItem('previous', 0)
			} else {
				localStorage.setItem('active', 0);
			}
		}

		$scope.page = localStorage.getItem('active');
		$scope.previous = localStorage.getItem('previous') || '0';
		$('#menu').attr('selectedIndex', $scope.page);
	}());

	// Load font and temperature unit
	(function() {
		$('#font-chooser').attr('selectedIndex', localStorage.getItem('font'));
		$('#select-box').attr('selectedIndex', localStorage.getItem('unit'));
	}());

	//attach the menu selectbox
	$('#menu').metroSelect({
		'onchange': function() {
			$scope.page = $('#menu').attr('selectedIndex');
			$scope.changePage(false);
		}
	});

	//attach the weather selectbox
	$('#select-box').metroSelect({
		'onchange': function() {
			localStorage.setItem('unit', $('#select-box').attr('selectedIndex'));
			updateStyle(true);
		}
	});

	//attach the font selectbox
	$('#font-chooser').metroSelect({
		'onchange': function() {
			localStorage.setItem('font', $('#font-chooser').attr('selectedIndex'));	
			updateStyle(true);
		}
	});

	//attach color pickers
	$.each($scope.defaultTheme, function(key, value) {
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

	$scope.wrench = false;
	$scope.clickWrench = function() {
		if ($scope.wrench){
			$('.option').hide('fast', function() {
				$(this).hide();
			});
			if(localStorage.getItem('active') == 3) {
				$('#menu-sel-' + localStorage.getItem('previous')).click();
			}
		} else {
			$('.option').show('fast');
		}
		$scope.wrench = !$scope.wrench;
		//handle guys that have states that can be activated AFTER wrench.
		$('.picker').fadeOut('fast');
		//doneEditingTheme();

		$('#where').prop('contentEditable', 'false');
		if($('#url').length) $('#url').remove();
	}

	$scope.hideWeather = function() {
		localStorage.setItem('hide_weather', localStorage.getItem('hide_weather') == 'false' ? 'true' : 'false');
		updateStyle(false);
	}

	//Get weather
	$scope.updateWeather = function(force) {
		$scope.weather = JSON.parse(localStorage.getItem('weather'));
		var unit = $scope.units[localStorage.getItem('unit')][0];
	    var locat = localStorage.getItem('locat');
	    var time = localStorage.getItem('time');
	    var cTime = new Date();
	    if(force || cTime.getTime() > time) {
			var url = 'http://www.google.com/ig/api?weather=' + locat;
			var xml = new JKL.ParseXML(url);
			xml.async(function (data) {
				if (data.xml_api_reply && typeof(data.xml_api_reply) === 'object') {
					var weather = data.xml_api_reply.weather;
					var city = weather.forecast_information.city.data.toLowerCase();
					localStorage.setItem('where', city);

					$scope.$apply(function() {
						if (unit == 'f') {
							$scope.weather = {
								'city': city,
								'currentTemp': weather.current_conditions.temp_f.data,
								'highTemp': weather.forecast_conditions[0].high.data,
								'lowTemp': weather.forecast_conditions[0].low.data,
								'condition': weather.current_conditions.condition.data.toLowerCase(),
								'unit': unit,
							}
						} else {
							$scope.weather = {
								'city': city,
								'currentTemp': toCelcius(weather.current_conditions.temp_f.data),
								'highTemp': toCelcius(weather.forecast_conditions[0].high.data),
								'lowTemp': toCelcius(weather.forecast_conditions[0].low.data),
								'condition': weather.current_conditions.condition.data.toLowerCase(),
								'unit': unit,
							}
						}
						localStorage.setItem('weather', JSON.stringify($scope.weather));
					});
				}
				updateStyle(false);
			});
			xml.parse();
		}
	}

	$scope.clickBookmark = function(bookmark, pageIndex) {
		if (bookmark.children.length > 0) {
			$scope.pages.length = pageIndex + 1;
			$scope.pages.push(bookmark.children);
			updateStyle(false);
			return false;
		}
	}

	// Function to uninstall apps
	$scope.uninstallApp = function(app) {
		for (id in $scope.apps) {
			if ($scope.apps[id].id == app.id) {
				chrome.management.uninstall(app.id);
				$scope.apps.splice(id, 1);
				break;
			}
		}
	}

	// Change to the newly provided theme.
	$scope.changeTheme = function(newTheme) {
		$.each(newTheme, function(key, value) {
			localStorage.setItem(key, value);	
		});

		updateStyle(true);

		$.each(newTheme, function(key, value) {
			$.farbtastic('#' + key).setColor(value);
		});
	}

	$scope.changePage = function(instant) {
		$scope.previous = localStorage.getItem('active');
		localStorage.setItem('previous', $scope.previous);
		localStorage.setItem('active', $scope.page);

		var cur = $scope.previous;
		var tar = $scope.page;
		var total = $scope.total;
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

	$scope.changePage(true);
	$scope.updateWeather(true);

}