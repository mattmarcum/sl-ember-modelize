var filterES6Modules = require('broccoli-es6-module-filter');
var broconcat = require('broccoli-concat');

module.exports = broconcat(
    filterES6Modules('lib', {
        moduleType: 'amd',
        anonymous: false,
        compatFix: true,
        packageName: 'emberize-model',
        main: 'main'
    }),
    {
        inputFiles: ['**/*.js'],
        outputFile: '/emberize-model.js',
        wrapInEval: false
    }
);