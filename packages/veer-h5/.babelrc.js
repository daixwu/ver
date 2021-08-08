module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        "targets": [
          '> 1%',
          'last 2 versions',
          'Firefox ESR',
        ],
        "useBuiltIns": "usage",
        "corejs": "3.16.0",
      }
    ],
    'vue',
  ]
}