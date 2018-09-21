const path = require('path');

module.exports = {
  entry: './src/interpreter.js',
  devtool: 'cheap-eval-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
