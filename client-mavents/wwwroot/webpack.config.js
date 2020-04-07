var webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
module.exports = {
  entry: ["babel-polyfill", "react-hot-loader/patch", "./src/index.js"],
  output: {
    filename: "../../build/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["env", { modules: false }], "react"],
            plugins: ["react-hot-loader/babel"],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  node: {
    fs: "empty",
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new Dotenv(),
  ],
  devServer: {
    contentBase: "../buiild",
    hot: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
