/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['pages/apps', 'pages/bookmarks', 'pages/themes', 'pages/links'], function Pages(apps, bookmarks, themes, links) {

    // storage.get('sort', defaults.defaultSort, $scope);
    var pages = {
        page: 0,

        data: Array.prototype.slice.call(arguments),

        init: function(document) {
            this.data.forEach(function(module) {
                module.init(document);
            });


            // Compare document height to element height to fine the number of elements per page.
            var that = this;
            require(['jquery', 'jss'], function(jquery, jss) {
                jquery(window).resize(function() {
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

                    var pageItemCount = Math.floor((height) / 60);
                    that.data.forEach(function(module) {
                        module.setPageItemCount(pageItemCount);
                    });
                });
                jquery(window).resize();
            });

        },
    };

    return pages;
});
