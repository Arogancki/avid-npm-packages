const   helper = require('./helper')

module.exports = async function sign(options){
    const cli = options === undefined;
    if (cli)
        options = await helper.readArgs()
    
    await helper.optionsValidation(options)
    
    const files  = await helper.readFiles(options.file)
    const hashes = await helper.getHashes(options.key, options.password, options.file, files)
    const manifest = {
        file: hashes
    }
    if (options.id){
        manifest.onwerID = options.id;
    }
    await helper.writeJsonFile(options.manifest, manifest)
	
	return Object.assign({
		output: `Manifest for ${Array.isArray(options.file) ? options.file.join(', ') : options.file} (${files.length} files) created in the ${options.manifest} file.`
	}, options)
}