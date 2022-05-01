/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const pkg = require('../../../package.json');

module.exports = {
  entry: './src/web/index.tsx',
  optimization: {
    usedExports: true,
  },
  output: {
    filename: 'assets/js/[name].[contenthash].js',
    path: path.resolve(__dirname, '../../../dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',

          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: './assets/fonts/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@tensorflow/tfjs$': path.resolve(
        __dirname,
        './custom_tfjs/custom_tfjs.js',
      ),
      '@tensorflow/tfjs-core$': path.resolve(
        __dirname,
        './custom_tfjs/custom_tfjs_core.js',
      ),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_PRODUCTION: process.env.NODE_ENV === 'production',
      PNM_VERSION: JSON.stringify(pkg.version),
      BUILD_TIME: Math.floor(Date.now() / 1000),
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash].css',
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/web/index.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: './src/web/login.html',
      inject: false,
    }),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/web/assets',
          to: 'assets',
          globOptions: {
            ignore: ['assets/fonts', '**/assets/tflite'],
          },
          info: { minimized: true },
        },
        {
          from: 'src/web/assets/tflite/*',
          to() {
            return 'assets/js/[name][ext]';
          },
        },
      ],
    }),
    new ESLintPlugin({
      extensions: ['js', 'ts', 'tsx', 'jsx'],
      fix: true,
      exclude: ['node_modules'],
    }),
  ],
};
