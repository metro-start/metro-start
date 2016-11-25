define(['jquery', '../utils/script', '../utils/storage'], function(jquery, script, storage) {
    var font = {
        init: function(document) {
            var selector = jquery('#font-chooser');
            var currentFont = storage.get('currentFont');

            if (isNaN(parseInt(currentFont)))
            {
                currentFont = 0;
            }

            selector.attr('selectedIndex', currentFont);
            font.changeFont(currentFont);
            
            selector.metroSelect({
                'onchange': this.changeFont
            });
        },

        changeFont: function(font) {
            if (font === 'normal fonts') {
                font = 0;
            } else if (font === 'thin fonts') {
                font = 1;
            }
            storage.save('currentFont', font);
            script.updateFont();
            
        },
    };

    return font;
});
