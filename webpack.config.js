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
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    // {
                    // 	loader: 'file-loader',
                    // 	options: {
                    // 		name: 'css/[name].css',
                    // 	}
                    // },
                    // // Compiles Sass to CSS
                    // 'sass-loader',
                ],
            },
        ]
    },
    resolve: {
        alias: {
            jss: '../../node_modules/jss/jss.js',
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'manifest.json' },
                { from: 'html/start.html' },
                { from: 'icons/*' }
            ],
        }),
        new ZipPlugin({
            // OPTIONAL: defaults to the Webpack output filename (above) or,
            // if not present, the basename of the path
            filename: 'metro-start.zip'
        })
    ]
};