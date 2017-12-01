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
            'font-chooser': 'normal fonts',
            'optionsColor': '#ff0000',
            'mainColor': '#ffffff',
            'titleColor': '#4a4a4a',
            'backgroundColor': '#000000',
            'background-chooser': 'none',
            'trivariance-chooser': 'freeform',
            'trisize-chooser': 'medium',
            'tristyle-chooser': 'tetrad',
            'trianglifierVariance': 1.51,
            'trianglifierCellSize': 75
        },

        // The default sortnig for the app.
        defaultSort: {
            'todos': false,
            'apps': false,
            'bookmarks': false,
            'themes': false
        },

        systemThemes: [{
            title: 'random theme',
            online: true,
            optionsColor: '#ff0000',
            mainColor: '#ffffff',
            titleColor: '#4a4a4a',
            backgroundColor: '#000000',
            author: 'metro start',
        },
        {
            title: 'metro start',
            online: true,
            optionsColor: '#ff0000',
            mainColor: '#ffffff',
            titleColor: '#4a4a4a',
            backgroundColor: '#000000',
            author: 'metro start',
            'trivariance-chooser': 0.75,
            'trisize-chooser': 75,
            'tristyle-chooser': 'tetrad',
            trianglifierVariance: 1.51,
            trianglifierCellSize: 75
        }]
    };
});
