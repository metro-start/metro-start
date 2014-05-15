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
                'js/util.js',
                'js/storage.js',
                'js/pages.js'
            ],
            options : {
                specs : 'spec/*.js',
                helpers: 'spec_helper.js',
                vendor: [
                    'lib/jquery/dist/jquery.min.js',
                    'lib/jquery-ui/ui/minified/jquery-ui.min.js',
                    'lib/angular/angular.min.js',
                    'lib/requirejs/require.js',
                ]
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
