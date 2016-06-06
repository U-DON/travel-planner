var webpack = require('webpack');

module.exports = {
    context: __dirname,

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
        })
    ]
};
