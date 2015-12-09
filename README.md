# tests-for-staged-files
Returns test files related to source files staged for commit, as a space-separated string.

`tests-for-staged-files` is meant to be used as a CLI tool. It expects two globs [1] and returns a space-separated
string with the paths to test files which are related [2] to the currently staged files (in Git). Two important notes:

1. Only the ** and * patterns are supported in globs. Feel free to create a PR to add more flexibility.
2. Relation between source and test is purely based on file paths. It does not use code coverage tooling. The glob
   patterns are used to convert from source paths to test paths. Pattern matches in the sources glob are applied to the
   patterns in the tests glob, right-to-left. If any patterns remain unused in the tests, they remain in place. For
   example:

   ```
   src/**/*.js => src/actions/count.js => test/**/**/*.js => test/**/actions/count.js
   ```

The intended use-case for this script is to run only relevant tests as part of a pre-commit hook. Therefore it's aimed
at speed rather than accuracy. Your CI server should run the entire test suite.

## Installation

Just add it as a devDependency:

```
npm i -D tests-for-staged-files
```

## Usage

```
tests-for-staged-files [sourcesGlob] [testsGlob]
```

For example:

```
tests-for-staged-files 'src/**/*.js' 'src/**/*.spec.js'
```

To run Mocha with just the test files which are related to files staged for commit:

```
npm run tests-for-staged-files 'src/**/*.js' 'test/**/**/*.js' | xargs mocha
```

### As a [pre-commit](https://www.npmjs.com/package/pre-commit) hook:

```json
"scripts": {
  "test:staged": "tests-for-staged-files 'src/**/*.js' 'test/**/**/*.js' | xargs mocha"
},
"pre-commit": [
  "test:staged"
]
```
