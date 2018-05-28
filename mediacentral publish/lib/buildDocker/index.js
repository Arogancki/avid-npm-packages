function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { execSync } = require('child_process');
const { mkdirSync, existsSync, copyFileSync, readFileSync, writeFileSync, remove } = require('fs-extra');
const { join, basename } = require('path');
const ejs = require('ejs');

function copyDockerTemplate(temp_dir_path, project_path, project_name) {
    mkdirSync(join(temp_dir_path, 'docker'));
    mkdirSync(join(temp_dir_path, 'docker', 'build_dist'));
    mkdirSync(join(temp_dir_path, 'docker', 'build_img'));

    // Dist
    let dist_dockerfile = ejs.render(readFileSync(join(__dirname, 'build_dist', 'Dockerfile'), 'utf8'), { tempDirPath: basename(temp_dir_path) });
    let image_dockerfile = ejs.render(readFileSync(join(__dirname, 'build_img', 'Dockerfile'), 'utf8'), { projectName: project_name });

    writeFileSync(join(temp_dir_path, 'docker', 'build_dist', 'Dockerfile'), dist_dockerfile);

    // Image
    writeFileSync(join(temp_dir_path, 'docker', 'build_img', 'Dockerfile'), image_dockerfile);

    // run.sh
    writeFileSync(join(temp_dir_path, 'docker', 'build_dist', 'run.sh'), readFileSync(join(__dirname, 'build_dist', 'run.sh')));
}

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (path, dir, appName, version) {
        let registry = "local";
        let image = `${registry}/avid/${appName}:${version}`;
        copyDockerTemplate(path, dir, appName);
        execSync(`docker build -t create_build_image -f "${join(path, 'docker/build_dist/Dockerfile')}" ${dir}`);
        if (!existsSync(join(dir, 'build'))) {
            mkdirSync(join(dir, 'build'));
        }
        execSync(`docker run --rm -v "${join(dir, 'build')}":/code/build create_build_image`);
        execSync(`docker build -t "${image}" -f "${join(path, 'docker', 'build_img', 'Dockerfile')}" "${dir}"`);
        // execSync(`docker tag "${image}" "${image}:${version}"`);
        const output = join(path, `${appName}-${version}-images.tar`);
        execSync(`docker save --output "${output}" "${image}"`);

        return {
            file: output
        };
    });

    return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();