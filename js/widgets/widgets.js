define(['./weather', './themes', './trianglifier', './font'], function(weather, themes, trianglifier, font) {
    var widgets = {
        weather: weather,
        themes: themes,
        trianglifer: trianglifier,
        font: font,
        confirm: confirm,

        data: [weather, themes, trianglifier, font],

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });
        }
    };

    return widgets;
});
