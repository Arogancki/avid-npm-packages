function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('./helper');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (options) {
        const cli = options === undefined;
        if (cli) options = yield helper.readArgs();

        yield helper.optionsValidation(options);

        const compresedFilePaths = yield helper.createCompressNames(options);

        let error = undefined;
        try {
            yield helper.compress([options.metadata, options.helm, options.docker], compresedFilePaths.fileTar, compresedFilePaths.fileBz2);
        } catch (e) {
            error = e;
        } finally {
            yield helper.removeFile(compresedFilePaths.fileTar).catch(function (e) {
                return console.warn(`Couldn't delete ${e.path} (${e.code}).`);
            });
            if (error) throw error;
        }

        return Object.assign({
            output: `Your feature pack has been successfully created to (${compresedFilePaths.fileBz2}) file.`,
            featurePackFile: compresedFilePaths.fileBz2
        }, options);
    });

    function pack(_x) {
        return _ref.apply(this, arguments);
    }

    return pack;
})();