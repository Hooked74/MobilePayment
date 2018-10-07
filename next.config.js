const webpack = require("webpack");
const withTypescript = require("@zeit/next-typescript");
const withCSS = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const dotenv = require("dotenv");

dotenv.load({ path: ".env" });

// fix: prevents error when .scss/css files are required by node
if (typeof require !== "undefined") {
  require.extensions[".css"] = file => {};
  require.extensions[".scss"] = file => {};
}

module.exports = withTypescript(
  withCSS({
    webpack(config, options) {
      const { isServer } = options;

      config.node = {
        fs: "empty"
      };

      config = withSass({
        cssModules: true,
        cssLoaderOptions: {
          importLoaders: 1,
          localIdentName: "[name]__[local]"
        }
      }).webpack(config, options);

      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader"
      });

      if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin());

      config.plugins.push(
        new webpack.DefinePlugin({
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          HOST: JSON.stringify(process.env.HOST),
          PORT: JSON.stringify(process.env.PORT)
        })
      );

      return config;
    }
  })
);
