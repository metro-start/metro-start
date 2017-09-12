define(['jquery', 'spectrum-colorpicker', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
  function (jquery, spectrum, modal, util, storage, defaults, script) {
    var trianglifier = {
      data: {},

      elems: {
        trianglify: document.getElementById('trianglifyButton'),
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
        this.currentTrianglifer = storage.get('currentTrianglifer', defaults.defaultTrianglifier);
        // script.updateBackground(this.currentTrianglifer);        

        this.elems.trianglify.addEventListener('click', this.trianglify.bind(this));

        // DEBUG
        this.showOptions();
      },

      showOptions: function() {
        this.bindSpectrum();

        for (var i = 0; i < this.textInputs.length; i++) {
          console.log(this.textInputs[i]);
          this.bindInput(this.textInputs[i]);
        }
        
        for (var j = 0; j < this.colorPickers.length; j++) {
          console.log(this.colorPickers[j]);
          this.bindSpectrum(this.colorPickers[j].id);
        }
      },

      bindInput: function(inputElement) {
        console.log(inputElement);
        inputElement.addEventListener('input', this.updateTrianglifier.bind(this, inputElement.id));
      },

      updateTrianglifier: function(inputId, val) {
        console.log(val);
        this.data[inputId] = val;

        console.log(inputId);
      },

      bindSpectrum: function (colorPickerId) {
        jquery('#' + colorPickerId).spectrum({
            chooseText: 'save color',
            replacerClassName: 'spectrum-replacer',
            appendTo: jquery(colorPickerId).parent(),
            showButtons: false,
            color: this.data[colorPickerId],
            move: this.colorChangedDelegate.bind(this, colorPickerId)
          });
      },

      trianglify: function () {
        // var picker = jquery('#trianglifierPicker');

//        this.modalWindow = modal.createModal('trianglify', picker[0], this.modalClosed.bind(this), 'save', 'cancel');
        this.bindSpectrum();
      },

      modalClosed: function() {

      },

      colorChangedDelegate: function () {
      }
    };
    return trianglifier;
});