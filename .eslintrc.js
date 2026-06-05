module.exports = {
	root: true,
	env: { browser: true, es6: true, node: true },
	parser: '@typescript-eslint/parser',
	parserOptions: { sourceType: 'module', extraFileExtensions: ['.json'] },
	ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/community'],
			rules: { 'n8n-nodes-base/community-package-json-name-still-default': 'off' },
		},
		{
			files: ['./credentials/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/credentials'],
			rules: {
				// This rule's autofixer mangles a valid external docs URL into camelCase;
				// keep the real https link to ifm.ai/docs instead.
				'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
				'n8n-nodes-base/cred-class-field-documentation-url-not-http-url': 'off',
			},
		},
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes'],
		},
	],
};
