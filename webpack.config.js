const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/main.tsx",
  output: {
    filename: "./dest/bundle.js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".tsx", ".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.t(s|sx)?$/,
        use: [{ loader: "ts-loader" }]
      },
      {   
        test: /\.js$/,
        use: [
          {   
            loader: "babel-loader",
            query: {
              plugins: ["transform-runtime"],
              presets: ["es2015"]
            }   
          }   
        ],  
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/index.html")
    })
  ]
};
