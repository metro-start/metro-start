const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        haml: {
            dist: {
                files: {
                    'dist/start.html': 'haml/start.haml'
                }
            },
        },
        webpack: {
            all: {
                entry: './js/app.js',
                devtool: 'source-map',
                output: {
                    filename: 'metro-start.js',
                    path: `${__dirname}/dist`,
                },
                stats: {
                    colors: true,
                    modules: true,
                    reasons: true
                },
                resolve: {
                    alias: {
                        jss: '../../node_modules/jss/jss.js'
                    }
                },
                plugins: [
                    new CopyWebpackPlugin([
                        { from: 'css', to: 'css' },
                        { from: 'fonts', to: 'css' },
                        { from: 'icons', to: 'icons' },
                        { from: 'manifest.json' },
                        { from: 'node_modules/spectrum-colorpicker/spectrum.css', to: 'css' }
                    ]),
                    new UglifyJsPlugin({
                        'cache': true,
                        'parallel': true,
                        'sourceMap': true
                    })]
            }
        },
        compress: {
            all: {
                options: {
                    archive: './metro-start.zip',
                    mode: 'zip'
                },
                files: [
                    { cwd: 'dist/', src: '**', expand: true }
                ]
            }
        },
        eslint: {
            target: ['js/**/*.js']
        },
        watch: {
            scripts: {
                files: [
					'js/**/*.js',
					'css/*.css',
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
              }
            }
        }
    });

    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-haml2html');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('gruntify-eslint');

    grunt.registerTask('build', ['webpack', 'haml']);
    grunt.registerTask('test', ['build', 'eslint']);
    
    grunt.registerTask('publish', ['test', 'compress']);
    grunt.registerTask('default', ['test']);
};
