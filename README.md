# grunt-bowercopy
[![Build Status](https://travis-ci.org/timmywil/grunt-bowercopy.png?branch=master)](https://travis-ci.org/timmywil/grunt-bowercopy)

> Wrangle those bower dependencies and place each one where it's supposed to be.

- Consistently positions your dependencies where you want them in your repository.
- Conveniently facilitates [tracking your dependencies](http://addyosmani.com/blog/checking-in-front-end-dependencies/) without committing the entire Bower components folder.
- Has the potential to reduce build times dramatically. For instance, if you were building a particular source folder for your webapp or website (compiling, concatenating, and minifying JavaScript and CSS), you were forced to include the entire `bower_components` directory in your build to make it work. This plugin clears the detritus.

## Workflow

Whenever you add a new bower dependency, add which file should be copied and where to your Gruntfile `"bowercopy"` config. Then, run `grunt bowercopy`.

By default, bowercopy runs `bower install` for you (turn this off with the `runbower` option). Your bower directory is not removed so you can see which files you need from each component.
It is suggested that you add the bower directory (usually `'bower_components'`) to your `.gitignore`.

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
			// Task-specific options go here
		},
		your_target: {
			// Target-specific file lists and/or options go here
		}
	}
});
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

#### options.runBower
Type: `Boolean`  
Default value: `true`

Run `bower install` in conjunction with the `bowercopy` task.

#### options.report
Type: `Boolean`  
Default value: `true`

Report any modules in your bower.json that have not been configured to copy at least one file with `bowercopy`.

**Note:** *The clean option reports the same thing, so this option is ignored if clean is true.*

#### options.clean
Type: `Boolean`  
Default value: `false`

Removes the bower components directory on completion. The folder path that is removed is `options.srcPrefix`.

**Note: the directory will only be removed if the following conditions are met.**

  1. All task targets are run (i.e. grunt-bowercopy was run with the command `grunt bowercopy` and not `grunt bowercopy:target`).
  2. At least one thing was copied from each bower component (grunt-bowercopy tracks this for you).

#### options.ignore
Type: `Array`  
Default value: `[]`

Using the `report` or `clean` option, `grunt-bowercopy` tracks which dependencies have at least one file copied.
The `ignore` option can be used to specify any bower dependencies that aren't copied, but need to be defined in your `bower.json` anyway.

#### options.copyOptions
Type: `Object`  
Default value: `{}`

Options to pass to `grunt.file.copy` when copying the files. See [grunt.file.copy](http://gruntjs.com/api/grunt.file#grunt.file.copy)

### Usage Examples

```js
grunt.initConfig({
	bowercopy: {
		options: {
			// Bower components folder will be removed afterwards
			clean: true
		},
		// Anything can be copied
		test: {
			options: {
				destPrefix: 'test/js'
			},
			files: {
				// Keys are destinations (prefixed with `options.destPrefix`)
				// Values are sources (prefixed with `options.srcPrefix`); One source per destination
				// e.g. 'bower_components/chai/lib/chai.js' will be copied to 'test/js/libs/chai.js'
				'libs/chai.js': 'chai/lib/chai.js',
				'mocha/mocha.js': 'libs/mocha/mocha.js',
				'mocha/mocha.css': 'libs/mocha/mocha.css'
			}
		},
		// Javascript
		libs: {
			options: {
				destPrefix: 'public/js/libs'
			},
			files: {
				'jquery.js': 'jquery/jquery.js',
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
		// Less
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
		// Images
		images: {
			options: {
				destPrefix: 'public/images'
			},
			files: {
				'account/chosen-sprite.png': 'chosen/public/chosen-sprite.png',
				'account/chosen-sprite@2x.png': 'chosen/public/chosen-sprite@2x.png'
			}
		},
		// Entire folders
		folders: {
			files: {
				// Note: when copying folders, the destination (key) will be used as the location for the folder
				'public/js/libs/lodash': 'lodash',
				// The destination can also be a folder
				// Note: if the basename of the location does not have a period('.'),
				// it is assumed that you'd like a folder to be created if none exists
				// and the source filename will be used
				'public/js/libs': 'lodash/dist/lodash.js'
			}
		},
		// Glob patterns
		glob: {
			files: {
				// When using glob patterns, destinations are *always* folder names
				// into which matching files will be copied
				// Also note that subdirectories are **not** maintained
				// if a destination is specified
				// For example, one of the files copied here is
				// 'lodash/dist/lodash.js' -> 'public/js/libs/lodash/lodash.js'
				'public/js/libs/lodash': 'lodash/dist/*.js'
			}
		},
		// Glob without destination
		globSrc: {
			options: {
				destPrefix: 'public/js/libs'
			},
			// By not specifying a destination, you are denoting
			// that the lodash directory structure should be maintained
			// when copying.
			// For example, one of the files copied here is
			// 'lodash/dist/lodash.js' -> 'public/js/libs/lodash/dist/lodash.js'
			src: 'lodash/**/*.js'
		},
		// Main pragma
		// Adding :main to the end of a source path will retrieve the main file(s) for that package
		// If the main property is not specified by a package, bowercopy will fail
		main: {
			src: 'jquery.minlight:main',
			dest: 'public/js/plugins/'
		}
	}
});
```

## Contributing
Follow the same coding style present in the repo and add tests for any bug fix or feature addition.

See the [CONTRIBUTING.md](https://github.com/timmywil/grunt-bowercopy/blob/master/CONTRIBUTING.md) for more info.

## Release History

- **1.1.0** (*6-23-2014*) Add :main pragma and `ignore` option.
- **1.0.1** (*6-12-2014*) Updated node modules
- **1.0.0** (*3-26-2014*) Version 1
- **0.9.0** (*3-3-2014*) Warn if a source location was not found.
- **0.8.0** (*2-21-2014*) Adds support for folders for destinations when copying individual files.
- **0.7.1** (*1-20-2014*) Fix Windows issue with path seperators.
- **0.7.0** (*1-13-2014*) Add `options.report`. Camelcase `options.runBower`. Fix an issue with a source format (gh-9).
- **0.6.0** (*1-13-2014*) Add glob matcher.
- **0.5.0** (*12-31-2013*) Add `options.copyOptions` to be passed along to `grunt.file.copy` and fix issue with local-only bower usage.
- **0.4.0** (*12-3-2013*) Update grunt to 0.4.2. Add the ability to copy folders.
- **0.3.0** (*12-2-2013*) Add clean option for removing the bower components directory on full task completion.
- **0.2.0** (*11-19-2013*) Report any bower components not configured to be copied when all targets are run together.
- **0.1.0** (*11-19-2013*) First Release

## License
Copyright (c) 2014 Timmy Willison. Licensed under the MIT license.
