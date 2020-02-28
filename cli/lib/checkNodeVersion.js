/**
 * node version check
 */
module.exports = () => {
    const version = process['versions']['node'];
    const semver = version.split('.');
    const major = semver[0];

    if (major < 8) {
        console.error(
            'You are running Node ' +
            version + '.\n' +
            '@izc/cli requires Node 8 or higher.\n' +
            'Please update your version of Node.'
        );
        process.exit(1);
    }
};
