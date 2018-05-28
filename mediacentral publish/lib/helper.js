let readArgs = (() => {
    var _ref = _asyncToGenerator(function* () {
        return yargs.usage('Usage: ').alias('p', 'project').describe('project', 'path to a project config file').string('project').alias('n', 'name').describe('name', 'project name (optional if the name is in a project/src/project.json file under identity.appName)').string('name').alias('c', 'config').describe('config', 'path to a project config file (optional if the config is project/src/project.act)').string('config').alias('s', 'password').describe('password', 'password to ssh private key').string('password').demandOption(['project']).help().argv;
    });

    return function readArgs() {
        return _ref.apply(this, arguments);
    };
})();

let optionsValidation = (() => {
    var _ref2 = _asyncToGenerator(function* (options) {
        if (!options.hasOwnProperty('project')) throw new Error("A project path not set!");

        if (typeof options.project !== 'string') throw new Error("A project path must be a string!");

        if (!(yield fs.exists(options.project))) throw new Error(`Path to a project (${options.project}) is invalid.`);

        if (!options.hasOwnProperty('config')) options.config = path.join(options.project, 'src', 'project.act');

        if (typeof options.config !== 'string') throw new Error("A config file path must be a string!");

        if (!(yield fs.exists(options.config))) throw new Error(`Path to a config file (${options.config}) is invalid.`);

        if (!options.hasOwnProperty('name')) {
            const packageJson = path.join(options.project, 'src', 'package.json');
            if (yield fs.exists(packageJson)) options.name = (require(packageJson).identity || {}).appName;
            if (!options.hasOwnProperty('name')) throw new Error("A project name not set!");
        }

        if (typeof options.name !== 'string') throw new Error("A name must be a string!");

        if (options.hasOwnProperty('didProgress') && typeof options.didProgress !== 'function') throw new Error("A didProgress must be a function!");

        if (options.hasOwnProperty('password')) if (typeof options.password !== 'string') throw new Error("A password must be a string!");
    });

    return function optionsValidation(_x) {
        return _ref2.apply(this, arguments);
    };
})();

let getDocker = (() => {
    var _ref3 = _asyncToGenerator(function* (wd, projectDir, appName, version) {
        return buildDocker(wd, projectDir, appName, version);
    });

    return function getDocker(_x2, _x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
    };
})();

let getHelm = (() => {
    var _ref4 = _asyncToGenerator(function* (dir, name, version, organization) {
        return createChart(dir, name, version, organization);
    });

    return function getHelm(_x6, _x7, _x8, _x9) {
        return _ref4.apply(this, arguments);
    };
})();

let getMetadata = (() => {
    var _ref5 = _asyncToGenerator(function* (metadataFile, name, version, organization) {
        return createMetadata(metadataFile, name, version, organization);
    });

    return function getMetadata(_x10, _x11, _x12, _x13) {
        return _ref5.apply(this, arguments);
    };
})();

let getFeaturePack = (() => {
    var _ref6 = _asyncToGenerator(function* (metadata, helm, docker, tag, output) {
        return fp({
            metadata,
            helm,
            docker,
            tag,
            output
        });
    });

    return function getFeaturePack(_x14, _x15, _x16, _x17, _x18) {
        return _ref6.apply(this, arguments);
    };
})();

let doUpload = (() => {
    var _ref7 = _asyncToGenerator(function* (manifest, pack, id) {
        return uploadProject({
            manifest,
            pack,
            id
        });
    });

    return function doUpload(_x19, _x20, _x21) {
        return _ref7.apply(this, arguments);
    };
})();

let doSign = (() => {
    var _ref8 = _asyncToGenerator(function* (key, manifest, file, password, id) {
        return signManifest({
            key,
            manifest,
            file,
            password,
            id
        });
    });

    return function doSign(_x22, _x23, _x24, _x25, _x26) {
        return _ref8.apply(this, arguments);
    };
})();

let createWorkingDir = (() => {
    var _ref9 = _asyncToGenerator(function* (projectDir) {
        do {
            var name = path.join(projectDir, randomstring.generate());
        } while (yield fs.exists(name));
        yield fs.mkdir(name);
        return normalize(path.resolve(name));
    });

    return function createWorkingDir(_x27) {
        return _ref9.apply(this, arguments);
    };
})();

let functionsFlow = (() => {
    var _ref10 = _asyncToGenerator(function* (config, didProgress = function () {}) {
        const doStep = function (totalSteps) {
            return (() => {
                var _ref11 = _asyncToGenerator(function* (name, step) {
                    // console.log(`${name}...`)
                    yield new Promise(function (r) {
                        return r(didProgress(null, name, totalSteps--));
                    });
                    return step().catch(function (err) {
                        return new Promise(function (r) {
                            return r(didProgress(err, name, 0));
                        }).then(function (data) {
                            throw new Error(`A error has occured during ${name}: ${err.message}`);
                        });
                    });
                });

                return function (_x29, _x30) {
                    return _ref11.apply(this, arguments);
                };
            })();
        }(6);

        let docker, helm, metadata, featurePack, sign, upload, output;

        try {
            docker = yield doStep('creating a docker save file', function () {
                return getDocker(config.dir, config.projectDir, config.appName, config.version);
            });
            helm = yield doStep('creating a helm chart file', function () {
                return getHelm(config.dir, config.appName, config.version, config.organization);
            });
            metadata = yield doStep('creating a metadata file', function () {
                return getMetadata(config.dir, config.appName, config.version, config.organization);
            });
            featurePack = yield doStep('creating a feature pack file', function () {
                return getFeaturePack(metadata.file, helm.file, docker.file, config.tag, config.dir);
            });
            sign = yield doStep('signing a feature pack', function () {
                return doSign(config.key, config.manifest, featurePack.featurePackFile, config.password, config.devID);
            });
            upload = yield doStep('uploading the project', function () {
                return doUpload(config.manifest, featurePack.featurePackFile, config.appID);
            });

            output = 'Your project has been successfully published.';
            doStep(output, _asyncToGenerator(function* () {}));

            return {
                config,
                output,
                docker,
                helm,
                metadata,
                featurePack,
                sign,
                upload
            };
        } catch (e) {
            e.docker = docker;
            e.helm = helm;
            e.metadata = metadata;
            e.featurePack = featurePack;
            e.sign = sign;
            e.upload = upload;
            e.config = config;
            throw e;
        }
    });

    return function functionsFlow(_x28) {
        return _ref10.apply(this, arguments);
    };
})();

let publish = (() => {
    var _ref13 = _asyncToGenerator(function* (config, didProgress) {
        config.dir = yield createWorkingDir(config.projectDir);
        config.manifest = path.join(config.dir, 'manifest.json');

        try {
            return yield functionsFlow(config, didProgress);
        } finally {
            if (yield fs.exists(config.dir)) {
                fs.remove(config.dir).catch(function (err) {
                    if (err) console.warn(`Couldn't delete working dir ${err.path} (${err.code}).`);
                });
            }
        }
    });

    return function publish(_x31, _x32) {
        return _ref13.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const yargs = require('yargs'),
      fp = require('mediacentral-feature-pack'),
      signManifest = require('mediacentral-sign'),
      uploadProject = require('mediacentral-upload'),
      fs = require('./fs'),
      randomstring = require('randomstring'),
      path = require('path'),
      buildDocker = require('./buildDocker'),
      createMetadata = require('./createMetadata'),
      createChart = require('./createChart'),
      normalize = require('normalize-path');

module.exports = {
    publish,
    readArgs,
    optionsValidation
};