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
	images: function(test) {
		test.expect(2);

		test.ok(grunt.file.exists('tmp/images/chosen/sprite.png'), 'Copies chosen sprite image');
		test.ok(grunt.file.exists('tmp/images/chosen/sprite@2x.png'), 'Copies chosen sprite image');

		test.done();
	},
	clean: function(test) {
		test.expect(1);

		test.ok(!grunt.file.exists('bower_modules'), 'The bower_modules folder was removed');

		test.done();
	}
};
