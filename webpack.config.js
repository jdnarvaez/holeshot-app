
const Autoprefixer = require('autoprefixer');
const PostCSSAssetsPlugin = require('postcss-assets-webpack-plugin');
const PostCSSCustomProperties = require('postcss-custom-properties');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const rtl = require('postcss-rtl');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GoogleFontsPlugin = require('google-fonts-plugin');

// const services =  require('./services/services');
const getPortSync = require('get-port-sync');
let   freePort    = null;
try       { freePort = getPortSync() }
catch (e) { /* boo */}

const pages = ['index'];
const entry = {};
const plugins = [];
const isDevServer = path.basename(require.main.filename).indexOf('webpack-dev-server.js') >= 0;

const babelOptions = {
  presets : ["@babel/preset-react", [ "@babel/preset-env", { "targets" : { "browsers": ["ie >= 11"] }, "useBuiltIns" : false }]],
  plugins : ['@babel/plugin-transform-object-assign', '@babel/plugin-syntax-object-rest-spread', '@babel/plugin-proposal-class-properties']
};

if (isDevServer) {
  plugins.push(new webpack.DefinePlugin({
    "IS_DEV_SERVER": true
  }))
} else {
  plugins.push(new webpack.DefinePlugin({
    "IS_DEV_SERVER": false
  }))
}

plugins.push(new EventHooksPlugin({
  afterPlugins: () => {
    if (isDevServer) {
      // services.start(freePort);
    }
  }
}))


if (!isDevServer) {
  plugins.push(new GoogleFontsPlugin({
  	"fonts": [
  		{
  			"family": "Poppins",
  			"variants": ['100', '100i', '200', '200i', '300', '300i', '400', '400i', '500', '500i', '600', '600i', '700', '700i', '800', '800i', '900', '900i'],
  			"subsets": [
  				"latin-ext"
  			]
  		}
  	],
  	"formats": [
  		"woff",
  		"woff2"
  	]
  }))  
}

pages.forEach((page) => {
  entry[page] = path.resolve(path.join(__dirname, 'www', page));

  const plugin = new HtmlWebpackPlugin({
    chunks: [page],
    filename: `${page}.html`,
    template: path.join(__dirname, 'www', `${page}.html`)
  });

  plugins.push(plugin);
});

plugins.push(new MiniCssExtractPlugin({
  filename: `[name].css`,
}));

plugins.push(new PostCSSAssetsPlugin({
  test: /\.css$/,
  log: false,
  plugins: [
    PostCSSCustomProperties({ preserve: true }),
  ],
}));

plugins.push(new OptimizeCSSAssetsPlugin({
  cssProcessorPluginOptions: {
    preset: ['default', { discardComments: { removeAll : true } }],
  }
}));

// Create the app-level configuration
const config = {
  entry : entry,
  mode : isDevServer ? 'development' : 'production',
  output: {
    publicPath: '/',
		path: path.join(__dirname, 'www', 'app'),
		filename: '[name].js'
	},
  devtool: 'cheap-source-map',
  resolveLoader: {
    modules: [path.resolve(path.join(__dirname, 'node_modules')), 'node_modules'],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    alias: {
      'react' : path.resolve(__dirname, 'node_modules', 'react'),
      'react-intl' : path.resolve(__dirname, 'node_modules', 'react-intl'),
      'react-dom' : path.resolve(__dirname, 'node_modules', 'react-dom'),
      'components' : path.resolve(__dirname, 'src', 'components')
    },
  },
  plugins : plugins,
  module: {
    rules: [
      {
        test: /\.Worker\.js$/,
        exclude: /node_modules\//,
        use: [
          {
            loader: 'worker-loader',
            options: {
              name: "[name].[ext]",
            }
          },
          {
            loader: 'babel-loader',
            options: babelOptions
          }
        ]
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules\//,
        use: {
          loader: 'babel-loader',
          options: babelOptions
        }
      },
      {
        test: /\.(png|svg|jpg|gif|otf|eot|ttf|svg|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.(css|scss)$/,
        use:  ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: true,
        cache: true,
        parallel: true,
        sourceMap: isDevServer,
        terserOptions: {
          compress: {
            passes: 2,
            typeofs: false,
          },
          output: {
            beautify: false,
          }
        },
      })
    ],
  }
}

const iOSConfig = Object.assign({}, config,{
  output: {
    publicPath: 'app/',
		path: path.join(__dirname, "platforms", "ios", "www", "app"),
		filename: '[name].js'
	}
});

const androidConfig = Object.assign({}, config,{
  output: {
    publicPath: 'app/',
		path: path.join(__dirname, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'www', 'app'),
		filename: '[name].js'
	}
});

module.exports = isDevServer ? config : [config, iOSConfig, androidConfig];
