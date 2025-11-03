const path = require('path')
const { checkIsImportRelative } = require('./checkIsImportRelative')
const { checkIsPathHaveAlias } = require('./checkIsPathHaveAlias')
const {
	checkIsPathHasAbsoluteStrangeFormat,
} = require('./checkIsPathHasAbsoluteStrangeFormat')

function getWorkingAndImportSliceNames(workingFilePath, importPath, aliases) {
	if (!workingFilePath || !importPath) {
		return ''
	}

	const workingFileSliceName = getSliceNameFromFullPath(workingFilePath)

	let importFileSliceName = null

	if (checkIsImportRelative(importPath)) {
		const workingDir = path.dirname(workingFilePath)
		const importFullPath = path.resolve(workingDir, importPath)
		importFileSliceName = getSliceNameFromFullPath(importFullPath)
	} else if (checkIsPathHaveAlias(importPath, aliases)) {
		importFileSliceName = getSliceNameFromAliasedPath(importPath)
	} else if (checkIsPathHasAbsoluteStrangeFormat(importPath)) {
		importFileSliceName = importPath.split(path.sep)[1]
	} else {
		return ''
	}

	return importFileSliceName === workingFileSliceName
		? workingFileSliceName
		: ''
}

function getSliceNameFromAliasedPath(filePath) {
	const parts = filePath.split(path.sep) // массив частей пути

	return parts[2]
}

function getSliceNameFromFullPath(filePath) {
	const parts = filePath.split(path.sep) // массив частей пути
	const srcIndex = parts.indexOf('src') // индекс в СТРОКЕ (не в массиве!)

	if (srcIndex !== -1 && srcIndex + 2 < parts.length) {
		return parts[srcIndex + 2]
	}
	return null
}

module.exports = {
	getWorkingAndImportSliceNames,
}
