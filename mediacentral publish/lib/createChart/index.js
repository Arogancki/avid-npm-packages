function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const yaml = require('js-yaml');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (path, PROJECT_NAME, VERSION, ORGANIZATION) {
        const helm_chart_path = join(path, PROJECT_NAME);
        if (!existsSync(helm_chart_path)) {
            createChartTemplate(path, PROJECT_NAME);
        }
        let uiplugin = yaml.safeLoad(readFileSync(join(path, `${PROJECT_NAME}`, `templates`, `uiplugin.yaml`), 'utf8'));
        let chart = yaml.safeLoad(readFileSync(join(path, `${PROJECT_NAME}`, `Chart.yaml`), 'utf8'));
        let values = yaml.safeLoad(readFileSync(join(path, `${PROJECT_NAME}`, `values.yaml`), 'utf8'));
        // project name
        uiplugin.metadata.name = PROJECT_NAME;
        uiplugin.metadata.labels.app = PROJECT_NAME;
        chart.name = PROJECT_NAME;
        // version
        chart.version = VERSION;
        //image
        values.image = `${ORGANIZATION}/${PROJECT_NAME}:${VERSION}`;
        writeFileSync(join(path, `${PROJECT_NAME}`, `templates`, `uiplugin.yaml`), yaml.safeDump(uiplugin), { encoding: 'utf8' });
        writeFileSync(join(path, `${PROJECT_NAME}`, `Chart.yaml`), yaml.safeDump(chart), { encoding: 'utf8' });
        writeFileSync(join(path, `${PROJECT_NAME}`, `values.yaml`), yaml.safeDump(values), { encoding: 'utf8' });
        const outputFile = join(path, `${PROJECT_NAME}-${VERSION}.tgz`);
        try {
            const HELM_CHART = execSync(`helm package "${join(path, PROJECT_NAME)}" -d "${path}"`).toString('utf8').trim();
        } catch (e) {
            if (!existsSync(outputFile)) {
                throw e;
            }
        }
        return {
            file: outputFile
        };
    });

    return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();

function createChartTemplate(path, project_name) {
    let uiplugin = yaml.safeLoad(readFileSync(join(__dirname, `templates`, `uiplugin.yaml`), 'utf8'));
    let chart = yaml.safeLoad(readFileSync(join(__dirname, `templates`, `Chart.yaml`), 'utf8'));
    let values = yaml.safeLoad(readFileSync(join(__dirname, `templates`, `values.yaml`), 'utf8'));
    mkdirSync(join(path, `${project_name}`));
    mkdirSync(join(path, `${project_name}`, `templates`));
    writeFileSync(join(path, `${project_name}`, `templates`, `uiplugin.yaml`), yaml.safeDump(uiplugin));
    writeFileSync(join(path, `${project_name}`, `Chart.yaml`), yaml.safeDump(chart));
    writeFileSync(join(path, `${project_name}`, `values.yaml`), yaml.safeDump(values));
}