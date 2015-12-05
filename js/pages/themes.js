define([ 'jquery', 'pages/pagebase', 'utils/util', 'utils/storage', 'utils/defaults'],
function(jquery, pagebase, util, storage, defaults) {
    var themes = {
        name: 'themes',

        data: {},

        elems: {},

        localThemes: {},

        onlineThemes: {},

        templates: {
            itemFragment: util.createElement('<div class="theme_item"></div>'),
            titleFragment: util.createElement('<span class="title"></span>'),
            removeFragment: util.createElement('<span class="remove option options-color small-text clickable">remove</span>'),
            shareFragment: util.createElement('<span class="options-color small-text clickable">share</span>'),
            authorFragment: util.createElement('<a class="options-color gallery-bio small-text"></a>')
        },

        init: function() {
            this.elems.rootNode = document.getElementById('internal_selector_themes');
            this.localThemes = new pagebase(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.onlineThemes = new pagebase(document, this.name, this.elems.rootNode, this.templateFunc.bind(this));
            this.localThemes.pageItemCount = -1;
            this.onlineThemes.pageItemCount = -1;
            this.loadThemes();
        },

        loadThemes: function() {
            var that = this;
            that.localThemes.addAll(storage.get('localThemes', [defaults.defaultTheme]));

            // Load online themes.
            jquery.get('http://metro-start.appspot.com/themes.json', function(data) {
                data = JSON.parse(data);
                for (var i in data) {
                    data[i].colors = {
                        'options-color': data[i].options_color,
                        'main-color': data[i].main_color,
                        'title-color': data[i].title_color,
                        'background-color': data[i].background_color,
                    };
                }
                that.onlineThemes.addAll(data);
            });
        },

        templateFunc: function(theme) {
            var fragment = util.createElement('');

            var title = this.templates.titleFragment.cloneNode(true);
            title.firstElementChild.id = 'theme_' + theme.id;
            title.firstElementChild.textContent = theme.title;
            title.firstElementChild.addEventListener('click', this.applyTheme.bind(this, theme));
            fragment.appendChild(title);

            var author = this.templates.authorFragment.cloneNode(true);
            author.firstElementChild.textContent = theme.author.name;
            // author.firstElementChild.href = theme.author.link;
            fragment.appendChild(author);

            var share = this.templates.shareFragment.cloneNode(true);
            share.firstElementChild.addEventListener('click', this.shareTheme.bind(this, theme));
            fragment.appendChild(share);

            var remove = this.templates.removeFragment.cloneNode(true);
            remove.firstElementChild.addEventListener('click', this.removeTheme.bind(this, theme));
            fragment.appendChild(remove);

            return fragment;
        },

        applyTheme: function(theme) {

        },

        shareTheme: function(theme) {

        },

        removeTheme: function(theme) {

        },

        editTheme: function(theme) {

        }
//
//         clickBookmark: function(bookmark, bookmarkNode, event) {
//             if (bookmark.children && bookmark.children.length > 0) {
//                 this.activateBookmark(bookmarkNode);
//                 var currentPage = bookmarkNode.parentNode.parentNode.id;
//                 this.bookmarks.truncatePages(currentPage.replace('bookmarks_', ''));
//                 this.bookmarks.addAll(bookmark.children);
//                 event.preventDefault();
//                 _gaq.push(['_trackEvent', 'Bookmarks', 'Click Bookmark Folder']);
//             }
//             _gaq.push(['_trackEvent', 'Bookmarks', 'Click Bookmarked Page']);
//         },
//
//         removeBookmark: function(bookmark, page, index) {
//             chrome.bookmarks.removeTree(bookmark.id, function() {
//                 $scope.$apply(function() {
//                     $scope.bookmarks[page].splice(index, 1);
//                 });
//             });
//             _gaq.push(['_trackEvent', 'Bookmarks', 'Remove Bookmarked']);
//         },
//
//         setShowOptions: function setShowOptions(showOptions) {
//             this.bookmarks.setShowOptions(showOptions);
//         },
//
//         activateBookmark: function activateBookmark(bookmarkElem) {
//             // bookmarkEle
//         },
//
//         templateFunc: function(bookmark) {
//             var fragment = util.createElement('');
//             var title = this.templates.titleFragment.cloneNode(true);
//             title.firstElementChild.href = bookmark.url;
//             title.firstElementChild.textContent = bookmark.title;
//             title.firstElementChild.id = 'bookmark_' + bookmark.id;
//             if (bookmark.children && bookmark.children.length > 0) {
//                 title.firstElementChild.appendChild(this.templates.slashFragment.cloneNode(true));
//             }
//             title.firstElementChild.addEventListener('click', this.clickBookmark.bind(this, bookmark, title.firstElementChild));
//             fragment.appendChild(title);
//
//             var remove = this.templates.removeFragment.cloneNode(true);
//             remove.firstElementChild.addEventListener('click', this.removeBookmark.bind(this, bookmark));
//             fragment.appendChild(remove);
//
//             return fragment;
//         }
//     };
//     return bookmarks;
// });
//
//
// define([], function() {
//     var themes = {
//         name: "themes",
//
//         data: {},
//
//         elems: {},
//
//         themes: {},
//
//         templates: {
//
//         },
//
//         init: function() {
// // storage.get('theme', defaults.defaultTheme, $scope);
// //
// // storage.get('font', 0, $scope);
//
//         },
//
//         setPageItemCount: function(pageItemCount) {
//             // this.links.setPageItemCount(pageItemCount);
//         },
//
//         loadThemes: function() {
//             // Load local themes.
//             storage.get('localThemes', [defaults.defaultTheme], $scope);
//             $scope.localThemes = new Pages($scope.localThemes, $scope.sort.themes, $scope.pageItemCount, getFunctions.title);
//
//             // Load online themes.
//             $http.get('http://metro-start.appspot.com/themes.json').success(function(data) {
//                 for (var i in data) {
//                     data[i].colors = {
//                         'options-color': data[i].options_color,
//                         'main-color': data[i].main_color,
//                         'title-color': data[i].title_color,
//                         'background-color': data[i].background_color,
//                     };
//                 }
//                 $scope.onlineThemes = new Pages(data, $scope.sort.themes, $scope.pageItemCount, getFunctions.title);
//             });
//         },
//
//         updateTheme: function() {
//             save('theme', $scope.theme,$scope);
//         },
//
//         /**
//             Reset to default theme.
//         */
//         resetTheme: function() {
//             storage.save('theme', defaults.defaultTheme, $scope);
//
//             script.updateStyle(true);
//
//             _gaq.push(['_trackEvent', 'Theme', 'Reset Theme']);
//         },
//
//         /**
//             Change the currently enabled theme.
//             newTheme: The theme to be enabled.
//         */
//         changeTheme: function(newTheme) {
//             storage.save('theme', newTheme, $scope);
//
//             script.updateStyle(true);
//
//             _gaq.push(['_trackEvent', 'Theme', 'Change Theme', newTheme.title]);
//         },
//
//         /**
//             Change the currently enabled font.
//             newFont: The font to be enabled.
//         */
//         changeFont: function(newFont) {
//             storage.save('font', newFont, $scope);
//
//             script.updateStyle(true);
//             if (newFont === 0) {
//                 _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Segoe/Helvetica']);
//             } else {
//                 _gaq.push(['_trackEvent', 'Theme', 'Change Font', 'Raleway']);
//             }
//         },
//
//         /**
//             Navigate the user to the share theme page.
//             theme: The theme being shared.
//         */
//         shareTheme: function(theme) {
//             var url = 'http://metro-start.appspot.com/newtheme?' +
//                 'title=' + encodeURIComponent(theme.title) +
//                 '&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
//                 '&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
//                 '&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
//                 '&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
//             window.open(url);
//             _gaq.push(['_trackEvent', 'Theme', 'Share Theme']);
//         },
//
//         /**
//             Remove the given local theme.
//             page: The page that contains the theme to be removed.
//             index: The index of the theme to be removed.
//         */
//         removeTheme: function(page, index) {
//             $scope.localThemes.remove(page, index);
//             storage.save('localThemes', $scope.localThemes.flatten());
//             _gaq.push(['_trackEvent', 'Theme', 'Remove Theme']);
//         },
//
//         /**
//             Handle the editTheme button click. if what is being edited has a name, save it.
//             Otherwise, just close (temp theme).
//         */
//         clickEditTheme: function() {
//             if ($scope.editThemeText == 'save theme') {
//                 if ($scope.newThemeTitle && $scope.newThemeTitle.trim() !== '') {
//                     $scope.theme.title = $scope.newThemeTitle;
//                     $scope.newThemeTitle = '';
//                     $scope.localThemes.add($scope.theme);
//                     storage.save('theme', $scope.theme);
//                     storage.save('localThemes', $scope.localThemes.flatten());
//                 }
//
//                 _gaq.push(['_trackEvent', 'Theme', 'Stop Editing Theme']);
//             } else {
//                 _gaq.push(['_trackEvent', 'Theme', 'Start Editing Theme']);
//             }
//
//             $scope.editThemeText = 'edit themesave theme'.replace($scope.editThemeText, '');
//         }
    };

    return themes;
});
