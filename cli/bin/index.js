#!/usr/bin/env node

'use strict';

// 引入依赖
const commander = require('commander');
const initCmd = require('../lib/initCmd');
const runAction = require('../lib/runAction');
const checkConfig = require('../lib/checkConfig');
const getTemplates = require('../lib/getTemplates');
const extendsConfig = require('../lib/extendsConfig');
const checkNodeVersion = require('../lib/checkNodeVersion');

// 检测node版本
checkNodeVersion();

// 定义全局参数
const config = {
    scope: 'izc',
    templates: getTemplates(),
};

// 定义版本号以及命令选项
const packageJson = require('../package.json');
const program = new commander.Command(config.scope);

// 定义命令参数
initCmd(program, packageJson.version, config);

// 命令检查
checkConfig(
    program,
    extendsConfig(program, config)
).then((options) => {
    if(options === false) {
        program.help();
        process.exit(1);
    }
    // 执行命令
    runAction(options);
});

