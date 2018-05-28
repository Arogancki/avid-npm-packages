const   helper = require('./helper'),
        readConfigFile = require('./readConfigFile')

module.exports = async function publish(options){
    const CLI = options === undefined
    if (CLI)
        options = await helper.readArgs()
    
    await helper.optionsValidation(options)
    
    return helper.publish(await readConfigFile(options), options.didProgress)
};
