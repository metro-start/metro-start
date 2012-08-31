function MetroStart($scope, $http) {
	checkAndUpgradeVersion();

	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];
	$scope.units = ['fahrenheit', 'celsius'];
	$scope.editThemeButton = 'edit theme';
	$scope.editThemeText = 'edit theme';
	$scope.hideOptions = true;
	$scope.linkToEdit = {};

	getLocalOrSync('page', 0, $scope, false);

	getLocalOrSync('theme', defaultTheme, $scope, true, function () { updateStyle(false) });

	getLocalOrSync('font', 0, $scope, false);

	getLocalOrSync('weatherUpdateTime', 0, $scope, false);

	getLocalOrSync('locat', 'seattle, wa', $scope, false);

	getLocalOrSync('weather', null, $scope, true);

	getLocalOrSync('weatherUnit', 0, $scope, false);

	getLocalOrSync('weatherToggleText', 'hide weather', $scope, false);

	// Load list of links
	// If there's no existing links (local or online) initiliazes with message.
	getLocalOrSync('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}], $scope, true, function(links) {
		$scope.links = new Pages($scope.links);
	});

	// Load list of apps
	(function() {
		$scope.apps = new Pages([{
			'name': 'Chrome Webstore', 
			'appLaunchUrl': 'https://chrome.google.com/webstore'
		}]);
	    chrome.management.getAll(function(res) {
	    	// Remove extensions and limit to apps.
	        res = res.filter(function(item) { return item.isApp; });
			$scope.apps.addAll(res);
	    });
	}());

	// Load list of bookmarks
	(function() {
		chrome.bookmarks.getTree(function(data) {
			$scope.$apply(function() {
				$scope.bookmarks = [data[0].children];
			});
		});
	}());

	// Attach a watcher to the page to see page changes and save the value.
	$scope.$watch('page', function(newValue, oldValue) {
		if (newValue != 3) { // Do not save navigation to themes page.
			saveTwice('page', newValue);
		}
	}, true);

	$scope.clickWrench = function() {
		$scope.hideOptions = !$scope.hideOptions;
		$scope.loadThemes();
		// If we're on the theme when wrench was clicked, navigate to the last page.
		if ($scope.page == 3) {
			getLocalOrSync('page', 0, $scope, false);
		}
		$scope.editThemeText = 'edit theme'; // Hide the theme editing panel.
	}

	$scope.addLink = function() {
		if(!$scope.newUrl.match(/https?\:\/\//)) {
			$scope.newUrl = 'http://' + $scope.newUrl;
		}
		if (!$.isEmptyObject($scope.linkToEdit)) {
			$scope.linkToEdit.name =  $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
			$scope.linkToEdit.url = $scope.newUrl;
			$scope.linkToEdit = {};
		} else {
			$scope.links.add({
				'name': $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
				'url': $scope.newUrl,
			});
		}
		$scope.newUrl = '';
		$scope.newUrlTitle = '';
		saveTwice('links', $scope.links.flatten());
	}

	$scope.editLink = function(page, index) {
		$scope.linkToEdit = $scope.links.get(page, index);
		$scope.newUrlTitle = $scope.linkToEdit.name;
		$scope.newUrl = $scope.linkToEdit.url;
	}

	$scope.removeLink = function(page, index){
		$scope.links.remove(page, index);
		saveTwice('links', $scope.links.flatten());
	}

	$scope.toggleWeather = function() {
		saveThrice('weatherToggleText', 'show weatherhide weather'.replace($scope.weatherToggleText, ''), $scope);
	}

	$scope.saveLocat = function() {
		if ($scope.newLocat && $scope.newLocat.trim() != '') {
			saveThrice('locat', $scope.newLocat, $scope);

			$scope.updateWeather(true);
		}
	}

	$scope.changeWeatherUnit = function(newWeatherUnit) {
		saveThrice('weatherUnit', newWeatherUnit, $scope);

		$scope.updateWeather(true);
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

	$scope.uninstallApp = function(app, page, index) {
		for (id in $scope.apps) {
			if ($scope.apps[id].id == app.id) {
				chrome.management.uninstall(app.id);
				$scope.apps.remove(page, index);
				break;
			}
		}
	}

	$scope.clickBookmark = function(bookmark, pageIndex) {
		if (bookmark.children.length > 0) {
			$scope.bookmarks.length = pageIndex + 1;
			$scope.bookmarks.push(bookmark.children);
			return false;
		}
	}

	$scope.removeBookmark = function(bookmark, pageIndex, bookmarkIndex) {
		chrome.bookmarks.removeTree(bookmark.id, function() {
			$scope.$apply(function() {
				$scope.bookmarks[pageIndex].splice(bookmarkIndex, 1);
			});
		});
	}

	$scope.changeTheme = function(newTheme) {
		saveThrice('theme', newTheme, $scope);

		updateStyle(true);
	}

	$scope.changeFont = function(newFont) {
		saveThrice('font', newFont, $scope);

		updateStyle(true);
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
		saveTwice('localThemes', $scope.localThemes.flatten());
	}

	$scope.clickEditTheme = function() {
		if ($scope.editThemeText == 'save theme') {
			if ($scope.newThemeTitle && $scope.newThemeTitle.trim() != '') {
				$scope.theme.title = $scope.newThemeTitle;
				$scope.newThemeTitle = '';
				$scope.localThemes.add($scope.theme);
				saveTwice('theme', $scope.theme);
				saveTwice('localThemes', $scope.localThemes.flatten());
			}
		}

		$scope.editThemeText = 'edit themesave theme'.replace($scope.editThemeText, '');
	}

	$scope.loadThemes = function() {
		// Load local themes.
		if (typeof $scope.onlineThemes === 'undefined') {
			getLocalOrSync('localThemes', [defaultTheme], $scope, true, function() {
				$scope.localThemes = new Pages($scope.localThemes);
			});

			// Load online themes.
			$http.get('http://metro-start.appspot.com/themes.json').success(function(data) {
				for (i in data) {
					// colors = {};
					data[i].colors = {
						'options-color': data[i]['options_color'],
						'main-color': data[i]['main_color'],
						'title-color': data[i]['title_color'],
						'background-color': data[i]['background_color'],
					}
				}
				$scope.onlineThemes = new Pages(data);
			});
		}
	}
	updateStyle(false);
	$scope.updateWeather(false);
}