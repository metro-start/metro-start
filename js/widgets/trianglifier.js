define(['jquery', 'spectrum-colorpicker', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
  function (jquery, spectrum, modal, util, storage, defaults, script) {
    var trianglifier = {

      isInit: false,

      data: {},

      elems: {
        themeEditor: document.getElementById('themeEditor'),
        trianglify: document.getElementById('trianglifyButton'),
        editThemeButton: document.getElementById('editThemeButton'),
      },

      textInputs: [
        document.getElementById('trianglifierSize'),
        document.getElementById('trianglifierColorSpace'),
        document.getElementById('trianglifierStrokeWidth'),
        document.getElementById('trianglifierCellSize'),
        document.getElementById('trianglifierVariance'),
        document.getElementById('trianglifierSeed')
      ],

      colorPickers: [
        document.getElementById('trianglifierXColor'),
        document.getElementById('trianglifierYColor')
      ],

      currentTrianglifer: {},

      init: function () {
        this.theme = storage.get('theme', defaults.defaultTheme);
        this.elems.themeEditor.parentNode.removeChild(this.elems.themeEditor);

        this.elems.editThemeButton.addEventListener('click', this.openThemeEditor.bind(this));

        // DEBUG
        var that = this;
        setTimeout(function() { that.elems.editThemeButton.click(); }, 500);
      },

      openThemeEditor: function() {
        if (!this.isInit) {
          for (var i = 0; i < this.textInputs.length; i++) {
            this.bindInput(this.textInputs[i]);
          }
          
          for (var j = 0; j < this.colorPickers.length; j++) {
            this.bindSpectrum(this.colorPickers[j]);
          }

          this.isInit = true;
        }
          
        modal.createModal('themeEditorModal', this.elems.themeEditor, this.themeEditorClosed.bind(this));
      },

      themeEditorClosed: function(result) {
        console.log("THEME CLOSED WITH: " + result);
      },

      bindInput: function(inputElement) {
        inputElement.addEventListener('input', this.updateTrianglifier.bind(this, inputElement.id));
      },

      bindSpectrum: function (colorPickerElem) {
        var colorPicker = jquery(colorPickerElem);
        colorPicker.spectrum({
            chooseText: 'save color',
            replacerClassName: 'spectrum-replacer',
            appendTo: colorPicker.parent(),
            showButtons: false,
            color: this.data[colorPicker.id],
            move: this.updateColor.bind(this, colorPicker.id)
          });
      },

      updateTrianglifier: function(inputId, val) {
        console.log(val);
        this.data[inputId] = val;

        console.log(inputId);
      },

      updateColor: function (themeColor, newColor) {
         console.log(themeColor);
        console.log(newColor);

        this.data.colors[themeColor] = newColor.toHexString();
      }
    };

    return trianglifier;
});