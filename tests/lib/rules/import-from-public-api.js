/**
 * @fileoverview modules must import entities only from public api if this entity
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/import-from-public-api'),
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

ruleTester.run('import-from-public-api', rule, {
	valid: [
		// Относительные импорты - всегда разрешены
		{
			code: "import { something } from './components/Test'",
		},
		{
			code: "import { something } from '../components/Test'",
		},
		{
			code: "import { something } from '../../lib/helpers'",
		},

		// Внешние библиотеки - всегда разрешены
		{
			code: "import React from 'react'",
		},
		{
			code: "import { useState } from 'react'",
		},
		{
			code: "import _ from 'lodash'",
		},

		// Корректные импорты для entities/features/widgets/pages (public API)
		{
			code: "import { User } from '@/entities/User'",
		},
		{
			code: "import { Auth } from '~/features/Auth'",
		},
		{
			code: "import { Header } from '@/widgets/Header'",
		},

		// Корректные импорты для shared слоя
		{
			code: "import { Button } from '@/shared/ui/Button'",
		},
		{
			code: "import { constants } from '~/shared/lib/constants'",
		},

		// Корректные импорты для app слоя
		{
			code: "import { router } from '@/app/router'",
		},
		{
			code: "import { StoreProvider } from '~/app/providers/StoreProvider'",
		},
	],

	invalid: [
		// Некорректные импорты для entities/features/widgets/pages (не public API)
		{
			code: "import { helper } from '@/entities/User/lib/helper'",
			errors: [
				{
					messageId: 'invalidImportPathForLayer',
				},
			],
		},
		{
			code: "import { model } from '~/features/Auth/model'",
			errors: [
				{
					messageId: 'invalidImportPathForLayer',
				},
			],
		},

		// Некорректные паттерны для shared слоя
		{
			code: "import { something } from '@/shared/lib'",
			errors: [
				{
					messageId: 'invalidImportPathForLayer',
				},
			],
		},

		// Некорректные паттерны для app слоя
		{
			code: "import { something } from '@/app'",
			errors: [
				{
					messageId: 'invalidImportPathForLayer',
				},
			],
		},

		// Некорректные паттерны для других слоев
		{
			code: "import { something } from '@/entities'",
			errors: [
				{
					messageId: 'invalidImportPathForLayer',
				},
			],
		},
	],
})
