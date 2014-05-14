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
                'js/util.js',
                'js/storage.js',
                'js/pages.js'
            ],
            options : {
                specs : 'spec/*.js',
                helpers: 'spec_helper.js'
            }
        },
        watch: {
            scripts: {
                files: [
                    'js/*.js',
                    'spec/*.js'
                ],
                tasks: ['test'],
                options: {
                    spawn: false,
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('test', ['jshint', 'jasmine']);
    grunt.registerTask('default', ['test']);
};
