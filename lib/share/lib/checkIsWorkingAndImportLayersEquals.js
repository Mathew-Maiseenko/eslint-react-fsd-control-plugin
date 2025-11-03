const path = require('path')

function checkIsWorkingAndImportLayersEquals(workingFilePath, importPath) {
	const parts = workingFilePath.split(path.sep) // массив частей пути
	const srcIndex = parts.indexOf('src') // индекс в СТРОКЕ (не в массиве!)

	parts.splice(srcIndex)
}
