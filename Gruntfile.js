/* jshint node: true */

var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webpack: {
            all: {
                entry: './js/app.js',
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

                // Source map option. Eval provides a little less info, but is faster
                devtool: 'eval',
                // Our loader configuration
                module: {
                    loaders: [{
                        test: /\.html$/,
                        loader: "file-loader?name=/dist/[name].[ext]"
                    },
                    {
                        test: /\.(png)$/i, 
                        loader: "file-loader?name=/dist/[name].[ext]"
                    }]
                },

                plugins: [
                    new CopyWebpackPlugin([
                        { from: 'css', to: 'css' },
                        { from: 'icons', to: 'icons' },
                        { from: 'manifest.json' },
                        { from: 'start.html' }
                    ])
                ]
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