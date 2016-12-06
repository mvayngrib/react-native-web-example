'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlPlugin = require('webpack-html-plugin');
var HasteResolverPlugin = require('haste-resolver-webpack-plugin');

var NODE_ENV = process.env.NODE_ENV;
var ROOT_PATH = path.resolve(__dirname, '..');
var PROD = 'production';
var DEV = 'development';
let isProd = NODE_ENV === 'production';

var config = {
  paths: {
    src: path.join(ROOT_PATH, '.'),
    index: path.join(ROOT_PATH, 'index.ios'),
  },
};

module.exports = {
  devtool: 'source-map',
  resolve: {
    alias: {
      'react-native': 'react-web',
      'ReactNativeART': 'react-art',
    },
    extensions: ['', '.js', '.jsx'],
  },
  entry: isProd? [
    config.paths.index
  ]: [
    'webpack-dev-server/client',
    // 'webpack/hot/only-dev-server',
    config.paths.index,
  ],
  output: {
    path: path.join(__dirname, 'output'),
    filename: 'bundle.js'
  },
  plugins: [
    new HasteResolverPlugin({
      platform: 'web',
      nodeModules: ['react-web']
    }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'NODE_ENV': JSON.stringify(isProd? PROD: DEV),
    //   },
    //   // Tradle: {
    //   //   provider: {
    //   //     org: {
    //   //       currency: '$'
    //   //     },
    //   //     style: {}
    //   //   }
    //   // }
    // }),
    new webpack.ProvidePlugin({
      React: "react"
    }),
    // isProd? new webpack.ProvidePlugin({
    //   React: "react"
    // }): new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlPlugin({
      template: path.resolve(ROOT_PATH, 'index-template.html'),
      filename: 'index.html'
    }),
  ],
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ],
    loaders: [{
      test: /\.json$/,
      loader: 'json',
    }, {
      test: /\.jsx?$/,
      loaders: ['babel?stage=1'],
      include: [config.paths.src, /node_modules\/tcomb-form-native.*/], ///node_modules\/tcomb\-form\-native/],
      exclude: [/node_modules\/.*node_modules/]
    }, ]
  }
};
