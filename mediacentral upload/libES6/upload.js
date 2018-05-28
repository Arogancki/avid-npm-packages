const   helper = require('./helper')

module.exports = async function upload(options){
    const cli = options === undefined;
    if (cli)
        options = await helper.readArgs()
        
    await helper.optionsValidation(options)

    try {
        await helper.upload(options.pack, options.manifest, options.id)
    }
    catch(e) {
        if (e.hasOwnProperty('statusCode')){
            throw new Error(`Couldn't reach the server or there was a connection error (status code: ${e.statusCode})`)
        }
        throw e
    }
	return Object.assign({output: `Your project (${options.pack}) has been successfully uploaded.`}, options)
}