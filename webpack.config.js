const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 引入 MiniCssExtractPlugin

module.exports = {
    // 假设 src 目录下的 AttractionList.ts 是入口文件，你可按需调整
    entry: './src/components/AttractionList.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        // 使用 [name] 和 [contenthash] 可以更好地管理缓存和代码分割
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js', // 配置动态导入生成的 chunk 文件名
        clean: true // Webpack v5+ 内置了 clean 功能，可以替代 CleanWebpackPlugin
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                // 添加 CSS 处理规则
                test: /\.css$/,
                use: [
                    // 在开发环境可以使用 'style-loader'，生产环境常用 MiniCssExtractPlugin.loader
                    // 'style-loader', // 开发环境
                    MiniCssExtractPlugin.loader, // 生产环境，提取 CSS 到文件
                    'css-loader' // 处理 CSS 文件中的 @import 和 url()
                ]
            }
        ]
    },
    plugins: [
        // new CleanWebpackPlugin(), // 如果使用了 output.clean: true, 则不需要这个插件
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html'
        }),
        // 添加 MiniCssExtractPlugin 实例
        new MiniCssExtractPlugin({
            // 配置输出的 CSS 文件名
            filename: '[name].[contenthash].css'
        })
    ],
    mode: 'development', // 或 'production'
    // 配置开发服务器 (可选，方便开发调试)
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // 将 dist 目录作为服务器的根
        },
        compress: true, // 启用 gzip 压缩
        port: 9000, // 服务器端口，你可以改成别的
        open: true, // 自动打开浏览器
        historyApiFallback: true, // 解决单页面应用路由问题 (如果需要的话)
    }
};