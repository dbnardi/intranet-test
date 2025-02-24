module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: "3.6.5"
        // targets: {
        //   // browsers: ["ie >= 11"]
        //   ie: "11"
        // }
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk"
      }
    ]
  ]
};
