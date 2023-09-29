const fs = require('fs');
const path = require('path');

//move all files in public/modal/assets to public/modal
function moveAssets() {
	const dir = '../../../public/modal/assets';
	const dest = '../../../public/modal';
	fs.readdir(dir, (err, files) => {
		files.forEach((file) => {
			fs.rename(path.join(dir, file), path.join(dest, file), (err) => {
				if (err) throw err;
			});
		});
	});
}

//rename all occurences of "/assets/" to "" in the public/modal/index.html file
function renameReferences(files) {
	for (const file of files) {
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			const result = data.replace(/\/assets\//g, '');
			fs.writeFile(file, result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
		});
	}
}

moveAssets();

const files = ['../../../public/modal/index.html'];
renameReferences(files);
