const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV || 'development',

  entry: './client/index.jsx',

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 3000,
    hot: true,
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'app.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({ template: './client/index.html' }),
    new webpack.NamedModulesPlugin(), // for HMR
    new webpack.HotModuleReplacementPlugin(),
  ],
}
