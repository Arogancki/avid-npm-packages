const { writeFileSync } = require('fs');
const { join } = require('path');

module.exports = async function(path, PROJECT_NAME, VERSION, ORGANIZATION) {
    
    const registry="local";
    const image=`${registry}/avid/${PROJECT_NAME}:${VERSION}`;
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
     }
};
