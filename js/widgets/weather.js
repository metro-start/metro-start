define(['jquery', '../utils/util', '../utils/storage'], function(jquery, util, storage) {
    var weather = {
        data: {},

        elems: {},

        nodes: ['city', 'currentTemp', 'highTemp', 'lowTemp', 'condition', 'unit'],

        init: function(document) {
            this.data = storage.get('weather');
            this.data.visible = !!this.data.visible;
            var that = this;
            this.nodes.forEach(function(name) {
                that.elems[name] = document.getElementById(name);
                that.elems[name].innerText = that.data[name];
            });

            this.elems.weather = document.getElementById('weather');
            this.elems.toggleWeather = document.getElementById('toggleWeather');
            if (this.data.visible) {
                this.showWeather();
            } else {
                this.hideWeather();
            }

            this.elems.toggleWeather.addEventListener('click', this.toggleWeather.bind(this));
            document.getElementById('saveLocation').addEventListener('submit', saveLocation);

            var chooser = jquery('#weather-unit-chooser');
            chooser.attr('selectedIndex', this.unit === 'fahrenheit' ? 0 : 1);
            chooser.metroSelect({
                'onchange': this.changeWeatherUnit.bind(this)
            });

            this.updateWeather(false);
        },

        toggleWeather: function() {
            this.update('visible', !this.data.visible);

            if (this.data.visible) {
                this.showWeather();
                
            } else {
                this.hideWeather();
                
            }
        },

        showWeather: function() {
            util.removeClass(this.elems.weather, 'hide');
            util.addClass(this.elems.weather, 'show');
            this.elems.toggleWeather.innerText = "hide weather";
        },

        hideWeather: function() {
            util.removeClass(this.elems.weather, 'show');
            util.addClass(this.elems.weather, 'hide');
            this.elems.toggleWeather.innerText = "show weather";
        },

        saveLocation: function() {
            var newLocation = document.getElementById('newLocation').value.trim();
            if (newLocation !== '' && newLocation !== this.data.city) {
                this.udpate('city', newLocation);

                updateWeather(true);
                
            }
        },

        changeWeatherUnit: function(newWeatherUnit) {
            this.update('unit', newWeatherUnit);
            this.updateWeather(true);
            
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
                var params = encodeURIComponent('select * from weather.forecast where woeid in (select woeid from geo.places where text="' + city + '" limit 1) and u="' + unit[0] + '"');
                var url = 'http://query.yahooapis.com/v1/public/yql?q=' + params + '&format=json';

                var that = this;
                jquery.ajax(url).done(function(data) {
                    // If data was actually returned, save it.
                    if (data.query.count) {
                        var elem = data.query.results.channel;
                        var city = elem.location.city + ', ';
                        city += (elem.location.region ? elem.location.region : elem.location.country);
                        that.data = {
                            'visible': that.data.visible,
                            'city': city.toLowerCase(),
                            'currentTemp': elem.item.condition.temp,
                            'highTemp': elem.item.forecast[0].high,
                            'lowTemp': elem.item.forecast[0].low,
                            'condition': elem.item.condition.text.toLowerCase(),
                            'unit': ' ' + elem.units.temperature.toLowerCase(),
                        };
                        storage.save('weather', that.data);
                        that.rebuildDom();
                    }
                });
            }
        },

        rebuildDom: function() {
            var that = this;
            this.nodes.forEach(function(node) {
                that.elems[node].innerText = that.data[node];
            });
        },

        update: function(key, value) {
            this.data[key] = value;
            storage.save('weather', this.data);
        }
    };
    return weather;
});
