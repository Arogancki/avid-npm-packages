const   fs = require('./fs'),
        normalize = require('normalize-path')

module.exports = async function readConfigFile(options){
    const config = JSON.parse(await fs.readFile(options.config, 'utf8'))
    const throwIfUndefined = (v, k) => {if (v===undefined || v==="") throw new Error(`Invalid config file (${options.config}). Missing property ${k}`); return v}
    throwIfUndefined(config.identity, 'identity');
    throwIfUndefined(config.signing, 'signing');
    return {
        tag: throwIfUndefined(config.identity.version, 'version'),
        devID: throwIfUndefined(config.signing.developerID, 'developerID'),
        version: throwIfUndefined(config.identity.version, 'version'),
        organization: throwIfUndefined(config.signing.organization, 'organization').toLowerCase(),
        key: throwIfUndefined(config.signing.privateKeyPath, 'privateKeyPath'),
        appID: throwIfUndefined(config.identity.appID, 'appID'),
        appName: options.name.toLowerCase(),
        projectDir: normalize(options.project),        
        password: options.password,
    }
};
