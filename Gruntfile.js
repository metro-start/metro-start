/* jshint node: true */

var BelTranformPlugin = require('babel-plugin-transform-object-rest-spread');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WebpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
var OptimizeJsPlugin = require('optimize-js-plugin');

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webpack: {
            all: {
                entry: './js/app.js',
                devtool: 'source-map',
                output: {
                    filename: 'metro-start.js',
                    path: __dirname + '/dist',
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                resolve: {
                    alias: {
                        jss: '../../node_modules/jss/jss.js'
                    }
                },
                module: 
                {
                    rules: [
                        {
                        test: /\.js$/,
                        exclude: /(node_modules|dist)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                            presets: ['env'],
                            plugins: [BelTranformPlugin]
                            }
                        }
                        }]
                },
                plugins: [
                    // new WebpackUglifyJsPlugin({
                    //     cacheFolder: './cached_uglify/',
                    //     debug: true,
                    //     minimize: true,
                    //     sourceMap: true
                    // }),
                    new CopyWebpackPlugin([
                        { from: 'css', to: 'css' },
                        { from: 'icons', to: 'icons' },
                        { from: 'manifest.json' },
                        { from: 'start.html' },
                        { from: 'node_modules/spectrum-colorpicker/spectrum.css', to: 'css' }
                    ])]
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
        jshint: {
            all: [
                'js/**/*.js',
            ],
            options: {
                reporter: require('jshint-stylish'),
                'esversion': 6,
            }
        },
        watch: {
            scripts: {
                files: [
                    'js/**/*.js',
                    'start.html',
                    'css/*.css'
                ],
                tasks: ['test'],
                options: {
                    spawn: false,
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', ['webpack']);

    grunt.registerTask('build', ['webpack']);
    grunt.registerTask('test', ['webpack', 'jshint']);
    grunt.registerTask('publish', ['webpack', 'jshint', 'compress']);
};
