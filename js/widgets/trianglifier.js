define(['jquery', 'spectrum-colorpicker', 'throttle-debounce', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
  function (jquery, spectrum, throttle_debounce, modal, util, storage, defaults, script) {
    var trianglifier = {

      isInit: false,

      data: {},

      elems: {
        themeEditor: document.getElementById('themeEditor'),
        trianglify: document.getElementById('trianglifyButton'),
        editThemeButton: document.getElementById('editThemeButton'),
        solidSection: document.getElementById('solid'),
        trianglifySection: document.getElementById('trianglify'),
        randomizeSection: document.getElementById('randomize')
      },

      textInputs: [
        document.getElementById('trianglifierVariance'),
        document.getElementById('trianglifierCellSize'),
        document.getElementById('trianglifierSeed'),
        document.getElementById('newThemeTitle'),
        document.getElementById('newThemeAuthor')
      ],

      colorInputs: [
        document.getElementById('backgroundColor'),
        document.getElementById('titleColor'),
        document.getElementById('mainColor'),
        document.getElementById('optionsColor'),
        document.getElementById('x_1_Color'),
        document.getElementById('x_2_Color'),
        document.getElementById('x_3_Color'),
        document.getElementById('y_1_Color'),
        document.getElementById('y_2_Color'),
        document.getElementById('y_3_Color')
      ],

      selectInputs: [
        document.getElementById('font-chooser'),
        document.getElementById('color-chooser'),
        document.getElementById('background-chooser'),
      ],

      init: function () {
        this.theme = storage.get('theme', defaults.defaultTheme);
        this.data = this.theme;
        this.elems.themeEditor.parentNode.removeChild(this.elems.themeEditor);

        this.elems.editThemeButton.addEventListener('click', this.openThemeEditor.bind(this));

        // DEBUG
        var that = this;
        setTimeout(function() { that.elems.editThemeButton.click(); }, 500);
      },

      openThemeEditor: function() {
        if (!this.isInit) {
          for (var i = 0; i < this.textInputs.length; i++) {
            this.bindTextInput(this.textInputs[i]);
          }

          for (var j = 0; j < this.colorInputs.length; j++) {
            this.bindColorInput(this.colorInputs[j]);
          }

          for (var k = 0; k < this.selectInputs.length; k++) {
            this.bindSelectInput(this.selectInputs[k]);
          }

          this.isInit = true;
        }
          
        modal.createModal('themeEditorModal', this.elems.themeEditor, this.themeEditorClosed.bind(this), 'save', 'cancel');
      },

      bindTextInput: function(inputElement) {
        inputElement.addEventListener('input', this.updateText.bind(this, inputElement.id));
      },

      bindSelectInput: function(inputElement) {
        inputElement.selectedIndex = this.theme[inputElement.id];
        jquery(inputElement).metroSelect({
            'onchange': this.changeSelect.bind(this, inputElement.id)
        });
      },

      bindColorInput: function (inputElement) {
        jquery(inputElement).spectrum({
            chooseText: 'save color',
            replacerClassName: 'spectrum-replacer',
            appendTo: inputElement.parentNode,
            showButtons: false,
            color: this.data[inputElement.id],
            move: throttle_debounce.throttle(250, this.updateColor.bind(this, inputElement.id), true)
          });
      },
        
      changeSelect: function(inputId, val) {
        util.logChange(inputId, val);
        this.data[inputId] = val;

        if (inputId === 'background-chooser' || inputId === 'color-chooser')
        {
          var elems = document.getElementsByClassName(inputId.replace('chooser', 'section'));
          for (var i = 0; i < elems.length; i++) { 
            if (!util.hasClass(elems[i], 'hide')) {
              util.addClass(elems[i], 'hide');
            }
          }

          var backgroundElement = document.getElementById(val);
          if (!!backgroundElement) {
            if (util.hasClass(backgroundElement, 'hide')) {
              util.removeClass(backgroundElement, 'hide');
            } else {
              util.addClass(backgroundElement, 'hide');
            }
          }
        } else {
          script.updateTheme(this.data);
        }
      },

      updateText: function(inputId, event) {
        util.logChange(inputId, event.target.value);
        this.data[inputId] = event.target.value;

        script.updateTheme(this.data);
      },

      updateColor: function (inputId, color) {
        // util.logChange(inputId, color);
        this.data[inputId] = color.toHexString();

        script.updateTheme(this.data);
      },
      
      randomTheme: function () {
        for (var i = 0; i < this.colorInputs.length; i++) {
          let color = util.randomColor();

          jquery(`#${this.colorInputs[i].id}`).spectrum('set', color);
          this.data[this.colorInputs[i].id] = color;
        }

        script.updateTheme(this.currentTheme, true);
      },

      themeEditorClosed: function(res) {
        util.log(`theme editor closed with result: ${res}`);
      },
      
      undoChanges: function () {
        this.currentTheme = storage.get('currentTheme', defaults.defaultTheme);
        script.updateTheme(this.currentTheme, true);

        for (var i = 0; i < this.colorInputs.length; i++) {
          let color = this.currentTheme[this.colorInputs[i].id];

          jquery(`#${this.colorInputs[i].id}`).spectrum('set', color);
          this.data[this.colorInputs[i].id] = color;
        }
      },
    };

    return trianglifier;
});