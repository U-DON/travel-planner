var webpack = require('webpack');

module.exports = {
    context: __dirname,

    entry: {
        polyfills: [
            'core-js/es6',
            'reflect-metadata',
            'zone.js/dist/zone'
        ],
        vendor: [
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/core',
            '@angular/common',
            '@angular/http',
            '@angular/router-deprecated',
            'rxjs'
        ]
    },

    output: {
        filename: '[name].js',
        library: '[name]',
        path: './assets/lib/'
    },

    plugins: [
        new webpack.DllPlugin({
            // Context is where Webpack was invoked.
            // Seems to differ from webpack-stream context.
            path: './assets/lib/[name]-manifest.json',
            name: '[name]'
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
