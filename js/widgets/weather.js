define(['jquery', '../utils/util', '../utils/defaults', '../utils/storage', 'metro-select'],
    (jquery, util, defaults, storage) => {
        let weather = {
            data: {},

            elems: {
                weather: document.getElementById('weather'),
                newLocation: document.getElementById('newLocation'),
                saveLocation: document.getElementById('saveLocation'),
                toggleWeather: document.getElementById('toggleWeather'),

                city: document.getElementById('city'),
                currentTemp: document.getElementById('currentTemp'),
                highTemp: document.getElementById('highTemp'),
                lowTemp: document.getElementById('lowTemp'),
                condition: document.getElementById('condition'),
                unit: document.getElementById('unit'),
            },

            init: function() {
                this.data = storage.get('weather', defaults.defaultWeather);

                this.elems.city.innerText = this.data.city;
                this.elems.currentTemp.innerText = this.data.currentTemp;
                this.elems.highTemp.innerText = this.data.highTemp;
                this.elems.lowTemp.innerText = this.data.lowTemp;
                this.elems.condition.innerText = this.data.condition;
                this.elems.unit.innerText = this.data.unit;

                this.elems.saveLocation.addEventListener('click', this.updateLocation.bind(this));
                this.elems.toggleWeather.addEventListener('click', () => {
                    this.setWeatherVisibility(!this.data.visible);
                });

                let chooser = jquery('#weather-unit-chooser');

                chooser.metroSelect({
                    'initial': this.data.unit,
                    'onchange': this.updateWeatherUnit.bind(this),
                });

                this.updateWeather(true);
                this.setWeatherVisibility(this.data.visible);
            },

            /**
             * Updates the current weather units.
             *
             * @param {any} newWeatherUnit The new weather unit.
             */
            updateWeatherUnit: function(newWeatherUnit) {
                this.update('unit', newWeatherUnit);
                this.updateWeather(true);
            },

            /**
             * Updates the current weather location when the weather form is submitted.
             */
            updateLocation: function() {
                let location = this.elems.newLocation.value;
                if (this.data.city !== location) {
                    this.update('city', location);
                }
            },

            /**
             * Sets the visibility of the weather panel.
             *
             * @param {any} visible: True is the weather element should be visible.
             */
            setWeatherVisibility: function(visible) {
                if (visible) {
                    util.removeClass(this.elems.weather, 'hide');
                } else {
                    util.addClass(this.elems.weather, 'hide');
                }

                this.elems.toggleWeather.innerText = visible ? 'hide weather' : 'show weather';
                this.update('visible', visible);
            },

            /**
             * Update the weather data being displayed.
             *
             * @param {any} force Skip timeout check.
             */
            updateWeather: function(force) {
                // If it has been more than an hour since last check.
                if (force || new Date().getTime() > parseInt(this.data.weatherUpdateTime, 10)) {
                    this.update('weatherUpdateTime', parseInt(new Date().getTime(), 10) + 3600000);
                    let params = encodeURIComponent(`select * from weather.forecast where woeid in (select woeid from geo.places where text="${this.data.city}" limit 1) and u="${this.data.unit[0]}"`);
                    let url = `https://query.yahooapis.com/v1/public/yql?q=${params}&format=json`;
                    let that = this;
                    jquery.ajax(url).done((data) => {
                        if (data.query.count) {
                            let result = data.query.results.channel;

                            that.data.city = (`${result.location.city}, ${result.location.region ? result.location.region : result.location.country}`).toLowerCase();
                            that.data.currentTemp = result.item.condition.temp;
                            that.data.highTemp = result.item.forecast[0].high;
                            that.data.lowTemp = result.item.forecast[0].low;
                            that.data.condition = result.item.condition.text.toLowerCase();
                            that.data.unit = result.units.temperature.toLowerCase();

                            storage.save('weather', that.data);
                            that.update();
                        }
                    });
                }
            },

            update: function(key, value) {
                if (key) {
                    this.data[key] = value;
                }

                storage.save('weather', this.data);

                this.elems.city.innerText = this.data.city;
                this.elems.currentTemp.innerText = this.data.currentTemp;
                this.elems.highTemp.innerText = this.data.highTemp;
                this.elems.lowTemp.innerText = this.data.lowTemp;
                this.elems.condition.innerText = this.data.condition;
                this.elems.unit.innerText = this.data.unit[0];
            },
        };
        return weather;
    });
