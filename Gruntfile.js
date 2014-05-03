/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
        all: [
            "js/*.js"
        ]
    },
    jasmine: {
        src : [
        'lib/jquery.js',
        'lib/jquery-ui.js',
        'lib/angular.js',
        'js/util.js'
        ],
        options : {
        specs : 'test/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('test', ['jshint']);
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['test']);
};
