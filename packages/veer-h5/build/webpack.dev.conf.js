const { merge } = require('webpack-merge')
const webpackConfigBase = require('./webpack.base.conf')

module.exports = merge(webpackConfigBase(), {
  mode:'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    contentBase: './dist',
    compress: true,
    port: 8008,
    open: true,
    hot: true,
    inline: true
  },
})