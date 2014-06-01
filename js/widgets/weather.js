define(['domReady!', 'utils/storage'], function(document, storage) {
    var weather = {
        data: {},

        init: function() {
            this.data = storage.get('weather');

            // storage.get('weatherUpdateTime', 0, $scope);
            //
            // storage.get('locat', 'seattle, wa', $scope);
            //
            // storage.get('weather', null, $scope);
            //
            // storage.get('weatherUnit', 0, $scope);
            //
            // storage.get('weatherToggleText', 'hide weather', $scope);

        },

        toggleWeather: function() {
            storage.save('weatherToggleText', 'show weatherhide weather'.replace($scope.weatherToggleText, ''), $scope);

            if ($scope.weatherToggleText == 'show weather') {
                _gaq.push(['_trackEvent', 'Weather', 'Hide Weather']);
            } else {
                _gaq.push(['_trackEvent', 'Weather', 'Show Weather']);
            }
        },

        saveLocation: function() {
            if ($scope.newLocat && $scope.newLocat.trim() !== '') {
                storage.save('locat', $scope.newLocat, $scope);

                $scope.updateWeather(true);
                _gaq.push(['_trackEvent', 'Weather', 'Save Weather Location']);
            }
        },

        changeWeatherUnit: function(newWeatherUnit) {
            storage.save('weatherUnit', newWeatherUnit, $scope);

            $scope.updateWeather(true);
            _gaq.push(['_trackEvent', 'Weather', 'Set Weather Unit', $scope.units[$scope.weatherUnit]]);
        },

        /**
            Update the weather data being displayed.

            force: Bypass the 1 hour wait requirement.
        */
        updateWeather: function(force) {
            var unit = $scope.units[$scope.weatherUnit][0];
            var locat = $scope.locat;
            // If it has been more than an hour since last check.
            if(force || new Date().getTime() > parseInt($scope.weatherUpdateTime, 10)) {
                storage.save('weatherUpdateTime', parseInt(new Date().getTime(), 10) + 3600000, $scope);
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
                        };
                    }
                    storage.save('weather', $scope.weather);
                });
            }
        }
    };
    return weather;
});
