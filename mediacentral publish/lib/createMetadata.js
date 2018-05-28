function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { writeFileSync } = require('fs');
const { join } = require('path');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (path, PROJECT_NAME, VERSION, ORGANIZATION) {

        const registry = "local";
        const image = `${registry}/avid/${PROJECT_NAME}:${VERSION}`;
        const metadata = {
            name: PROJECT_NAME,
            version: VERSION,
            charts_files: [`${PROJECT_NAME}-${VERSION}.tgz`],
            image_files: [`${PROJECT_NAME}-${VERSION}-images.tar`],
            image_list: [`${image}`]
        };

        const filePath = join(path, 'metadata.json');
        writeFileSync(filePath, JSON.stringify(metadata, null, 4));
        return {
            output: `A metadata file created in ${filePath}.`,
            file: filePath
        };
    });

    return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();