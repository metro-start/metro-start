/**
The default theme for metro start.
*/
define(function() {
    return {
        init: function() {},
        defaultWebservice: 'http://metro-start.appspot.com',

        defaultTodos: [
            {'name': 'use the wrench to get started. . . ', 'done': false}
        ],

        // The default theme for the app.
        defaultTheme: {
            'font-chooser': 'system',
            'fontfamily-chooser': 'system',
            'fontweight-chooser': 'normal',
            'fontvariant-chooser': 'normal',
            'fontreadability-chooser': 'off',

            'palette-chooser': 'custom',
            'baseColor': '#aaffaa',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'optionsColor': '#ff0000',
            'backgroundColor': '#000000',

            'background-chooser': 'none',
            'trivariance-chooser': 'uniform',
            'trisize-chooser': 'medium',
            'tristyle-chooser': 'monochromatic',

            'title': 'metro start',
            'author': 'metro start',
        },

        // The default sorting for pages.
        defaultSort: {
            'todos': false,
            'apps': false,
            'bookmarks': false,
            'themes': false
        },

        // The default weather location.
        defaultWeather: {
            'city': 'vancouver, bc',
            'unit': 'c',
            'visible': true
        },

        systemThemes: [{
            'title': 'random theme',
            'author': 'metro start',

            'optionsColor': '#ff0000',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'backgroundColor': '#000000',

            'online': true,
        },
        {
            'title': 'metro start',
            'author': 'metro start',

            'optionsColor': '#ff0000',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'backgroundColor': '#000000',

            'online': true
        }]
    };
});
