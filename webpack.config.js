const path = require('path');
const packageJson = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const config = {
    entry: './es6/app.js',
    devtool: 'inline-source-map',
    mode: 'production',
    optimization: {
        minimize: false,
    },
    stats: {
        colors: true,
        modules: true,
        reasons: true,
    },
    resolve: {
        alias: {
            jquery: require.resolve('jquery'),
            jss: path.resolve(__dirname, './node_modules/jss/jss.min.js'),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    }
};

var chromeConfig = Object.assign({}, config, {
    output: {
        filename: 'metro-start.js',
        path: `${__dirname}/dist/chrome`,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'html/start.html'},
                {from: 'icons/*' },
                {
                    from: 'manifest.template.json',
                    to: 'manifest.json',
                    transform(content) {
                        let manifest = JSON.parse(content.toString());
                        manifest.version = packageJson.version;
                        return JSON.stringify(manifest);
                    }
                }]}),
        new ZipPlugin({
            path: `${__dirname}/dist`,
            filename: 'metro-start-chrome.zip',
        })]
});

var firefoxConfig = Object.assign({}, config, {
    output: {
        filename: 'metro-start.js',
        path: `${__dirname}/dist/firefox`,
    },
    plugins: [new CopyPlugin({
        patterns: [
            {from: 'html/start.html'},
            {from: 'icons/*' },
            {
                from: 'manifest.template.json',
                to: 'manifest.json',
                transform(content) {
                    let manifest = JSON.parse(content.toString());
                    manifest.version = packageJson.version;
                    manifest.browser_specific_settings = {
                        gecko: {
                            id: 'metro-start@metro-start.com',
                            strict_min_version: '77.0'
                        }
                    };
                    return JSON.stringify(manifest);
                }
            }]
    }),
    new ZipPlugin({
        path: `${__dirname}/dist`,
        filename: 'metro-start-firefox.zip',
    })]});

var xcodeConfig = Object.assign({}, config, {
    output: {
        filename: 'metro-start.js',
        path: `${__dirname}/dist/xcode`,
    },
    plugins: [new CopyPlugin({
        patterns: [
            {from: 'html/start.html'},
            {from: 'icons/*' },
            {
                from: 'manifest.template.json',
                to: 'manifest.json',
                transform(content) {
                    let manifest = JSON.parse(content.toString());
                    manifest.version = packageJson.version;
                    return JSON.stringify(manifest);
                }
            }]
    }),
    new ZipPlugin({
        path: `${__dirname}/dist`,
        filename: 'metro-start-xcode.zip',
    })]});
    
module.exports = [chromeConfig, firefoxConfig, xcodeConfig];