const   path = require('path'),
        yargs = require('yargs'),
        rp = require('request-promise'),
        JSON5 = require('json5'),

        fs = require('./fs'),

        uploadUri = `https://api.avid.com/file/learning/UploadNewVersionWithManifest`

async function readArgs(){
    return yargs.usage('Usage: ')
        .alias('m', 'manifest')
        .describe('manifest', 'path to a manifest file')
        .default('m', './manifest.json')
        .string('manifest')
        
        .alias('p', 'pack')
        .describe('pack', 'path to a feature pack to upload')
        .string('pack')

        .alias('i', 'id')
        .describe('id', 'MyApplication id for your project')
        .string('id')

        .demandOption(['pack', 'id'])
        .help()
        .argv;
}

async function optionsValidation(options){
    if (!options.hasOwnProperty('pack'))
        throw new Error("A feature pack path not set!")
    
    if (!options.hasOwnProperty('manifest'))
        throw new Error("A manifest file path not set!")

    if (!options.hasOwnProperty('id'))
        throw new Error("MyApplication id not set!")

    if (typeof options.id !== 'string'){
        throw new Error(`MyApplication id must be a string`)
    } 

    if (typeof options.pack !== 'string' || !await fs.exists(options.pack))
        throw new Error(`Path to a project (${options.pack}) is invalid.`)

    if (typeof options.pack !== 'string' || !await fs.exists(options.manifest))
        throw new Error(`Path to a manifest file (${options.manifest}) is invalid.`)

    if (!(await fs.lstat(options.manifest).then(s=>s.isFile())))
        throw new Error(`A manifest file (${options.manifest}) musn't be a directory.`)
}

async function upload(pack, manifest, id){
    const res = await rp({
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
    })
    const resObj = JSON5.parse(`{${res.split('Version')[0]}}`)
    if (resObj.statusCode !== 200)
            throw new Error(`${resObj.ReasonPhrase} (status code: ${resObj.StatusCode})`)
};


module.exports = {
    readArgs,
    optionsValidation,
    upload,
}