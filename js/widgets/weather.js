define([
    'jquery',
    '../utils/util',
    '../utils/defaults',
    '../utils/storage',
    'metro-select',
], (jquery, util, defaults, storage) => {
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
            units: document.getElementById('units'),
        },

        init: function () {
            this.data = storage.get('weather', defaults.defaultWeather);
            this.upgradeWeather(defaults.defaultWeather);

            this.elems.city.textContext = this.data.city;
            this.elems.currentTemp.textContext = this.data.currentTemp;
            this.elems.highTemp.textContext = this.data.highTemp;
            this.elems.lowTemp.textContext = this.data.lowTemp;
            this.elems.condition.textContext = this.data.condition;
            this.elems.units.textContext = this.data.units;

            this.elems.saveLocation.addEventListener(
                'click',
                this.updateLocation.bind(this)
            );
            this.elems.toggleWeather.addEventListener('click', () => {
                this.setWeatherVisibility(!this.data.visible);
            });

            let chooser = jquery('#weather-units-chooser');

            chooser.metroSelect({
                initial: this.data.units,
                onchange: this.updateWeatherUnit.bind(this),
            });

            this.updateWeather(true);
            this.setWeatherVisibility(this.data.visible);
        },

        /**
         * Updates the current weather units.
         *
         * @param {any} newWeatherUnit The new weather units.
         */
        updateWeatherUnit: function (newWeatherUnit) {
            this.update('units', newWeatherUnit);
            this.updateWeather(true);
        },

        /**
         * Updates the current weather location when the weather form is submitted.
         */
        updateLocation: function () {
            let location = this.elems.newLocation.value;
            if (this.data.city !== location) {
                this.update('city', location);
                this.updateWeather(true);
            }
        },

        /**
         * Sets the visibility of the weather panel.
         *
         * @param {any} visible: True is the weather element should be visible.
         */
        setWeatherVisibility: function (visible) {
            if (visible) {
                util.removeClass(this.elems.weather, 'hide');
            } else {
                util.addClass(this.elems.weather, 'hide');
            }

            this.elems.toggleWeather.textContext = visible
                ? 'hide weather'
                : 'show weather';
            this.update('visible', visible);
        },

        /**
         * Update the weather data being displayed.
         *
         * @param {any} force Skip timeout check.
         */
        updateWeather: function (force) {
            this.upgradeWeather(defaults.defaultWeather);
            // If it has been more than an hour since last check.
            if (
                force ||
                new Date().getTime() > parseInt(this.data.weatherUpdateTime, 10)
            ) {
                this.update(
                    'weatherUpdateTime',
                    parseInt(new Date().getTime(), 10) + 3600000
                );
                let units =
                    this.data.units == 'celsius' ? 'metric' : 'imperial';
                let url = `${defaults.defaultWebservice}/weather?location=${this.data.city}&units=${units}`;
                let that = this;
                jquery.ajax(url).done((result) => {
                    if (result) {
                        let city = `${result.name}, ${result.country}`;
                        util.log(url);
                        util.log(JSON.stringify(result));
                        that.data.city = city.toLowerCase();
                        that.data.currentTemp = parseInt(result.temp, 10);
                        that.data.highTemp = parseInt(result.tempMax, 10);
                        that.data.lowTemp = parseInt(result.tempMin, 10);
                        that.data.condition = result.description.toLowerCase();

                        storage.save('weather', that.data);
                        that.update();
                    }
                });
            }
        },

        update: function (key, value) {
            if (key) {
                this.data[key] = value;
            }

            storage.save('weather', this.data);

            this.elems.city.textContext = this.data.city;
            this.elems.currentTemp.textContext = this.data.currentTemp;
            this.elems.highTemp.textContext = this.data.highTemp;
            this.elems.lowTemp.textContext = this.data.lowTemp;
            this.elems.condition.textContext = this.data.condition;
            this.elems.units.textContext = this.data.units[0];
        },

        upgradeWeather: function (defaultWeather) {
            if (!this.data.units) {
                this.data = defaultWeather;
            }
        },
    };
    return weather;
});
