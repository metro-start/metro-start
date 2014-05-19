require.config({
    paths: {
        'domReady': '../lib/requirejs-domready/domReady',
        'jquery': '../lib/jquery/dist/jquery',
        'util': '../js/util',
        'pages': '../js/pages',
        'storage': '../js/storage',
        'script': '../js/script'
    },
});

require(['domReady!', 'spec_helper'], function() {
    var specs = ['util.spec', 'storage.spec', 'pages.spec'];

    require(specs, function () {
        jasmine.getEnv().addReporter(
            new jasmine.HtmlReporter()
        );

        // Run all the loaded test specs.
        jasmine.getEnv().execute();
    });
});
