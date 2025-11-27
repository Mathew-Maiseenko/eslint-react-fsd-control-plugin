/**
 * @fileoverview This rule check FSD layers and let programmer to import modules only if that import localed in layer lower than current file
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/resolving-modules-by-size'),
	RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

// Для ESLint v9+ с flat config
const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2015,
		sourceType: 'module',
	},
})

ruleTester.run('resolving-modules-by-size', rule, {
	valid: [
		// Импорты из более низких слоев (разрешены)
		{
			code: "import { User } from '@/entities/User'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@'] }],
		},
		{
			code: "import { utils } from '~/shared/lib/utils'",
			filename: '/project/src/widgets/header/index.js',
			options: [{ aliases: ['~'] }],
		},
		{
			code: "import { constants } from '@/shared/constants'",
			filename: '/project/src/pages/main/index.js',
			options: [{ aliases: ['@'] }],
		},
		{
			code: "import { auth } from '@/features/auth'",
			filename: '/project/src/pages/profile/index.js',
			options: [{ aliases: ['@'] }],
		},

		// Импорты из того же слоя когда разрешено
		{
			code: "import { otherFeature } from '@/features/otherFeature'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@'], letEqualImports: true }],
		},

		// Относительные импорты внутри одного слайса
		{
			code: "import { model } from './model'",
			filename: '/project/src/features/someFeature/index.js',
		},
		{
			code: "import { component } from '../ui/component'",
			filename: '/project/src/features/someFeature/lib/utils.js',
		},

		// Внешние библиотеки (пропускаются)
		{
			code: "import React from 'react'",
			filename: '/project/src/features/someFeature/index.js',
		},
		{
			code: "import { useState } from 'react'",
			filename: '/project/src/widgets/header/index.js',
		},

		// Файлы вне FSD структуры (пропускаются)
		{
			code: "import something from '@/entities/User'",
			filename: '/project/config/webpack.config.js',
		},
		{
			code: "import value from '../../outside'",
			filename: '/project/src/main.js',
		},
	],

	invalid: [
		// Импорты из более высоких слоев (запрещены)
		{
			code: "import { Header } from '@/widgets/Header'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},
		{
			code: "import { MainPage } from '@/pages/MainPage'",
			filename: '/project/src/features/auth/index.js',
			options: [{ aliases: ['@'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},
		{
			code: "import { App } from '@/app/App'",
			filename: '/project/src/widgets/sidebar/index.js',
			options: [{ aliases: ['@'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},
		{
			code: "import { pageComponent } from '~/pages/Profile'",
			filename: '/project/src/entities/user/index.js',
			options: [{ aliases: ['~'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},

		// Импорты из того же слоя когда запрещено (по умолчанию)
		{
			code: "import { otherFeature } from '@/features/otherFeature'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},
		{
			code: "import { User } from '@/entities/User'",
			filename: '/project/src/entities/Product/index.js',
			options: [{ aliases: ['@'] }],
			errors: [
				{
					messageId: 'incorrectImportFromHigherLayerFSD',
				},
			],
		},
	],
})
