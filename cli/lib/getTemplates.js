const fs = require('fs');
const path = require('path');

/**
 * 获取模板目录名
 * @returns {Array}
 */
module.exports = () => {
    let templates = [];

    const cwd = path.join(__dirname, '../templates');
    const dirs = fs.readdirSync(cwd);

    dirs.forEach(function (item) {
        let stat = fs.lstatSync(path.join(cwd, item));
        if (stat.isDirectory() === true) {
            templates.push(item);
        }
    });

    return templates;
};
