function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('./helper'),
      readConfigFile = require('./readConfigFile');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (options) {
        const CLI = options === undefined;
        if (CLI) options = yield helper.readArgs();

        yield helper.optionsValidation(options);

        return helper.publish((yield readConfigFile(options)), options.didProgress);
    });

    function publish(_x) {
        return _ref.apply(this, arguments);
    }

    return publish;
})();