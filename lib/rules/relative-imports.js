/* eslint-disable eslint-plugin/require-meta-type */

/**
 * @fileoverview control to fsd corresponding import in slices and outside them
 * @author relative-imports
 */
'use strict'

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

		const hasAlias = importPath => {
			return aliases.some(alias => importPath.startsWith(alias))
		}

		const removeAlias = importPath => {
			for (const alias of aliases) {
				if (importPath.startsWith(alias)) {
					return importPath.slice(alias.length).replace(/^[\\/]/, '')
				}
			}
			return importPath
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

		const resolveRelativePath = (importPath, currentFilePath) => {
			const currentSegments = getPathSegments(currentFilePath)
			const importSegments = getPathSegments(importPath)

			// Убираем имя файла из текущего пути, оставляем только директорию
			const currentDirSegments = currentSegments.slice(0, -1)
			let resultSegments = [...currentDirSegments]

			for (const segment of importSegments) {
				if (segment === '..') {
					if (resultSegments.length > 0) {
						resultSegments.pop()
					}
				} else if (segment !== '.') {
					resultSegments.push(segment)
				}
			}

			return resultSegments.join('/')
		}

		const getImportLayerAndSlice = (importPath, currentFilePath) => {
			if (isImportRelative(importPath)) {
				const resolvedPath = resolveRelativePath(importPath, currentFilePath)
				return getLayerAndSlice(resolvedPath)
			}

			if (hasAlias(importPath)) {
				const pathWithoutAlias = removeAlias(importPath)
				const segments = pathWithoutAlias.split('/').filter(Boolean)
				return {
					layer: segments[0] || null,
					slice: segments[1] || null,
				}
			}

			return { layer: null, slice: null }
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
			const target = getImportLayerAndSlice(importPath, currentFilePath)

			console.log('Outside check:', {
				currentFile: currentFilePath,
				importPath,
				currentLayer: current.layer,
				currentSlice: current.slice,
				targetLayer: target.layer,
				targetSlice: target.slice,
			})

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
				if (!isImportRelative(importPath) && !hasAlias(importPath)) {
					return
				}

				const current = getLayerAndSlice(currentFile)
				const target = getImportLayerAndSlice(importPath, currentFile)

				console.log('Логирование:', {
					currentFile,
					importPath,
					currentLayer: current.layer,
					currentSlice: current.slice,
					targetLayer: target.layer,
					targetSlice: target.slice,
				})

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
