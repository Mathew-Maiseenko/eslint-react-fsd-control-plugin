/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/relative-imports'),
	RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester()
ruleTester.run('relative-imports', rule, {
	valid: [
		// Относительные импорты внутри одного слайса (разрешенные)
		{
			code: "import value from './model'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},
		{
			code: "import value from '../model'",
			filename: '/project/src/features/someFeature/ui/component.js',
			options: [{ aliases: ['@', '~'] }],
		},
		{
			code: "import { something } from './subfolder/file'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},

		// Абсолютные импорты между разными слоями (разрешенные)
		{
			code: "import value from '@/shared/ui'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},
		{
			code: "import value from '~/entities/user'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},
		{
			code: "import value from '@/app/providers'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},

		// Абсолютные импорты внутри одного слоя но разных слайсов (разрешенные)
		{
			code: "import value from '@/features/otherFeature'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
		},

		// Файлы вне структуры FSD (должны игнорироваться)
		{
			code: "import value from './somefile'",
			filename: '/project/utils/helpers.js',
			options: [{ aliases: ['@', '~'] }],
		},
		{
			code: "import value from '../../outside'",
			filename: '/project/src/main.js',
			options: [{ aliases: ['@', '~'] }],
		},
	],

	invalid: [
		// Абсолютные импорты внутри одного слайса (запрещенные)
		{
			code: "import value from '@/features/someFeature/model'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'unexpectedNonRelativeImportInsideSlice',
				},
			],
		},
		{
			code: "import value from '~/features/someFeature/ui'",
			filename: '/project/src/features/someFeature/model/index.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'unexpectedNonRelativeImportInsideSlice',
				},
			],
		},

		// Относительные импорты между разными слайсами (запрещенные)
		{
			code: "import value from '../../otherFeature'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'incorrectRelativeImportToSlicesOutsides',
				},
			],
		},
		{
			code: "import value from '../../otherFeature/model'",
			filename: '/project/src/features/someFeature/ui/component.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'incorrectRelativeImportToSlicesOutsides',
				},
			],
		},

		// Относительные импорты между разными слоями (запрещенные)
		{
			code: "import value from '../../../shared/ui'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'incorrectRelativeImportToSlicesOutsides',
				},
			],
		},
		{
			code: "import value from '../../../../entities/user'",
			filename: '/project/src/features/someFeature/subfolder/file.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'incorrectRelativeImportToSlicesOutsides',
				},
			],
		},

		// Смешанные случаи - относительные импорты в чужие слайсы
		{
			code: "import value from './../../otherSlice'",
			filename: '/project/src/features/someFeature/index.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'incorrectRelativeImportToSlicesOutsides',
				},
			],
		},

		// Абсолютные импорты внутри слайса с глубокой вложенностью
		{
			code: "import value from '@/features/someFeature/deep/nested/module'",
			filename: '/project/src/features/someFeature/another/deep/file.js',
			options: [{ aliases: ['@', '~'] }],
			errors: [
				{
					messageId: 'unexpectedNonRelativeImportInsideSlice',
				},
			],
		},
	],
})
