angular.module('MetroStart', []).
/**
 * "if" filter
 * Simple filter useful for conditionally applying CSS classes and decouple
 * view from controller 
 */
filter('if', function() {
  return function(input, value) {
    if (typeof(input) === 'string') {
      input = [input, ''];
    }
    return value? input[0] : input[1];
  };
});