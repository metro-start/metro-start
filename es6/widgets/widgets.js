import weather from './weather';
import themes from './themes';
import about from './about';
export default {
    weather,
    themes,
    about,

    data: [weather, themes, about],

    init(document) {
        this.data.forEach((module) => {
            module.init(document);
        });
    },
};