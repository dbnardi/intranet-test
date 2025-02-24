var webpack = require("webpack");

const CompressionWebpackPlugin = require('compression-webpack-plugin')


module.exports = {
  css: {
    extract: {
      filename: "[name].css",
      chunkFilename: "[name].css"
    }
  },
  filenameHashing: false,
  productionSourceMap: false,
  lintOnSave: process.env.NODE_ENV !== "production",
  runtimeCompiler: true,
  chainWebpack: config => config.optimization.minimize(true),
  configureWebpack: {
    output: {
      filename: "[name].js",
      chunkFilename: "[name].js",
      devtoolModuleFilenameTemplate: info => info.resourcePath.match(/^\.\/\S*?\.vue$/)
        ? `webpack-generated:///${info.resourcePath}?${info.hash}`
        : `webpack-yourCode:///${info.resourcePath}`,
      devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]'
    },
    plugins: [
      new webpack.ProvidePlugin({
        moment: "moment",
        _: "lodash",
      })
    ]
  }
};
