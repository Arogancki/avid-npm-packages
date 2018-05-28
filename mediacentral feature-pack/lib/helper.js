let readArgs = (() => {
    var _ref = _asyncToGenerator(function* () {
        return yargs.usage('Usage: ').alias('m', 'metadata').describe('metadata', 'path to a metadata file based on the feature pack definition').string('metadata').alias('h', 'helm').describe('helm', 'path to a helm chart file').string('helm').alias('d', 'docker').describe('docker', 'a docker image file with the contents of build').string('docker').alias('t', 'tag').describe('tag', 'a version tag').string('tag').alias('o', 'output').describe('output', 'an output directory').string('output').default('output', '.').demandOption(['metadata', 'helm', 'docker', 'tag']).help().argv;
    });

    return function readArgs() {
        return _ref.apply(this, arguments);
    };
})();

let validateFile = (() => {
    var _ref2 = _asyncToGenerator(function* (options, name) {
        if (!options.hasOwnProperty(name)) throw new Error(`Path to a ${name} file is not set!`);

        if (typeof options[name] !== 'string') throw new Error(`${name} must be a string!`);

        if (!(yield fs.exists(options[name]))) throw new Error(`Path to a ${name} file (${options[name]}) is invalid.`);

        if (!(yield fs.lstat(options[name]).then(function (s) {
            return s.isFile();
        }))) throw new Error(`A (${name}) file (${options[name]}) musn't be a directory.`);
    });

    return function validateFile(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
})();

let optionsValidation = (() => {
    var _ref3 = _asyncToGenerator(function* (options) {
        if (!options.hasOwnProperty('tag')) throw new Error(`A version tag is not set!`);

        if (typeof options.tag !== 'string') throw new Error(`Tag must be a string!`);

        if (!options.hasOwnProperty('output')) throw new Error(`An output directory is not set!`);

        if (typeof options.output !== 'string') throw new Error(`An output directory must be a string!`);

        if (!(yield fs.exists(options.output))) throw new Error(`Path to an output directory (${options.output}) is invalid.`);

        if (!(yield fs.lstat(options.output).then(function (s) {
            return s.isDirectory();
        }))) throw new Error(`An output musn't be a directory.`);

        return Promise.all([validateFile(options, 'metadata'), validateFile(options, 'helm'), validateFile(options, 'docker')]);
    });

    return function optionsValidation(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

let createCompressNames = (() => {
    var _ref4 = _asyncToGenerator(function* (options) {
        const fileBz2 = path.join(options.output, `${path.basename(options.helm, path.extname(options.helm))}-${options.tag}.tar.bz2`);
        if (yield fs.exists(fileBz2)) throw new Error(`File ${fileBz2} already exists`);
        do {
            var fileTar = path.join(options.output, `${timestamp('YYYY-MM-DD-mm-ss')}.${randomstring.generate(3)}.tar`);
        } while (yield fs.exists(fileTar));
        return {
            fileTar,
            fileBz2
        };
    });

    return function createCompressNames(_x4) {
        return _ref4.apply(this, arguments);
    };
})();

let compress = (() => {
    var _ref5 = _asyncToGenerator(function* (files, fileTar, fileBz2) {
        yield archiver.archive(files, {
            format: 'tar',
            output: fileTar
        });
        return fs.writeFile(fileBz2, compressjs.Bzip2.compressFile(fs.readFileSync(fileTar)));
    });

    return function compress(_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
    };
})();

let removeFile = (() => {
    var _ref6 = _asyncToGenerator(function* (file) {
        return (yield fs.exists(file)) && (yield fs.unlink(file));
    });

    return function removeFile(_x8) {
        return _ref6.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path'),
      yargs = require('yargs'),
      timestamp = require('time-stamp'),
      compressjs = require('compressjs'),
      randomstring = require("randomstring"),
      archiver = require('simple-archiver');

fs = require('./fs');

module.exports = {
    removeFile,
    compress,
    createCompressNames,
    readArgs,
    optionsValidation
};