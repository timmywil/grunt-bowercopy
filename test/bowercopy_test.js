'use strict';

var grunt = require('grunt');

/*
	======== A Handy Little Nodeunit Reference ========
	https://github.com/caolan/nodeunit

	Test methods:
		test.expect(numAssertions)
		test.done()
	Test assertions:
		test.ok(value, [message])
		test.equal(actual, expected, [message])
		test.notEqual(actual, expected, [message])
		test.deepEqual(actual, expected, [message])
		test.notDeepEqual(actual, expected, [message])
		test.strictEqual(actual, expected, [message])
		test.notStrictEqual(actual, expected, [message])
		test.throws(block, [error], [message])
		test.doesNotThrow(block, [error], [message])
		test.ifError(value)
*/

exports.bowercopy = {
	default_options: function (test) {
		test.expect(2);

		test.ok(grunt.file.exists('tmp/js/libs/jquery.js'), 'jQuery file copied to libs directory');
		test.ok(grunt.file.exists('tmp/js/plugins/jquery.panzoom.js'), 'Panzoom file copied to libs directory');

		test.done();
	},
	prefix_options: function (test) {
		test.expect(5);

		test.ok(grunt.file.exists('tmp/js/backbone/backbone.js'), 'Backbone copied to backbone directory');
		test.ok(grunt.file.exists('tmp/js/backbone/backbone-min.js'), 'Backbone copied to backbone directory');
		test.ok(grunt.file.exists('tmp/js/backbone/backbone-min.map'), 'Backbone copied to backbone directory');
		test.ok(grunt.file.exists('tmp/js/backbone/index.html'), 'Backbone copied to backbone directory');
		test.ok(grunt.file.exists('tmp/js/backbone/package.json'), 'Backbone copied to backbone directory');

		test.done();
	},
	process: function(test) {
		test.expect(4);

		test.ok(grunt.file.exists('tmp/js/jquery-ui/jquery.ui.core.js'), 'jQuery UI core copied to jquery-ui directory');
		test.ok(grunt.file.exists('tmp/js/jquery-ui/jquery.ui.widget.js'), 'jQuery UI widget factory copied to jquery-ui directory');
		test.strictEqual(grunt.file.read('tmp/js/jquery-ui/jquery.ui.core.js'), grunt.file.read('test/golden_files/jquery.ui.core.js' ), 'jQuery UI core contains commit hash as its version');
		test.strictEqual(grunt.file.read('tmp/js/jquery-ui/jquery.ui.widget.js'), grunt.file.read('test/golden_files/jquery.ui.widget.js' ), 'jQuery UI widget factory contains commit hash as its version');

		test.done();
	},
	images: function(test) {
		test.expect(2);

		test.ok(grunt.file.exists('tmp/images/chosen/chosen-sprite.png'), 'Copy chosen sprite image');
		test.ok(grunt.file.exists('tmp/images/chosen/chosen-sprite@2x.png'), 'Copy chosen sprite image');

		test.done();
	},
	glob: function(test) {
		test.expect(2);

		test.ok(!grunt.file.exists('tmp/js/libs/lodash/lodash.js'), 'Copy lodash files without including unminified files');
		test.ok(grunt.file.exists('tmp/js/libs/lodash/lodash.min.js'), 'Copy lodash files with glob src');

		test.done();
	},
	dest_folder: function(test) {
		test.expect(1);

		test.ok(grunt.file.exists('tmp/js/libs/lodash_folder/lodash.js'));

		test.done();
	},
	clean: function(test) {
		test.expect(1);

		test.ok(!grunt.file.exists('bower_modules'), 'Remove bower_modules folder');

		test.done();
	},
	main: function(test) {
		test.expect(1);

		test.ok(grunt.file.exists('tmp/js/plugins/jquery.minlight.js'), 'Minlight copied to plugins directory');

		test.done();
	},
	main_with_complex_dest_prefix: function (test) {
		test.expect(1);

		test.ok(grunt.file.exists('tmp/js/main_with_complex_dest_prefix/angular/angular.js'), 'Angular copied to plugins directory');

		test.done();
	},
	main_with_no_dest: function (test) {
		test.expect(1);

		test.ok(grunt.file.exists('tmp/js/libs/angular/angular.js'), 'Angular copied to plugins directory');

		test.done();
	}
};
