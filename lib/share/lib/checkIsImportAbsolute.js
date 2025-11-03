function checkIsImportRelative(path) {
	return path.startsWith('.') || path.startsWith('../') || path.startsWith('./')
}

module.exports = {
	checkIsImportRelative,
}
