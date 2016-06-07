var webpack = require('webpack');

module.exports = {
    context: __dirname,

    entry: {
        app: './boot.ts'
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
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require('../assets/lib/polyfills-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require('../assets/lib/vendor-manifest.json')
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
