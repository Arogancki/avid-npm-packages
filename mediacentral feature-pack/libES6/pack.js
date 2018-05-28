const   helper = require('./helper')

module.exports = async function pack(options){
    const cli = options === undefined;
    if (cli)
        options = await helper.readArgs()
        
    await helper.optionsValidation(options)

    const compresedFilePaths = await helper.createCompressNames(options)

    let error = undefined;
    try {
        await helper.compress([
            options.metadata, 
            options.helm, 
            options.docker
        ], compresedFilePaths.fileTar, compresedFilePaths.fileBz2)
    }
    catch(e) {
        error = e
    }
    finally {
        await helper.removeFile(compresedFilePaths.fileTar)
            .catch(e=>console.warn(`Couldn't delete ${e.path} (${e.code}).`))
        if(error) 
            throw error
    }
	
	return Object.assign({
		output:`Your feature pack has been successfully created to (${compresedFilePaths.fileBz2}) file.`,
		featurePackFile: compresedFilePaths.fileBz2
	}, options)
}