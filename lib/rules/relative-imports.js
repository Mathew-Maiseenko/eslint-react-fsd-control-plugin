//FIXME: Переписать без проблем с линтом

/* eslint-disable eslint-plugin/require-meta-type */

//---------------------------------------------------

/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

const { checkIsImportRelative } = require('../share/lib/checkIsImportRelative')
const {
	getWorkingAndImportEqualLayer,
} = require('../share/lib/checkIsWorkingAndImportLayersEquals')

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
			incorrectRelativeImportFound:
				"Найден относительный импорт: '{{ importPath }}'",
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

				const equalLayer = getWorkingAndImportEqualLayer(
					currentFile,
					importFilePath,
					aliases
				)

				const isLayersEquals = Boolean(equalLayer)

				if (isLayersEquals) {
					context.report({
						node,
						messageId: 'relativeImportFound',
						data: {
							importPath: importFilePath, // подставляется в {{ importPath }}
						},
					})
				} else {
					if (checkIsImportRelative(importFilePath)) {
						context.report({
							node,
							messageId: 'incorrectRelativeImportFound',
							data: {
								importPath: importFilePath, // подставляется в {{ importPath }}
							},
						})
					}
				}
			},
		}
	},
}
