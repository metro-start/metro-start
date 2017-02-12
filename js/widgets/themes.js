define(['detect-dom-ready', 'jquery', 'spectrum-colorpicker', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'], function (domready, jquery, spectrum, util, storage, defaults, script) {
  var themes = {
    data: {},

    elems: {
      picker: document.getElementById('picker'),
      newThemeTitle: document.getElementById('newThemeTitle'),
      editTheme: document.getElementById('editTheme'),
      saveTheme: document.getElementById('saveTheme')
    },

    themeAdded: function () {},
    themeRemoved: function () {},

    currentTheme: {},

    init: function () {
      this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
      script.updateStyle(this.currentTheme, false);
      this.elems.editTheme.addEventListener('click', this.editTheme.bind(this));
      this.elems.saveTheme.addEventListener('click', this.saveTheme.bind(this));
      
      this.bindSpectrum();
    },

    bindSpectrum: function () {
        this.spectrumBound = true;
        var that = this;
        var bindOptions = function (inputName) {
          return {
            chooseText: 'save color',
            appendTo: jquery('#input-' + inputName).parent(),
            background: 'black',
            showButtons: false,
            color: that.currentTheme.colors[inputName],
            move: that.colorChangedDelegate.bind(that, inputName)
          };
        };

        jquery('#input-background-color').spectrum(bindOptions('background-color'));
        jquery('#input-title-color').spectrum(bindOptions('title-color'));
        jquery('#input-main-color').spectrum(bindOptions('main-color'));
        jquery('#input-options-color').spectrum(bindOptions('options-color'));
    },

    colorChangedDelegate: function (themeColor, newColor) {
      this.currentTheme.colors[themeColor] = newColor.toHexString();
      script.updateStyle(this.currentTheme, false);
    },

    undoChanges: function () {
      this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
      script.updateStyle(this.currentTheme, true);

      jquery('#input-background-color').spectrum('option', 'color', this.currentTheme.colors['background-color']);
      jquery('#input-title-color').spectrum('option', 'color', this.currentTheme.colors['title-color']);
      jquery('#input-main-color').spectrum('option', 'color', this.currentTheme.colors['main-color']);
      jquery('#input-options-color').spectrum('option', 'color', this.currentTheme.colors['options-color']);
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

    saveTheme: function () {
      var title = this.elems.newThemeTitle.value.trim();
      if (title === "") {
        // https://github.com/kylestetz/Sentencer ?
        title = "verdant sunset" + (Math.random() * 500);
      }

      this.currentTheme.title = title;
      var localThemes = storage.get('localThemes', [defaults.defaultTheme]);
      localThemes.push(this.currentTheme);
      storage.save('localThemes', localThemes);
      storage.save('currentTheme', this.currentTheme);
      this.themeAdded();
    },

    applyTheme: function (theme) {
      this.currentTheme = theme;
      script.updateStyle(this.currentTheme, true);
      storage.save('currentTheme', this.currentTheme);
    },

    shareTheme: function (theme) {
      var url = 'http://metro-start.appspot.com/newtheme?' +
        'title=' + encodeURIComponent(theme.title) +
        '&maincolor=' + encodeURIComponent(theme.colors['main-color']) +
        '&optionscolor=' + encodeURIComponent(theme.colors['options-color']) +
        '&titlecolor=' + encodeURIComponent(theme.colors['title-color']) +
        '&backgroundcolor=' + encodeURIComponent(theme.colors['background-color']);
      window.open(url);
    },

    removeTheme: function (theme) {
      var localThemes = storage.get('localThemes', [defaults.defaultTheme]);
      localThemes = localThemes.filter(function (themeToRemove) {
        return theme.title !== themeToRemove.title;
      });

      storage.save('localThemes', localThemes);
      this.themeRemoved();
    },

    updateTheme: function (theme) {
      if (!this.isVisible()) {
        this.editTheme();
      }

      jquery('#input-background-color').spectrum('option', 'color', theme.colors['background-color']);
      jquery('#input-title-color').spectrum('option', 'color', theme.colors['title-color']);
      jquery('#input-main-color').spectrum('option', 'color', theme.colors['main-color']);
      jquery('#input-options-color').spectrum('option', 'color', theme.colors['options-color']);
    },

    isVisible: function () {
      return util.hasClass(this.elems.picker, 'show');
    }
  };
  return themes;
});