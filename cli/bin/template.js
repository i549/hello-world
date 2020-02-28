#!/usr/bin/env node

'use strict';
// 引入依赖
const commander = require('commander');
const vfs = require('vinyl-fs');
const through = require('through2');
const chalk = require('chalk');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const {runNpm} = require('./utils');

// 检测node版本
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 8) {
    console.error(
        'You are running Node ' +
        currentNodeVersion +
        '.\n' +
        '@izc/cli requires Node 8 or higher. \n' +
        'Please update your version of Node.'
    );
    process.exit(1);
}

const scope = 'izc';
const supportTemplate = (function() {
    let templates = [];
    let cwd = path.join(__dirname, '../templates');
    const files = fs.readdirSync(cwd);
    files.forEach(function (item) {
        let stat = fs.lstatSync(path.join(cwd, item));
        if (stat.isDirectory() === true) {
            templates.push(item);
        }
    });
    return templates;
}());
let action, createProject;

// 定义版本号以及命令选项
const packageJson = require('../package.json');
const program = new commander.Command(scope);

program
    .version(packageJson.version, '-v --version')
    .arguments('<command> [<project-directory>]')
    .usage(`${chalk.green('<command> [<project-directory>]')} [options]`)
    .option('-s --scope [scope]', 'set project scope', scope)
    .option('-k --skip', 'skip project packages install')
    .option(
        '-t --template [template]',
        `specify project use template from: [${
            supportTemplate.map(i => chalk.cyan(i)).join(', ')
        }]`,
        'ui'
    );

/*创建项目*/
program
    .command(`create <project-directory> [options]`)
    .description(`create a new project with template`)
    .action((dir) => {
        action = 'create';
        createProject = dir;
    });

/*查询支持的模板*/
program
    .command(`templates`)
    .description(`show all templates`)
    .action(() => {
        console.log('support templates has: ');
        supportTemplate.forEach(item => console.log(`  ${chalk.cyan(item)}`));
        process.exit(0);
    });

program.parse(process.argv);

if(
    typeof action === 'undefined'
    || (action === 'create' && typeof createProject === 'undefined')
) {
    program.help();
}

const createNewProject = (name, template, scope, skip) => {
    // 获取将要构建的项目根目录
    const root = path.resolve(name);
    // 获取将要构建的的项目名称
    const projectName = path.basename(root);

    console.log(`Start to create a project in ${chalk.green(root)}`);
    console.log(`Create ${chalk.green(projectName)} with ${chalk.green(template)} template`);

    // 根据将要构建的项目名称创建文件夹
    fs.ensureDirSync(projectName);

    // 获取本地模板目录
    let cwd = path.join(__dirname, '../templates/' + template);

    // 从模板目录中读取除node_modules目录下的所有文件并筛选处理
    vfs.src(['**/*', '!node_modules/**/*'], {cwd: cwd, dot: true})
        .pipe(through.obj(function (file, enc, callback) {
            if (!file.stat.isFile()) {
                return callback();
            }
            this.push(file);
            return callback();
        }))
        // 将模板目录下读取的文件流写入到之前创建的文件夹中
        .pipe(vfs.dest(root))
        .on('end', function () {
            // 修改项目名
            const packagePath = path.join(root, 'package.json');
            const packageJson = require(packagePath);
            if(packageJson) {
                packageJson.name = `@${scope}/${projectName}`;
                if(template === "ui" || template === "ui-lib") {
                    packageJson.files = [
                        "es",
                        "lib",
                        "dist"
                    ];
                }
                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + os.EOL);
            }
            if(skip) {
                console.log(`${chalk.green('finished')}.`);
            } else {
                console.log('Installing packages...');
                // 将node工作目录更改成构建的项目根目录下
                process.chdir(root);
                // 执行安装命令
                runNpm(['install'], () => {
                    console.log(`install ${chalk.green('finished')}.`);
                    console.log('--------------------------------------------');
                    console.log(`    ${chalk.blue('cd ' + projectName)}`);
                    console.log('# and run: ');
                    console.log(`    ${chalk.blue('npm run start')}`);
                    console.log('# OR');
                    console.log(`    ${chalk.blue('yarn start')}`);
                });
            }
        })
        .resume();
};

if(action === 'create') {
    const {template, scope, skip} = program;
    createNewProject(createProject, template, scope, skip);
}

