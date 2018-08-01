define(['./weather', './themes'], (weather, themes) => {
    let widgets = {
        weather: weather,
        themes: themes,

        data: [weather, themes],

        init: function(document) {
            this.data.forEach((module) => {
                module.init(document);
            });
        },
    };

    return widgets;
});
