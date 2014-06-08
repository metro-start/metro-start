define(['jquery', 'jss', 'pages/apps', 'pages/bookmarks', 'pages/themes', 'pages/links'],
    function Pages(jquery, jss, apps, bookmarks, themes, links) {
    var pages = {

        page: 0,

        data: Array.prototype.slice.call(arguments, 2),

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });

            var that = this;
            jquery(window).resize(that.windowResized.bind(that));
            this.windowResized();
        },

        // Compare document height to element height to fine the number of elements per page.
        windowResized: function() {
            var pageHeight = jquery('body').height();
            var headerHeight = jquery('h1').outerHeight(true);
            var navBarHeight = jquery('.page-chooser').outerHeight(true);
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
        }
    };

    return pages;
});
