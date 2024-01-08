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
const svgButtonIconsFolderPath = path.resolve(__dirname, 'src/eager/controls/boolean/button/icon/svg-button/ng/svg/');
const productionMode = 'production';
const developmentMode = 'development';

declare interface WebpackDevServer {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[index: string]: any;
}

declare interface DevServer extends WebpackDevServer {
    static?: false | string | string[] | DevServer.Static | DevServer.Static[];
    contentBasePublicPath?: string[] | false;
    stats?: 'verbose'; // can be other things as well
}

declare namespace DevServer {
    export interface Static {
        directory?: string;
        publicPath?: string;
        watch?: boolean;
    }
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
    // console.log(new Date().toLocaleTimeString());
    // console.log('Pre');
    // console.log(JSON.stringify(config));

    let development: boolean;
    if (config.mode === undefined) {
        config.mode = productionMode;
        development = false;
    } else {
        development = config.mode === developmentMode;
    }
    updateRules(config, development);
    updatePlugins(config, development);
    updateDevtool(config, development);

    if (development) {
        updateDevServer(config);
    }

    // console.log('Post');
    // console.log(JSON.stringify(config));
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
            addSvgAssetSourcesRule(rules);
            addSourceMapLoaderRule(rules);
        }
    }
}

function excludeSvgButtonIconFolderFromModuleRules(rules: (undefined | null | false | "" | 0 | webpack.RuleSetRule | "...")[]) {
    rules.forEach((rule) => {
        if (typeof rule === 'object' && rule !== null) {
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

function addSvgAssetSourcesRule(rules: (undefined | null | false | "" | 0 | webpack.RuleSetRule | "...")[]) {
    const rule: webpack.RuleSetRule = {
        test: /\.svg$/,
        type: 'asset/source',
    };
    rules.push(rule);
}

function addSourceMapLoaderRule(rules: (undefined | null | false | "" | 0 | webpack.RuleSetRule | "...")[]) {
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

function updateDevtool(config: webpack.WebpackOptionsNormalized, development: boolean) {
    if (development) {
        // config.devtool = 'eval-source-map';
    } else {
        config.devtool = 'source-map';
    }
}

function updateDevServer(config: webpack.WebpackOptionsNormalized) {
    const configDevServer = config.devServer;
    if (configDevServer !== undefined) {
        updateDevServerStatic(configDevServer);
    }
}

function updateDevServerStatic(devServer: DevServer) {
    const configDoNotDeleteDirectory = path.resolve(__dirname, 'dev_static/_config-do-not-delete');
    const configDoNotDeletePublicPath = '/_config-do-not-delete';
    const extensionsDirectory = path.resolve(__dirname, '../extensions');
    const extensionsPublicPath = '/extensions';

    function checkIfDirectoryIsConfigDoNotDeleteOrExtensions(directory: string, directoryStatic: DevServer.Static) {
        switch (directory) {
            case configDoNotDeleteDirectory: {
                configDoNotDeleteStatic = directoryStatic;
                break;
            }
            case extensionsDirectory: {
                extensionsStatic = directoryStatic;
                break;
            }
        }
    }

    let configDoNotDeleteStatic: DevServer.Static | undefined;
    let extensionsStatic: DevServer.Static | undefined;
    const existingStatics = devServer.static;
    const newStatics: DevServer.Static[] = [];
    if (existingStatics !== undefined && existingStatics !== false) {
        if (typeof existingStatics === 'string') {
            const directory = existingStatics;
            const stringStatic: DevServer.Static = {
                directory,
            };
            checkIfDirectoryIsConfigDoNotDeleteOrExtensions(directory, stringStatic);
            newStatics.push(stringStatic);
        } else {
            if (typeof existingStatics === 'object') {
                if (!Array.isArray(existingStatics)) {
                    // must be of type DevServer.Static
                    const singleStatic = existingStatics as DevServer.Static;
                    const directory = singleStatic.directory;
                    if (directory !== undefined) {
                        checkIfDirectoryIsConfigDoNotDeleteOrExtensions(directory, singleStatic);
                    }
                    newStatics.push(singleStatic);
                } else {
                    for (const existingStatic of existingStatics) {
                        if (typeof existingStatic === 'string') {
                            const directory = existingStatic;
                            const stringStatic: DevServer.Static = {
                                directory,
                            };
                            checkIfDirectoryIsConfigDoNotDeleteOrExtensions(directory, stringStatic);
                            newStatics.push(stringStatic);
                        } else {
                            if (existingStatic !== undefined) {
                                const directory = existingStatic.directory;
                                if (directory !== undefined) {
                                    checkIfDirectoryIsConfigDoNotDeleteOrExtensions(directory, existingStatic);
                                }
                                newStatics.push(existingStatic);
                            }
                        }
                    }
                }
            }
        }
    }

    if (configDoNotDeleteStatic === undefined) {
        configDoNotDeleteStatic = {};
        newStatics.push(configDoNotDeleteStatic);
    }

    if (extensionsStatic === undefined) {
        extensionsStatic = {};
        newStatics.push(extensionsStatic);
    }

    configDoNotDeleteStatic.directory = configDoNotDeleteDirectory;
    configDoNotDeleteStatic.publicPath = configDoNotDeletePublicPath;
    extensionsStatic.directory = extensionsDirectory;
    extensionsStatic.publicPath = extensionsPublicPath;

    devServer.static = newStatics;
    // devServer.stats = 'verbose';
}



module.exports = customizeWebpackConfig;
// export default (
//     config: webpack.Configuration,
//     options: CustomWebpackBrowserSchema,
//     targetOptions: TargetOptions
// ) => customizeWebpackConfig(config);
