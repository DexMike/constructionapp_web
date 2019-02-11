import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('development')
};

export default {
  devtool: 'inline-source-map',
  entry: [
    'babel-polyfill',
    'eventsource-polyfill',
    path.resolve(__dirname, 'src/index')
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },
  devServer: {
    port: 8081,
    disableHostCheck: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/subpage/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    },
    contentBase: path.resolve(__dirname, 'src'),
    inline: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: './dist/index.html',
      favicon: 'public/favicon32.png'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
    // new Dotenv()
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, './src')],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['transform-class-properties']
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
        use: ['file-loader']
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'url-loader',
        options: { prefix: 'font', limit: 5000 }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: { limit: 10000, mimetype: 'application/octet-stream' }
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
