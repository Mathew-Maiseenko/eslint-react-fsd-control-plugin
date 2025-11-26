/* eslint-disable eslint-plugin/require-meta-type */

/**
 * @fileoverview modules must import entities only from public api if this entiti
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const { checkIsImportRelative } = require('../share/lib/checkIsImportRelative')

const {
	getLayerFromNonRelativePath,
} = require('../share/lib/checkIsWorkingAndImportLayersEquals')

const { deleteAliases } = require('../share/lib/deleteAliases')
const {
	isValidImportPath,
} = require('../share/lib/isImportPathCorrespondPublicApi')
const { isExternalLibraryImport } = require('../share/lib/checkIsLibratyImport')

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
			invalidImportPathForLayer: `
				Invalid import path for {{ layerName }} layer:
				--------------------------------------
				Import from: '{{ importPath }}'
				Expected pattern: {{ expectedPattern }}
				--------------------------------------
				Reason: import must follow FSD public API conventions
			`,
		},
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

				if (isExternalLibraryImport(importFilePath)) {
					return
				}

				const layerName = getLayerFromNonRelativePath(importFilePath, aliases)

				const pathWithoutAlias = deleteAliases(importFilePath, aliases)
				const pathSegments = pathWithoutAlias.split(/[\\/]/).length

				if (['shared', 'app'].includes(layerName) && pathSegments > 3) {
					return
				}

				if (!isValidImportPath(importFilePath, aliases, layerName)) {
					let expectedPattern = `${layerName}/module-name`

					context.report({
						node,
						messageId: 'invalidImportPathForLayer',
						data: {
							importPath: importFilePath,
							layerName: layerName,
							expectedPattern: expectedPattern,
						},
					})
					return
				}
			},
		}
	},
}
