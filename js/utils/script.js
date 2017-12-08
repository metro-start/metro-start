define(['jquery', 'tinycolor2', 'jss', 'trianglify', './util', './storage', './defaults'],
  function (jquery, tinycolor, jss, trianglify, util, storage, defaults) {
    var script = {
      init: function () { },

      /**
      * Changes the style to whatever is in the scope.
      *
      * @param {any} data: The new theme to change to.
      * @param {any} transition: A bool indicating whether to slowly transition or immediately change.
      */
      updateTheme: function (data, transition) {
        var theme = util.upgradeTheme(data, defaults.defaultTheme);

        var optionsColor = theme.optionsColor;
        var backgroundColor = theme.backgroundColor;
        var mainColor = theme.mainColor;
        var titleColor = theme.titleColor;

        this.updateFont(theme);
        this.updateBackground(theme);

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
          'background': optionsColor
        });

        // Animate the color transition.
        var duration = (transition === true ? 800 : 0);
        jquery('body').animate({ 'color': mainColor }, { duration: duration, queue: false });
        jquery('input').animate({ 'color': mainColor }, { duration: duration, queue: false });
        jquery('.background-color').animate({ 'backgroundColor': backgroundColor }, { duration: duration, queue: false });
        jquery('.title-color').animate({ 'color': titleColor }, { duration: duration, queue: false });
        jquery('.options-color').animate({ 'color': optionsColor }, { duration: duration, queue: false });

        // ...but then we still need to add it to the DOM.
        jss.set('.title-color', {
          'color': titleColor
        });
        jss.set('body', {
          'color': mainColor
        });
        jss.set('input', {
          'color': mainColor,
        });
        jss.set('.theme-section-title', {
          'border-bottom-color': mainColor
        });
        jss.set('.options-color', {
          'color': optionsColor
        });
        jss.set('.theme-active', {
          'background-color': optionsColor
        });
        jss.set('.bookmark-active', {
          'background-color': optionsColor
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
        jss.set('.modal-info .clickable', {
          'border': '2px solid ' + optionsColor,
          'background-color': optionsColor
        });
      },

      /**
       * Updates the current background.
       * 
       * @param {any} data Theme object with the new background settings.
       */
      updateBackground: function (data) {
        var jBody = jquery('body');
        if (data['background-chooser'] === 'trianglify') {
          var xColors = [data.backgroundColor];
          var yColors = null;

          // Convert variance from my option to actual values.
          var triVariance = 0.75;
          switch (data['trivariance-chooser'].toLowerCase()) {
            case 'uniform':
              triVariance = 0;
              break;
            
            case 'bent':
              triVariance = 0.375;
              break;

            case 'freeform':
              triVariance = 0.75;
              break;

            default:
              console.error("Could not recognize trivariance: " + data['trivariance-chooser']);
              break;
          }

          var triSize = 70;
          switch (data['trisize-chooser'].toLowerCase()) {
            case 'small':
              triSize = 25;
              break;

            case 'medium':
              triSize = 70;
              break;

            case 'large':
              triSize = 125;
              break;

            default:
              console.error("Could not recognize trisize: " + data['trisize-chooser']);
              break;
          }

          switch (data['tristyle-chooser'].toLowerCase()) {
            case 'engulfed in flames':
              xColors = [
                tinycolor.mix(data.backgroundColor, 'red', 100).toHexString(),
                tinycolor.mix(data.backgroundColor, 'red', 64).toHexString(),
                tinycolor.mix(data.backgroundColor, 'red', 8).toHexString(),
                tinycolor.mix(data.backgroundColor, 'red', 64).toHexString(),
                tinycolor.mix(data.backgroundColor, 'red', 100).toHexString()
              ];
              break;
            case 'triad':
              xColors = tinycolor(data.backgroundColor).triad().map(v => v.toHexString());
              break;
            case 'tetrad':
              xColors = tinycolor(data.backgroundColor).tetrad().map(v => v.toHexString());
              break;
            case 'monochromatic':
              xColors = tinycolor(data.backgroundColor).monochromatic().map(v => v.toHexString());
              break;
            case 'split complements':
              xColors = tinycolor(data.backgroundColor).splitcomplement().map(v => v.toHexString());
              break;
            default:
              console.error("Could not recognize tristyle: " + data['tristyle-chooser']);
              break;
          }

          if (!yColors) {
            yColors = xColors;
          }

          var bodyPattern = trianglify({
            width: jBody.prop('scrollWidth'),
            height: jBody.prop('scrollHeight'),
            variance: triVariance,
            cell_size: triSize,
            x_colors: xColors
          });

          var modalPattern = trianglify({
            width: jBody.prop('scrollWidth') * 0.75,
            height: jBody.prop('scrollHeight') * 0.85,
            variance: triVariance,
            cell_size: triSize,
            x_colors: xColors
          });

          jss.set('body', {
            'background': 'url(' + bodyPattern.png() + ')'
          });

          jss.set('.modal-content', {
            'background': 'url(' + modalPattern.png() + ')'
          });
        } else {
          jss.set('body', {
            'background': data.backgroundColor
          });
          jss.set('.modal-content', {
            'background': data.backgroundColor
          });
          jss.set('.background-color', {
            'background-color': data.backgroundColor
          });
        }
      },

      /**
       * Upates the currently selected font.
       * 
       * @param {any} data The theme object with the new font settings.
       */
      updateFont: function (data) {
        var currentFont = 'sans-serif';

        switch (data['font-chooser'].toLowerCase()) {
          case 'normal fonts':
          currentFont = '"Segoe UI", Helvetica, Arial, sans-serif';
          break;

          case 'thin fonts':
          currentFont = 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif';
          break;
        }

        jss.set('body', {
          'font-family': currentFont,
        });
      },
    };

    return script;
  });
