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
            'title': 'metro start',
            'author': 'metro start',
            'font': 'normal fonts',
            'optionsColor': '#ff0000',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'backgroundColor': '#000000',
            'background-chooser': 'none',
            'triVariance': 0.75,
            'triSize': 75,
            'triStyle': 'tetrad',
            'trianglifierVariance': 1.51,
            'trianglifierCellSize': 75,
            'x_1_Color': '#001133',
            'x_2_Color': '#001133',
            'x_3_Color': '#001133',
            'y_1_Color': '#001133',
            'y_2_Color': '#001133',
            'y_3_Color': '#001133'
        },

        defaultTrianglifier: {
            'color': 'Greys'
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
            'online': true,
            'colors': {
                'options-color': '#ff0000',
                'main-color': '#ffffff',
                'title-color': '#4a4a4a',
                'background-color': '#000000'
            },
            'author': 'metro start'
        },
        {
            'title': 'metro start',
            'online': true,
            'colors': {
                'options-color': '#ff0000',
                'main-color': '#ffffff',
                'title-color': '#4a4a4a',
                'background-color': '#000000'
            },
            'author': 'metro start'
        }]
    };
});
