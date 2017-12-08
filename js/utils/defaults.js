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
            'font-chooser': 'normal fonts',

            'palette-chooser': 'automatic',
            'baseColor': '#aaffaa',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'optionsColor': '#ff0000',
            'backgroundColor': '#000000',
            'background-chooser': 'none',
            'trivariance-chooser': 'freeform',
            'trisize-chooser': 'medium',
            'tristyle-chooser': 'tetrad',

            'title': 'metro start',
            'author': 'metro start',
        },

        // The default sortnig for the app.
        defaultSort: {
            'todos': false,
            'apps': false,
            'bookmarks': false,
            'themes': false
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
        }]
    };
});
