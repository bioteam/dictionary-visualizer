/* config-overrides.js */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config, env) {
    config.plugins = [
        ...config.plugins,
        new MonacoWebpackPlugin({
            // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            languages: ['json']
        })
    ];

    return config;
}