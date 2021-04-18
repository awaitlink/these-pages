module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,html,eot,woff2}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'dist/sw.js',
	dontCacheBustURLsMatching: /.*\.[a-z0-9]{8}\..*/,
	cleanupOutdatedCaches: true,
};