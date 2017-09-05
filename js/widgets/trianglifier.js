define(['jquery', 'spectrum-colorpicker', '../utils/modal', '../utils/util', '../utils/storage', '../utils/defaults', '../utils/script'],
  function (jquery, spectrum, modal, util, storage, defaults, script) {
    var trianglifier = {
      data: {},

      elems: {
        trianglify: document.getElementById('trianglify')
      },

      currentTrianglifer: {},

      init: function () {
        this.currentTrianglifer = storage.get('currentTrianglifer', defaults.defaultTrianglifier);
        script.updateBackground(this.currentTrianglifer);        
        
        this.elems.trianglify.addEventListener('click', this.trianglify.bind(this));

        this.bindSpectrum();

        var that = this;
        setTimeout(function() { 
          that.elems.trianglify.click();
        }, 2000);
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
            color: that.currentTrianglifer.color,
            move: that.colorChangedDelegate.bind(that, inputName)
          };
        };

        jquery('#input-triangle-color').spectrum(bindOptions('triangle-color'));
      },

      trianglify: function () {
        var picker = jquery('<div class="picker" id="trianglifierPicker">' +
          '<p>' +
            '<input type="text" id="trianglifierSize" class="options-color" size="12" placeholder="size">' +
            '<input type="text" id="trianglifierVertexes" class="options-color" size="12" placeholder="vertexes">' +
          '</p>' +
          '<div>' +
            '<span class="picker-text options-color">triangle <input type="text" id="input-triangle-color" size="9">' +
            '</span>' +
            '<div id="triangle-color"></div>' +
          '</div>' +
        '</div>');

        this.modalWindow = modal.createModal('trianglify', picker[0], this.modalClosed.bind(this), 'save', 'cancel');
        this.bindSpectrum();
      },

      modalClosed: function() {

      },

      colorChangedDelegate: function () {
      }
    };
    return trianglifier;
});