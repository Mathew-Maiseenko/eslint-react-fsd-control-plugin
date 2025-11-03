const path = require('path')
const { checkIsImportRelative } = require('./checkIsImportRelative')
const { checkIsPathHaveAlias } = require('./checkIsPathHaveAlias')
const {
	checkIsPathHasAbsoluteStrangeFormat,
} = require('./checkIsPathHasAbsoluteStrangeFormat')

function getWorkingAndImportEqualLayer(workingFilePath, importPath, aliases) {
	const workingFileLayer = getLayerFromFullPath(workingFilePath)

	let importFileLayer = null

	if (checkIsImportRelative(importPath)) {
		const workingDir = path.dirname(workingFilePath)
		const importFullPath = path.resolve(workingDir, importPath)
		importFileLayer = getLayerFromFullPath(importFullPath)
	} else if (checkIsPathHaveAlias(importPath, aliases)) {
		importFileLayer = getLayerFromAliasedPath(importPath)
	} else if (checkIsPathHasAbsoluteStrangeFormat(importPath)) {
		importFileLayer = importPath.split(path.sep)[0]
	} else {
		return ''
	}

	return importFileLayer === workingFileLayer ? workingFileLayer : ''
}

function getLayerFromAliasedPath(filePath) {
	const parts = filePath.split(path.sep) // массив частей пути

	return parts[1]
}

function getLayerFromFullPath(filePath) {
	const parts = filePath.split(path.sep) // массив частей пути
	const srcIndex = parts.indexOf('src') // индекс в СТРОКЕ (не в массиве!)

	if (srcIndex !== -1 && srcIndex + 1 < parts.length) {
		return parts[srcIndex + 1]
	}
	return null
}

module.exports = {
	getWorkingAndImportEqualLayer,
}
