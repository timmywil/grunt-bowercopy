/*
 * grunt-bowercopy
 *
 * Copyright (c) 2014 Timmy Willison
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
	'use strict';

	// Logging
	var log = grunt.log,
		verbose = grunt.verbose,
		fatal = grunt.fatal,
		warn = grunt.warn;

	// Utilities
	var _ = require('lodash');

	// Modules
	var path = require('path'),
		bower = require('bower'),
		glob = require('glob'),
		sep = path.sep;

	// Get all modules
	var bowerConfig = grunt.file.readJSON('bower.json');
	var allModules = Object.keys(
		_.extend({}, bowerConfig.dependencies, bowerConfig.devDependencies)
	);
	var unused = allModules.slice(0);

	// Track number of runs
	var numTargets;
	var numRuns = 0;

	// Regex
	var rperiod = /\./;

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
	 * Convert from grunt to a cleaner format
	 * @param {Array} files
	 */
	function convert(files) {
		var converted = [];
		files.forEach(function(file) {
			// We need originals as the destinations may not yet exist
			file = file.orig;
			var dest = file.dest;

			// Use destination for source if no source is available
			if (!file.src.length) {
				converted.push({
					src: dest,
					dest: dest
				});
				return;
			}

			file.src.forEach(function(source) {
				converted.push({
					src: source,
					dest: dest
				});
			});
		});
		return converted;
	}

	/**
	 * Filter out all of the modules represented in the filesSrc array
	 * @param {Array} modules
	 * @param {Array} files
	 * @param {Object} options
	 */
	function filterRepresented(modules, files, options) {
		return _.filter(modules, function(module) {
			return !_.some(files, function(file) {
				// Look for the module name somewhere in the source path
				return path.join(sep, options.srcPrefix, file.src, sep)
					.indexOf(sep + module + sep) > -1;
			});
		});
	}

	/**
	 * Ensure all bower dependencies are accounted for
	 * @param {Array} files Files property from the task
	 * @param {Object} options
	 * @returns {boolean} Returns whether all dependencies are accounted for
	 */
	function ensure(files, options) {
		// Update the global array of represented modules
		unused = filterRepresented(unused, files, options);

		verbose.writeln('Unrepresented modules list currently at ', unused);

		// Only print message when all targets have been run
		if (++numRuns === getNumTargets()) {
			if (unused.length) {
				if (options.clean) {
					log.error('Could not clean directory. Some bower components are not configured: ', unused);
				} else if (options.report) {
					log.writeln('Some bower components are not configured: ', unused);
				}
			} else {
				// Remove the bower_components directory as it's no longer needed
				if (options.clean) {
					grunt.file.delete(options.srcPrefix);
					log.ok('Bower directory cleaned');
				}
				if (options.report) {
					log.ok('All modules accounted for');
				}
			}
		}
	}

	/**
	 * Convert an array of files sources to our format
	 * @param {Array} files
	 * @param {Object} options
	 * @param {String} [dest] A folder destination for all of these sources
	 */
	function convertMatches(files, options, dest) {
		return files.map(function(source) {
			return {
				src: source,
				dest: path.join(
					// Build a destination from the new source if no dest
					// was specified
					dest != null ?
						dest :
						path.dirname(source).replace(options.srcPrefix + sep, ''),
					path.basename(source)
				)
			};
		});
	}

	/**
	 * Copy over specified component files from the bower directory
	 *  files format: [{ src: '', dest: '' }, ...]
	 * @param {Array} files
	 * @param {Object} options
	 */
	function copy(files, options) {
		files.forEach(function(file) {
			var src = file.src;
			// Use source for destination if no destionation is available
			// This is done here so globbing can use the original dest
			var dest = file.dest || src;

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
				if (!rperiod.test(path.basename(dest))) {
					dest = path.join(dest, path.basename(src));
				}
				grunt.file.copy(src, dest, options.copyOptions);
				log.writeln(src + ' -> ' + dest);
			// Glob
			} else {
				var matches = glob.sync(src);
				if (matches.length) {
					matches = convertMatches(matches, options, file.dest);
					copy(matches, options);
				} else {
					warn(src + ' was not found');
				}
			}
		});
	}

	/**
	 * Top-level copying run
	 *  files format is Grunt's default:
	 *  [{ orig: { src: '', dest: '' }, src: '', dest: '' }, ...]
	 *  convert to copy()'s format before calling copy()
	 * @param {Array} files
	 * @param {Object} options
	 */
	function run(files, options) {
		verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
		verbose.writeln('Using destPrefix: ' + options.destPrefix);

		// Build the file list
		files = convert(files);

		// Copy files
		copy(files, options);
		log.ok('Bower components copied to specified locations');

		// Report if any dependencies have not been copied
		ensure(files, options);
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
				report: true,
				runBower: true,
				clean: false,
				copyOptions: {}
			});

			// Back-compat. Non-camelcase
			if (options.runBower || options.runbower) {
				// Run `bower install`
				var done = this.async();

				bower.commands.install().on('log', function(result) {
					log.writeln(['bower', result.id.cyan, result.message].join(' '));
				}).on('error', function(code) {
					fatal(code);
				}).on('end', function() {
					run(files, options);
					done();
				});
			} else {
				run(files, options);
			}
		}
	);
};
