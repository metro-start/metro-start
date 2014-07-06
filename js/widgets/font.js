define(['jquery', 'utils/script', 'utils/storage'], function(jquery, script, storage) {
    var font = {
        data: {},

        elems: {},

        nodes: ['city', 'currentTemp', 'highTemp', 'lowTemp', 'condition', 'unit'],

        init: function(document) {
            jquery('#font-chooser').metroSelect({
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
