import CopyPlugin from "copy-webpack-plugin";
import ZipPlugin from 'zip-webpack-plugin';

export const entry = './js/app.js';
export const devtool = 'inline-source-map';
export const mode = 'production';
export const optimization = {
  minimize: false,
};
export const output = {
  filename: 'metro-start.js',
  path: `${__dirname}/dist`,
};
export const stats = {
  colors: true,
  modules: true,
  reasons: true,
};
export const module = {
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
      ],
    },
  ]
};
export const resolve = {
  alias: {
    jss: '../../node_modules/jss/jss.js',
  },
};
export const plugins = [
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
];