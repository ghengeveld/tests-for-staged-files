import minimatch from 'minimatch';
import promisify from 'promisify-node';

const glob = promisify(require('glob'));
const stagedGitFiles = promisify(require('staged-git-files'));

const [ , , sourceGlob, testGlob ] = process.argv;

stagedGitFiles()
	.then(results => results.map(staged => staged.filename))
	.then(files => files.map(findRelatedTest).filter(Boolean))
	.then(globs => Promise.all(globs.map(g => glob(g))))
	.then(flatten)
	.then(tests => tests.join(' '))
	.then(pathstring => process.stdout.write(pathstring));

function findRelatedTest(filepath) {
	if (minimatch(filepath, sourceGlob, { matchBase: true })) {
		const [ , ...matches ] = filepath.match(globToRegExp(sourceGlob));
		return reverse(matches.reverse().reduce((acc, match) => acc.replace(/\*+/, reverse(match)), reverse(testGlob)));
	}

	if (minimatch(filepath, testGlob, { matchBase: true })) {
		return filepath;
	}
}

function globToRegExp(glob) {
	return new RegExp(`^${glob.replace(/\*\*/g, '(.+)').replace(/\*/g, '([^/]+)')}$`);
}

function reverse(string) {
	return string.split('').reverse().join('');
}

function flatten(arrays) {
	return arrays.reduce((acc, array) => {
		acc.push(...array);
		return acc;
	}, []);
}
