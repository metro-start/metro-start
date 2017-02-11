define(['detect-dom-ready', 'jquery', 'spectrum-colorpicker', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'], function (domready, jquery, spectrum, util, storage, defaults, script) {
  var themes = {
    data: {},

    elems: {
      picker: document.getElementById('picker'),
      newThemeTitle: document.getElementById('newThemeTitle'),
      resetTheme: document.getElementById('resetTheme'),
      editTheme: document.getElementById('editTheme')

      // backgroundColor: document.getElementById('input-background-color'),
      // titleColor: document.getElementById('input-title-color'),
      // mainColor: document.getElementById('input-main-color'),
      // optionsColor: document.getElementById('input-options-color')
    },

    themeAdded: function () {},
    themeRemoved: function () {},

    currentTheme: {},

    init: function () {
      this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
      script.updateStyle(this.currentTheme, false);
      this.bindSpectrum();
      // this.elems.picker = document.getElementById('picker');
      // util.addClass(this.elems.picker, 'hide');

      // this.elems.newThemeTitle = document.getElementById('newThemeTitle');

      // this.elems.resetTheme = document.getElementById('resetTheme');
      this.elems.resetTheme.addEventListener('click', this.resetTheme.bind(this));

      // this.elems.editTheme = document.getElementById('editTheme');
      this.elems.editTheme.addEventListener('click', this.editTheme.bind(this));

      // this.elems.backgroundColor = document.getElementById('input-background-color');
      // this.elems.backgroundColor.value = this.currentTheme.colors['background-color'];
      // this.elems.backgroundColor.onkeyup();
      // this.elems.backgroundColor.addEventListener('change', this.updateColor.bind(this, 'background-color'));

      // this.elems.titleColor = document.getElementById('input-title-color');
      // this.elems.titleColor.value = this.currentTheme.colors['title-color'];
      // this.elems.titleColor.keyup();
      // this.elems.titleColor.addEventListener('change', this.updateColor.bind(this, 'title-color'));

      // this.elems.mainColor = document.getElementById('input-main-color');
      // this.elems.mainColor.value = this.currentTheme.colors['main-color'];
      // this.elems.mainColor.keyup();
      // this.elems.mainColor.addEventListener('change', this.updateColor.bind(this, 'main-color'));

      // this.elems.optionsColor = document.getElementById('input-options-color');
      // this.elems.optionsColor.value = this.currentTheme.colors['options-color'];
      // this.elems.optionsColor.keyup();

      // script.addColorChangedHandler(this.colorChangedHandler.bind(this));
      // this.elems.optionsColor.addEventListener('change', this.updateColor.bind(this, 'options-color'));
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

    resetTheme: function () {
      this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
      script.updateStyle(this.currentTheme, true);

      jquery('#input-background-color').spectrum('option', 'color', this.currentTheme.colors['background-color']);
      jquery('#input-title-color').spectrum('option', 'color', this.currentTheme.colors['title-color']);
      jquery('#input-main-color').spectrum('option', 'color', this.currentTheme.colors['main-color']);
      jquery('#input-options-color').spectrum('option', 'color', this.currentTheme.colors['options-color']);
    },

    editTheme: function () {
      if (this.isVisible()) {
        // Save the theme then hide the picker.
        this.saveTheme();
        this.themeAdded();

        util.removeClass(this.elems.picker, 'show');
        util.addClass(this.elems.picker, 'hide');
        this.elems.editTheme.textContent = 'edit theme';
      } else {
        // Show the picker.
        util.removeClass(this.elems.picker, 'hide');
        util.addClass(this.elems.picker, 'show');
        this.elems.editTheme.textContent = 'save theme';
      }
    },

    saveTheme: function () {
      var title = "verdant sunset" + (Math.random() * 500);
      // https://github.com/kylestetz/Sentencer ?

      this.currentTheme.title = title;
      var localThemes = storage.get('localThemes', [defaults.defaultTheme]);
      localThemes.push(this.currentTheme);
      storage.save('localThemes', localThemes);
      storage.save('currentTheme', this.currentTheme);
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