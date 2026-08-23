import MetroSelect from 'metro-select';
import util from '../utils/util';
import defaults from '../utils/defaults';
import storage from '../utils/storage';
import {getWeather} from '../utils/api';
export default {
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

    init() {
        this.data = storage.get('weather', defaults.defaultWeather);
        this.upgradeWeather(defaults.defaultWeather);

        this.elems.city.innerText = this.data.city;
        this.elems.currentTemp.innerText = this.data.currentTemp;
        this.elems.highTemp.innerText = this.data.highTemp;
        this.elems.lowTemp.innerText = this.data.lowTemp;
        this.elems.condition.innerText = this.data.condition;
        this.elems.units.innerText = this.data.units;

        this.elems.saveLocation.addEventListener(
            'click',
            this.updateLocation.bind(this)
        );
        this.elems.toggleWeather.addEventListener('click', () => {
            this.setWeatherVisibility(!this.data.visible);
        });

        this.unitChooser = new MetroSelect(document.getElementById('weather-units-chooser'), {
            initial: this.data.units,
            onChange: this.updateWeatherUnit.bind(this),
        });

        this.updateWeather(false);
        this.setWeatherVisibility(this.data.visible);
    },

    /**
     * Updates the current weather units.
     *
     * @param {any} newWeatherUnit The new weather units.
     */
    updateWeatherUnit(newWeatherUnit) {
        this.update('units', newWeatherUnit);
        this.updateWeather(true);
    },

    /**
     * Updates the current weather location when the weather form is submitted.
     */
    updateLocation() {
        const location = this.elems.newLocation.value;
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
    setWeatherVisibility(visible) {
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
    async updateWeather(force) {
        this.upgradeWeather(defaults.defaultWeather);
        // If it has been more than an hour since last check.
        if (
            force ||
            new Date().getTime() > parseInt(this.data.weatherUpdateTime, 10)
        ) {
            const units =
                this.data.units === 'celsius' ? 'metric' : 'imperial';
            // If running from file:// (demo) or no network, skip remote fetch and use stored data
            try {
                if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
                    util.log('Demo mode detected — skipping remote weather fetch');
                    // Ensure UI is updated from stored data
                    this.update();
                    return;
                }
            } catch {
                // ignore and proceed to attempt ajax
            }

            try {
                const result = await getWeather(
                    defaults.defaultWebservice,
                    this.data.city,
                    units
                );
                if (result) {
                    const city = `${result.name}, ${result.country}`;
                    this.data.city = city.toLowerCase();
                    this.data.currentTemp = Number.parseInt(result.temp, 10);
                    this.data.highTemp = Number.parseInt(result.tempMax, 10);
                    this.data.lowTemp = Number.parseInt(result.tempMin, 10);
                    this.data.condition = result.description
                        ? result.description.toLowerCase()
                        : this.data.condition;
                    this.data.weatherUpdateTime = Date.now() + 3600000;
                    storage.save('weather', this.data);
                }
            } catch (error) {
                util.log(`Weather fetch failed: ${error}`);
                this.data.weatherUpdateTime = Date.now() + 300000;
            }
            this.update();
        }
    },

    update(key, value) {
        if (key) {
            this.data[key] = value;
        }

        storage.save('weather', this.data);

        this.elems.city.innerText = this.data.city;
        this.elems.currentTemp.innerText = this.data.currentTemp;
        this.elems.highTemp.innerText = this.data.highTemp;
        this.elems.lowTemp.innerText = this.data.lowTemp;
        this.elems.condition.innerText = this.data.condition;
        this.elems.units.innerText = this.data.units ? this.data.units[0] : '';
    },

    upgradeWeather(defaultWeather) {
        if (!this.data.units) {
            this.data = util.clone(defaultWeather);
        }
    },
};
