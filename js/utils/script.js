define(['jquery', 'jquery-color', 'jss', 'trianglify', './util', './storage', './defaults'],
function (jquery, jqueryColor, jss, trianglify, util, storage, defaults) {
  var fonts = {
    'normal fonts': '"Segoe UI", Helvetica, Arial, sans-serif', 
    'thin fonts': 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'
  };

  var script = {
    init: function () { },

    /**
    Changes the style to whatever is in the scope.
    theme: The new theme to change to.
    transition: A bool indicating whether to slowly transition or immediately change.
    */
    updateTheme: function (data, transition) {
      jss.set('body', {
        'font-family': fonts[data.font],
      });
      
        this.updateFont(data);
        this.updateBackground(data);
  
        var optionsColor = data.optionsColor;
        var backgroundColor = data.backgroundColor;
        var mainColor = data.mainColor;
        var titleColor = data.titleColor;
  
        jss.set('*', {
          'border-color': optionsColor
        });
  
        jss.set('::-webkit-scrollbar', {
          'background': backgroundColor
        });
  
        jss.set('::-webkit-scrollbar-thumb', {
          'background': optionsColor
        });
  
        jss.set('::-webkit-input-placeholder', {
          'background': mainColor
        });
  
        // Animate the color transition.
        var duration = (transition === true ? 800 : 0);
  
        var isTriangled = storage.get('isTriangled', true);
        if (!isTriangled) {
          jquery('body').animate({ 'color': mainColor }, { duration: duration, queue: false });
          jss.set('.background-color', {
            'background-color': backgroundColor
          });
        }
        jquery('input').animate({ 'color': mainColor }, { duration: duration, queue: false });
        jquery('.background-color').animate({ 'backgroundColor': backgroundColor }, { duration: duration, queue: false });
        jquery('.titles-color').animate({ 'color': titleColor }, { duration: duration, queue: false });
        jquery('.options-color').animate({ 'color': optionsColor }, { duration: duration, queue: false });
  
        // ...but then we still need to add it to the DOM.
        jss.set('.titles-color', {
          'color': titleColor
        });
        jss.set('body', {
          'color': mainColor
        });
        jss.set('input', {
          'color': mainColor,
        });
        jss.set('.theme-section', {
          'border-bottom-color': mainColor
        });
        jss.set('.options-color', {
          'color': optionsColor
        });
        jss.set('.bookmark-active', {
          'background-color': optionsColor
        });
        jss.set('.modal-content', {
          'background-color': optionsColor
        });
        jss.set('.overlay-wrap', {
          'background-color': mainColor
        });
        jss.set('.pagebase-grouped > .group > .page', {
          'border-top-style': 'solid',
          'border-top-width': '1px',
          'border-top-color': optionsColor
        });
        jss.set('.pagebase-grouped > .group > .page', {
          'border-top-style': 'solid',
          'border-top-width': '1px',
          'border-top-color': optionsColor
        });
        jss.set('#picker', {
          'border': '1px solid ' + optionsColor
        });
    },

    /**
    Changes the style to whatever is in the scope.
    theme: The new theme to change to.
    transition: A bool indicating whether to slowly transition or immediately change.
    */
    updateStyle: function (theme, transition) {
      this.updateFont(theme);
      this.updateBackground(theme);

      var optionsColor = theme.colors['options-color'];
      var backgroundColor = theme.colors['background-color'];
      var mainColor = theme.colors['main-color'];
      var titleColor = theme.colors['title-color'];

      jss.set('*', {
        'border-color': optionsColor
      });

      jss.set('::-webkit-scrollbar', {
        'background': backgroundColor
      });

      jss.set('::-webkit-scrollbar-thumb', {
        'background': optionsColor
      });

      jss.set('::-webkit-input-placeholder', {
        'background': mainColor
      });

      // Animate the color transition.
      var duration = (transition === true ? 800 : 0);

      var isTriangled = storage.get('isTriangled', true);
      if (!isTriangled) {
        jquery('body').animate({ 'color': mainColor }, { duration: duration, queue: false });
        jss.set('.background-color', {
          'background-color': backgroundColor
        });
      }
      jquery('input').animate({ 'color': mainColor }, { duration: duration, queue: false });
      jquery('.background-color').animate({ 'backgroundColor': backgroundColor }, { duration: duration, queue: false });
      jquery('.titles-color').animate({ 'color': titleColor }, { duration: duration, queue: false });
      jquery('.options-color').animate({ 'color': optionsColor }, { duration: duration, queue: false });

      // ...but then we still need to add it to the DOM.
      jss.set('.titles-color', {
        'color': titleColor
      });
      jss.set('body', {
        'color': mainColor
      });
      jss.set('input', {
        'color': mainColor
      });
      jss.set('.options-color', {
        'color': optionsColor
      });
      jss.set('.bookmark-active', {
        'background-color': optionsColor
      });
      jss.set('.modal-content', {
        'background-color': optionsColor
      });
      jss.set('.overlay-wrap', {
        'background-color': mainColor
      });
      jss.set('.pagebase-grouped > .group > .page', {
        'border-top-style': 'solid',
        'border-top-width': '1px',
        'border-top-color': optionsColor
      });
      jss.set('.pagebase-grouped > .group > .page', {
        'border-top-style': 'solid',
        'border-top-width': '1px',
        'border-top-color': optionsColor
      });
      jss.set('#picker', {
        'border': '1px solid ' + optionsColor
      });
    },

    updateBackground: function (data) {
      var b = jquery('body');
      
      var cellSize = Number.parseInt(data.trianglifierCellSize);
      var variance = Number.parseFloat(data.trianglifierVariance);
      
      // 25 < cellSize < 100
      cellSize = cellSize < 25 ? 25 : (cellSize < 100 ? cellSize : 100);
      var pat = trianglify({
        width: b.prop('scrollWidth'), 
        height: b.prop('scrollHeight'),
        variance: variance,
        x_colors: data['trianglify-chooser'],
        cell_size: cellSize
      });
      
      jss.set('body', {
        'background': 'url(' + pat.png() + ')'
      });

      jss.set('#themeEditorModal', {
        'background': 'url(' + pat.png() + ')'
      });
    },

    updateFont:  function() {
    }
  };

  return script;
});
