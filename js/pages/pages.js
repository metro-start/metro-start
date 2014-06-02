/**
    A collection to handle organizing data in pages.
    newRows: An array of items to initialize the collection with.
*/
define(['pages/apps', 'pages/bookmarks', 'pages/themes', 'pages/links'], function Pages(apps, bookmarks, themes, links) {

    // storage.get('sort', defaults.defaultSort, $scope);
    //
    // storage.get('page', 0, $scope);
    var pages = {
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

                    var pageItemCount = Math.floor((height) / 60) - 1;
                    that.data.forEach(function(module) {
                        module.setPageItemCount(pageItemCount);
                    });
                });
            });

        },
    };

    return pages;
});


/**
    Get functions that retrieve different types of data from various things
    that could be in the pages object.
*/
var getFunctions = {
    'name': function(elem) {
        return elem.name.toLocaleLowerCase();
    },
    'title': function(elem) {
        return elem.title.toLocaleLowerCase();
    },
};
