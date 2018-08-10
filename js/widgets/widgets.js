define(['./weather', './themes', './about'], (weather, themes, about) => {
    let widgets = {
        weather: weather,
        themes: themes,
        about: about,

        data: [weather, themes, about],

        init: function(document) {
            this.data.forEach((module) => {
                module.init(document);
            });
        },
    };

    return widgets;
});
