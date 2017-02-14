define(['detect-dom-ready', 'jquery', 'spectrum-colorpicker', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'], 
function (domready, jquery, spectrum, util, storage, defaults, script) {
  var themes = {
    data: {},

    elems: {
      picker: document.getElementById('picker'),
      newThemeTitle: document.getElementById('newThemeTitle'),
      newThemeAuthor: document.getElementById('newThemeAuthor'),
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
      // https://github.com/kylestetz/Sentencer ?
      if (title === "") {
        title = "verdant sunset" + (Math.random() * 500);
      }
      var author = this.elems.newThemeAuthor.value.trim();
      if (author === '') {
        author = 'poet ' + (Math.random() * 500);
      }

      this.currentTheme.online = false;
      this.currentTheme.title = title;
      this.currentTheme.author = author;
      storage.save('currentTheme', this.currentTheme);

      var localThemes = storage.get('localThemes', [defaults.defaultTheme]);
      localThemes.push(this.currentTheme);
      storage.save('localThemes', localThemes);
      this.themeAdded();
    },

    applyTheme: function (theme) {
      this.currentTheme = theme;
      storage.save('currentTheme', this.currentTheme);
      script.updateStyle(this.currentTheme, true);
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
      var localThemes = storage.get('localThemes', [defaults.defaultTheme]);

      for(var i = 0; i < localThemes.length; i++) {
        if (theme.title === localThemes[i].title) {
          localThemes.splice(i, 1);
          break;
        }
      }

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