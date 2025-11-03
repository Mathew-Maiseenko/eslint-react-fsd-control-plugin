// @/shared/...      // переиспользуемые модули
// @/entities/...     // бизнес-сущности
// @/features/...     // функциональности
// @/widgets/...      // композитные блоки
// @/pages/...        // страницы
// @/app/...          // настройки приложения
const path = require('path')

function getLayerFSDWithAliases(fileToPath) {
	const importPathsDirs = fileToPath.split(path.sep)

	const layer = importPathsDirs[1]

	return layer
}

module.exports = {
	getLayerFSDWithAliases,
}
