require.config({
    paths: {
        'jasmine': 'lib/jasmine-2.0.0/jasmine',
        'jasmine-html': 'lib/jasmine-2.0.0/jasmine-html',
        'boot': 'lib/jasmine-2.0.0/boot',
        'jquery': '../lib/jquery/dist/jquery',
        util: '../js/util',
        pages: '../js/pages',
        storage: '../js/storage',
        script: '../js/script'
    },
    shim: {
        'jasmine': {
            exports: 'window.jasmineRequire'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'window.jasmineRequire'
        },
        'boot': {
            deps: ['jasmine', 'jasmine-html'],
            exports: 'window.jasmineRequire'
        }
    }
});

require(['boot'], function () {
    require(['spec_helper'], function() {
        var specs = ['util.spec', 'storage.spec', 'pages.spec'];

        require(specs, function () {
            // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
            window.onload();
        });
    });
    // Load the specs
});
