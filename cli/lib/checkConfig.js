const inquirer = require('inquirer');

const isTypeOf = dt => (v, t = dt) => typeof v === t;
const isUndefined = isTypeOf('undefined');
const isString = isTypeOf('string');

/**
 * 校验参数有效性
 * @param v
 * @returns {boolean}
 */
const valid = v => !(isUndefined(v) || (isString(v) && v.trim() === ''));

/**
 * 校验对象属性有效性，缓存对象
 * @param config
 * @returns {function(*): boolean}
 */
const validWith = config => {
    const _valid = k => valid(config[k]);

    return keys => {
        if(Array.isArray(keys)) {
            return keys.some(_valid);
        }
        return _valid(keys);
    }
};

/**
 * 校验命令及参数
 * @param program
 * @param config
 * @returns {Promise<boolean | {}>}
 */
module.exports = async (program, config) => {
    // 操作命令有效
    if(!valid(config.action)) {
        return false;
    }

    const prompts = [];
    if(config.inquirer) {
        const validConfig = validWith(config);
        Object.entries(config.inquirer).forEach(([k, v]) => {
            !validConfig(k) && prompts.push(v);
        });
        delete config.inquirer;
    }

    const options = { ...config, ...program };
    if(prompts.length > 0) {
        const answer = await inquirer.prompt(prompts);
        return { ...options, ...answer };
    }

    return options;
};
