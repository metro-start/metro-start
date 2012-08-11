function MetroStart($scope, $http) {
	$scope.defaultTheme = {
		'options-color': '#ff0000',
		'main-color': '#ffffff',
		'title-color': '#4a4a4a',
		'background-color': '#000000'
	};
	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];

	$scope.page = '1';
	$scope.previous = '0';
	$scope.changePage = function(instant) {
		// console.log('changePage');
		// console.log($scope.page);
		// console.log($scope.previous);
		var cur = $scope.previous;
		var tar = $scope.page;
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
		$scope.previous = $scope.page;
	}

	//attach the menu selectbox
	$('#menu').metroSelect({
		'onchange': function() {
			$scope.$apply(function() {
				$scope.page = $('#menu').val();
				$scope.changePage(false);
			});
			//changeView($('#menu').attr('selectedIndex'));
		}
	});

	//attach the weather selectbox
	$('#select-box').metroSelect({
		'onchange': function() {
			localStorage.setItem('unit', units[$('#select-box').attr('selectedIndex')]);
			//updateWeather(true);
		}
	});

	$('#font-chooser').metroSelect({
		'onchange': function() {
			localStorage.setItem('font', $('#font-chooser').attr('selectedIndex'));	
			updateStyle();
		}
	});

	// Load list of links
    var links = localStorage.getItem('links');
    if(links) $scope.links = JSON.parse(links);
    else $scope.links = [];

	if (links == []) {
		$scope.links.push({'name': 'use the wrench to get started. . . ', 'url': ''});
		localStorage.setItem('links', JSON.stringify($scope.list));
	}

	// Load list of apps
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

	// Load list of bookmarks
	chrome.bookmarks.getTree(function(data) {
		$scope.$apply(function() {
//			$scope._bookmarks = data[0].children;
			$scope.pages = [data[0].children];
		});
		updateStyle(false);
	//	changeView(localStorage.getItem('active'), true);	
	});

	//Get weather
	$scope.weather = JSON.parse(localStorage.getItem('weather'));
	$scope.updateWeather = function(force) {
		var unit = localStorage.getItem('unit')[0];
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
								'unit': unit,
							}
						} else {
							$scope.weather = {
								'city': city,
								'currentTemp': toCelcius(weather.current_conditions.temp_f.data),
								'highTemp': toCelcius(weather.forecast_conditions[0].high.data),
								'lowTemp': toCelcius(weather.forecast_conditions[0].low.data),
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

	$scope.changePage(true);
	$scope.updateWeather(true);

	//changeView(localStorage.getItem('active'), true);

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

	$scope.ellipsis = function(title) {
		return (title.length > 22 ? (title.substr(0, 17) + '...') : title);
	}

	$scope.bookmarkClick = function(bookmark, pageIndex) {
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

	/**
	  Change to the newly provided theme.
	  */
	$scope.changeTheme = function(newTheme) {
		$.each(newTheme, function(key, value) {
			localStorage.setItem(key, value);	
		});

		updateStyle(true);

		$.each(newTheme, function(key, value) {
			$.farbtastic('#' + key).setColor(value);
		});

	}
}