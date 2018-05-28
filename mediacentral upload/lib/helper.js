let readArgs = (() => {
    var _ref = _asyncToGenerator(function* () {
        return yargs.usage('Usage: ').alias('m', 'manifest').describe('manifest', 'path to a manifest file').default('m', './manifest.json').string('manifest').alias('p', 'pack').describe('pack', 'path to a feature pack to upload').string('pack').alias('i', 'id').describe('id', 'MyApplication id for your project').string('id').demandOption(['pack', 'id']).help().argv;
    });

    return function readArgs() {
        return _ref.apply(this, arguments);
    };
})();

let optionsValidation = (() => {
    var _ref2 = _asyncToGenerator(function* (options) {
        if (!options.hasOwnProperty('pack')) throw new Error("A feature pack path not set!");

        if (!options.hasOwnProperty('manifest')) throw new Error("A manifest file path not set!");

        if (!options.hasOwnProperty('id')) throw new Error("MyApplication id not set!");

        if (typeof options.id !== 'string') {
            throw new Error(`MyApplication id must be a string`);
        }

        if (typeof options.pack !== 'string' || !(yield fs.exists(options.pack))) throw new Error(`Path to a project (${options.pack}) is invalid.`);

        if (typeof options.pack !== 'string' || !(yield fs.exists(options.manifest))) throw new Error(`Path to a manifest file (${options.manifest}) is invalid.`);

        if (!(yield fs.lstat(options.manifest).then(function (s) {
            return s.isFile();
        }))) throw new Error(`A manifest file (${options.manifest}) musn't be a directory.`);
    });

    return function optionsValidation(_x) {
        return _ref2.apply(this, arguments);
    };
})();

let upload = (() => {
    var _ref3 = _asyncToGenerator(function* (pack, manifest, id) {
        const res = yield rp({
            uri: uploadUri,
            method: 'POST',
            headers: {
                'content-type': 'multipart/form-data'
            },
            formData: {
                files: {
                    value: fs.createReadStream(pack),
                    options: {
                        filename: path.basename(pack),
                        contentType: null
                    }
                },
                manifest: {
                    value: fs.createReadStream(pack),
                    options: {
                        filename: path.basename(pack),
                        contentType: null
                    }
                },
                applicationId: id
            }
        });
        const resObj = JSON5.parse(`{${res.split('Version')[0]}}`);
        if (resObj.statusCode !== 200) throw new Error(`${resObj.ReasonPhrase} (status code: ${resObj.StatusCode})`);
    });

    return function upload(_x2, _x3, _x4) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path'),
      yargs = require('yargs'),
      rp = require('request-promise'),
      JSON5 = require('json5'),
      fs = require('./fs'),
      uploadUri = `https://api.avid.com/file/learning/UploadNewVersionWithManifest`;

;

module.exports = {
    readArgs,
    optionsValidation,
    upload
};