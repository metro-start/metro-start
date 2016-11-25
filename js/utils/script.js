define(['jquery', 'jss', './util', './storage', './defaults'], function(jquery, jss, util, storage, defaults) {
  var fonts = ['"Segoe UI", Helvetica, Arial, sans-serif', 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'];

  var script = {
    pageItemCount: 4,

    handlers: [],

    init: function() {
      var that = this;

      jquery('body').show();

      jquery.each(defaults.defaultTheme.colors, function(key, value) {
        // jquery('#' + key).farbtastic(function(color) {
        //   var inputNode = document.getElementById('input-' + key);
        //   inputNode.value = color;
        //   // themes.updateColor(key, color);
        //   that.handlers.forEach(function(handler) { handler(key, color)});
        //   // that.updateStyle(false);
        //   // console.log(inputNode.onchange);
        //   // util.maybe(inputNode.change)(color);
        //   // util.maybe(inputNode.maybe, )
        //   // console.log(key);
        //   // document.getElementById('input-' + key).value = color;
        //   // console.log(document.getElementById('input-' + key).change);
        //   // document.getElementById('input-' + key).onchange(color);
        // });
        // jquery.farbtastic('#' + key).setColor(value);
        // // Add a listener to update farbtastic and style when a color is changed.
        // // scope.$watch('theme.colors["' + key + '"]', function(newVal, oldVal) {
        // //     jquery.farbtastic('#' + key).setColor(newVal);
        // //     that.updateStyle(false);
        // // });
      });
    },

    addColorChangedHandler: function (handler) {
      this.handlers.push(handler);
    },

    /**
    Changes the style to whatever is in the scope.
    transition: A bool indicating whether to slowly transition or immediately change.
    */
    updateStyle: function(theme, transition) {
      //updateFont();

      var scope = {};
      var options_color = theme.colors['options-color'];
      var background_color = theme.colors['background-color'];
      var main_color = theme.colors['main-color'];
      var title_color = theme.colors['title-color'];

      // jquery.each(defaults.defaultTheme.colors, function(key, value) {
      //
      //     jquery('#' + key).farbtastic('.color-picker .' + key);
      //     //
      //     // // Add a listener to update farbtastic when a color is changed.
      //     // scope.$watch('theme.colors["' + key + '"]', function(newVal, oldVal) {
      //     //     jquery.farbtastic('#' + key).setColor(newVal);
      //     // });
      // });
      // if (scope.theme) {
      //   background_color = scope.theme.colors['background-color'];
      //   options_color = scope.theme.colors['options-color'];
      //   main_color = scope.theme.colors['main-color'];
      //   title_color = scope.theme.colors['title-color'];
      // }

      jss.set('*', {
        'border-color': options_color
      });

      jss.set('::-webkit-scrollbar', {
        'background': background_color
      });

      jss.set('::-webkit-scrollbar-thumb', {
        'background': options_color
      });

      jss.set('::-webkit-input-placeholder', {
        'background': main_color
      });

      // Transition the colors
      if (transition) {
        jquery('.background-color').animate({'backgroundColor': background_color}, {duration: 800, queue: false});
        jquery('.title-color').animate({'color': title_color}, {duration: 400, queue: false});
        jquery('body').animate({'color': main_color}, {duration: 400, queue: false});
        jquery('input').animate({'color': main_color}, {duration: 400, queue: false});
        jquery('.options-color').animate({'color': options_color}, {duration: 400, queue: false});
      }

      //but then we still need to add it to the DOM.
      jss.set('.background-color', {
        'background-color': background_color
      });
      jss.set('.title-color', {
        'color': title_color
      });
      jss.set('body', {
        'color': main_color
      });
      jss.set('input', {
        'color': main_color
      });
      jss.set('.options-color', {
        'color': options_color
      });
      jss.set('.bookmark-active', {
        'color': options_color
        //'border-bottom': '2px solid ' + options_color
      });
    },

    updateFont: function () {
      jss.set('body', {
        'font-family': fonts[storage.get('currentFont', 'normal fonts')],
      });
    }
  };

  return script;
});
