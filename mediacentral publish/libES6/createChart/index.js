const yaml = require('js-yaml');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

module.exports = async function(path, PROJECT_NAME, VERSION, ORGANIZATION){
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
};

function createChartTemplate(path, project_name) {
    let uiplugin = yaml.safeLoad(readFileSync(join(__dirname, `templates`, `uiplugin.yaml`), 'utf8'));
    let chart = yaml.safeLoad(readFileSync(join(__dirname,  `templates`, `Chart.yaml`), 'utf8'));
    let values = yaml.safeLoad(readFileSync(join(__dirname, `templates`, `values.yaml`), 'utf8'));
    mkdirSync(join(path, `${project_name}`));
    mkdirSync(join(path, `${project_name}`, `templates`));
    writeFileSync(join(path, `${project_name}`,`templates`, `uiplugin.yaml`), yaml.safeDump(uiplugin));
    writeFileSync(join(path, `${project_name}`, `Chart.yaml`), yaml.safeDump(chart));
    writeFileSync(join(path, `${project_name}`, `values.yaml`), yaml.safeDump(values));
}
