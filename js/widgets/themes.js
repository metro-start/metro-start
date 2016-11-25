define(['detect-dom-ready', 'jquery', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'], function(domready, jquery, util, storage, defaults, script) {
    var themes = {
        data: {},

        elems: {},

        currentTheme: {},

        init: function() {
          domready(function() {
            this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);

            this.elems.picker = document.getElementById('picker');
            util.addClass(this.elems.picker, 'hide');

            this.elems.newThemeTitle = document.getElementById('newThemeTitle');

            this.elems.resetTheme = document.getElementById('resetTheme');
            this.elems.resetTheme.addEventListener('click', this.resetTheme.bind(this));

            this.elems.editTheme = document.getElementById('editTheme');
            this.elems.editTheme.addEventListener('click', this.editTheme.bind(this));

            this.elems.backgroundColor = document.getElementById('input-background-color');
            // this.elems.backgroundColor.value = this.currentTheme.colors['background-color'];
            // this.elems.backgroundColor.onkeyup();
            // this.elems.backgroundColor.addEventListener('change', this.updateColor.bind(this, 'background-color'));

            this.elems.titleColor = document.getElementById('input-title-color');
            // this.elems.titleColor.value = this.currentTheme.colors['title-color'];
            // this.elems.titleColor.keyup();
            // this.elems.titleColor.addEventListener('change', this.updateColor.bind(this, 'title-color'));

            this.elems.mainColor = document.getElementById('input-main-color');
            // this.elems.mainColor.value = this.currentTheme.colors['main-color'];
            // this.elems.mainColor.keyup();
            // this.elems.mainColor.addEventListener('change', this.updateColor.bind(this, 'main-color'));

            this.elems.optionsColor = document.getElementById('input-options-color');
            // this.elems.optionsColor.value = this.currentTheme.colors['options-color'];
            // this.elems.optionsColor.keyup();

            script.addColorChangedHandler(this.colorChangedHandler.bind(this));
            // this.elems.optionsColor.addEventListener('change', this.updateColor.bind(this, 'options-color'));
          });
        },

        resetTheme: function() {
          this.currentTheme = defaults.defaultTheme;
        },

        editTheme: function() {
          if (this.isVisible()) {
            this.saveTheme();

            // Save the theme then hide the picker.
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

        saveTheme: function() {
          var title = this.elems.newThemeTitle.value.trim();
          if (title === '') {
            return;
          }

          this.currentTheme.title = title;
          var localThemes = storage.get('localThemes', [defaults.defaultTheme]);
          localThemes.push(this.currentTheme);
          storage.save('localThemes', localThemes);
          storage.save('currentTheme', this.currentTheme);
        },

        isVisible: function() {
          return util.hasClass(this.elems.picker, 'show');
        },

        colorChangedHandler: function(themeColor, newValue) {
          this.currentTheme.colors[themeColor] = newValue;
          script.updateStyle(this.currentTheme, false);
        }
    };
    return themes;
});
