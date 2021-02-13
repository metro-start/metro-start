import weather from './weather';
import themes from './themes';
import about from './about';
export default {
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