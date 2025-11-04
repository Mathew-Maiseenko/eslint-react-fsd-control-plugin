/* eslint-disable eslint-plugin/require-meta-type */
/**
 * @fileoverview control rule for moduled stules importing obj name
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null, // `problem`, `suggestion`, or `layout`
		docs: {
			description: 'control rule for moduled stules importing obj name',
			recommended: false,
			url: null, // URL to the documentation page for this rule
		},
		fixable: null, // Or `code` or `whitespace`
		schema: [
			{
				type: 'string', // название переменной импортированной из стилей
			},
		], // Add a schema if the rule has options
		messages: {
			incorrectModulesStylesObjImport: `
        Invalid module styles import: \n
        --------------------------------------\n
        Imported entity from: '{{ importPath }}'\n
        Should be named: '{{ requiredEntityName }}'\n
        --------------------------------------\n
      `,
			incorrectModulesStylesObjImport_Global: `
        Invalid module styles import: \n
        --------------------------------------\n
        Imported namespace from: '{{ importPath }}'\n
        Should be named: '{{ requiredEntityName }}'\n
        --------------------------------------\n
    `,
			incorrectModulesStylesObjImport_Named: `
        Invalid module styles import: \n
        --------------------------------------\n
        Named import from: '{{ importPath }}'\n
        Named imports are not allowed for module styles\n
        Use default or namespace import instead\n
        --------------------------------------\n
    `,
		}, // Add messageId and message
	},

	create(context) {
		const importVariableNameFromConfig = context.options[0] || 'classes'
		const stylesFilesExtensions = ['css', 'scss', 'sass', 'less', 'styl']

		return {
			ImportDeclaration(node) {
				const importFilePath = node.source.value

				const isImportFileStylesFile = stylesFilesExtensions.some(extension =>
					importFilePath.endsWith(`module.${extension}`)
				)

				if (!isImportFileStylesFile) {
					return
				}

				// Проверяем все спецификаторы импорта
				node.specifiers.forEach(specifier => {
					if (specifier.type === 'ImportDefaultSpecifier') {
						// import styles from './styles.module.css'
						const importedName = specifier.local.name
						if (importedName !== importVariableNameFromConfig) {
							context.report({
								node: specifier,
								messageId: 'incorrectModulesStylesObjImport',
								data: {
									importPath: importFilePath,
									requiredEntityName: importVariableNameFromConfig,
								},
							})
						}
					} else if (specifier.type === 'ImportNamespaceSpecifier') {
						// import * as styles from './styles.module.css'

						context.report({
							node: specifier,
							messageId: 'incorrectModulesStylesObjImport_Global',
							data: {
								importPath: importFilePath,
								requiredEntityName: importVariableNameFromConfig,
							},
						})
					} else if (specifier.type === 'ImportSpecifier') {
						// import { className } from './styles.module.css'
						context.report({
							node: specifier,
							messageId: 'incorrectModulesStylesObjImport_Named',
							data: {
								importPath: importFilePath,
							},
						})
					}
				})
			},
		}
	},
}

/*
create(context) {
		const importVariableNameFromConfig = context.options[0] || 'classes'
		const stylesFilesExtensions = ['css', 'scss', 'sass', 'less', 'styl']
		//----------------------------------------------------------------------
		// Helpers
		//----------------------------------------------------------------------

		// any helper functions should go here or else delete this section

		//----------------------------------------------------------------------
		// Public
		//----------------------------------------------------------------------

		return {
			ImportDeclaration(node) {
				const importFilePath = node.source.value
				const nameOfImportedEntity = node.specifiers[0].local.name

				const isImportFileStylesFile = stylesFilesExtensions.some(extension =>
					importFilePath.endsWith(`module.${extension}`)
				)

				if (
					isImportFileStylesFile &&
					importVariableNameFromConfig !== nameOfImportedEntity
				) {
					context.report({
						node,
						messageId: 'incorrectModulesStylesObjImport',
						data: {
							importPath: importFilePath,
							requiredEntityName: importVariableNameFromConfig,
						},
					})
				}
			},
			// visitor functions for different types of nodes
		}
	},

*/
