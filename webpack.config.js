const cpath = import('path');
const HtmlWebpackPlugin = import('html-webpack-plugin');

module.exports = {
  /* entry: cpath.join(__dirname, "src", "index.js"),
  output: {
    path:cpath.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: cpath.join(__dirname, "src", "index.html"),
    }),
  ],*/
}