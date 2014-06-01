define(['jquery', 'jss', 'farbtastic', 'utils/defaults'], function(jquery, jss, farbtastic, defaults) {
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

            // Add a listener to update the page item count when the window is resized.
            jquery(window).resize(function() {
                scope.$apply(function() {
                    scope.setPageItemCount(that.getPageItemCount());
                });
            });

            that.getPageItemCount();
        },
        /**
            Compares window height to element height to fine the number of elements per page.
            returns: The number of items to fit on a page.
        */
        getPageItemCount: function() {
            var pageHeight = jquery('body').height();
            var headerHeight = jquery('h1').outerHeight(true);
            var navBarHeight = jquery('.page-chooser').outerHeight(true);
            var footerHeight = jquery('.footer').outerHeight(true);
            var height =  pageHeight - (headerHeight + navBarHeight + footerHeight);

            jss.set('.external', {
                'height': '' + height
            });
            jss.set('.bookmark_page', {
                'height': '' + height
            });

            return Math.floor((height) / 60) - 1;
        },
        /**
            Changes the style to whatever is in the scope.
            transition: A bool indicating whether to slowly transition or immediately change.
        */
        updateStyle: function(transition) {
            var scope = {};
            var options_color = defaults.defaultTheme['options-color'];
            var background_color = defaults.defaultTheme['background-color'];
            var main_color = defaults.defaultTheme['main-color'];
            var title_color = defaults.defaultTheme['title-color'];

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

            if(scope.font === 0) {
                jss.set('body', {
                    'font-family': '"Segoe UI", Helvetica, Arial, sans-serif',
                });
            } else {
                jss.set('body', {
                    'font-family': 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif',
                });
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
        }
    };
});
