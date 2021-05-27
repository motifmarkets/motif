// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires

module.exports = {
    entry: [
        path.resolve(__dirname, "src/index.ts"),
    ],

    output: {
        filename: 'tsdemo.js',
        path: path.resolve(__dirname, 'dist/'),
    },

    devtool: 'source-map',

    devServer: {
        port: 3000,
        writeToDisk: true,
        publicPath: 'dist/',
        contentBase: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.js'],
        symlinks: true,
    },

    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        "configFile": "../tsconfig.json",
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            // {
            //     test: /\.js$/,
            //     enforce: 'pre',
            //     use: ['source-map-loader'],
            
            // },
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            env: JSON.stringify(process.env)
        }),
    ]
};
