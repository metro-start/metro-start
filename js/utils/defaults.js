/**
The default theme for metro start.
*/
define(function() {
    return {
        init: function() {
        },

        getDefaultFont: function () {
            return 'normal fonts';
        },

        getDefaultTheme: function() {
            return {
                title: 'metro start',
                colors: {
                    'options-color': '#ff0000',
                    'main-color': '#ffffff',
                    'title-color': '#4a4a4a',
                    'background-color': '#000000'
                },
                author: {
                name: 'metro-start',
                link: 'chumannaji.com'
                }
            };
        },

        getDefaultWeather: function() {
            return {
                city: 'vancouver, bc',
                currentTemp: '-',
                highTemp: '-',
                lowTemp: '-',
                condition: '-'
            };
        },

        getDefaultWeatherUnit: function() {
            return "celcius";
        },

        getDefaultSort: function() {
            return {
                links: 'unsorted',
                apps: 'unsorted',
                bookmarks: 'unsorted',
                themes: 'unsorted'
            };
        }
    };
});
