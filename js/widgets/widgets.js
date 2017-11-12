define(['./weather', './themes', './font'], function(weather, themes, font) {
    var widgets = {
        weather: weather,
        themes: themes,
        font: font,

        data: [weather, themes, font],

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });
        }
    };

    return widgets;
});
