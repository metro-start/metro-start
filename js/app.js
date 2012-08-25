function MetroStart($scope, $http) {
	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];
	$scope.units = ['fahrenheit', 'celsius'];
	$scope.editThemeButton = 'edit theme';

	getLocalOrSync('page', 0, $scope, false);

	getLocalOrSync('theme', defaultTheme, $scope, true, function () { updateStyle(false) });

	getLocalOrSync('font', 0, $scope, false);

	getLocalOrSync('weatherUpdateTime', 0, $scope, false);

	getLocalOrSync('locat', 'seattle, wa', $scope, false);

	getLocalOrSync('weather', null, $scope, true);

	getLocalOrSync('weatherUnit', 0, $scope, false);

	getLocalOrSync('weatherToggleText', 'hide weather', $scope, false);

	// Load list of links
	getLocalOrSync('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}], $scope, true, function() {
		$scope.links = new Pages($scope.links);
	});

	// Load list of apps
	(function() {
		$scope.apps = new Pages([{
			'name': 'Chrome Webstore', 
			'appLaunchUrl': 'https://chrome.google.com/webstore'
		}]);
	    chrome.management.getAll(function(res) {
	        res = res.filter(function(item) { return item.isApp; });
			$scope.apps.addAll(res);
			updateStyle(false);
	    });
	}());

	// Load list of bookmarks
	(function() {
		chrome.bookmarks.getTree(function(data) {
			$scope.$apply(function() {
				$scope.bookmarks = [data[0].children];
			});
			updateStyle(false);
		});
	}());

	// Load themes
	(function() {
		// Load local themes from localstorage
		getLocalOrSync('localThemes', [], $scope, true, function() {
			$scope.localThemes.unshift(defaultTheme);
			$scope.localThemes = new Pages($scope.localThemes);
		});

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
			$scope.onlineThemes = new Pages(data);
		});
	}());

	// Attach a watcher to the page to see page changes and save the value.
	$scope.$watch('page', function(newValue, oldValue) {
		if (newValue == 3) { // Do not save navigation to themes.
			saveTwice('page', oldValue);
		}else {
			saveTwice('page', newValue);
		}
	}, true);

	$scope.wrench = false;
	$scope.clickWrench = function() {
		if ($scope.wrench){
			$('.option').hide('fast', function() {
				$(this).hide(); // Hides the ones that are hidden right now.
			});
			// If we're on the themes page, load the last real page
			if ($scope.page == 3) {
				getLocalOrSync('page', 0, $scope, false);
			}
		} else {
			$('.option').show('fast').css('display', 'inline');
			if ($('#hide-rule').length) {
				$('#hide-rule').remove(); //Remove the hide-rule css rule
				$('.picker').hide(); //Prevents flashing it on screen when rule removed
			}
		}
		$scope.wrench = !$scope.wrench;
		//handle guys that have states that can be activated AFTER wrench.
		$('.picker').fadeOut('fast');
		$scope.doneEditingTheme();

		$('#where').prop('contentEditable', 'false');
		if($('#url').length) $('#url').remove();
	}

	$scope.toggleWeather = function() {
		saveThrice('weatherToggleText', 'show weatherhide weather'.replace($scope.weatherToggleText, ''), $scope);
	}

	$scope.updateWeather = function(force) {
		var unit = $scope.units[$scope.weatherUnit][0];
	    var locat = $scope.locat;
	    // If it has been more than an hour since last check.
	    if(force || new Date().getTime() > parseInt($scope.time)) {
			saveThrice('weatherUpdateTime', parseInt(new Date().getTime()) + 3600000, $scope);
	    	var params = encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places where text="' + locat + '" limit 1) and u="' + unit + '"');
	    	var url = 'http://query.yahooapis.com/v1/public/yql?q=' + params + '&format=json';
			$http.get(url).success(function(data) {
				// If data was actually returned, save it.
				if (data.query.count) {
					var elem = data.query.results.channel;
					var city = elem.location.city + ', ';
					city += (elem.location.region ? elem.location.region : elem.location.country);
					$scope.weather = {
						'city': city.toLowerCase(),
						'currentTemp': elem.item.condition.temp,
						'highTemp': elem.item.forecast[0].high,
						'lowTemp': elem.item.forecast[0].low,
						'condition': elem.item.condition.text.toLowerCase(),
						'unit': elem.units.temperature.toLowerCase(),
					}
				}
				saveTwice('weather', $scope.weather);
			});
		}
	}

	$scope.saveLocat = function() {
		if ($scope.newLocat.trim() != '') {
			saveThrice('locat', $scope.newLocat, $scope);

			$scope.updateWeather(true);
		}
	}

	$scope.saveLink = function() {
		if(!$scope.newUrl.match(/https?\:\/\//)) {
			$scope.newUrl = 'http://' + $scope.newUrl;
		}
		$scope.links.add({
			'name': angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
			'url': $scope.newUrl,
		});
		$scope.newUrl = '';
		saveTwice('links', $scope.links.flatten());
	}

	$scope.removeLink = function(page, index){
		$scope.links.remove(page, index);
		saveTwice('links', $scope.links.flatten());
	}

	$scope.clickBookmark = function(bookmark, pageIndex) {
		if (bookmark.children.length > 0) {
			$scope.pages.length = pageIndex + 1;
			$scope.pages.push(bookmark.children);
			return false;
		}
	}

	$scope.removeBookmark = function(bookmark, pageIndex, bookmarkIndex) {
		chrome.bookmarks.removeTree(bookmark.id, function() {
			$scope.$apply(function() {
				$scope.pages[pageIndex].splice(bookmarkIndex, 1);
			});
		});
	}

	$scope.uninstallApp = function(app, page, index) {
		for (id in $scope.apps) {
			if ($scope.apps[id].id == app.id) {
				chrome.management.uninstall(app.id);
				$scope.apps.remove(page, index);
				break;
			}
		}
	}

	$scope.shareTheme = function(theme) {
		var url = 'http://metro-start.appspot.com/newtheme?' + 
			'title=' + encodeURIComponent(theme.title) +
			'&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
			'&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
			'&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
			'&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
		window.open(url);
	}

	$scope.removeTheme = function(page, index) {
		$scope.localThemes.remove(page, index);
		saveTwice('themes', $scope.localThemes.flatten());
	}

	$scope.changeTheme = function(newTheme) {
		saveThrice('theme', newTheme, $scope);

		updateStyle(true);

		$.each(newTheme, function(key, value) {
			$.farbtastic('#' + key).setColor(value);
		});
	}

	$scope.changeWeatherUnit = function(newWeatherUnit) {
		saveThrice('weatherUnit', newWeatherUnit, $scope);

		$scope.updateWeather(true);
	}

	$scope.changeFont = function(newFont) {
		$scope.font = newFont;
		localStorage.setItem('font', newFont);
		chrome.storage.sync.set({'font': newFont});

		updateStyle(true);
	}

	$scope.clickEditTheme = function() {
		$('#theme-gallery:visible').fadeOut('fast');
		$('.picker').fadeToggle('fast');

		$scope.doneEditingTheme();
	}

	//TODO: Review this section.
	$scope.doneEditingTheme = function() {
		if ($('.picker:visible').length) {
			if($scope.editThemeButton == 'edit theme') {
				$scope.editThemeButton = 'save theme';
			} else {
				$scope.editThemeButton = 'edit theme';
			}

			//If the text still says untitled, don't save it.
			if($('#edit-title').text().trim() !== 'untitled') {
				$scope.localThemes.push({
					'title': $('#edit-title').text().trim(),
					'colors': {
						'options-color': localStorage.getItem('options-color'),
						'main-color': localStorage.getItem('main-color'),
						'title-color': localStorage.getItem('title-color'),
						'background-color': localStorage.getItem('background-color')
					}
				});
				localStorage.setItem('themes', JSON.stringify($scope.localThemes));
				$('#edit-title').text('untitled');
			}
		}
	}

	updateStyle(false);
	$scope.updateWeather(false);
}