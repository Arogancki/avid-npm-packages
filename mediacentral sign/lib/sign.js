function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('./helper');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (options) {
        const cli = options === undefined;
        if (cli) options = yield helper.readArgs();

        yield helper.optionsValidation(options);

        const files = yield helper.readFiles(options.file);
        const hashes = yield helper.getHashes(options.key, options.password, options.file, files);
        const manifest = {
            file: hashes
        };
        if (options.id) {
            manifest.onwerID = options.id;
        }
        yield helper.writeJsonFile(options.manifest, manifest);

        return Object.assign({
            output: `Manifest for ${Array.isArray(options.file) ? options.file.join(', ') : options.file} (${files.length} files) created in the ${options.manifest} file.`
        }, options);
    });

    function sign(_x) {
        return _ref.apply(this, arguments);
    }

    return sign;
})();