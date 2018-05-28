const fs = require('fs')
		
module.exports = Object.assign(fs, {
	lstat:(f)=>new Promise(r=>r(fs.lstatSync(f))),
	exists:(f)=>new Promise(r=>r(fs.existsSync(f))),
	readdir:(f,o)=>new Promise(r=>r(fs.readdirSync(f,o))),
	writeFile:(f,o)=>new Promise(r=>r(fs.writeFileSync(f,o))),
	readFile:(f,o)=>new Promise(r=>r(fs.readFileSync(f,o)))
})