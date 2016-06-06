var webpack = require('webpack');

module.exports = {
    context: __dirname,

    // devtool: debug ? 'inline-sourcemap' : null,

    entry: {
        'polyfills': './polyfills.ts',
        'vendor': './vendor.ts',
        'app': './boot.ts'
    },

    output: {
        filename: '[name].min.js'
    },

    resolve: {
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            }
        ]
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
