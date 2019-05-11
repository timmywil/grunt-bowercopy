/*
 * grunt-bowercopy
 *
 * Copyright (c) 2014 Timmy Willison
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	// Load all npm grunt tasks
	require('load-grunt-tasks')(grunt);
	var bumpFiles = ['package.json', 'bower.json'];

	grunt.initConfig({
		bump: {
			options: {
				// The bower.json file is private,
				// but we still update the version
				files: bumpFiles,
				commitFiles: bumpFiles,
				commitMessage: 'Release %VERSION%',
				pushTo: 'origin',
				tagName: '%VERSION%',
				push: false
			}
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		jsonlint: {
			all: [
				'*.json'
			]
		},

		// Configuration to be run (and then tested)
		bowercopy: {
			options: {
				clean: true,
				report: false,
				ignore: ['jquery-1.x']
			},
			default_options: {
				files: {
					'tmp/js/libs/jquery.js': 'jquery/dist/jquery.js',
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
					srcPrefix: 'bower_modules/chosen',
					destPrefix: 'tmp/images/chosen'
				},
				// Test source arrays
				src: ['chosen-sprite.png', 'chosen-sprite@2x.png']
			},
			glob: {
				options: {
					srcPrefix: 'bower_modules/lodash/dist',
					destPrefix: 'tmp/js/libs/lodash'
				},
				// When using glob for source files,
				// the destination will always be used as a FOLDER
				// in which to place the matching files
				src: ['**/*.min.js']
			},
			dest_folder: {
				src: 'lodash/dist/lodash.js',
				dest: 'tmp/js/libs/lodash_folder'
			},
			// Main pragma
			main: {
				src: 'jquery.minlight:main',
				dest: 'tmp/js/plugins/'
			},
			// Main pragma with complicated destPrefix
			main_with_complex_dest_prefix: {
				options: {
					destPrefix: 'tmp/js/main_with_complex_dest_prefix'
				},
				src: 'angular:main',
				dest: 'angular'
			},
			// Main pragma with no dest (so bowercopy uses the src as the dest)
			main_with_no_dest: {
				options: {
					destPrefix: 'tmp/js/libs'
				},
				src: 'angular:main'
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
