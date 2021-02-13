const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    entry: './js/app.js',
    devtool: 'inline-source-map',
    mode: 'production',
    optimization: {
        minimize: false,
    },
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
            jss: path.resolve(__dirname, './node_modules/jss/jss.min.js'),
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'html/start.html'},
                {from: 'icons/*', },
                {from: 'manifest.json'}
            ]
        }),
        new ZipPlugin({
            filename: 'metro-start.zip',
        })
        // new UglifyJsPlugin({
        //     'cache': true,
        //     'parallel': true,
        //     'sourceMap': true,
        //     'uglifyOptions': {
        //         'ecma': 6,
        //     },
        // }),
    ],
};