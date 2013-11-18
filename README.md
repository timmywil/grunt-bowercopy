# grunt-bowercopy

> Wrangle those bower dependencies and place each one where it's supposed to be.

- Consistently positions your dependencies where you want them in your repository.
- Conveniently facilitates [tracking your dependencies](http://addyosmani.com/blog/checking-in-front-end-dependencies/) without committing the entire Bower components folder.
- Has the potential to reduce build times dramatically. For instance, if you were building a particular source folder for your webapp or website (compiling, concatenating, and minifying JavaScript and CSS), you were forced to include the entire `bower_components` directory in your build to make it work. This plugin clears the detritus.

## How This Changes Your Workflow

Whenever you add a new bower dependency, add which file should be copied and where to your Gruntfile `"bowercopy"` config. Then, run `grunt bowercopy`.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-bowercopy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bowercopy');
```

*Note: have a look at [load-grunt-tasks](https://github.com/sindresorhus/load-grunt-tasks) so you can skip this step for all your grunt plugins.*

## The "bowercopy" task

### Overview
In your project's Gruntfile, add a section named `bowercopy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	bowercopy: {
		options: {
			// Task-specific options go here.
		},
		your_target: {
			// Target-specific file lists and/or options go here.
		},
	},
})
```

### Options

#### options.srcPrefix
Type: `String`
Default value: The `directory` property value in your `.bowerrc` or `'bower_components'` if the `.bowerrc` cannot be found.

`srcPrefix` will prefix your source locations with the correct bower folder location.

#### options.destPrefix
Type: `String`
Default value: `'js'`

`destPrefix` will be used as the prefix for destinations.


### Usage Examples

```js
grunt.initConfig({
	bowercopy: {
		options: {
			destPrefix: 'website/public/js'
		},
		// Keys are sources (prefixed with `options.srcPrefix`);
		// values are destinations (prefixed with `options.destPrefix`)
		testFiles: {
			'chai/lib/chai.js': 'libs/expect.js',
			'mocha/mocha.js': 'libs/mocha/mocha.js',
			'mocha/mocha.css': 'libs/mocha/mocha.css'
		},
		// Anything can be copied
		website: {

			// Javascript
			// Copies 'bower_components/jquery/jquery.js' to 'website/public/js/libs/jquery.js'
			'jquery/jquery.js': 'libs/jquery.js',
			'lodash/dist/lodash.js': 'libs/lodash.js',
			'requirejs/require.js': 'libs/require.js',

			// Make dependencies follow your naming conventions
			'chosen/public/chosen.js': 'plugins/jquery.chosen.js',

			// Less
			'bootstrap/less/dropdowns.less': '../../less/dropdowns.less',

			// Images
			'chosen/public/chosen-sprite.png': '../images/account/chosen-sprite.png',
			'chosen/public/chosen-sprite@2x.png': '../images/account/chosen-sprite@2x.png'
		}
	}
});
```

## Contributing
Follow the same coding style present in the repo and add tests for any bug fix or feature addition.

See the [CONTRIBUTING.md](https://github.com/timmywil/grunt-bowercopy/blob/master/CONTRIBUTING.md) for more info.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Timmy Willison. Licensed under the MIT license.
