function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('./helper');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (options) {
        const cli = options === undefined;
        if (cli) options = yield helper.readArgs();

        yield helper.optionsValidation(options);

        try {
            yield helper.upload(options.pack, options.manifest, options.id);
        } catch (e) {
            if (e.hasOwnProperty('statusCode')) {
                throw new Error(`Couldn't reach the server or there was a connection error (status code: ${e.statusCode})`);
            }
            throw e;
        }
        return Object.assign({ output: `Your project (${options.pack}) has been successfully uploaded.` }, options);
    });

    function upload(_x) {
        return _ref.apply(this, arguments);
    }

    return upload;
})();