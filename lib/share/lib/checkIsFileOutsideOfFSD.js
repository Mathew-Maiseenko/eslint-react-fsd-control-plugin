const path = require('path')

function checkIsFileInsideOfFSD(filePath) {
	const parts = filePath.split(path.sep)
	const srcIndex = parts.indexOf('src')

	// Если нет src в пути - файл вне FSD
	if (srcIndex === -1) {
		return false
	}

	// Если после src нет достаточного количества частей для FSD структуры
	// Нужно как минимум: src/слой/слайс
	if (parts.length - srcIndex < 3) {
		return false
	}

	return true
}

module.exports = { checkIsFileInsideOfFSD }
