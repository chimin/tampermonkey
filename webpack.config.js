const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    entry: {
        instagram: './src/instagram.ts',
        manhuagui: './src/manhuagui.ts',
        setnmh: './src/setnmh.ts',
        facebook: './src/facebook.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].user.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new ZipPlugin({
            path: path.resolve(__dirname, 'out'),
            filename: 'tampermonkey.zip',
            pathPrefix: '',
        })
    ]
};