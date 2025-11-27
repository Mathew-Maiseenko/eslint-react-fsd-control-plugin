// Вспомогательные функции
const isImportRelative = importPath => {
	return importPath.startsWith('.') || importPath.startsWith('../')
}

const hasAlias = (importPath, aliases = ['@', '~']) => {
	return aliases.some(alias => importPath.startsWith(alias))
}

const removeAlias = (importPath, aliases) => {
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

const getImportLayerAndSlice = (importPath, currentFilePath, aliases) => {
	if (isImportRelative(importPath)) {
		const resolvedPath = resolveRelativePath(importPath, currentFilePath)
		return getLayerAndSlice(resolvedPath)
	}

	if (hasAlias(importPath, aliases)) {
		const pathWithoutAlias = removeAlias(importPath, aliases)
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

module.exports = {
	isImportRelative,
	hasAlias,
	removeAlias,
	getPathSegments,
	getLayerAndSlice,
	resolveRelativePath,
	getImportLayerAndSlice,
	isInsideFSD,
	hasValidLayerAndSlice,
}
