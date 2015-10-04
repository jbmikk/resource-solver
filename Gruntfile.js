module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    karma: {
      options: {
        files: [
          'bower_components/angular/angular.js',
          'bower_components/angular-mocks/angular-mocks.js',
          'test/mocks/uiRouter.js',
          'src/**/*.js',
          'test/resource-solver.js'
        ],
      },
      unit: {
        frameworks: [ 'jasmine' ],
        plugins: [ 'karma-jasmine', 'karma-phantomjs-launcher' ],
        browsers: ['PhantomJS'],
        logLevel: 'ERROR'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'karma:unit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma:unit']);

};
