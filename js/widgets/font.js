define(['jquery', 'utils/script', 'utils/storage'], function(jquery, script, storage) {
    var font = {
        init: function(document) {
            var selector = jquery('#font-chooser');
            selector.attr('selectedIndex', storage.get('fonts') == 'normal fonts' ? 0 : 1);
            selector.metroSelect({
                'onchange': this.changeFont
            });
        },

        changeFont: function(font) {
            storage.save('font', font);
            script.updateFont();
            _gaq.push(['_trackEvent', 'Theme', 'Change Font', font]);
        },
    };

    return font;
});
