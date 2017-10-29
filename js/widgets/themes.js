define(['jquery', 'spectrum-colorpicker', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
  function (jquery, spectrum, modal, util, storage, defaults, script) {
    var themes = {
      data: {},

      templates: {

      },

      elems: {
        picker: document.getElementById('picker'),
        newThemeTitle: document.getElementById('newThemeTitle'),
        newThemeAuthor: document.getElementById('newThemeAuthor'),
        editTheme: document.getElementById('editTheme'),
        randomTheme: document.getElementById('randomTheme'),
        saveTheme: document.getElementById('saveTheme'),
      },

      themeAdded: function () { },
      themeRemoved: function () { },

      currentTheme: {},

      init: function () {
        this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
        if (this.currentTheme.title === 'random theme') {
          this.randomTheme();
        } else {
          script.updateTheme(this.currentTheme, false);
        }
      },

      editTheme: function () {
        if (this.isVisible()) {
          util.removeClass(this.elems.picker, 'show');
          util.addClass(this.elems.picker, 'hide');
          this.elems.editTheme.textContent = 'edit theme';
        } else {
          util.removeClass(this.elems.picker, 'hide');
          util.addClass(this.elems.picker, 'show');
          this.elems.editTheme.textContent = 'close';
        }
      },

      randomTheme: function () {
        this.currentTheme.colors['options-color'] = '#' + util.randomColor();
        this.currentTheme.colors['background-color'] = '#' + util.randomColor();
        this.currentTheme.colors['main-color'] = '#' + util.randomColor();
        this.currentTheme.colors['title-color'] = '#' + util.randomColor();

        jquery('#input-background-color').spectrum('set', this.currentTheme.colors['background-color']);
        jquery('#input-options-color').spectrum('set', this.currentTheme.colors['options-color']);
        jquery('#input-main-color').spectrum('set', this.currentTheme.colors['main-color']);
        jquery('#input-title-color').spectrum('set', this.currentTheme.colors['title-color']);

        script.updateTheme(this.data, true);
      },

      saveTheme: function (data) {
        if (!data.newThemeTitle)
        {
          // https://github.com/kylestetz/Sentencer ?
          modal.createModal('themeManagerError', 'please specify a name for this theme', null, 'okay');
          return;
        }
        
        if (!data.newThemeAuthor) {
          data.newThemeAuthor = 'unknown';
        }
        
        data.online = false;
        
        var themesLocal = storage.get('themesLocal', []);
        themesLocal.push(data);
       storage.save('themesLocal', themesLocal);
        storage.save('currentTheme', data);

        this.themeAdded();
      },

      applyTheme: function (theme) {
        this.currentTheme = theme;
        storage.save('currentTheme', this.currentTheme);

        if (theme.title === 'random theme') {
          this.randomTheme();
        } else {
          script.updateTheme(this.currentTheme, true);
        }
      },

      shareTheme: function (theme) {
        var url = defaults.defaultWebservice + '/newtheme?' +
          'title=' + encodeURIComponent(theme.title) +
          '&author=' + encodeURIComponent(theme.author) +
          '&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
          '&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
          '&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
          '&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
        console.log(url);

        jquery.get(url, function (data) {
          console.log(data);
        });
      },

      removeTheme: function (theme) {
        var themesLocal = storage.get('themesLocal', [defaults.defaultTheme]);

        for (var i = 0; i < themesLocal.length; i++) {
          if (theme.title === themesLocal[i].title) {
            themesLocal.splice(i, 1);
            break;
          }
        }

        storage.save('themesLocal', themesLocal);
        this.themeRemoved();
      },

      updateTheme: function (theme) {
        // if (!this.isVisible()) {
        //   this.editTheme();
        // }

        // jquery('#input-background-color').spectrum('option', 'color', theme.colors['background-color']);
        // jquery('#input-title-color').spectrum('option', 'color', theme.colors['title-color']);
        // jquery('#input-main-color').spectrum('option', 'color', theme.colors['main-color']);
        // jquery('#input-options-color').spectrum('option', 'color', theme.colors['options-color']);
      },

      isVisible: function () {
        return util.hasClass(this.elems.picker, 'show');
      }
    };
    return themes;
});