/*
 * grunt-bowercopy
 *
 * Copyright (c) 2013 Timmy Willison
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Logging
	var log = grunt.log,
		verbose = grunt.verbose,
		fatal = grunt.fatal;

	// Modules
	var path = require('path'),
		spawn = require('child_process').spawn;

	/**
	 * Copy over specified component files from the bower directory
	 * @param {Object} files
	 * @param {Object} options
	 */
	function copy( files, options ) {

		verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
		verbose.writeln('Using destPrefix: ' + options.destPrefix);

		files.forEach(function(file) {

			file = file.orig;

			// Prefix sources with the srcPath
			var src = path.join(options.srcPrefix, file.src[0]);
			var dest = path.join(options.destPrefix, file.dest);

			// Copy
			grunt.file.copy( src, dest );

			log.writeln(src + ' -> ' + dest);
		});
		log.ok('Bower components copied to specified directories');
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
				runbower: false
			});

			// Run `bower install` regardless
			if ( options.runbower ) {
				var done = this.async();
				var install = spawn('bower', [ 'install' ], { stdio: 'inherit' });
				install.on('close', function( code ) {
					if ( code !== 0 ) {
						fatal('Bower install process exited with code ' + code);
						return;
					}
					copy( files, options );
					done();
				});
			} else {
				copy( files, options );
			}
		}
	);
};
