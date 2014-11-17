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
		fail = grunt.fail;

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
	var rmain = /^([^:]+):main$/;

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
			if (options.ignore.indexOf(module) > -1) {
				return false;
			}
			return !_.some(files, function(file) {
				// Look for the module name somewhere in the source path
				return path.join(sep, options.srcPrefix, file.src.replace(rmain, '$1'), sep)
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
	 * @param {string} [dest] A folder destination for all of these sources
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
	 * Get the main files for a particular package
	 * @param {string} src
	 * @param {Object} options
	 * @param {string} dest
	 * @returns {Array} Returns an array of file locations from the main property
	 */
	function getMain(src, options, dest) {
		var meta = grunt.file.readJSON(path.join(src, '.bower.json'));
		if (!meta.main) {
			fail.fatal('No main property specified by ' + path.normalize(src.replace(options.srcPrefix, '')));
		}
		var files = typeof meta.main === 'string' ? [meta.main] : meta.main;
		return files.map(function(source) {
			return {
				src: path.join(src, source),
				dest: dest
			};
		});
	}

	/**
	 * Copy over specified component files from the bower directory
	 *  files format: [{ src: '', dest: '' }, ...]
	 * @param {Array} files
	 * @param {Object} options
	 * @returns {boolean} Returns whether anything was copied for the list of files
	 */
	function copy(files, options) {
		var copied = false;
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

			// Copy main files if :main is specified
			var main = rmain.exec(src);
			if (main) {
				copied = copy(getMain(main[1], options, dest), options) || copied;
				return;
			}

			// Copy folders
			if (grunt.file.isDir(src)) {
				grunt.file.recurse(src, function(abspath, rootdir, subdir, filename) {
					copied = true;
					grunt.file.copy(
						abspath,
						path.join(dest, subdir || '', filename),
						options.copyOptions
					);
				});
				log.writeln(src + ' -> ' + dest);
			// Copy files
			} else if (grunt.file.exists(src)) {
				copied = true;
				if (!rperiod.test(path.basename(dest))) {
					dest = path.join(dest, path.basename(src));
				}
				grunt.file.copy(src, dest, options.copyOptions);
				log.writeln(src + ' -> ' + dest);
			// Glob
			} else {
				var matches = glob.sync(file.src, { cwd: options.srcPrefix });
				if (matches.length) {
					matches = convertMatches(matches, options, file.dest);
					copied = copy(matches, options) || copied;
				} else {
					log.warn(src + ' was not found');
				}
			}
		});
		return copied;
	}

	/**
	 * Top-level copying run
	 *  files format is Grunt's default:
	 *  [{ orig: { src: '', dest: '' }, src: '', dest: '' }, ...]
	 *  convert to copy()'s format before calling copy()
	 * @param {Array} files
	 * @param {Object} options
	 */
	var run = function(files, options) {
		verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
		verbose.writeln('Using destPrefix: ' + options.destPrefix);

		// Build the file list
		files = convert(files);

		// Copy files
		if (!copy(files, options)) {
			fail.warn('Nothing was copied for the "' + this.target + '" target');
		}

		// Report if any dependencies have not been copied
		ensure(files, options);
	};

	grunt.registerMultiTask(
		'bowercopy',
		[
			'Copy only the needed files from bower components',
			'over to their specified file locations'
		].join(' '),
		function bowercopy() {
			var self = this;
			var files = this.files;

			// Options
			var options = this.options({
				srcPrefix: bower.config.directory,
				destPrefix: '',
				ignore: [],
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
					fail.fatal(code);
				}).on('end', function() {
					run.call(self, files, options);
					done();
				});
			} else {
				run.call(self, files, options);
			}
		}
	);
};
