define(['jquery', 'jquery-color', 'jss', './util', './storage'],
  function (jquery, jqueryColor, jss, util, storage) {
    var fonts = ['"Segoe UI", Helvetica, Arial, sans-serif', 'Raleway, "Segoe UI", Helvetica, Arial, sans-serif'];

    var script = {
      init: function () { },

      /**
      Updates the page style with colors provided.
      theme: The new theme to use.
      transition: If true, animate the color transition.
      */
      updateStyle: function (theme, transition) {
        this.updateFont();

        var options_color = theme.colors['options-color'];
        var background_color = theme.colors['background-color'];
        var main_color = theme.colors['main-color'];
        var title_color = theme.colors['title-color'];

        // Animate the color transition.
        var duration = 1200;
        if (transition === false) {
          duration = 0;
        }

        jquery('*').animate({ 'borderColor': options_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('*').animate({ 'color': main_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('.background-color').animate({ 'backgroundColor': background_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('.titles-color').animate({ 'color': title_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('body').animate({ 'color': main_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('input').animate({ 'color': main_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('.options-color').animate({ 'color': options_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('#picker').animate({ 'borderColor': options_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('.overlay').animate({ 'backgroundColor': options_color }, { duration: duration, queue: false, easing: 'linear' });
        jquery('.bookmark-active').animate({ 'backgroundColor': options_color }, { duration: duration, queue: false, easing: 'linear' });

        // ...poor sods that can't be animated. SAD!
        jss.set('::-webkit-scrollbar', {
          'background': background_color
        });
        jss.set('::-webkit-scrollbar-thumb', {
          'background': options_color
        });
        jss.set('::-webkit-input-placeholder', {
          'background': main_color
        });
        jss.set('.pagebase-grouped > .group > .page', {
          'border-top-style': 'solid',
          'border-top-width': '1px'
        });
        jss.set('#picker', {
          'border': '1px solid'
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
