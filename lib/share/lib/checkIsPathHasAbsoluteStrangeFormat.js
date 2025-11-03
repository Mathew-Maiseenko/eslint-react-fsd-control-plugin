const path = require('path')
const { layers } = require('../const/layersFSD')

function checkIsPathHasAbsoluteStrangeFormat(filePath) {
	return layers.some(layer => layer === filePath.split(path.sep)[0])
}

module.exports = {
	checkIsPathHasAbsoluteStrangeFormat,
}
