import webpack from 'webpack';
import path from 'path';
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
// import CompressionPlugin from 'compression-webpack-plugin';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production')
};

process.traceDeprecation = true;

export default {
  devtool: 'source-map',
  entry: './src/index.js',
  // target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/',
    filename: 'bundle.js'
  },
  // devServer: {
  //   contentBase: './dist'
  // },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: 'src/index.html',
    //   filename: './index.html',
    //   favicon: './public/favicon.ico'
    // }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
    // initially bundle.js file is 3.7 MB

    /*
    new CompressionPlugin({
      // filename: '[path].br[query]',
      filename: '[path].gz[query]',
      // algorithm: 'brotliCompress',
      algorithm: 'gzip',
      test: new RegExp('\\.(js|css)$'),
      compressionOptions: { level: 11 },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false
    })
    */
  ],
  module: {
    rules: [
      // {
      //   test: /\.html(\?v=\d+\.\d+\.\d+)?$/,
      //   loader: 'file-loader'
      // },
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, './src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
      // {
      //   test: /\.(gif|png|jpe?g|svg)$/i,
      //   use: [{
      //     loader: 'url-loader',
      //     options: {
      //       limit: 8000,
      //       name: 'images/[hash]-[name].[ext]'
      //     }
      //   }]
      // },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[hash]-[name].[ext]'
        }
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'file-loader',
        options: {
          prefix: 'font',
          limit: 5000,
          name: 'fonts/[hash]-[name].[ext]'
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
          name: 'fonts/[hash]-[name].[ext]'
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  }
};
