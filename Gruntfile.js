/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    , jshint: {
        all: [
          "js/*.js"
        ]
      , options: {
          jshintrc: '.jshintrc'
        },
      }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')

  grunt.registerTask('test', ['jshint'])
  grunt.registerTask('default', ['test'])
};
