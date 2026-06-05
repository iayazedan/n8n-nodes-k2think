const { src, dest } = require('gulp');

// Copies node/credential SVG icons into dist so n8n can render them.
function buildIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
