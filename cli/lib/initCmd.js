const chalk = require('chalk');

/**
 * 项目创建
 * @param program
 * @param config
 */
const create = (program, config) => {
    program
        .command(`create <project-directory> [options]`)
        .description(`create a new project with template`)
        .action((dir) => {
            config.action = 'create';
            config.dir = dir;
        });
};

/**
 * 模板查询
 * @param program
 * @param config
 */
const showTemplates = (program, config) => {
    program
        .command(`templates`)
        .description(`show all templates`)
        .action(() => {
            console.log('support templates has: ');
            config.templates.forEach(item => console.log(`  ${chalk.cyan(item)}`));
            process.exit(0);
        });
};

/**
 * 定义交互命令
 * @param program 交互对象
 * @param version 版本号
 * @param config  配置对象
 */
module.exports = (program, version, config) => {
    const {templates, scope} = config;

    // 初始化命令参数
    program
        .version(version, '-v --version')
        .arguments('<command> [<project-directory>]')
        .usage(`${chalk.green('<command> [<project-directory>]')} [options]`)
        .option('-s --scope [scope]', 'set project scope', scope)
        .option('-k --skip', 'skip project packages install')
        .option(
            '-t --template [template]',
            `specify project use template from: [${
                templates.map(i => chalk.cyan(i)).join(', ')
            }]`,
        );

    // 项目创建命令
    create(program, config);
    // 模板查询命令
    showTemplates(program, config);

    // 解析命令参数
    program.parse(process.argv);

    return config;
};
