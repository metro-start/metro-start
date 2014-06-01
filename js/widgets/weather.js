define(['domReady!', 'jquery', 'utils/storage'], function(document, jquery, storage) {
    var weather = {
        data: {},

        elems: {},

        init: function() {
            this.data = storage.get('weather');

            var that = this;
            ['city', 'currentTemp', 'highTemp', 'lowTemp', 'condition', 'unit'].forEach(function(name) {
                that.elems[name] = document.getElementById(name);
                that.elems[name].innerText = that.data[name];
            });
            document.getElementById('toggleWeather').addEventListener('click', toggleWeather);
            document.getElementById('saveLocation').addEventListener('submit', saveLocation);
        },

        toggleWeather: function() {
            this.update('visible', !this.data.visible);

            if (!this.elems.weather) {
                this.elems.weather = document.getElementById('weather');
            }

            if (this.data.visible) {
                this.elems.weather.addClass('show');
                this.elems.weather.removeClass('hide');
                _gaq.push(['_trackEvent', 'Weather', 'Show Weather']);
            } else {
                this.elems.weather.addClass('hide');
                this.elems.weather.removeClass('show');
                _gaq.push(['_trackEvent', 'Weather', 'Hide Weather']);
            }
        },

        saveLocation: function() {
            var newLocation = document.getElementById('newLocation').value.trim();
            if (newLocation !== '' && newLocation !== this.data.city) {
                this.udpate('city', newLocation);

                updateWeather(true);
                _gaq.push(['_trackEvent', 'Weather', 'Save Weather Location']);
            }
        },

        changeWeatherUnit: function(newWeatherUnit) {
            update('unit', newWeatherUnit);

            updateWeather(true);
            _gaq.push(['_trackEvent', 'Weather', 'Set Weather Unit', $scope.units[$scope.weatherUnit]]);
        },

        update: function(key, value) {
            this.data[key] = value;
            storage.save('weather', this.data);
        },

        /**
            Update the weather data being displayed.

            force: Bypass the 1 hour wait requirement.
        */
        updateWeather: function(force) {
            var unit = this.data.unit;
            var city = this.data.city;
            // If it has been more than an hour since last check.
            if(force || new Date().getTime() > parseInt(this.data.weatherUpdateTime, 10)) {
                this.update('weatherUpdateTime', parseInt(new Date().getTime(), 10) + 3600000);
                var params = encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places where text="' + city + '" limit 1) and u="' + unit + '"');
                var url = 'http://query.yahooapis.com/v1/public/yql?q=' + params + '&format=json';
                jquery.ajax(url).done(function(data) {
                    // If data was actually returned, save it.
                    if (data.query.count) {
                        var elem = data.query.results.channel;
                        var city = elem.location.city + ', ';
                        city += (elem.location.region ? elem.location.region : elem.location.country);
                        this.data = {
                            'city': city.toLowerCase(),
                            'currentTemp': elem.item.condition.temp,
                            'highTemp': elem.item.forecast[0].high,
                            'lowTemp': elem.item.forecast[0].low,
                            'condition': elem.item.condition.text.toLowerCase(),
                            'unit': elem.units.temperature.toLowerCase(),
                        };
                    }
                    storage.save('weather', this.data);
                });
            }
        }
    };
    return weather;
});
