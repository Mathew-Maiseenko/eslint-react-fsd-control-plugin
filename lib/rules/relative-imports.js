//FIXME: Переписать без проблем с линтом

/* eslint-disable eslint-plugin/require-meta-type */

//---------------------------------------------------

/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

const {
	checkIsFileInsideOfFSD,
} = require('../share/lib/checkIsFileOutsideOfFSD')
const { checkIsImportRelative } = require('../share/lib/checkIsImportRelative')
const {
	checkIsRelativeImportGoneOutsideSlice,
} = require('../share/lib/checkIsRelativeImportGoneOutsideSlice')
const {
	getWorkingAndImportEqualLayer,
} = require('../share/lib/checkIsWorkingAndImportLayersEquals')
const {
	getWorkingAndImportSliceNames,
} = require('../share/lib/getWorkingAndImportSliceNames')

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
			unexpectedNonRelativeImportInsideSlice: `
        Invalid import found: \n
        --------------------------------------\n
        Import from: '{{ importPath }}'\n
        Cannot be used in file: '{{ currentFile }}'\n
        --------------------------------------\n
        Reason: incorrect reference to entity within its own slice
    	`,

			incorrectRelativeImportToSlicesOutsides: `
        Invalid relative import found: \n
        --------------------------------------\n
        Import from: '{{ importPath }}'\n
        Cannot be used in file: '{{ currentFile }}'\n
        --------------------------------------\n
        Reason: incorrect reference to external slices
    	`,
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

				const equalSliceName = getWorkingAndImportSliceNames(
					currentFile,
					importFilePath,
					aliases
				)

				const isLayersEquals = Boolean(equalLayer)
				const isSliceNameEquals = Boolean(equalSliceName)
				const isImportRelative = checkIsImportRelative(importFilePath)
				const isRelativeImportGoneOutsideSlice =
					checkIsRelativeImportGoneOutsideSlice(currentFile, importFilePath)

				if (isLayersEquals && isSliceNameEquals) {
					if (!isImportRelative && checkIsFileInsideOfFSD(currentFile)) {
						context.report({
							node,
							messageId: 'unexpectedNonRelativeImportInsideSlice',
							data: {
								importPath: importFilePath,
								currentFile: currentFile,
							},
						})
					}
				} else {
					if (
						isImportRelative &&
						isRelativeImportGoneOutsideSlice &&
						checkIsFileInsideOfFSD(currentFile)
					) {
						context.report({
							node,
							messageId: 'incorrectRelativeImportToSlicesOutsides',
							data: {
								importPath: importFilePath,
								currentFile: currentFile,
							},
						})
					}
				}
			},
		}
	},
}
