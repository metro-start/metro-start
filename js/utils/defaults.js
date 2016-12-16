/**
The default theme for metro start.
*/
define(function() {
    return {
        init: function() {

        },

        getDefaultTheme: function() {
            return {
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
            };
        },

        defaultSort: {
            'links': false,
            'apps': false,
            'bookmarks': false,
            'themes': false
        }
    };
});
