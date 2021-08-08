// webpack.config.js
const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin }  = require('vue-loader')
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin")

const envDefaults = {
  prod: false,
}
debugger
module.exports = (env = envDefaults) => ({
  target: 'web',
  mode: env.prod === true ? 'production' : 'development',
  devtool : env.prod === true ? 'source-map' : 'eval-cheap-module-source-map',
  entry: {
    main: './src/main.js'
  },
  output: {
      filename: 'js/[name].js',
      path: resolve(__dirname, './dist'),
      assetModuleFilename: 'images/[name].[hash][ext][query]',
      clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    
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
        test : /\.vue$/,
        use  : 'vue-loader',
      },
      {
        oneOf: [
          {
            test : /\.ts$/,
            
            use: [
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true
                }
              },
              {
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: [/\.vue$/],
                },
              },
            ],
          },
          {
            test: /\.(scss|css)$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../' // 使url的查找路径为dist根路径
                }
              },
              'css-loader',
              'postcss-loader',
              'sass-loader',
            ]
          },
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
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
            generator: {
              filename: 'fonts/[name].[hash:8][ext][query]'
            }
          },
          {
            test: /\.(png|jpg|jpeg|gif|svg)/,
            type: 'asset/resource',
          },
          {
            test: /\.html?$/,
            loader: 'html-loader',
            options: {
              esModule: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      // 复制html文件，并自动引入打包后的所有资源
      template: resolve(__dirname, './public/index.html'),
      filename: "index.html",
      // html 压缩配置
      // minify:{
      //   // 移除空格
      //   collapseWhitespace: true,
      //   // 移除注释
      //   removeComments: true,
      //   // 压缩 去掉引号
      //   removeAttributeQuotes: true 
      // }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/app.[contenthash:8].css',
    }),
    new ESLintPlugin(),

    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(env.prod === true ? 'production' : 'development'),
      },

      __VUE_OPTIONS_API__   : JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__ : JSON.stringify(env.prod !== false),
    }),

    // new workboxWebpackPlugin.GenerateSW({
    //   // 1、帮助 serviceWorker 快速启动
    //   // 2、删除旧的 serviceWorker

    //   // 生成一个 serviceWorker 的配置文件（在入口js文件中做配置）
    //   clientsClaim: true,
    //   skipWaiting: true
    // })
    
  ],
  // optimization: {
  //   minimizer: [
  //     `...`,
  //     new CssMinimizerPlugin({
  //       minimizerOptions: {
  //         preset: [
  //           "default",
  //           {
  //             discardComments: { removeAll: true },
  //           },
  //         ],
  //       },
  //     }),
  //   ],
  // },
  devServer: {
    contentBase: '/dist',
    compress: true,
    port: 3000,
    open: true,
    hot: true,
    inline: true
  },
})