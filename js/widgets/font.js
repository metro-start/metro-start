define(['jquery', 'jss', '../utils/defaults', '../utils/storage'], function(jquery, jss, defaults, storage) {
    var font = {
        fonts: {
            'normal fonts': '"Segoe UI", Helvetica, Arial, sans-serif',
            'thin fonts': 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'
        },

        init: function(document) {
            var selector = jquery('#font-chooser');
            var currentFont = storage.get('currentFont', defaults.getDefaultFont());

            selector.metroSelect({
                initial: currentFont,
                onchange: this.changeFont.bind(this)
            });
        },

        changeFont: function(font) {
            storage.save('currentFont', font);
            jss.set('body', {
                'font-family': this.fonts[font],
            });
        }
    };

    return font;
});
