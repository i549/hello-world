const os = require('os');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const vfs = require('vinyl-fs');
const through = require('through2');
const {runNpm} = require('./utils');

/**
 * 创建项目
 * @param dir       项目目录
 * @param template  模板名
 * @param scope     项目命名空间
 * @param skip      是否跳过依赖安装
 */
module.exports = ({dir, template, scope, skip}) => {
    // 获取将要构建的项目根目录
    const root = path.resolve(dir);
    // 获取将要构建的的项目名称
    const projectName = path.basename(root);

    console.log(`Start to create a project in ${chalk.green(root)}.`);
    console.log(`Create ${chalk.green(projectName)} with ${chalk.green(template)} template.`);

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
                packageJson.name = scope !== "false" ? `@${scope}/${projectName}` : projectName;
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
                    console.log(`    ${chalk.cyan('cd ' + projectName)}`);
                    console.log('# and run: ');
                    console.log(`    ${chalk.cyan('npm run start')}`);
                    console.log('# OR');
                    console.log(`    ${chalk.cyan('yarn start')}`);
                });
            }
        })
        .resume();
};
