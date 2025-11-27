/* eslint-disable eslint-plugin/require-meta-type */

/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

const {
	getImportLayerAndSlice,
	hasAlias,
} = require('../share/utils/import-path-utils')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null,
		docs: {
			description:
				'control to fsd corresponding import in slices and outside them',
			recommended: false,
			url: null,
		},
		fixable: null,
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
		],
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
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const aliases = options.aliases || ['@', '~']

		// Вспомогательные функции
		const isImportRelative = importPath => {
			return importPath.startsWith('.') || importPath.startsWith('../')
		}

		const getPathSegments = filePath => {
			return filePath.replace(/\\/g, '/').split('/').filter(Boolean)
		}

		const getLayerAndSlice = filePath => {
			const segments = getPathSegments(filePath)
			const srcIndex = segments.indexOf('src')

			if (srcIndex === -1 || srcIndex + 2 >= segments.length) {
				return { layer: null, slice: null }
			}

			return {
				layer: segments[srcIndex + 1],
				slice: segments[srcIndex + 2],
			}
		}

		const isInsideFSD = filePath => {
			const segments = getPathSegments(filePath)
			return segments.includes('src')
		}

		const hasValidLayerAndSlice = fileInfo => {
			return fileInfo.layer && fileInfo.slice
		}

		const isRelativeImportGoingOutside = (currentFilePath, importPath) => {
			if (!isImportRelative(importPath)) return false

			const current = getLayerAndSlice(currentFilePath)
			const target = getImportLayerAndSlice(
				importPath,
				currentFilePath,
				aliases
			)

			// console.log('Outside check:', {
			// 	currentFile: currentFilePath,
			// 	importPath,
			// 	currentLayer: current.layer,
			// 	currentSlice: current.slice,
			// 	targetLayer: target.layer,
			// 	targetSlice: target.slice,
			// })

			// Если у текущего файла нет валидного слоя и слайса - не проверяем
			if (!hasValidLayerAndSlice(current)) return false

			// Если у целевого файла нет валидного слоя и слайса - считаем что импорт наружу
			if (!hasValidLayerAndSlice(target)) return true

			// Если слои разные - точно наружу
			if (current.layer !== target.layer) return true

			// Если слайсы разные - наружу
			return current.slice !== target.slice
		}

		return {
			ImportDeclaration(node) {
				const currentFile = context.filename
				const importPath = node.source.value

				// Пропускаем файлы не внутри FSD
				if (!isInsideFSD(currentFile)) {
					return
				}

				// Пропускаем абсолютные импорты без алиасов (node_modules)
				if (!isImportRelative(importPath) && !hasAlias(importPath, aliases)) {
					return
				}

				const current = getLayerAndSlice(currentFile)
				const target = getImportLayerAndSlice(importPath, currentFile, aliases)

				// console.log('Логирование:', {
				// 	currentFile,
				// 	importPath,
				// 	currentLayer: current.layer,
				// 	currentSlice: current.slice,
				// 	targetLayer: target.layer,
				// 	targetSlice: target.slice,
				// })

				const isSameLayer =
					current.layer && target.layer && current.layer === target.layer
				const isSameSlice =
					current.slice && target.slice && current.slice === target.slice

				// Внутри одного слайса используем только относительные импорты
				if (isSameLayer && isSameSlice) {
					if (!isImportRelative(importPath)) {
						context.report({
							node,
							messageId: 'unexpectedNonRelativeImportInsideSlice',
							data: {
								importPath: importPath,
								currentFile: currentFile,
							},
						})
					}
				} else {
					// Между разными слайсами запрещаем относительные импорты
					// Но только если у текущего файла есть валидный слой и слайс
					if (
						hasValidLayerAndSlice(current) &&
						isImportRelative(importPath) &&
						isRelativeImportGoingOutside(currentFile, importPath)
					) {
						context.report({
							node,
							messageId: 'incorrectRelativeImportToSlicesOutsides',
							data: {
								importPath: importPath,
								currentFile: currentFile,
							},
						})
					}
				}
			},
		}
	},
}
