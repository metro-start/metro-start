define(['jquery', 'jss', 'farbtastic', 'utils/util', 'utils/storage', 'utils/defaults'], function(jquery, jss, farbtastic, util, storage, defaults) {

    var fonts = {
        'normal fonts': '"Segoe UI", Helvetica, Arial, sans-serif',
        'thin fonts': 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'
    };

    return {
        pageItemCount: 4,
        init: function() {
            var that = this;

            jquery('body').show();

            jquery.each(defaults.defaultTheme.colors, function(key, value) {
                var inputFarbtastic = jquery('#' + key).farbtastic('#input-' + key);
                // Add a listener to update farbtastic and style when a color is changed.
                // scope.$watch('theme.colors["' + key + '"]', function(newVal, oldVal) {
                //     jquery.farbtastic('#' + key).setColor(newVal);
                //     that.updateStyle(false);
                // });
            });
        },

        /**
            Changes the style to whatever is in the scope.
            transition: A bool indicating whether to slowly transition or immediately change.
        */
        updateStyle: function(transition) {
            updateFont();

            var scope = {};
            var options_color = defaults.defaultTheme.colors['options-color'];
            var background_color = defaults.defaultTheme.colors['background-color'];
            var main_color = defaults.defaultTheme.colors['main-color'];
            var title_color = defaults.defaultTheme.colors['title-color'];

            jquery.each(defaults.defaultTheme.colors, function(key, value) {

                jquery('#' + key).farbtastic('.color-picker .' + key);
                //
                // // Add a listener to update farbtastic when a color is changed.
                // scope.$watch('theme.colors["' + key + '"]', function(newVal, oldVal) {
                //     jquery.farbtastic('#' + key).setColor(newVal);
                // });
            });
            if (scope.theme) {
                background_color = scope.theme.colors['background-color'];
                options_color = scope.theme.colors['options-color'];
                main_color = scope.theme.colors['main-color'];
                title_color = scope.theme.colors['title-color'];
            }

            jss.set('*', {
                'border-color': options_color
            });

            jss.set('::-webkit-scrollbar', {
                'background': background_color
            });

            jss.set('::-webkit-scrollbar-thumb', {
                'background': options_color
            });

            jss.set('::-webkit-input-placeholder', {
                'background': main_color
            });

            // Transition the colors
            if (transition) {
                jquery('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
                jquery('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
                jquery('body').animate({'color': main_color}, {duration: 400, queue: false});
                jquery('input').animate({'color': main_color}, {duration: 400, queue: false});
                jquery('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
            }

            //but then we still need to add it to the DOM.
            jss.set('.background-color', {
                'background-color': background_color
            });
            jss.set('.title-color', {
                'color': title_color
            });
            jss.set('body', {
                'color': main_color
            });
            jss.set('input', {
                'color': main_color
            });
            jss.set('.options-color', {
                'color': options_color
            });
            jss.set('.bookmark-active', {
                'color': options_color
                //'border-bottom': '2px solid ' + options_color
            });
        },

        updateFont: function () {
            jss.set('body', {
                'font-family': fonts[storage.get('font', 'normal fonts')],
            });
        }
    };
});
