const webpack = require("webpack");
const withCSS = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

// fix: prevents error when .scss/css files are required by node
if (typeof require !== "undefined") {
  require.extensions[".css"] = file => {};
  require.extensions[".scss"] = file => {};
  require.extensions[".less"] = file => {};
}

module.exports = withCSS({
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

    if (isServer) {
      const antStyles = /antd\/.*?\/style\/css.*?/;
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback();
          if (typeof origExternals[0] === "function") {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === "function" ? [] : origExternals)
      ];

      config.module.rules.unshift({
        test: antStyles,
        use: "null-loader"
      });

      config.plugins.push(new ForkTsCheckerWebpackPlugin());
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        HOST: JSON.stringify(process.env.HOST),
        PORT: JSON.stringify(process.env.PORT)
      }),
      new FilterWarningsPlugin({
        exclude: /Conflicting order between:/
      })
    );

    return config;
  }
});
