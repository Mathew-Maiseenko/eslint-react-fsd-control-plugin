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
		// give me some code that won't trigger a warning
		"import value from 'path/to/lib'",
	],

	invalid: [
		{
			code: "import value from './path/to/lib'",
			errors: [
				{
					messageId: 'relativeImportFound', // ваш messageId из meta.messages
				},
			],
			filename: 'src/features/test/index.js',
		},
	],
})
