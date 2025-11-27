/* eslint-disable eslint-plugin/require-meta-type */
/**
 * @fileoverview This rule check FSD layers and let programmer to import modules only if that import localed in layer lower than current file
 * @author bananacat
 */
'use strict'

const { layersWeights } = require('../share/const/layersFSD')
const {
	isInsideFSD,
	isImportRelative,
	hasAlias,
	getLayerAndSlice,
	getImportLayerAndSlice,
} = require('../share/utils/import-path-utils')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null, // `problem`, `suggestion`, or `layout`
		docs: {
			description:
				'This rule check FSD layers and let programmer to import modules only if that import located in layer lower than current file',
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
					letEqualImports: {
						type: 'boolean',
					},
				},
			},
		], // Add a schema if the rule has options
		messages: {
			incorrectImportFromHigherLayerFSD: `
        Invalid import found: \n
        --------------------------------------\n
        Import from: '{{ importLayer }}' layer\n
        Cannot be used in: '{{ currentLayer }} layer'\n
        --------------------------------------\n
        Reason: in FSD you have to import modules\n
        only from lowest layers
    	`,
		}, // Add messageId and message
	},

	create(context) {
		const options = context.options[0] || {}
		const aliases = options.aliases || ['@', '~']

		return {
			ImportDeclaration(node) {
				const currentFile = context.filename
				const importPath = node.source.value

				if (!isInsideFSD(currentFile)) {
					return
				}

				if (isImportRelative(importPath)) {
					return
				}

				if (!isImportRelative(importPath) && !hasAlias(importPath, aliases)) {
					return
				}

				const current = getLayerAndSlice(currentFile)
				const target = getImportLayerAndSlice(importPath, currentFile, aliases)

				const currentFileWeight = layersWeights[current.layer]
				const targetFileWeight = layersWeights[target.layer]

				if (!targetFileWeight || !currentFileWeight) {
					return
				}

				if (
					!options.letEqualImports &&
					currentFileWeight === targetFileWeight
				) {
					context.report({
						node,
						messageId: 'incorrectImportFromHigherLayerFSD',
						data: {
							importLayer: target.layer,
							currentLayer: current.layer,
						},
					})
				}

				if (currentFileWeight < targetFileWeight) {
					context.report({
						node,
						messageId: 'incorrectImportFromHigherLayerFSD',
						data: {
							importLayer: target.layer,
							currentLayer: current.layer,
						},
					})
				}
			},
		}
	},
}

//entities -> current
//import features -> target
