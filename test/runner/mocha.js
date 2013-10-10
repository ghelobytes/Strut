require({

  // Ensure you point to where your spec folder is, base directory is app/scripts,
  // which is why ../../test is necessary
  paths: {
    spec: '../../test/spec',
    lodash: "../scripts/libs/lodash",
    ServiceRegistry: 'framework/sr/index',
    Q: '../components/q/q',

    // build - rmap
    'strut/presentation_generator/bespoke': '../bundles/app/strut.presentation_generator.bespoke',
    'strut/presentation_generator/reveal': '../bundles/app/strut.presentation_generator.reveal',
    'strut/presentation_generator/handouts': '../bundles/app/strut.presentation_generator.handouts',
    'strut/deck': '../bundles/app/strut.deck',
    'strut/startup': '../bundles/app/strut.startup',
    'strut/editor': '../bundles/app/strut.editor',
    'strut/etch_extension': '../bundles/app/strut.etch_extension',
    'strut/exporter/zip/browser': '../bundles/app/strut.exporter.zip.browser',
    'strut/exporter': '../bundles/app/strut.exporter',
    'strut/exporter/json': '../bundles/app/strut.exporter.json',
    'strut/header': '../bundles/app/strut.header',
    'strut/importer': '../bundles/app/strut.importer',
    'strut/importer/json': '../bundles/app/strut.importer.json',
    'strut/presentation_generator/impress': '../bundles/app/strut.presentation_generator.impress',
    'strut/logo_button': '../bundles/app/strut.logo_button',
    'strut/presentation_generator': '../bundles/app/strut.presentation_generator',
    'strut/slide_components': '../bundles/app/strut.slide_components',
    'strut/slide_editor': '../bundles/app/strut.slide_editor',
    'strut/slide_snapshot': '../bundles/app/strut.slide_snapshot',
    'strut/storage': '../bundles/app/strut.storage',
    'strut/themes': '../bundles/app/strut.themes',
    'strut/well_context_buttons': '../bundles/app/strut.well_context_buttons',
    'strut/config': '../bundles/app/strut.config',
    'strut/transition_editor': '../bundles/app/strut.transition_editor',

    'tantaman/web': '../bundles/common/tantaman.web',
    'tantaman/web/large_local_storage': '../bundles/common/tantaman.web.large_local_storage',
    'tantaman/web/local_storage': '../bundles/common/tantaman.web.local_storage',
    'tantaman/web/remote_storage': '../bundles/common/tantaman.web.remote_storage',
    'tantaman/web/saver': '../bundles/common/tantaman.web.saver',
    'tantaman/web/storage': '../bundles/common/tantaman.web.storage',
    'tantaman/web/undo_support': '../bundles/common/tantaman.web.undo_support',
    'tantaman/web/interactions': '../bundles/common/tantaman.web.interactions',
    'tantaman/web/widgets': '../bundles/common/tantaman.web.widgets',
    'tantaman/web/css_manip': '../bundles/common/tantaman.web.css_manip'
    // end build - rmap
  }

}, [

// Load specs
'spec/MultiMapTest',
'spec/ServiceRegistryTest',
'spec/LargeLocalStorageProviderTest'

], function() {
  'use strict';

  var runner = mocha.run();

  if(!window.PHANTOMJS) return;

  runner.on('test', function(test) {
    sendMessage('testStart', test.title);
  });

  runner.on('test end', function(test) {
    sendMessage('testDone', test.title, test.state);
  });

  runner.on('suite', function(suite) {
    sendMessage('suiteStart', suite.title);
  });

  runner.on('suite end', function(suite) {
    if (suite.root) return;
    sendMessage('suiteDone', suite.title);
  });

  runner.on('fail', function(test, err) {
    sendMessage('testFail', test.title, err);
  });

  runner.on('end', function() {
    var output = {
      failed  : this.failures,
      passed  : this.total - this.failures,
      total   : this.total
    };

    sendMessage('done', output.failed,output.passed, output.total);
  });

  function sendMessage() {
    var args = [].slice.call(arguments);
    alert(JSON.stringify(args));
  }
});
