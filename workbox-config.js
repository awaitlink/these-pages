module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,html}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'dist/sw.js',
	dontCacheBustURLsMatching: /.*\.[a-z0-9]{8}\..*/
};