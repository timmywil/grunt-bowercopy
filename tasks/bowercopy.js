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
		warn = grunt.warn,
		fatal = grunt.fatal;

	// Utilities
	var _ = grunt.util._;

	// Node modules
	var fs = require('fs'),
		path = require('path');

	// Regex
	var rfolder = /\/[^\/]+$/;

	grunt.registerMultiTask(
		'bowercopy',
		'Copy only the needed files from bower components over to their specified file locations',
		function bowercopy() {
			// Require an object in data
			if (!Object.keys(this.data).length) {
				warn('Bowercopy is not configured to copy anything');
				return;
			}

			// The file's presence is not required
			var srcPrefix;
			try {
				srcPrefix = (grunt.file.readJSON('.bowerrc') || {}).directory;
			} catch(e) {}

			// Options
			var options = this.options({
				srcPrefix: srcPrefix || 'bower_components',
				destPrefix: 'js'
			});

			verbose.writeln('Using srcPrefix: ' + options.srcPrefix);
			verbose.writeln('Using destPrefix: ' + options.destPrefix);

			_.forOwn(this.data, function(dest, src) {
				// Type checking
				if ( typeof dest !== 'string' ) {
					fatal('Destination must be a string: ' + JSON.stringify(dest) || dest);
					return;
				}
				if ( typeof dest !== 'string' ) {
					fatal('Source must be a string: ' + JSON.stringify(src) || src);
					return;
				}

				// Prefix sources with the srcPath
				src = path.join(options.srcPrefix, src);
				dest = path.join(options.destPrefix, dest);

				var folder = dest.replace(rfolder, '');

				// Allow mkdir failures
				try {
					fs.mkdirSync(folder, 755);
					verbose.writeln('Folder created: ' + folder);
				} catch( e ) {
					verbose.writeln('Folder already present: ' + folder);
				}

				// Copy
				fs.writeFileSync( dest, fs.readFileSync( src ) );
				log.writeln(src + ' -> ' + dest);
			});
			log.ok('Bower components copied to specified directories');
		}
	);
};
