const path = require('path')

function deleteAliases(filepath, aliases) {
	const parts = filepath.split(path.sep)

	// Если первая часть пути является распространенным алиасом - удаляем
	if (aliases.includes(parts[0])) {
		return parts.slice(1).join(path.sep)
	}

	return filepath
}

module.exports = {
	deleteAliases,
}
