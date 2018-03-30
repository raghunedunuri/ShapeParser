var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/app/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'shapes.js'
  },

  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },


      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test:  /\.html$/,
        exclude:  /node_modules/,
        loader:  'html-loader'
      },
      {
        test:  /font-awesome\.config\.js/,
        use:  [
          {  loader:  'style-loader'  },
          {  loader:  'font-awesome-loader'  }
        ]
      },
      {
        test:  /bootstrap\/dist\/js\/umd\//,  use:  'imports-loader?jQuery=jquery'
      },
      // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader" },
      {
        test: /\.(png|jpg|svg|ttf|eot|svg|otf)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 750000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  }
};