const fs = require('fs');
const path = require('path');
exports.deleteFile = filePath => {
	file = path.join(path.dirname(process.mainModule.filename), filePath);
	fs.unlink(file, err => {
		if (err) {
			throw err;
		}
	});
}