const { deleteAliases } = require('./deleteAliases')

const PATH_PATTERNS = {
	// Для shared: алиас/shared/любой-путь/название-модуля (ровно 3 сегмента)
	shared: /^shared\/[^\/]+\/[^\/]+$/,

	// Для app: алиас/app/любой-путь (минимум 2 сегмента)
	app: /^app\/.+$/,

	// Для остальных слоев (entities, features, widgets, pages): алиас/слой/название-модуля (ровно 2 сегмента)
	other: /^(entities|features|widgets|pages)\/[^\/]+$/,
}

function isValidImportPath(importPath, aliases, layerName) {
	const pathWithoutAlias = deleteAliases(importPath, aliases)
	console.log(pathWithoutAlias)

	// Если путь пустой после удаления алиасов - невалидный
	if (!pathWithoutAlias) {
		return false
	}

	switch (layerName) {
		case 'shared':
			// shared/любой-путь/название-модуля
			return PATH_PATTERNS.shared.test(pathWithoutAlias)

		case 'app':
			// app/любой-путь (минимум 2 сегмента)
			return PATH_PATTERNS.app.test(pathWithoutAlias)

		default:
			// entities/модуль, features/модуль и т.д.
			return PATH_PATTERNS.other.test(pathWithoutAlias)
	}
}

module.exports = {
	isValidImportPath,
	PATH_PATTERNS,
}

// Тесты для isValidImportPath
console.log('Testing isValidImportPath:')
console.log(
	'entities/User:',
	isValidImportPath('@/features/someFeature/model', ['@'], 'features')
) // true
