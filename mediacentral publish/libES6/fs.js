const   fsEx = require('fs-extra'),
        fs = require('fs')
		
module.exports = {
	exists: (f)=>new Promise(r=>r(fs.existsSync(f))),
	readFile: (f,o)=>new Promise(r=>r(fs.readFileSync(f,o))),
	remove: (f)=>new Promise(r=>r(fsEx.removeSync(f))),
	mkdir: (f,o)=>new Promise(r=>r(fs.mkdirSync(f,o)))
}