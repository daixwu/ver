const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
const WebpackBar = require('webpackbar')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { VueLoaderPlugin }  = require('vue-loader')

const envDefaults = {
  prod: false,
}
module.exports = (env = envDefaults) => {
  return  {
    target: 'web',
    stats: "errors-only",
    entry: {
      main: './src/main.js'
    },
    output: {
      path: resolve(__dirname, '../dist'),
      filename: 'js/[name].[chunkhash:8].js',
      publicPath: env.prod === true ? './' : '/',
      clean: true
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue': '@vue/runtime-dom',
        '@': resolve(__dirname, './src'),
        assets: resolve(__dirname, './src/assets/'),
        img: resolve(__dirname, './src/assets/images'),
        utils: resolve(__dirname, './src/utils'),
        api: resolve(__dirname, './src/api'),
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    cacheDirectory: true
                  }
                }
              ]
            },
            {
              test: /\.(scss|css)$/,
              use: [
                env.prod === true ? 
                {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: '../'
                  }
                } : 'style-loader',
                'css-loader',
                'postcss-loader',
                'sass-loader',
              ]
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/,
              type: 'asset/resource',
              generator: {
                filename: 'fonts/[name].[hash:8][ext]'
              }
            },
            {
              test: /\.(png|jpg|jpeg|gif|svg)$/,
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 2 * 1024
                }
              },
              generator: {
                filename: 'images/[name].[hash:8][ext]',
              },
            },
          ]
        },
        {
          test : /\.vue$/,
          use  : 'vue-loader',
        }
      ]
    },
    plugins: [
      new WebpackBar(),
      new FriendlyErrorsWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(__dirname, '../public/index.html'),
        filename: "index.html",
        title: 'webpack5+vue3',
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
        },
      }),
      new VueLoaderPlugin(),
      new ESLintPlugin(),
  
      new DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(env.prod === true ? 'production' : 'development'),
        },
        __VUE_OPTIONS_API__   : JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__ : JSON.stringify(env.prod !== false),
      })
    ],
    performance: {
      maxEntrypointSize: 50000000,
      maxAssetSize: 30000000,
    },
  }
}