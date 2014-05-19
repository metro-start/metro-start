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
            all : {
                options : {
                    specs : 'spec/*.spec.js',
                    helpers: 'spec_helper.js',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: './',
                            paths: {
                                'util': 'js/util',
                                'pages': 'js/pages',
                                'storage': 'js/storage',
                                'jquery': 'lib/jquery/dist/jquery'
                            },
                            deps: ['spec/spec_helper']
                        }
                    }
                }
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
