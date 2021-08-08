# webpack

## webpack 打包配置

- [打包css样式资源](#cssLoader)
- [打包HTML资源](#htmlLoader)
- [打包图片资源](#imgLoader)
- [打包其它资源](#otherLoader)
- [开发服务配置 devServer](#devServer)
- [js 语法检查 eslint](#eslint)
- [html 和 js 压缩](#htmljs)

## webpack 开发环境性能优化

- 优化打包构建速度
  - [HMR 模块热替换](#hmr)
- 优化代码调试
  - [source-map](#sourcemap)

## webpack 生产环境性能优化

- 优化打包构建速度
  - [oneOf](#oneOf)
  - [babel 缓存](#babel)
  - [多进程打包](#thread)
  - [externals](#externals)
  - [dll](#DLL)
- 优化代码运行的性能
  - [缓存(hash-chunkhash-contenthash)](#hash)
  - [tree shaking](#treeShaking)
  - [code split](#codeSplit)
  - [懒加载 / 预加载](#prefetch)
  - [PWA](#PWA)

## webpack 是什么

- webpack 是一种前端资源构建工具，一个静态模块打包器(module bundler)

- 在webpack 看来, 前端的所有资源文件(js/json/css/img/less/scss等等)都会作为模块处理

- 它将根据模块的依赖关系进行静态分析，打包生成对应的静态资源(bundle)

## webpack 常用配置详解

### Entry 入口

指示 webpack 以哪个文件为入口起点开始打包，分析构建内部依赖图。

**entry 的几种写法**：

```js
entry:'./src/index.js'
```

字符串的形式：单进单出(打包形成一个chunk，输出一个bundle文件，chunk默认名称是main)

```js
entry: ['./src/a.js','./src/b.js']
```

数组的形式：支持多进单出(打包形成一个chunk，输出一个bundle文件，只有在HMR功能中让html热更新生效才会使用)

```js
entry:{
  a: './src/a.js',
  b: './src/b.js'
}
```

对象的形式：支持多进多出(有几个入口文件就形成几个chunk，输出几个bundle文件，chunk名称为 key)

```js
entry:{
  a: ['./src/a.js', './src/c.js'],
  b: './src/b.js'
}
```

特殊用法，dll打包时会使用

### Output 输出

指示 webpack 打包后的资源 bundles 输出到哪里去，以及如何命名。

```js
output: {
  // 输出文件目录（将来所有资源输出的公共目录）
  path: path.resolve(__dirname, 'dist'), 
  // 文件名称（指定名称 + 目录）
  filename: 'js/[name].js', 
  // 所有资源引入公共路径前缀 'img/a.jpg' --> '/img/a.jpg'
  publicPath: '/',
  // 非入口chunk的名称 (如 import 动态导入)
  chunkFilename: 'js/[name].[chunkhash].js'
  // 整个库向外暴露的变量名，自己写库的时候使用
  library: '[name]',
  // 变量名添加到哪个上 window / global / commonjs
  libraryTarget: 'window'
}
```

### Loader

让 webpack 能够去处理那些非 JS 的文件，比如样式文件、图片文件(webpack 自身只理解JS)

```js
module: {
  rules: [
    // loader 的配置
    {
      test: /\.css$/,
      // 多个 loader 用 use
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\js$/
      // 排除 node_modules 下的js文件
      exclude: /node_modules/,
      // 只检查src下的js文件
      include: resolve(__dirname, 'src'),
      // 优先执行
      enforce: 'pre',
      // 延后执行
      // enforce: 'post',
      // 单个loader用loader
      loader: 'babel-loader',
      options: {}
    },
    {
      // 以下配置只会生效一个
      oneOf: []
    }
  ]
}
```

### resolve 简写路径

```js
module.exports = {
  // 解析模块的规则
  resolve: {
    // 配置解析模块路径别名 优点：简写路径 缺点：写路径无提示
    alias: {
      $: resolve(__dirname, 'src')
    },
    // 配置省略文件路径的后缀名
    extensions: ['.js', '.json', '.jsx'],
    // 告诉 webpack 解析模块是去哪个目录
    modules: [resolve(__dirname, '../../node_modules')]
  }
}
```

### optimization(生产环境配置)

```js
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',

      // 注：以下为默认值，可不写
      // 分割的chunk最小为30kb
      minSize: 30 * 1024,
      // 最大没有限制
      maxSize: 1,
      // 要提取的chunk最少被引用1次
      minChunks: 1,
      // 按需加载时并行加载的文件的最大数量
      maxAsyncRequests: 5,
      // 入口js文件最大并行请求数量
      maxInitialRequests: 3,

      // 名称连接符
      automaticNameDelimiter: '~',
      // 可以使用命名规则
      name: true,
      // 分割 chunk 的组
      cacheGroups: {
        // node_modules 文件会被打包到 vendors 组的 chunk 中 --> vendors~xxx.js
        // 满足上面的公共规则
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          // 优先级
          priority: -10
        },
        default: {
          // 要提取的chunk最少引用2次
          minChunks: 2,
          // 优先级
          priority: -20,
          // 如果当前要打包的模块和之前被提到的模块是同一个，就会复用，而不是重新打包
          reuseExistingChunk: true
        }
      }
    },
    // 将当前模块的记录的其它模块的hash单独打包为一个文件 runtime
    // 解决问题：修改a文件导致b文件的 contenthash 变化
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
    minimizer: {
      // 配置生产环境的压缩方案：js 和 css
      new TerserPlugin({
        // 开启缓存
        cache: true,
        // 开启多进程打包
        parallel: true,
        // 启动source-map
        sourceMap: true
      })
    }
  }
}
```

### Plugins 插件

可以用于执行范围更广的任务。插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量等

### Mode 模式

指示 webpack 使用相应模式的配置

| 选项 | 描述 | 特点 |
| -- | -- | -- |
| development | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin | 能让代码本地调试运行的环境 |
| production | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 TerserPlugin | 能让代码优化上线运行的环境 |

## <span id="cssLoader">⚓️</span>打包CSS样式资源

### sass-loader

- 将scss编译为css，需安装node-sass
- 安装: npm i sass-loader node-sass -D

### postcss-loader

- css兼容性样式处理，可在 package.json 中配置 browserslist，postcss 通过配置加载指定的css兼容性样式（通过设置nodejs环境变量 process.env.NODE_ENV里指定环境，默认为生产环境）

```json
// package.json
{
  // ...
  "browserslist": {
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ],
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ]
  }
  // ...
}
```

postcss-loader 的配置可直接 rules 中配置，也可以新建 `.postcssrc` 或 `postcss.config.js`

```js
// postcss.config.js
module.exports = {
  plugins: [
    [
      'postcss-preset-env',
      {
        ident: "postcss"
      },
    ],
  ]
}
```

- 安装: npm i postcss-loader postcss-preset-env -D

### css-loader

- 将css文件解析为commonjs模块加载到JS代码中，里面内容为样式字符串
- 安装: npm i css-loader -D

### style-loader

- 创建style标签，将js中的样式资源插入标签中，添加到head中生效
- 安装: npm i style-loader -D

### mini-css-extract-plugin

- 提取js中的css成单独文件，可取代 style loader

- 安装：npm i mini-css-extract-plugin -D

### css-minimizer-webpack-plugin

- 压缩css代码 默认production mode下压缩
- 安装：npm i css-minimizer-webpack-plugin -D

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.(scss|css)$/,
        use: [
          // 取代style loader 提取js中的css成单独文件
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // 使用commonjs规范解析css，require引入可以不加.default
              esModule: false,   
              // 使url的查找路径为dist根路径
              publicPath: '../'
            }
          },
          // 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      ident: "postcss"
                    },
                  ],
                ]
              }
            }
          },
          'sass-loader',
        ]
      },
      // ...
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/app.[contenthash:8].css',
    }),
  ],

  optimization: {
    // 设置minimize为true 在 development mode下同样压缩
    // minimize: true,
    minimizer: [
      // 压缩css代码 默认production mode下压缩
      // 注意这会导致js的生产环境下无法压缩，原因是webpack认为，如果配置了minimizer，就表示开发者在自定以压缩插件。内部的JS压缩器就会被覆盖掉。所以这里还需要手动将它添加回来。webpack内部使用的JS压缩器是「terser-webpack-plugin」
      new CssMinimizerPlugin(),
      // 如果使用了css压缩插件，则需要
      new TerserPlugin()
    ],
  },
}
```

## <span id="htmlLoader">⚓️</span>打包HTML资源

### html-webpack-plugin

- 默认会创建一个空的HTML，自动引入打包输出的所有资源(js/css)
- 安装：npm i html-webpack-plugin -D

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // 复制html文件，并自动引入打包后的所有资源
      template: './src/index.html',
      // html 压缩配置
      minify:{
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
        // 压缩 去掉引号
        removeAttributeQuotes: true 
      }
    }),
  ],
}
```

## <span id="imgLoader">⚓️</span>打包图片资源

### url-loader

- 处理图片资源(url-loader 依赖 file-loader)
- 安装：npm i url-loader file-loader -D

### html-loader

- 处理html文件里的img图片（负责引入img，从而能被url-loader处理）
- 安装：npm i html-loader -D

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        // 处理图片资源
        test: /\.(png|jpg|jpeg|gif|svg)/,
        use: [
          {
            // 需要下载安装url-loader file-loader
            loader: 'url-loader',
            options: {
              // 图片重命名 [hash:7]取图片hash的前10位，[ext]取文件原来的扩展名
              name: '[name].[hash:7].[ext]',
              // 图片大小小于8kb会被转化为base64（通常8~12k的图片可考虑处理为base64）
              limit: 8 * 1024,
              outputPath: 'images',
              esModule: false
            }
          }, 
        ]
      },
      {
        test: /\.html?$/,
        // 处理html文件里的img图片（负责引入img，从而能被url-loader处理）
        loader: 'html-loader',
        options: {
          // 关闭es6模块
          esModule: false
        }
      }
      // ...
    ]
  },
}
```

## <span id="otherLoader">⚓️</span>打包其它资源

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1 * 1024,
          name: '[name].[hash:8].[ext]',
          outputPath: 'font'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1 * 1024,
          name: '[name].[hash:8].[ext]',
          outputPath: 'media'
        }
      }
      // ...
    ]
  },
}
```

## <span id="devServer">⚓️</span>开发服务配置 devServer

> webpack-dev-server 会从 output.path 中定义的目录为服务提供 bundle 文件，即，文件将可以通过 `http://[devServer.host]:[devServer.port]/[output.publicPath]/[output.filename]` 进行访问。

- 开发服务器 devServer 自动化编译、打开、刷新浏览器（只会在内存中编译打包，不会有任何输出）
- 启动devServer指令为：npx webpack server

```js
const { resolve } = require('path')

module.exports = {
  devServer: {
    // 运行代码的目录
    contentBase: resolve(__dirname, 'dist'),
    // 监视 contentBase 目录下的文件，一旦变化就会 reload
    watchContentBase: true,
    // 监视文件
    watchOptions: {
      // 忽略文件
      ignored: /node_modules/
    },
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 5000,
    // 域名
    host: 'localhost'
    // 自动打开浏览器
    open: true,
    // 开启HMR功能(修改webpack配置，新配置如想生效需要重启服务)
    hot: true,
    // 不要显示启动服务器日志信息
    clientLogLevel: 'none',
    // 除了一些基本启动信息以外，其它内容都不显示
    quiet: true,
    // 如果出错了，不要全屏提示
    overlay: false,
    // 服务器代理 --> 解决开发环境跨域问题
    proxy: {
      // 一旦devServer(5000)服务器接收到 /api/xxx 的请求，就会把请求转发到另外一个服务器(3000)
      '/api': {
        target: 'http://localhost:3000',
        // 发送请求时，请求路径重写：将 /api/xxx --> /xxx (去掉/api)
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
}
```

## <span id="eslint">⚓️</span>js 语法检查 eslint

### eslint-webpack-plugin

- 统一规范团队代码习惯，降低代码出错风险
- 安装 npm i eslint eslint-webpack-plugin -D
- 引用Airbnb规则依赖 npm i eslint-config-airbnb-base  eslint-plugin-import -D
- [babel-eslint](https://www.npmjs.com/package/babel-eslint) 将不能被常规linter解析的代码转换为能被常规解析的代码，注意和 eslint 版本对应 npm i babel-eslint -D

```js
// webpack.config.js
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
   plugins: [
     // js语法检查 配置参考：https://zhuanlan.zhihu.com/p/347103745
    new ESLintPlugin(),
   ]
}
```

```js
// .eslintrc.js
// root - 限定配置文件的使用范围
// parser - 指定eslint的解析器
// parserOptions - 设置解析器选项
// extends - 指定eslint规范
// plugins - 引用第三方的插件
// env - 指定代码运行的宿主环境
// rules - 启用额外的规则或覆盖默认的规则
// globals - 声明在代码中的自定义全局变量

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: 'airbnb-base',
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: ['warn', 'never'],
  },
}

// .eslintignore
// /build/
// /config/
// /dist/
// /*.js
```

配置参见：[webpack之ESlint配置](https://zhuanlan.zhihu.com/p/347103745)

## <span id="babel">⚓️</span>js 兼容性处理 babel

### babel-loader

- js 兼容处理，也可在 .babelrc 中配置
- 安装 npm i babel-loader @babel/core @babel/preset-env -D

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false,
                    // 需要兼容到以下浏览器的什么版本
                    "targets": [
                      '> 1%',
                      'last 2 versions',
                      'Firefox ESR',
                    ],
                    // 按需引入 polyfill
                    "useBuiltIns": "usage",
                    // 指定core-js版本 npm i core-js -D
                    "corejs": "3.15",
                  }
                ]
              ],
              // 开启 babel 缓存，第二次构建时会读取之前的缓存，速度会更快一些
              cacheDirectory: true
            }
          }
        ]
      },
      // ...
    ]
  },
}
```

## <span id="htmljs">⚓️</span>html 和 js 压缩

> 注：js 生产环境下会自动压缩，但需注意如果有配置css压缩，需要手动将js压缩配置添加回来，webpack内部使用的JS压缩器是「terser-webpack-plugin」

```js
const TerserPlugin = require("terser-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      // 复制html文件，并自动引入打包后的所有资源
      template: './src/index.html',
      // html 压缩配置
      minify:{
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
        // 压缩 去掉引号
        removeAttributeQuotes: true 
      }
    }),
  ],
  optimization: {
    // 设置minimize为true 在 development mode下同样压缩
    // minimize: true,
    usedExports: true,
    minimizer: [
      // 压缩css代码 默认production mode下压缩
      // 注意这会导致js的生产环境下无法压缩，原因是webpack认为，如果配置了minimizer，就表示开发者在自定以压缩插件。内部的JS压缩器就会被覆盖掉。所以这里还需要手动将它添加回来。webpack内部使用的JS压缩器是「terser-webpack-plugin」
      new CssMinimizerPlugin(),
      // 如果使用了css压缩插件，则需要
      new TerserPlugin()
    ],
  },
  // 生产环境下会自动压缩js代码
  mode: 'production',
}
```

## <span id="hmr">⚓️</span>HMR 热模块替换 / 模块热替换

- 作用是一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块），极大提升构建速度

```js
const { resolve } = require('path')

module.exports = {
  devServer: {
    contentBase: resolve(__dirname, 'dist'),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true,
    // 开启HMR功能(修改webpack配置，新配置如想生效需要重启服务)
    hot: true,
    inline: true
  },
}
```

- **样式文件**：可以使用 HMR 功能，因为 style-loader 内部的实现

- **js 文件**：默认没有 HMR 功能 --->需要修改非入口文件 js

```js
if (module.hot) {
  // 一旦 module.hot 为 true，说明开启了HMR功能 ---> 让HMR功能代码生效
  module.hot.accept("./print.js", () => {
    // 方法会监听 print.js 文件的变化，一旦发生变化，其他模块不会重新打包构建
    // 会执行后面的回调函数
    print();
  });
}
```

- **HTML 文件**：默认没有 HMR 功能，同时导致html文件不能热更新的问题。(html 可以不用做HMR功能) 解决：修改 entry 入口将 html 文件引入（`entry: ['./src/main.js', './src/index.html']`）

## <span id="sourcemap">⚓️</span>source-map 优化代码调试

一种提供源代码到构建后代码映射（如果构建后代码出错，可通过映射追踪源代码错误）

```js
devtool: "source-map"
```

```js
[inline- | hidden- | eval-][nosources-][cheap-[module-]]source-map
```

- source-map: 提示错误代码准确信息以及源代码的错误位置
- inline-source-map: 内联（只生成一个source-map，同样提供错误代码准确信息以及源代码的错误位置）
- hidden-source-map: 外部（只隐藏源代码，提供错误代码错误原因，但是没有错误位置，不能追踪源代码错误，只能提示到构建后代码的错误位置）
- eval-source-map：内联（每一个文件都生成对应的source-map，都在eval函数中）
- nosources-source-map：外部（全部隐藏，提示错误代码准确信息，但是没有任何源代码信息）
- cheap-source-map：外部（提示错误代码信息以及源代码的错误位置，错误信息只能精确到行）
- cheap-module-source-map：外部（module会将loader的source map加入）

> 内联和外部的区别：1、外部生成文件，内联没有 2、内联构建速度更快

**开发环境**：速度快(eval>inline>cheap eval-cheap-source-map 最快 eval-source-map 其次)，调试更友好(source-map 最友好，cheap-module-source-map 其次，cheap-source-map)，平常开发中折中一般使用 eval-source-map / eval-cheap-module-source-map

**生产环境**：源代码要不要隐藏？调试要不要友好？一般不使用内联，因为其会导致代码体积增大，生产环境一般使用 source-map / cheap-module-source-map，需要隐藏则使用 hidden-source-map(只隐藏源代码，会提示构建后代码错误信息) / nosources-source-map(全部隐藏)

## <span id="oneOf">⚓️</span>oneOf 提升打包构建速度

- oneOf 中的 loader 只会匹配一个，需要注意的是 oneOf 不能有两个配置处理同一类型的文件，如有可提到外面去

```js
rules: [
  {
    // 正常来讲，一个文件只能被一个loader处理，当一个文件要被多个loader处理，那么一定要指定loader的先后顺序
    oneOf: [
      { ... },
    ],
  },
];
```

## <span id="babel">⚓️</span>开启 babel 缓存（让第二次打包速度更快）

开启 babel 缓存，第二次构建时会读取之前的缓存，速度会更快一些

```js
{
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: /(node_modules|bower_components)/,
  options: {
    presets: [
      [
        '@babel/preset-env',
        {
          // 需要兼容到以下浏览器的什么版本
          "targets": [
            '> 1%',
            'last 2 versions',
            'Firefox ESR',
          ],
          // 按需引入 polyfill
          "useBuiltIns": "usage",
          // 指定core-js版本
          "corejs": "3.15",
        }
      ]
    ],
    // 开启 babel 缓存，第二次构建时会读取之前的缓存，速度会更快一些
    cacheDirectory: true
  }
}
```

## <span id="hash">⚓️</span>文件资源缓存机制（让代码上线运行缓存更好用）

webpack 中对于输出文件名可以有三种 hash 值：1. hash； 2. chunkhash； 3. contenthash。

### hash

hash是跟整个webpack构建项目相关的，每次项目构建hash对应的值都是不同的，即使项目文件没有做“任何修改”。

其实是有修改的，因为每次webpack打包编译都会注入webpack的运行时代码，导致整个项目有变化，所以每次hash值都会变化的。

可以看出，前后两次对应项目构建hash改变了。由此推断使用该方式是无法达到缓存的，因为每次hash都会变化。

```js
module.exports = {
  output: {
    filename: "js/[name]_[hash:8].js",
    path: path.resolve(__dirname, "../dist"),
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name]_[hash:8].css",
    }),
  ],
}
```

### chunkhash

chunkhash，从字面上就能猜出它是跟webpack打包的chunk相关的。具体来说webpack是根据入口entry配置文件来分析其依赖项并由此来构建该entry的chunk，并生成对应的hash值。不同的chunk会有不同的hash值。一般在项目中把公共的依赖库和程序入口文件隔离并进行单独打包构建，用chunkhash来生成hash值，只要依赖公共库不变，那么其对应的chunkhash就不会变，从而达到缓存的目的。

一般在项目中对webpack的entry使用chunkhash，具体表现在output配置项上：

```js
module.exports = {
  entry: {
   app: './entry'
   vendor: ['vue', 'other-lib']
  },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].[chunkhash].js'
  }
}
```

但是如果文件之间建立了依赖关系，比如 js 中引入了 css 那么它们的 chunkhash 是一样的，这样还是存在缓存没有被充分利用的问题。

### contenthash

contenthash表示由文件内容产生的hash值，内容不同产生的contenthash值也不一样。在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。比方在webpack配置这样来用

```js
module.exports = {
  ...
  plugins: [
     new ExtractTextPlugin({
    filename: 'static/[name]_[chunkhash:7].css',
    disable: false,
    allChunks: true
     })
  ...
  ]
}
```

上面配置有一个问题，因为使用了chunkhash，它与依赖它的chunk共用chunkhash。

比方在上面app chunk例子中依赖一个index.css文件，index.css的hash是跟着app的chunkhash走的，只要app文件变更的话，那么即使index.css文件没有变化，它的hash值也是会跟着变化的，导致缓存失效。

那么这时我们可以使用extra-text-webpack-plugin里的contenthash值，保证即使css文件所处的模块里就算其他文件内容改变，只要css文件内容不变，它的hash值就不会变。

参见：[webpack hash哈希值](https://www.jianshu.com/p/b83f4a046399)

## <span id="treeShaking">⚓️</span>tree shaking

前提：1、必须使用 ES6 模块化 2、开启 production 环境

作用：可减少代码体积

需要在 package.json 中配置 `"sideEffects": false`，意为所有代码都没有副作用（都可以进行 tree shaking），设置后可能会把 css 等副作用文件干掉，配置为`"sideEffects": ["*.css", "*.scss"]`可以规避

## <span id="codeSplit">⚓️</span>code split(按需加载)

- 多入口方式

```js
module.exports = {
  entry: {
    app: './src/main.js',
    test: './src/test.js'
  },
  output: {
    filename: 'js/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
  },
}
```

- `optimization.splitChunks` 配置

1、可以将 node_modules 中的代码单独打包成一个chunk 最终输出

2、会自动分析多入口 chunk 中有没有公共的文件，如果有会打包成单独一个 chunk

```js
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
  },
  // 1、可以将 node_modules 中的代码单独打包成一个chunk 最终输出
  // 2、会自动分析多入口 chunk 中有没有公共的文件，如果有会打包成单独一个 chunk
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
}
```

- import 动态导入语法：能将某个文件单独打包

通过 js 代码让某个文件被单独打包成一个chunk，使用 `/* webpackChunkName: 'test' */` 可命名文件名

```js
// math.js
export function square(x) {
  return x * x
}

export function cube(x) {
  return x * x * x
}

// app.js
import(/* webpackChunkName: 'test' */'./math')
  .then(({ square, cube }) => {
    console.log('square', square(2))
    console.log('cube', cube(2))
  })
  .catch(() => {
    console.log('加载失败')
  })
```

## <span id="prefetch">⚓️</span>懒加载和预加载

- 懒加载（分割代码，当文件需要时才加载）

```js
document.getElementById('btn').onclick = function() {
  // 懒加载
  import('./math')
    .then(({ square, cube }) => {
      console.log('square', square(2))
      console.log('cube', cube(2))
    })
    .catch(() => {
      console.log('加载失败')
    })
}
```

- 预加载(可以在使用之前提前加载js文件) `webpackPrefetch: true`

与正常加载的不同，正常加载可以认为是并行加载（同一时间加载多个文件），预加载是等其他资源加载完毕，浏览器空闲了再偷偷加载资源（预加载在移动端会有兼容问题）

```js
document.getElementById('btn').onclick = function() {
  // 懒加载
  import(/* webpackPrefetch: true */'./math')
    .then(({ square, cube }) => {
      console.log('square', square(2))
      console.log('cube', cube(2))
    })
    .catch(() => {
      console.log('加载失败')
    })
}
```

## <span id="PWA">⚓️</span>PWA 渐进式网络开发应用程序（离线可访问）

workbox --> workbox-webpack-plugin

```bash
npm install workbox-webpack-plugin -D
```

```js
// webpack.config.js
const workboxWebpackPlugin = require("workbox-webpack-plugin")

module.exports = {
  plugins: [
    new workboxWebpackPlugin.GenerateSW({
      // 1、帮助 serviceWorker 快速启动
      // 2、删除旧的 serviceWorker

      // 生成一个 serviceWorker 的配置文件（在入口js文件中做配置）
      clientsClaim: true,
      skipWaiting: true
    })
  ]
}

// main.js  入口js
// 注册 serviceWorker
// 处理兼容问题
// serviceWorker 代码需运行在服务器上
// 安装 npm i serve -g
// 命令 serve -s [dist] 启动服务器，将 dist 目录下所有的静态资源暴露出去
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log(
          'ServiceWorker registration successful with scope: ',
          registration.scope,
        )
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err)
      })
  })
}
```

## <span id="thread">⚓️</span>多进程打包（优化打包速度）

```bash
npm i thread-loader -D
```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          // 开启多进程打包
          // 进程开启大概为600ms，进程通信也有开销，只有工作消耗时间比较长，才需要多进程打包
          {
            loader: 'thread-loader',
            options: {
              workers: 2 // 进程2个
            }
          },
          // ...
        ]
      },
    ]
  }
}
```

## <span id="externals">⚓️</span>externals（避免通过CDN引入的库被打包进来）

```js
module.exports = {
  //...
  externals: {
    // 忽略[库名]被打包输出 --> npm 包名
    jquery: 'jQuery',
  },
}
```

## <span id="DLL">⚓️</span>DLL（性能优化，只需打包一次，不用重复打包）

```js
// webpack.dll.js
// 使用dll技术对第三方库(vue、react...)进行单独打包
// 当运行 webpack 时，默认查找 webpack.config.js 配置文件，如果需要运行 webpack.dll.js 文件则使用 webpack --config webpack.dll.js

const { resolve } = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    // 最终生成的[name] --> vue
    // ['vue'] --> 要打包的库是 vue
    vue: ['vue']

  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'dll'),
    // 打包的库里面对外暴露出去的内容叫什么名字
    library: '[name]_[fullhash:8]'
  },
  plugins: [
    // 打包生成一个 manifest.json --> 提供和库的映射
    new webpack.DllPlugin({
      // 映射库的暴露的内容名称
      name: '[name]_[fullhash:8]',
      // 输出文件路径
      path: resolve(__dirname, 'dll/manifest.json')
    })
  ],
  mode: 'production'
}


// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const webpack = require('webpack');
const { resolve } = require('path');

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // 复制html文件，并自动引入打包后的所有资源
      template: './src/index.html',
      // html 压缩配置
      minify:{
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true,
        // 压缩 去掉引号
        removeAttributeQuotes: true 
      }
    }),
    // 告诉 webpack 哪些库不参与打包，同时使用名称也得变
    new webpack.DllReferencePlugin({
      manifest: resolve(__dirname, 'dll/manifest.json')
    }),
    // 将某个文件打包输出去，并在html中自动引入该资源
    new AddAssetHtmlPlugin({
      filepath: resolve(__dirname, 'dll/vue.js'),
      includeRelatedFiles: false,
      publicPath: '',
    }),
  ]
}
```
