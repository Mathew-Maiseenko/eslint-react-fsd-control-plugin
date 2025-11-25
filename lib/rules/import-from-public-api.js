/* eslint-disable eslint-plugin/require-meta-type */

/**
 * @fileoverview modules must import entities only from public api if this entiti
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const path = require('path')
const {
	checkIsFileInsideOfFSD,
} = require('../share/lib/checkIsFileOutsideOfFSD')
const { checkIsImportRelative } = require('../share/lib/checkIsImportRelative')

const {
	getLayerFromNonRelativePath,
} = require('../share/lib/checkIsWorkingAndImportLayersEquals')
const {
	getSliceNameFromNonRelativePath,
} = require('../share/lib/getWorkingAndImportSliceNames')
const { deleteAliases } = require('../share/lib/deleteAliases')
const { layersWeights } = require('../share/const/layersFSD')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null, // `problem`, `suggestion`, or `layout`
		docs: {
			description:
				'modules must import entities only from public api if this entiti',
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

			incorrectAbsoluteImportFromNonPublicApiFile: `
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

		return {
			ImportDeclaration(node) {
				const importFilePath = node.source.value

				const isImportRelative = checkIsImportRelative(importFilePath)

				if (isImportRelative) {
					return
				}

				const layerName = getLayerFromNonRelativePath(importFilePath, aliases)

				const sliceName = getSliceNameFromNonRelativePath(
					importFilePath,
					aliases
				)

				const needleImportPath = [layerName, sliceName].join(path.sep)
				if (deleteAliases(importFilePath, aliases) !== needleImportPath) {
					if (layerName === 'shared') {
					}
					return 'error'
				}
			},
		}
	},
}
