define(['./weather', './themes', './font', './confirm'], function(weather, themes, font, confirm) {
    var widgets = {
        weather: weather,
        themes: themes,
        font: font,
        confirm: confirm,

        data: [weather, themes, font, confirm],

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });
        }
    };

    return widgets;
});
