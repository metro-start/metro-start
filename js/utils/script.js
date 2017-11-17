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
          'background': mainColor
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
        jss.set('.theme-section', {
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
      },

      updateBackground: function (data) {
        var jBody = jquery('body');
        if (data['background-chooser'] === 'trianglify') {
          var xColors = [data.backgroundColor];

          var triVariance = 0.75;
          switch (data['trivariance-chooser'].toLowerCase()) {
            case 'uniform':
              triVariance = 0;
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
            case 'neighbors':
              var hsl = tinycolor(data.backgroundColor).toHsl();
              xColors = [
                data.backgroundColor,
                tinycolor({ h: hsl.h + 90 % 360, s: hsl.s, l: hsl.l }).toHexString(),
                tinycolor({ h: hsl.h + 180 % 360, s: hsl.s, l: hsl.l }).toHexString(),
                tinycolor({ h: hsl.h + 270 % 360, s: hsl.s, l: hsl.l }).toHexString()
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
            case 'analogous':
              xColors = tinycolor(data.backgroundColor).analogous().map(v => v.toHexString());
              break;
            case 'split complements':
              xColors = tinycolor(data.backgroundColor).splitcomplement().map(v => v.toHexString());
              break;
            default:
              console.error("Could not recognize tristyle: " + data['tristyle-chooser']);
              break;
          }

          console.log(xColors);

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

      updateFont: function (theme) {
        jss.set('body', {
          'font-family': fonts[theme['font-chooser']],
        });
      },
    };

    return script;
  });
