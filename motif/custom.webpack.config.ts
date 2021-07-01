/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import * as webpack from 'webpack';
// import * as pkg from './package.json';

const path = require('path');
// const { getOptionsByPreset } = require('javascript-obfuscator');
// const JavaScriptObfuscator = require('webpack-obfuscator');

const webpackConfigFileName = 'webpack.config.dev';
const svgButtonIconsFolderPath = path.resolve(__dirname, 'src/controls/boolean/button/icon/svg-button/ng/svg/');
const productionMode = 'production';
const developmentMode = 'development';

declare interface WebpackDevServer {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[index: string]: any;
}

declare interface DevServer extends WebpackDevServer {
    contentBase?: string[] | false;
    contentBasePublicPath?: string[] | false;
    stats?: 'verbose'; // can be other things as well
}

// module.exports = {
//     mode: 'development',

//     // Place files under <root>/dev_static folder for testing if they are included in app but not
//     // included in bundle (eg. Config files)
//     devServer: {
//         contentBase: [
//             path.resolve(__dirname, 'dev_static/_config-do-not-delete'),
//             path.resolve(__dirname, '../extensions'),
//         ],
//         contentBasePublicPath: [
//             '/_config-do-not-delete',
//             '/extensions',
//         ],
//         stats: 'verbose'
//     },

//     module: {
//         rules: [
//             {
//                 test: /\.svg$/,
//                 loader: 'svg-sprite-loader',
//                 include: svgButtonIconsFolderPath,
//                 options: {
//                     extract: true,
//                     publicPath: '/'
//                     // symbolId: '[name]'
//                 }
//             },
//             {
//                 test: /\.js$/,
//                 enforce: 'pre',
//                 use: ['source-map-loader'],
//             }
//         ]
//     },

//     plugins: [
//         // new JavaScriptObfuscator(getOptionsByPreset('default'), []), // production only - not needed now at all
//     ]

// //  Uncomment the code below to view production code in a readable format.  DO NOT DEPLOY
// //    module.exports = config => {
// //        config.optimization.minimize = false;
// //        config.optimization.minimizer.filter (({constructor: {name}}) => name === 'TerserPlugin')
// //        .forEach (terser => {
// //            terser.options.terserOptions.keep_classnames = true;
// //            terser.options.terserOptions.mangle = false;
// //        });
// //
// //        return config;
// //    };
//
// };

/**
 * Entry point for custom webpack configuration.
 *
 * @angular-builders/custom-webpack passes the Angular CLI prepared
 * webpack config, which we can customize here.
 *
 */

function customizeWebpackConfig(config: webpack.WebpackOptionsNormalized) {
    console.log(new Date().toLocaleTimeString());
    console.log('Pre');
    console.log(config);

    let development: boolean;
    if (config.mode === undefined) {
        config.mode = productionMode;
        development = false;
    } else {
        development = config.mode === developmentMode;
    }
    updateRules(config, development);
    updatePlugins(config, development);
    updateDevTools(config, development);

    if (development) {
        updateDevServer(config);
    }

    console.log('Post');
    console.log(config);
    return config;
}

function updateRules(config: webpack.WebpackOptionsNormalized, development: boolean) {
    const configModule = config.module;
    if (configModule === undefined) {
        throw new Error(`${webpackConfigFileName}: module undefined`);
    } else {
        const rules = configModule.rules;
        if (rules === undefined) {
            throw new Error(`${webpackConfigFileName}: module.rules undefined`);
        } else {
            excludeSvgButtonIconFolderFromModuleRules(rules);
            addIconSpriteModuleRule(rules);
            if (development) {
                addSourceMapLoaderRule(rules);
            }
        }
    }
}

function excludeSvgButtonIconFolderFromModuleRules(rules: (webpack.RuleSetRule | '...')[]) {
    rules.forEach((rule) => {
        if (typeof rule !== 'string') {
            const test = rule.test;
            if (test !== undefined) {
                if (!test.toString().includes('svg')) {
                    return;
                }

                excludeSvgButtonIconFolderFromModuleRule(rule);
            }
        }
    });
}

function excludeSvgButtonIconFolderFromModuleRule(rule: webpack.RuleSetRule) {
    if (!rule.exclude) {
        rule.exclude = svgButtonIconsFolderPath;
        return;
    }

    if (Array.isArray(rule.exclude)) {
        rule.exclude.push(svgButtonIconsFolderPath);
        return;
    }

    rule.exclude = [rule.exclude, svgButtonIconsFolderPath];
}

function addIconSpriteModuleRule(rules: (webpack.RuleSetRule | '...')[]) {
    const rule: webpack.RuleSetRule = {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: svgButtonIconsFolderPath,
        options: {
            symbolId: 'button-icon-[name]',
        },
    };
    rules.push(rule);
}

function addSourceMapLoaderRule(rules: (webpack.RuleSetRule | '...')[]) {
    const rule: webpack.RuleSetRule = {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
    };
    rules.push(rule);
}

function updatePlugins(config: webpack.WebpackOptionsNormalized, development: boolean) {
    const configPlugins = config.plugins;
    if (configPlugins === undefined) {
        throw new Error(`${webpackConfigFileName}: plugins undefined`);
    } else {
        if (!development) {
            // addPluginForJavaScriptObfuscator(configPlugins);
        }
    }
}

function addPluginForJavaScriptObfuscator(plugins: (
        | ((this: webpack.Compiler, compiler: webpack.Compiler) => void)
        | webpack.WebpackPluginInstance
    )[]
) {
    // const plugin = new JavaScriptObfuscator(getOptionsByPreset('default'), []);
    // plugins.push(plugin);
}

function updateDevTools(config: webpack.WebpackOptionsNormalized, development: boolean) {
    if (!development) {
        config.devtool = 'source-map';
    }
}

function updateDevServer(config: webpack.WebpackOptionsNormalized) {
    const configDevServer = config.devServer;
    if (configDevServer !== undefined) {
        updateDevServerContentBase(configDevServer);
    }
}

function updateDevServerContentBase(devServer: DevServer) {
    const configDoNotDeleteSrcFolder = path.resolve(__dirname, 'dev_static/_config-do-not-delete');
    const configDoNotDeletePublicPath = '/_config-do-not-delete';
    const extensionsSrcFolder = path.resolve(__dirname, '../extensions');
    const extensionsPublicPath = '/extensions';

    const contentBase: string[] = devServer.contentBase === undefined || devServer.contentBase === false ? [] : devServer.contentBase;
    const contentBasePublicPath: string[] =
        devServer.contentBasePublicPath === undefined || devServer.contentBasePublicPath === false ? [] : devServer.contentBasePublicPath;

    if (contentBase.length !== contentBasePublicPath.length) {
        throw new Error(`${webpackConfigFileName}: contentBase and contentBasePublicPath different lengths`);
    } else {
        const configDoNotDeleteSrcIdx = contentBase.indexOf(configDoNotDeleteSrcFolder);
        if (configDoNotDeleteSrcIdx >= 0) {
            contentBasePublicPath[configDoNotDeleteSrcIdx] = configDoNotDeletePublicPath;
        } else {
            contentBase.push(configDoNotDeleteSrcFolder);
            contentBasePublicPath.push(configDoNotDeletePublicPath);
        }

        const extensionsSrcIdx = contentBase.indexOf(extensionsSrcFolder);
        if (extensionsSrcIdx >= 0) {
            contentBasePublicPath[extensionsSrcIdx] = extensionsPublicPath;
        } else {
            contentBase.push(extensionsSrcFolder);
            contentBasePublicPath.push(extensionsPublicPath);
        }
    }

    devServer.contentBase = contentBase;
    devServer.contentBasePublicPath = contentBasePublicPath;
    devServer.stats = 'verbose';
}



module.exports = customizeWebpackConfig;
// export default (
//     config: webpack.Configuration,
//     options: CustomWebpackBrowserSchema,
//     targetOptions: TargetOptions
// ) => customizeWebpackConfig(config);
