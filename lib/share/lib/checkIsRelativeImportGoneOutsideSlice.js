// {
// 	code: "import value from '../otherFeature/model'",
// 	filename: '/project/src/features/someFeature/ui/component.js',
// 	options: [{ aliases: ['@', '~'] }],
// 	errors: [
// 		{
// 			messageId: 'incorrectRelativeImportToSlicesOutsides',
// 		},
// 	],
// }

const path = require('path')

function checkIsRelativeImportGoneOutsideSlice(workingFilePath, importPath) {
	const goingBackCount = countOfComingBackInDirByPath(importPath)

	const workingFsdPathParts = deleteNonFsdPartsFromPath(workingFilePath).split(
		path.sep
	)
	if (goingBackCount === 0) {
		return false
	}

	const countOfFilesInRelativePath = 1
	const countOfFilesAndLayersInWorkingPath = 2

	if (
		goingBackCount + countOfFilesInRelativePath >=
		workingFsdPathParts.length - countOfFilesAndLayersInWorkingPath - 1
	) {
		return true
	}
	return false
}

function countOfComingBackInDirByPath(relativePath) {
	const parts = relativePath.split(path.sep)
	let goingBackCount = 0
	for (let i = 0; i < parts.length; i++) {
		const value = parts[i]
		if (value === '.') {
			continue
		} else if (value === '..') {
			goingBackCount = goingBackCount + 1
		} else {
			break
		}
	}

	return goingBackCount
}

function deleteNonFsdPartsFromPath(filePath) {
	const parts = filePath.split(path.sep) // массив частей пути
	const srcIndex = parts.indexOf('src') // индекс в СТРОКЕ (не в массиве!)
	if (parts.length - 1 >= srcIndex + 1) {
		return parts.slice(srcIndex + 1).join(path.sep)
	}
	return ''
}

module.exports = {
	checkIsRelativeImportGoneOutsideSlice,
}
