function isExternalLibraryImport(importPath) {
	// Проверяем, является ли импорт из внешней библиотеки
	// (не начинается с точки и не содержит алиасов/слогов FSD)
	return (
		!importPath.startsWith('.') &&
		!importPath.includes('/') &&
		!importPath.startsWith('~/')
	)
}

module.exports = {
	isExternalLibraryImport,
}
