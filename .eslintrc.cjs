module.exports = {
	extends: [
		'./node_modules/rocket-boots-eslint/eslint-config.cjs',
	],
	rules: {
		// your custom rules here
		'import/no-extraneous-dependencies': 0,
		'no-underscore-dangle': 1,
		'max-lines': 1,
		'no-unused-vars': 1,
		'quote-props': 1,
		'one-var': 1,
	},
};
