const fs = require('fs')
		
module.exports = Object.assign(
fs, {
		lstat: (f)=>new Promise(r=>r(fs.lstatSync(f))),
		exists: (f)=>new Promise(r=>r(fs.existsSync(f)))
	}
)