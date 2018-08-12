const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        haml: {
            dist: {
                files: {
                    'dist/start.html': 'haml/start.haml',
                },
            },
        },
        sass: {
            options: {
                sourceMap: true,
                style: 'compressed',
            },
            dist: {
                files: {
                    'dist/css/style.css': 'scss/style.scss',
                    'dist/css/reset.css': 'scss/reset.scss',
                },
            },
        },
        webpack: {
            all: {
                entry: './js/app.js',
                devtool: 'source-map',
                mode: 'production',
                output: {
                    filename: 'metro-start.js',
                    path: `${__dirname}/dist`,
                },
                stats: {
                    colors: true,
                    modules: true,
                    reasons: true,
                },
                resolve: {
                    alias: {
                        jss: '../../node_modules/jss/jss.js',
                    },
                },
                plugins: [
                    new UglifyJsPlugin({
                        'cache': true,
                        'parallel': true,
                        'sourceMap': true,
                    })],
            },
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        src: ['fonts/*', 'icons/*', 'manifest.json'],
                        dest: 'dist/',
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['node_modules/spectrum-colorpicker/spectrum.css'],
                        dest: 'dist/css',
                    },
                ],
            },
        },
        compress: {
            all: {
                options: {
                    archive: './metro-start.zip',
                    mode: 'zip',
                },
                files: [
                    {expand: true, cwd: 'dist/', src: '**/*', dest: '/'},
                ],
            },
        },
        eslint: {
            target: ['js/**/*.js'],
        },
        watch: {
            scripts: {
                files: [
                    'js/**/*.js',
                    'scss/*.scss',
                    'fonts/*.ttf',
                    'haml/start.haml',
                ],
                tasks: ['test', 'notify:build'],
                options: {
                    spawn: false,
                },
            },
        },
        notify: {
            build: {
              options: {
                message: 'Build complete',
              },
            },
        },
    });

    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-haml2html');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('gruntify-eslint');

    grunt.registerTask('build', ['webpack', 'haml', 'sass', 'copy']);
    grunt.registerTask('test', ['build', 'eslint']);

    grunt.registerTask('publish', ['test', 'compress']);
    grunt.registerTask('default', ['test']);
};
