function checkIsPathHaveAlias(path, aliases) {
	if (!Array.isArray(aliases)) return false
	return aliases.some(alias => path.startsWith(alias))
}

module.exports = {
	checkIsPathHaveAlias,
}
