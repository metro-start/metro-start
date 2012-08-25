function MetroStart($scope, $http) {
	$scope.total = ['links', 'apps', 'bookmarks', 'themes'];
	$scope.units = ['fahrenheit', 'celsius'];
	$scope.editThemeButton = 'edit theme';
	$scope.location = '98122';
	$scope.weatherUnit = 0;
	$scope.weatherToggleText = 'show weather';

	getLocalOrSync('theme', $scope.defaultTheme, $scope, true);

	getLocalOrSync('theme', 0, $scope, false);

	getLocalOrSync('weatherUnit', 0, $scope, false);

	getLocalOrSync('weatherToggleText', 'show weather', $scope, false);

	//Load defaults
	(function() {
		// Load font and temperature unit
		chrome.storage.sync.get('weatherUnit', function (container) {
			$scope.$apply(function() {
				if (container.weatherUnit) {
						$scope.weatherUnit = container.weatherUnit;
				} else {
					chrome.storage.sync.set({ 'weatherUnit': $scope.weatherUnit });
				}
			});
			$scope.updateWeather(false);
		});

		chrome.storage.sync.get('weatherToggleText', function (container) {
			$scope.$apply(function() {
				if (container.weatherToggleText) {
						$scope.weatherToggleText = container.weatherToggleText;
				} else {
					$scope.weatherToggleText = 'hide weather';
					chrome.storage.sync.set({'weatherToggleText': $scope.weatherToggleText });
				}
			});
		});
	}());

	// Load list of links
	(function() {
		chrome.storage.sync.get('links', function(container) {
			$scope.$apply(function() {
				if (container.links) {
					$scope.links = new Pages(container.links);
				} else {
					$scope.links = new Pages([{'name': 'use the wrench to get started. . . ', 'url': ''}]);
					chrome.storage.sync.set({'links': $scope.links});
				}
			});
		});
	}());

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
		chrome.storage.sync.get('localThemes', function (container) {
			$scope.$apply(function() {
				$scope.localThemes = new Pages(container.localThemes);
			});
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

	// Load first page
	(function() {
		var previous = localStorage.getItem('previous');
		//If the last page we were at  was the gallery, show the last page before that.
		if (localStorage.getItem('active') == 3) {
			if (previous && previous != 3) {
				localStorage.setItem('active', previous);
				localStorage.setItem('previous', (previous + 1) % 3)
			} else {
				localStorage.setItem('active', 0);
				localStorage.setItem('previous', 1)
			}
		}

		$scope.page = localStorage.getItem('active');
		$scope.previous = previous || '0';
	}());

	$scope.wrench = false;
	$scope.clickWrench = function() {
		if ($scope.wrench){
			$('.option').hide('fast', function() {
				$(this).hide();
			});
			if(localStorage.getItem('active') == 3) {
				$('#page-chooser-sel-' + localStorage.getItem('previous')).click();
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
		$scope.weatherToggleText = 'show weatherhide weather'.replace($scope.weatherToggleText, '');
		chrome.storage.sync.set({ 'weatherToggleText': $scope.weatherToggleText }, function(res) {
		});
	}

	$scope.updateWeather = function(force) {
		var unit = $scope.units[$scope.weatherUnit][0];
	    var locat = localStorage.getItem('locat');
	    var time = localStorage.getItem('time');
	    var cTime = new Date();
	    if(force || cTime.getTime() > time) {
	    	var params = encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places where text="' + locat + '" limit 1) and u="' + unit + '"');
	    	var url = 'http://query.yahooapis.com/v1/public/yql?q=' + params + '&format=json';
			$http.get(url).success(function(data) {
				if (data.query.count) {
					var elem = data.query.results.channel;
					var city = elem.location.city + ', ' + elem.location.region;
					$scope.$apply(function() {
						$scope.weather = {
							'city': city.toLowerCase(),
							'currentTemp': elem.item.condition.temp,
							'highTemp': elem.item.forecase[0].high,
							'lowTemp': elem.item.forecase[0].low,
							'condition': elem.item.condition.text.toLowerCase(),
							'unit': elem.units.temperature.toLowerCase(),
						}
					});
				}
				chrome.storage.sync.set({ 'weather', $scope.weather });
				localStorage.setItem('weather', JSON.stringify($scope.weather));
			});
		}
	}

	$scope.editWeather = function() {
		var done = function() {
			var locat = $('#where').text();
			if(locat.trim() == '') {
				return;
			}
			$('#where').prop('contentEditable', 'false');
			localStorage.setItem('locat', locat);
			$scope.updateWeather(true);
			$('#edit').text('edit');
		};

		if($('#where').prop('contentEditable') != 'true') {
			$('#where').prop('contentEditable', 'true');
			$('#where').focus();
			document.execCommand('selectAll', false, null);
			$('#where').on('keydown', function(e) {
				if(e.keyCode == 13) {
					e.preventDefault();
					done();
				}
			});
			$('#edit').text('done');
		} else {
			done();
		}
	}

	$scope.saveLink = function() {
		if(!$scope.newUrl.match(/https?\:\/\//)) {
			$scope.newUrl = 'http://' + $scope.newUrl;
		}
		$scope.links.add({
			'name': $scope.newUrl.toLowerCase().replace(/^https?\:\/\//i, '').replace(/^www\./i, ''),
			'url': $scope.newUrl,
		});
		$scope.newUrl = '';
		localStorage.setItem('links', JSON.stringify($scope.links.flatten()));
	}

	$scope.removeLink = function(page, index){
		$scope.links.remove(page, index);
		localStorage.setItem('links', JSON.stringify($scope.links.flatten()));
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
		localStorage.setItem('themes', JSON.stringify($scope.localThemes.flatten));
	}

	$scope.changeTheme = function(newTheme) {
		$.each(newTheme, function(key, value) {
			localStorage.setItem(key, value);	
		});

		updateStyle(true);

		$.each(newTheme, function(key, value) {
			$.farbtastic('#' + key).setColor(value);
		});
	}

	$scope.changeWeatherUnit = function(newWeatherUnit) {
		$scope.weatherUnit = newWeatherUnit;
		chrome.storage.sync.set({'weatherUnit': newWeatherUnit});

		$scope.updateWeather(true);
	}

	$scope.changeFont = function(newFont) {
		$scope.font = newFont;
		chrome.storage.sync.set({'font': newFont});

		updateStyle(true);
	}

	$scope.beginChangePage = function(newPage) {
		$scope.page = newPage;
		$scope.previous = localStorage.getItem('active');
		localStorage.setItem('previous', $scope.previous);
		localStorage.setItem('active', $scope.page);

		$scope.finishChangePage(false);
	}

	$scope.finishChangePage = function(instant) {
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

	$scope.clickEditTheme = function() {
		$('#theme-gallery:visible').fadeOut('fast');
		$('.picker').fadeToggle('fast');

		$scope.doneEditingTheme();
	}

	$scope.doneEditingTheme = function() {
		if ($('.picker:visible').length) {
			if($scope.editThemeButton == 'edit theme') {
				$scope.editThemeButton = 'done editing';
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

	$scope.finishChangePage(true);
}