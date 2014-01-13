/*
 * grunt-bowercopy
 *
 * Copyright (c) 2013 Timmy Willison
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
	'use strict';

	// Logging
	var log = grunt.log,
		verbose = grunt.verbose,
		fatal = grunt.fatal;

	// Utilities
	var _ = require('lodash');

	// Modules
	var path = require('path'),
		bower = require('bower'),
		glob = require('glob');

	// Get all modules
	var bowerConfig;
	try {
		bowerConfig = grunt.file.readJSON('bower.json');
	} catch(e) {
		return true;
	}
	var allModules = Object.keys(
		_.extend({}, bowerConfig.dependencies, bowerConfig.devDependencies)
	);
	var unused = allModules.slice(0);

	// Track number of runs
	var numTargets;
	var numRuns = 0;

	/**
	 * Retrieve the number of targets from the grunt config
	 * @returns {number|undefined} Returns the number of targets,
	 *  or undefined if the bowercopy config could not be found
	 */
	function getNumTargets() {
		if (numTargets) {
			return numTargets;
		}
		var targets = grunt.config('bowercopy');
		if (targets) {
			delete targets.options;
			numTargets = Object.keys(targets).length;
		}
		return numTargets;
	}

	/**
	 * Filter out all of the modules represented in the filesSrc array
	 * @param {Array} modules
	 * @param {Array} filesSrc
	 */
	function filterRepresented(modules, filesSrc) {
		return _.filter(modules, function(module) {
			return !_.some(filesSrc, function(src) {
				return path.join('/', src, '/').indexOf('/' + module + '/') > -1;
			});
		});
	}

	/**
	 * Ensure all bower dependencies are accounted for
	 * @param {Object} files Files property from the task
	 * @param {Object} options
	 * @returns {boolean} Returns whether all dependencies are accounted for
	 */
	function ensure(files, options) {
		// We need the originals, which grunt's filesSrc
		// does not give us if the files are not present yet
		var filesSrc = _.map(files, function(file) {
			return file.orig.src[0] || file.orig.dest;
		});

		// Update the global array of represented modules
		unused = filterRepresented(unused, filesSrc);

		verbose.writeln('Unrepresented modules list currently at ', unused);

		// Only print message when all targets have been run
		if (++numRuns === getNumTargets()) {
			if (unused.length) {
				log.error('Some bower components are not configured: ', unused);
			} else {
				// Remove the bower_components directory as it's no longer needed
				if (options.clean) {
					grunt.file.delete(options.srcPrefix);
					log.ok('Bower directory cleaned');
				}
				log.ok('All modules accounted for');
			}
		}
		log.ok('Bower components copied to specified locations');
		return true;
	}

	/**
	 * Copy over specified component files from the bower directory
	 * @param {Object} files
	 * @param {Object} options
	 */
	function copy(files, options) {
		var recurse;
		verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
		verbose.writeln('Using destPrefix: ' + options.destPrefix);

		files.forEach(function(file) {
			// Grunt's files object format
			file = file.orig;

			// Default each to the other if one is not specified
			// Ignore multiple explicit sources
			var src = file.src[0] || file.dest;
			// dest can be empty string to avoid using the source
			var dest = file.dest != null ? file.dest : file.src[0];

			// Add source prefix if not already added
			if (src.indexOf(options.srcPrefix) !== 0) {
				src = path.join(options.srcPrefix, src);
			}

			// Add dest prefix if not already added
			if (dest.indexOf(options.destPrefix) !== 0) {
				dest = path.join(options.destPrefix, dest);
			}

			// Copy folders
			if (grunt.file.isDir(src)) {
				grunt.file.recurse(src, function(abspath, rootdir, subdir, filename) {
					grunt.file.copy(
						abspath,
						path.join(dest, subdir || '', filename),
						options.copyOptions
					);
				});
				log.writeln(src + ' -> ' + dest);
			// Copy files
			} else if (grunt.file.exists(src)) {
				grunt.file.copy(src, dest, options.copyOptions);
				log.writeln(src + ' -> ' + dest);
			// Glob
			} else {
				var matches = glob.sync(src);
				if (matches.length) {
					// Convert to grunt format
					matches = matches.map(function(match) {
						return { orig: {
							src: [match],
							dest: path.join(
								// Build a destination from the new source if no dest
								// was specified
								file.dest != null ?
									file.dest :
									path.dirname(match).replace(options.srcPrefix + '/', ''),
								path.basename(match)
							)
						} };
					});
					recurse = true;
					// Recurse to copy
					copy(matches, options);
				}
			}
		});

		if (!recurse) {
			// Report if any dependencies have not been copied
			ensure(files, options);
		}
	}

	grunt.registerMultiTask(
		'bowercopy',
		[
			'Copy only the needed files from bower components',
			'over to their specified file locations'
		].join(' '),
		function bowercopy() {
			var files = this.files;

			// Options
			var options = this.options({
				srcPrefix: bower.config.directory,
				destPrefix: '',
				runbower: true,
				clean: false,
				copyOptions: {}
			});

			if (options.runbower) {
				// Run `bower install`
				var done = this.async();

				bower.commands.install().on('log', function(result) {
					log.writeln(['bower', result.id.cyan, result.message].join(' '));
				}).on('error', function(code) {
					fatal(code);
				}).on('end', function() {
					copy(files, options);
					done();
				});
			} else {
				copy(files, options);
			}
		}
	);
};
