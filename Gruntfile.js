'use strict';

const fs = require('fs'),
  path = require('path');

module.exports = function (grunt) {
  grunt.initConfig({
    eslint: {
      target: [
        'Gruntfile.js',
        'index.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.registerTask('test', ['eslint']);

  grunt.task.registerTask('update-version', 'Updates the value of "version" in package.json', function () {
    const build = (process.argv.pop() || '').replace(/-(-)?(build=)?/g, '');

    if (build !== '') {
      const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')), 'utf8');

      config.version += '+' + build;
      fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(config, null, 2), 'utf8');
      console.log('Updated version to ' + config.version);
    }
  });

  grunt.registerTask('default', ['test']);
};
