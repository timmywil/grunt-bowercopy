/*
 * grunt-bowercopy
 *
 * Copyright (c) 2013 Timmy Willison
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	// Load all npm grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		jsonlint: {
			all: [
				'*.json'
			]
		},

		// Configuration to be run (and then tested)
		bowercopy: {
			default_options: {
				files: {
					'tmp/js/libs/jquery.js': 'jquery/jquery.js',
					'tmp/js/plugins/jquery.panzoom.js': 'jquery.panzoom/dist/jquery.panzoom.js'
				}
			},
			prefix_options: {
				options: {
					srcPrefix: 'bower_modules',
					destPrefix: 'tmp/js'
				},
				src: 'backbone'
			},
			process: {
				options: {
					destPrefix: 'tmp/js/jquery-ui',
					copyOptions: {
						process: function(content) {
							var version = grunt.file.readJSON('bower.json').devDependencies['jquery-ui'].split('#')[1];
							return content.replace(/@VERSION/g, version);
						}
					}
				},
				files: {
					'jquery.ui.core.js': 'jquery-ui/ui/jquery.ui.core.js',
					'jquery.ui.widget.js': 'jquery-ui/ui/jquery.ui.widget.js'
				}
			},
			images: {
				options: {
					srcPrefix: 'bower_modules/chosen/public',
					destPrefix: 'tmp/images/chosen'
				},
				// Test source arrays
				src: ['chosen-sprite.png', 'chosen-sprite@2x.png']
			},
			glob: {
				options: {
					destPrefix: 'tmp/js/libs'
				},
				// When using glob for source files,
				// the destination will always be used as a FOLDER
				// in which to place the matching files
				src: 'lodash/**/*.js'
			},
			clean: {
				options: {
					clean: true,
					report: false
				}
			}
		},

		// Before generating any new files, remove any previously-created files
		clean: {
			tests: [
				'tmp'
			]
		},

		// Unit tests
		nodeunit: {
			tests: ['test/*_test.js']
		},

		// Development watch task
		watch: {
			dev: {
				files: [
					'<%= jshint.all %>'
				],
				tasks: [ 'default' ]
			},
			json: {
				files: [
					'<%= jsonlint.all %>'
				],
				tasks: [ 'jsonlint' ]
			}
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', [ 'clean', 'bowercopy', 'nodeunit' ]);

	// By default, lint and run all tests.
	grunt.registerTask('default', [ 'jshint', 'jsonlint', 'test' ]);

};
