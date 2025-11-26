function deleteAliases(importPath, aliases) {
	for (const alias of aliases) {
		if (importPath.startsWith(alias)) {
			return importPath.slice(alias.length).replace(/^[\\/]/, '')
		}
	}
	return importPath
}

module.exports = {
	deleteAliases,
}
