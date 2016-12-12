/* jshint node: true */

var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webpack: {
            all: {
                entry: './js/app.js',
                devtool: 'sourcemap',
                output: {
                    filename: 'bundle.js',
                    path: './dist',
                    sourceMapFileName: 'bundle.map'
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
                plugins: [
                    new CopyWebpackPlugin([
                        { from: 'css', to: 'css' },
                        { from: 'icons', to: 'icons' },
                        { from: 'manifest.json' },
                        { from: 'start.html' }
                    ])]
            }
        },
        jshint: {
            all: [
                "js/**/*.js"
            ]
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

    grunt.registerTask('build', ['webpack']);
    grunt.registerTask('test', ['webpack', 'jshint']);
    grunt.registerTask('default', ['webpack', 'test']);
};