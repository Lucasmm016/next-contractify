import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: {
			js,
			prettier,
			'simple-import-sort': simpleImportSort,
		},
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser },
		rules: {
			'prettier/prettier': 'warn',
			'simple-import-sort/exports': 'warn',
			'simple-import-sort/imports': [
				'warn',
				{
					groups: [
						// Side effects (ex: import './globals.css')
						['^\\u0000'],

						// Node built-ins (node:)
						['^node:'],

						// Pacotes (react/next primeiro, depois o resto)
						['^react', '^next', '^@?\\w'],

						// Aliases internos (seu tsconfig tem "@/*")
						['^@/'],

						// Relativos (subindo pasta, mesma pasta)
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

						// Estilos no final
						['^.+\\.s?css$'],
					],
				},
			],
		},
	},
	tseslint.configs.recommended,
	prettierConfig,

	globalIgnores(['dist/**', 'node_modules/**', 'coverage/**']),
])
