# grunt-bowercopy (not yet released)

> Wrangle those bower dependencies and place each one where it's supposed to be.

- Consistently positions your dependencies where you want them in your repository.
- Conveniently facilitates [tracking your dependencies](http://addyosmani.com/blog/checking-in-front-end-dependencies/) without committing the entire Bower components folder.
- Has the potential to reduce build times dramatically. For instance, if you were building a particular source folder for your webapp or website (compiling, concatenating, and minifying JavaScript and CSS), you were forced to include the entire `bower_components` directory in your build to make it work. This plugin clears the detritus.

## How This Changes Your Workflow

Whenever you add a new bower dependency, add which file should be copied and where to your Gruntfile `"bowercopy"` config. Then, run `grunt bowercopy`.

By default, bowercopy runs `bower install` for you (turn this off with the `runbower` option). Your bower directory is not removed so you can see which files you need from each component.
It is suggested that you add the bower directory to your `.gitignore`.

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
Default value: `''`

`destPrefix` will be used as the prefix for destinations.

#### option.runbower
Type: `Boolean`
Default value: `true`

Run `bower install` in conjunction with the `bowercopy` task.


### Usage Examples

```js
grunt.initConfig({
	bowercopy: {

		testFiles: {
			options: {
				destPrefix: 'test/js'
			},
			files: {
				// Keys are destinations (prefixed with `options.destPrefix`)
				// Values are sources (prefixed with `options.srcPrefix`); One source per destination
				// e.g. 'bower_components/chai/lib/chai.js' will be copied to 'test/js/libs/chai.js'
				'libs/chai.js': 'chai/lib/chai.js': ,
				'mocha/mocha.js': 'libs/mocha/mocha.js',
				'mocha/mocha.css': 'libs/mocha/mocha.css'
			}
		},

		// Anything can be copied
		libs: {
			options: {
				destPrefix: 'public/js/libs'
			},
			files: {
				'jquery.js': 'jquery/jquery.js',
				'lodash.js': 'lodash/dist/lodash.js',
				'require.js': 'requirejs/require.js'
			},
		},
		plugins: {
			options: {
				destPrefix: 'public/js/plugins'
			},
			files: {
				// Make dependencies follow your naming conventions
				'jquery.chosen.js': 'chosen/public/chosen.js'
			}
		},
		less: {
			options: {
				destPrefix: 'less'
			},
			files: {
				// If either the src or the dest is not present,
				// the specified location will be used for both.
				// In other words, this will copy
				// 'bower_components/bootstrap/less/dropdowns.less' to 'less/bootstrap/less/dropdowns.less'
				// See http://gruntjs.com/configuring-tasks#files for recommended files formats
				src: 'bootstrap/less/dropdowns.less'
			}
		},
		images: {
			options: {
				destPrefix: 'public/images'
			},
			files: {
				'account/chosen-sprite.png': 'chosen/public/chosen-sprite.png',
				'account/chosen-sprite@2x.png': 'chosen/public/chosen-sprite@2x.png'
			}
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
