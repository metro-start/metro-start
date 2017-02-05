define(['./weather', './themes', './font'], function(weather, themes, font) {
    var widgets = {
        weather: weather,
        themes: themes,
        font: font,

        data: Array.prototype.slice.call(arguments),

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });
        }
    };

    return widgets;
});
