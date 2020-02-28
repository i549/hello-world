/**
 * 命令处理配置
 * @type {{}}
 */
module.exports = (program, config = {}) => {
    if(!config.action) {
        return config;
    }

    return ({
        'create': {
            inquirer: {
                template: {
                    type: 'list',
                    name: 'template',
                    choices: config.templates,
                    message: 'Select the project template',
                    default: 'ui',
                }
            },
            ...config,
        },
    }[config.action])
};
