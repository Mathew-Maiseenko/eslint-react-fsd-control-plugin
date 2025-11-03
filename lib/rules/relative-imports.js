//FIXME: Переписать без проблем с линтом

/* eslint-disable eslint-plugin/require-meta-type */

//---------------------------------------------------

/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

const { checkIsImportRelative } = require('../share/lib/checkIsImportAbsolute')
const { checkIsPathHaveAlias } = require('../share/lib/checkIsPathHaveAlias')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null, // `problem`, `suggestion`, or `layout`
		docs: {
			description:
				'control to fsd corresponding import in slices and outside them',
			recommended: false,
			url: null, // URL to the documentation page for this rule
		},
		fixable: null, // Or `code` or `whitespace`
		schema: [
			{
				type: 'object',
				properties: {
					aliases: {
						type: 'array',
						items: { type: 'string' },
					},
				},
			},
		], // Add a schema if the rule has options
		messages: {
			relativeImportFound: "Найден относительный импорт: '{{ importPath }}'",
		}, // Add messageId and message
	},

	create(context) {
		const options = context.options[0] || {}
		const aliases = options.aliases || ['@', '~']

		// variables should be defined here

		//----------------------------------------------------------------------
		// Helpers
		//----------------------------------------------------------------------

		// any helper functions should go here or else delete this section

		//----------------------------------------------------------------------
		// Public
		//----------------------------------------------------------------------

		return {
			ImportDeclaration(node) {
				const currentFile = context.filename

				const importFilePath = node.source.value

				if (checkIsImportRelative(importFilePath)) {
					context.report({
						node,
						messageId: 'relativeImportFound',
						data: {
							importPath: importFilePath, // подставляется в {{ importPath }}
						},
					})
				}
				if (checkIsPathHaveAlias(importFilePath, aliases)) {
					console.log(111)
				}
			},
		}
	},
}
