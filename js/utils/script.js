define(['jquery', 'jquery-color', 'jss', './util', './storage'], 
function (jquery, jqueryColor, jss, util, storage) {
  var fonts = ['"Segoe UI", Helvetica, Arial, sans-serif', 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'];

  var script = {
    init: function () { },

    /**
    Changes the style to whatever is in the scope.
    theme: The new theme to change to.
    transition: A bool indicating whether to slowly transition or immediately change.
    */
    updateStyle: function (theme, transition) {
      this.updateFont();

      var options_color = theme.colors['options-color'];
      var background_color = theme.colors['background-color'];
      var main_color = theme.colors['main-color'];
      var title_color = theme.colors['title-color'];

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

      // Animate the color transition.
      var duration = transition === true ? 800 : 0;
      jquery('.background-color').animate({ 'backgroundColor': background_color }, { duration: duration, queue: false });
      jquery('.titles-color').animate({ 'color': title_color }, { duration: duration, queue: false });
      jquery('body').animate({ 'color': main_color }, { duration: duration, queue: false });
      jquery('input').animate({ 'color': main_color }, { duration: duration, queue: false });
      jquery('.options-color').animate({ 'color': options_color }, { duration: duration, queue: false });

      // ...but then we still need to add it to the DOM.
      jss.set('.background-color', {
        'background-color': background_color
      });
      jss.set('.titles-color', {
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
        'background-color': options_color
      });
      jss.set('.message-box', {
        'background-color': options_color
      });
      jss.set('.pagebase-grouped > .group > .page', {
        'border-top-style': 'solid',
        'border-top-width': '1px',
        'border-top-color': options_color
      });
      jss.set('.pagebase-grouped > .group > .page', {
        'border-top-style': 'solid',
        'border-top-width': '1px',
        'border-top-color': options_color
      });
      jss.set('#picker', {
        'border': '1px solid ' + options_color
      });
    },

    updateFont: function () {
      jss.set('body', {
        'font-family': fonts[storage.get('currentFont', 0)],
      });
    }
  };

  return script;
});
