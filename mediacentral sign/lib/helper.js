let readPrivateKey = (() => {
    var _ref = _asyncToGenerator(function* (file, passphrase) {
        let options = {
            filename: file
        };
        if (passphrase) {
            options.passphrase = passphrase;
        }
        return sshpk.parsePrivateKey((yield fs.readFile(file)), 'ssh', options);
    });

    return function readPrivateKey(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let readFilesRecursive = (() => {
    var _ref2 = _asyncToGenerator(function* (file) {
        if (yield fs.lstat(file).then(function (s) {
            return s.isFile();
        })) {
            return [file];
        }
        return fs.readdir(file).then(function (f) {
            return Promise.all(f.map(function (f) {
                return path.join(file, f);
            }).map(readFilesRecursive)).then(function (f) {
                return f.reduce(function (p, v) {
                    return [...p, ...v];
                }, []);
            });
        });
    });

    return function readFilesRecursive(_x3) {
        return _ref2.apply(this, arguments);
    };
})();

let writeJsonFile = (() => {
    var _ref3 = _asyncToGenerator(function* (file, object) {
        return fs.writeFile(file, JSON.stringify(object, null, 2));
    });

    return function writeJsonFile(_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

let getHashes = (() => {
    var _ref4 = _asyncToGenerator(function* (keyFile, password, dir, files) {
        const hashes = {};
        const privateKey = yield readPrivateKey(keyFile, password);
        yield Promise.all(files.map(function (f) {
            return fs.readFile(path.join(dir, f), 'utf8').then(function (data) {
                return hashes[f !== '' ? f : path.basename(dir)] = privateKey.createSign('sha512').update(data).sign().toString();
            });
        }));
        return hashes;
    });

    return function getHashes(_x6, _x7, _x8, _x9) {
        return _ref4.apply(this, arguments);
    };
})();

let readArgs = (() => {
    var _ref5 = _asyncToGenerator(function* () {
        return yargs.usage('Usage: ').alias('k', 'key').describe('key', 'path to a private key').string('key')
        // .default('k', 'id_rsa')

        .alias('m', 'manifest').describe('manifest', 'path to a new or existing manifest file').default('manifest', './manifest.json').string('manifest').alias('f', 'file').describe('file', 'path to a directory or file to sign').default('file', '.').string('file').alias('p', 'password').describe('password', 'password to the private key').string('password').alias('i', 'id').describe('id', 'developers ID (assigned by Avid)').string('id').demandOption(['key']).help().argv;
    });

    return function readArgs() {
        return _ref5.apply(this, arguments);
    };
})();

let optionsValidation = (() => {
    var _ref6 = _asyncToGenerator(function* (options) {

        if (!options.hasOwnProperty('key')) throw new Error("A key file not set!");

        if (!options.hasOwnProperty('file')) throw new Error("File not set!");

        if (!options.hasOwnProperty('manifest')) throw new Error("A manifest file not set!");

        if (typeof options.key !== 'string') {
            throw new Error(`Path to a key file must be a string.`);
        }

        if (typeof options.manifest !== 'string') {
            throw new Error(`Path to a manifest file must be a string.`);
        }

        if (typeof options.file !== 'string' && !Array.isArray(options.file)) {
            throw new Error(`File to sign must be a string or array of strings.`);
        }

        if (options.password && typeof options.password !== 'string') {
            throw new Error(`Password must be a string.`);
        }

        if (options.id && typeof options.id !== 'string') {
            throw new Error(`developers ID must be a string.`);
        }

        if (!(yield fs.exists(options.key))) throw new Error(`Path to a key file (${options.key}) is invalid.`);

        if (Array.isArray(options.file)) {
            yield Promise.all(options.file.map(function (f) {
                return fs.exists(f).then(function (exists) {
                    if (!exists) throw new Error(`Path to a directory or file to sign (${f}) is invalid.`);
                });
            }));
        } else if (!(yield fs.exists(options.file))) throw new Error(`Path to a directory or file to sign (${options.file}) is invalid.`);

        if ((yield fs.exists(options.manifest)) && !(yield fs.lstat(options.manifest).then(function (s) {
            return s.isFile();
        }))) throw new Error(`A manifest file (${options.manifest}) musn't be a directory.`);

        if (!(yield fs.lstat(options.key).then(function (s) {
            return s.isFile();
        }))) throw new Error(`A key file (${options.key}) musn't be a directory.`);
    });

    return function optionsValidation(_x10) {
        return _ref6.apply(this, arguments);
    };
})();

let readFiles = (() => {
    var _ref7 = _asyncToGenerator(function* (file) {
        return (Array.isArray(file) ? Promise.all(file.map(function (fi) {
            return readFilesRecursive(fi);
        })).then(function (files) {
            return files.reduce(function (p, v) {
                return [...p, ...v];
            }, []);
        }) : readFilesRecursive(file)).then(function (files) {
            return files.map(function (f) {
                return path.relative(file, f);
            });
        });
    });

    return function readFiles(_x11) {
        return _ref7.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path'),
      yargs = require('yargs'),
      sshpk = require('sshpk'),
      sha512 = require('js-sha512').sha512,
      fs = require('./fs');

module.exports = {
    readArgs,
    optionsValidation,
    readFiles,
    writeJsonFile,
    getHashes
};