define(['./weather', './themes'], function(weather, themes) {
    var widgets = {
        weather: weather,
        themes: themes,

        data: [weather, themes],

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });
        }
    };

    return widgets;
});
