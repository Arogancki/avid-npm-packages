function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('./fs'),
      normalize = require('normalize-path');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (options) {
        const config = JSON.parse((yield fs.readFile(options.config, 'utf8')));
        const throwIfUndefined = function (v, k) {
            if (v === undefined || v === "") throw new Error(`Invalid config file (${options.config}). Missing property ${k}`);return v;
        };
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
            password: options.password
        };
    });

    function readConfigFile(_x) {
        return _ref.apply(this, arguments);
    }

    return readConfigFile;
})();