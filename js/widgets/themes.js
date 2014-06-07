define(['domReady!', 'jquery', 'utils/util', 'utils/storage'], function(document, jquery, util, storage) {
    var themes = {
        data: {},

        elems: {},

        init: function() {
            this.data = storage.get('themes');

            this.elems.picker = document.getElementById('picker');
            util.addClass(this.elems.picker, 'hide');
            // var that = this;
            // ['city', 'currentTemp', 'highTemp', 'lowTemp', 'condition', 'unit'].forEach(function(name) {
            //     that.elems[name] = document.getElementById(name);
            //     that.elems[name].innerText = that.data[name];
            // });
        },

    };
    return themes;
});
