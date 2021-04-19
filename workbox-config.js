module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,js,html,woff2}'
	],
	swDest: 'dist/sw.js',
	dontCacheBustURLsMatching: /.*\.[a-z0-9]{8}\..*/,
	cleanupOutdatedCaches: true,
};