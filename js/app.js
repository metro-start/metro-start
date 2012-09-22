var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25604585-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Need to marshall all calls to updateStyle through a central function. Maybe with a listener?
function MetroStart($scope, $http) {
	checkAndUpgradeVersion();

	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];
	$scope.units = ['fahrenheit', 'celsius'];

	// These elements are refreshed on every page load.
	$scope.editThemeButton = 'edit theme';
	$scope.editThemeText = 'edit theme';
	$scope.hideOptions = true;
	$scope.linkToEdit = {};
	$scope.pageItemCount = 4;

	getLocalOrSync('sort', defaultSort, $scope, true);

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
	$scope.loadLinks = function() {
		getLocalOrSync('links', [{'name': 'use the wrench to get started. . . ', 'url': ''}], $scope, true, function(links) {
			$scope.links = new Pages($scope.links, $scope.sort.links, $scope.pageItemCount, getFunctions['name']);
		});
	}

	// Load list of apps
	$scope.loadApps = function() {
	    chrome.management.getAll(function(res) {
			var apps = [{
				'name': 'Chrome Webstore', 
				'appLaunchUrl': 'https://chrome.google.com/webstore'
			}];
	    	// Remove extensions and limit to apps.
	        apps = apps.concat(res.filter(function(item) { return item.isApp; }));
	        $scope.$apply(function() {
				$scope.apps = new Pages(apps, $scope.sort.apps, $scope.pageItemCount, getFunctions['name']);
			});
	    });
	};

	// Load list of bookmarks
	$scope.loadBookmarks = function() {
		chrome.bookmarks.getTree(function(data) {
			$scope.$apply(function() {
				$scope.bookmarks = [data[0].children];
			});
		});
	};

	$scope.loadThemes = function() {
		// Load local themes.
		getLocalOrSync('localThemes', [defaultTheme], $scope, true, function() {
			$scope.localThemes = new Pages($scope.localThemes, $scope.sort.themes, $scope.pageItemCount, getFunctions['title']);
		});

		// Load online themes.
		$http.get('http://metro-start.appspot.com/themes.json').success(function(data) {
			for (i in data) {
				data[i].colors = {
					'options-color': data[i]['options_color'],
					'main-color': data[i]['main_color'],
					'title-color': data[i]['title_color'],
					'background-color': data[i]['background_color'],
				}
			}
			$scope.onlineThemes = new Pages(data, $scope.sort.themes, $scope.pageItemCount, getFunctions['title']);
		});
	}

	// Attach a watcher to the page to see page changes and save the value.
	$scope.$watch('page', function(newValue, oldValue) {
		if (newValue != 3) { // Do not save navigation to themes page.
			saveTwice('page', newValue);
		}
	}, true);

	$scope.setPageItemCount = function(pageItemCount) {
		$scope.pageItemCount = pageItemCount;
		if (typeof $scope.links !== 'undefined')
			$scope.links.setPageItemCount(pageItemCount - 1);

		if (typeof $scope.apps !== 'undefined')
			$scope.apps.setPageItemCount(pageItemCount);

		if (typeof $scope.localThemes !== 'undefined')
			$scope.localThemes.setPageItemCount(pageItemCount);

		if (typeof $scope.onlineThemes !== 'undefined')
			$scope.onlineThemes.setPageItemCount(pageItemCount);
	};

	$scope.clickWrench = function() {
		$scope.hideOptions = !$scope.hideOptions;
		$scope.loadThemes();
		// If we're on the theme when wrench was clicked, navigate to the last page.
		if ($scope.page == 3) {
			getLocalOrSync('page', 0, $scope, false);
		}
		$scope.editThemeText = 'edit theme'; // Hide the theme editing panel.
		_gaq.push(['_trackEvent', 'Page', 'Wrench']);
	}

	$scope.changeSorting = function(key, newSorting) {
		$scope.sort[key] = newSorting;
		saveTwice('sort', $scope.sort, $scope);
		if ($scope.sort[key] == 0) {
			if (key == 'links') {
				$scope.loadLinks();
			} else if(key == 'apps') {
				$scope.loadApps();
			} else if(key == 'themes') {
				$scope.loadThemes();
			} else if (key == 'bookmarks') {
				for (i = $scope.bookmarks.length - 1; i >= 0; i--) {
					if (typeof $scope.bookmarks[i][0].parentId !== 'undefined') {
						(function(parentId, i) {
							chrome.bookmarks.getChildren(parentId, function(res) {
								$scope.$apply(function() {
									$scope.bookmarks[i] = res;
								});
							});
						})($scope.bookmarks[i][0].parentId, i);
					}
				}
			}
			_gaq.push(['_trackEvent', 'Page', 'Show Unsorted Items']);
		}
		else if ($scope.sort[key] == 1) {
			if (key == 'themes') {
				$scope.localThemes.sort();
				$scope.onlineThemes.sort();
			} else if (key == 'bookmarks') {
				for (i = 0; i < $scope.bookmarks.length; i++) {
					$scope.bookmarks[i].sort(function(a, b) {
						if (angular.lowercase(a.title) > angular.lowercase(b.title)) {
							return 1;
						} else if(angular.lowercase(a.title) < angular.lowercase(b.title)) {
							return -1;
						} else {
							return 0;
						}
					});
				}
			} else {
				$scope[key].sort();
			}
			_gaq.push(['_trackEvent', 'Page', 'Show Sorted Items']);
		}
	}

	$scope.addLink = function() {
		if(!$scope.newUrl.match(/https?\:\/\//)) {
			$scope.newUrl = 'http://' + $scope.newUrl;
		}
		if (!$.isEmptyObject($scope.linkToEdit)) {
			$scope.linkToEdit.name =  $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, '');
			$scope.linkToEdit.url = $scope.newUrl;
			$scope.linkToEdit = {};

			_gaq.push(['_trackEvent', 'Links', 'Save Edited Link']);
		} else {
			$scope.links.add({
				'name': $scope.newUrlTitle ? $scope.newUrlTitle : angular.lowercase($scope.newUrl).replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
				'url': $scope.newUrl,
			});

			_gaq.push(['_trackEvent', 'Links', 'Add New Link']);
		}
		$scope.newUrl = '';
		$scope.newUrlTitle = '';
		saveTwice('links', $scope.links.flatten());
	}

	$scope.editLink = function(page, index) {
		$scope.linkToEdit = $scope.links.get(page, index);
		$scope.newUrlTitle = $scope.linkToEdit.name;
		$scope.newUrl = $scope.linkToEdit.url;
		_gaq.push(['_trackEvent', 'Links', 'Start Editing Link']);
	}

	$scope.removeLink = function(page, index){
		$scope.links.remove(page, index);
		saveTwice('links', $scope.links.flatten());
		_gaq.push(['_trackEvent', 'Links', 'Remove Link']);
	}

	$scope.toggleWeather = function() {
		saveThrice('weatherToggleText', 'show weatherhide weather'.replace($scope.weatherToggleText, ''), $scope);

		if ($scope.weatherToggleText == 'show weather') {
			_gaq.push(['_trackEvent', 'Weather', 'Hide Weather']);
		} else {
			_gaq.push(['_trackEvent', 'Weather', 'Show Weather']);
		}
	}

	$scope.saveLocat = function() {
		if ($scope.newLocat && $scope.newLocat.trim() != '') {
			saveThrice('locat', $scope.newLocat, $scope);

			$scope.updateWeather(true);
			_gaq.push(['_trackEvent', 'Weather', 'Save Weather Location']);
		}
	}

	$scope.changeWeatherUnit = function(newWeatherUnit) {
		saveThrice('weatherUnit', newWeatherUnit, $scope);

		$scope.updateWeather(true);
		_gaq.push(['_trackEvent', 'Weather', 'Set Weather Unit', $scope.units[$scope.weatherUnit]]);
	}

	/**
		Update the weather data being displayed.

		force: Bypass the 1 hour wait requirement.
	*/
	$scope.updateWeather = function(force) {
		var unit = $scope.units[$scope.weatherUnit][0];
	    var locat = $scope.locat;
	    // If it has been more than an hour since last check.
	    if(force || new Date().getTime() > parseInt($scope.weatherUpdateTime)) {
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

		_gaq.push(['_trackEvent', 'Apps', 'Uninstall App']);
	}

	$scope.clickBookmark = function(bookmark, pageIndex) {
		if (bookmark.children.length > 0) {
			// Deactiviate siblings.
			siblings = $scope.bookmarks[pageIndex];
			for(i = 0; i < siblings.length; i++) {
				siblings[i].active = false;
			}

			// Activate bookmark whenever siblings are deactiveated.
			bookmark.active = true;

			// Deactive children.
			for(i = 0; i < bookmark.children.length; i++) {
				bookmark.children[i].active = false;
			}

			$scope.bookmarks.length = pageIndex + 1;
			if ($scope.sort.bookmarks) {
				$scope.bookmarks.push(bookmark.children.sort(function(a, b) {
					if (angular.lowercase(a.title) > angular.lowercase(b.title)) {
						return 1;
					} else if(angular.lowercase(a.title) < angular.lowercase(b.title)) {
						return -1;
					} else {
						return 0;
					}
				}));
			} else {
				$scope.bookmarks.push(bookmark.children);
			}
			_gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Folder']);
			return false;
		}
		_gaq.push(['_trackEvent', 'Bookmarks', 'Bookmarked Page']);
	}

	$scope.removeBookmark = function(bookmark, pageIndex, bookmarkIndex) {
		chrome.bookmarks.removeTree(bookmark.id, function() {
			$scope.$apply(function() {
				$scope.bookmarks[pageIndex].splice(bookmarkIndex, 1);
			});
		});

		_gaq.push(['_trackEvent', 'Bookmarks', 'Remove Bookmarked']);
	}

	$scope.changeTheme = function(newTheme) {
		saveThrice('theme', newTheme, $scope);

		updateStyle(true);

		_gaq.push(['_trackEvent', 'Theme', 'Change Theme', newTheme.title]);
	}

	$scope.changeFont = function(newFont) {
		saveThrice('font', newFont, $scope);

		updateStyle(true);
		if (newFont == 0) {
			_gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Segoe/Helvetica']);
		} else {
			_gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Raleway']);
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
		_gaq.push(['_trackEvent', 'Theme', 'Share Theme']);
	}

	$scope.removeTheme = function(page, index) {
		$scope.localThemes.remove(page, index);
		saveTwice('localThemes', $scope.localThemes.flatten());
		_gaq.push(['_trackEvent', 'Theme', 'Remove Theme']);
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

			_gaq.push(['_trackEvent', 'Theme', 'Stop Editing Theme']);
		} else {
			_gaq.push(['_trackEvent', 'Theme', 'Start Editing Theme']);
		}

		$scope.editThemeText = 'edit themesave theme'.replace($scope.editThemeText, '');
	}

	$scope.loadLinks();
	$scope.loadApps();
	$scope.loadBookmarks();

	updateStyle(false);
	$scope.updateWeather(false);
}