import weather from './weather';
import themes from './themes';
import about from './about';
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

export default widgets;
