define(['jquery', 'jss', 'utils/storage', 'pages/links', 'pages/apps', 'pages/bookmarks', 'pages/themes'],
    function Pages(jquery, jss, storage, links, apps, bookmarks, themes) {
    var pages = {

        name: 'pages',

        elems: {},

        data: Array.prototype.slice.call(arguments, 3),

        init: function(document) {
            this.page = storage.get('page', 'links');
            this.data.forEach(function(module) {
                module.init(document);
            });

            this.elems.chooser = document.getElementById(this.name + '-chooser');
            jquery(this.elems.chooser).attr('selectedIndex', this.indexOfModule(this.page));
            this.changePage(this.page);

            jquery(this.elems.chooser).metroSelect({
                'onchange': this.changePage.bind(this)
            });

            var that = this;
            jquery(window).resize(that.windowResized.bind(that));
            jquery(window).resize();
//            this.windowResized();
        },

        changePage: function changePage(page) {
            this.page = page;
            storage.save('page', page);

            console.log((this.data.map(function(m) { return m.name; }).indexOf(page) * -100) + '%');
            jss.set('.external .internal', {
                'margin-left': (this.indexOfModule(page) * -100) + '%'
            });
        },

        // Compare document height to element height to fine the number of elements per page.
        windowResized: function() {
            var pageHeight = jquery('body').height();
            var headerHeight = jquery('h1').outerHeight(true);
            var navBarHeight = jquery('.' + this.name + '-chooser').outerHeight(true);
            var footerHeight = jquery('.footer').outerHeight(true);
            var height =  pageHeight - (headerHeight + navBarHeight + footerHeight);

            jss.set('.external', {
                'height': '' + height
            });
            jss.set('.bookmark_page', {
                'height': '' + height
            });

            var pageItemCount = Math.floor((height) / 60); //-1 to account for sorting
            this.data.forEach(function(module) {
                module.setPageItemCount(pageItemCount);
            });
        },

        showOptionsChanged: function(showOptions) {
            this.data.forEach(function(module) {
                if (module.setShowOptions) {
                    module.setShowOptions(showOptions);
                }
            });
        },

        indexOfModule: function indexOfModule(moduleName) {
            return this.data.map(function(m) { return m.name; }).indexOf(moduleName);
        }
    };

    return pages;
});
