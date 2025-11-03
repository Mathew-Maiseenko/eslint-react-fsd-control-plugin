const layersWeights = {
	shared: 1, // переиспользуемые модули
	entities: 2, // бизнес-сущности
	features: 3, // функциональности
	widgets: 4, // композитные блоки
	pages: 5, // страницы
	processes: 6, // процессы приложения | deprecated
	app: 7, // настройки приложения
}

const layers = Object.keys(layersWeights)

module.exports = {
	layers,
	layersWeights,
}
