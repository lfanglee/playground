module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
};
