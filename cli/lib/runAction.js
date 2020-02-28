const chalk = require('chalk');
const createProject = require('./createProject');

const runLog = (action, args) => {
console.log(`run ${action} with options: {
    ${Object.entries(args).map(
        ([k, v]) => `${chalk.gray(k)}: ${chalk.magenta(v)}`
    ).join(',\n    ')}
}`);
};

module.exports = ({
  action, dir, template, scope, skip
}) => {
    switch (action) {
        case 'create':
            const options = { dir, template, scope, skip };
            runLog(action, options);
            return createProject(options);

        case 'none':
            return null;

        default:
            return null;
    }
};
