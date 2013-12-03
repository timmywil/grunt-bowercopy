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
		spawn = require('child_process').spawn;

	// Get all modules
	var bowerConfig;
	try {
		bowerConfig = grunt.file.readJSON('bower.json');
	} catch(e) {
		return true;
	}
	var allModules = Object.keys(_.extend({}, bowerConfig.dependencies, bowerConfig.devDependencies));
	var unused = allModules.slice(0);

	// Track number of runs
	var numTargets;
	var numRuns = 0;

	/**
	 * Retrieve the number of targets from the grunt config
	 * @returns {number|undefined} Returns the number of targets, or undefined if the bowercopy config could not be found
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
		// We need the originals, which grunt's filesSrc does not give us if the files are not present yet
		var filesSrc = _.map(files, function(file) { return file.orig.src[0] || file.orig.dest; });

		// Update the global array of represented modules
		unused = filterRepresented(unused, filesSrc);

		// Only print message when all targets have been run
		if (++numRuns === getNumTargets()) {
			if (unused.length) {
				log.error('Some bower components are not configured: ', unused);
			} else {
				// Remove the bower_components directory as it's no longer needed
				if (options.clean) {
					grunt.file.delete(options.srcPrefix);
					log.ok('Bower directory cleaned.');
				}
				log.ok('All modules accounted for.');
			}
		}
		return true;
	}

	/**
	 * Copy over specified component files from the bower directory
	 * @param {Object} files
	 * @param {Object} options
	 */
	function copy(files, options) {
		verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
		verbose.writeln('Using destPrefix: ' + options.destPrefix);

		files.forEach(function(file) {
			file = file.orig;

			// Add prefixes to source and destination
			// Default each to the other if one is not specified
			// Ignore multiple sources
			var src = path.join(options.srcPrefix, file.src[0] || file.dest);
			var dest = path.join(options.destPrefix, file.dest || file.src[0]);

			// Copy folders
			if (grunt.file.isDir(src)) {
				grunt.file.recurse(src, function(abspath, rootdir, subdir, filename) {
					grunt.file.copy( abspath, path.join(dest, subdir || '', filename) );
				});
			// Copy files
			} else {
				grunt.file.copy(src, dest);
			}

			log.writeln(src + ' -> ' + dest);
		});
		log.ok('Bower components copied to specified directories');

		// Report if any dependencies have not been copied
		ensure(files, options);
	}

	grunt.registerMultiTask(
		'bowercopy',
		'Copy only the needed files from bower components over to their specified file locations',
		function bowercopy() {
			var files = this.files;

			// The file's presence is not required
			var srcPrefix;
			try {
				srcPrefix = (grunt.file.readJSON('.bowerrc') || {}).directory;
			} catch(e) {}

			// Options
			var options = this.options({
				srcPrefix: srcPrefix || 'bower_components',
				destPrefix: '',
				runbower: true,
				clean: false
			});

			// Run `bower install` regardless
			if (options.runbower) {
				var done = this.async();
				var install = spawn('bower', [ 'install' ], { stdio: 'inherit' });
				install.on('close', function(code) {
					if (code !== 0) {
						fatal('Bower install process exited with code ' + code);
						return;
					}
					copy(files, options);
					done();
				});
			} else {
				copy(files, options);
			}
		}
	);
};
