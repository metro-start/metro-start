/**
The default theme for metro start.
*/
define(function() {
    return {
        init: {},

        defaultLinks: [
            {'name': 'use the wrench to get started. . . ', 'url': ''}
        ],

        // The default theme for the app.
        defaultTheme: {
            'title': 'metro start',
            'colors': {
                'options-color': '#ff0000',
                'main-color': '#ffffff',
                'title-color': '#4a4a4a',
                'background-color': '#000000'
            },
            'author': {
              'name': 'metro-start',
              'link': 'chumannaji.com'
            }
        },

        // The default sortnig for the app.
        defaultSort: {
            'links': false,
            'apps': false,
            'bookmarks': false,
            'themes': false
        }
    };
});
