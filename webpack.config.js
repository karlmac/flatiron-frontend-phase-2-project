const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js', // Entry point of your application
  output: {
    path: path.join(__dirname, 'dist'), // Output directory for bundled files
    filename: 'bundle.js', // Name of the bundled JavaScript file
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        //use: 'babel-loader', // Use Babel for transpiling JavaScript/JSX,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML template
    }),
  ],
  devServer: {
    //contentBase: path.join(__dirname, 'dist'), // Serve content from the 'dist' directory
    port: 8080, // Port for the development server
  },
};

/*
const cpath = import('path');
const HtmlWebpackPlugin = import('html-webpack-plugin');

module.exports = {
  //entry: cpath.join(__dirname, "src", "index.js"),
  output: {
    //path:cpath.resolve(__dirname, "dist"),
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
    //new HtmlWebpackPlugin({
      //template: cpath.join(__dirname, "src", "index.html"),
    //}),
  ],
}
*/