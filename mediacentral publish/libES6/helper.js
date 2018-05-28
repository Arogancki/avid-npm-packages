const   yargs = require('yargs'),
        fp = require('mediacentral-feature-pack'),
        signManifest = require('mediacentral-sign'),
        uploadProject = require('mediacentral-upload'),
        fs = require('./fs'),
        randomstring = require('randomstring'),
        path = require('path'),
        buildDocker = require('./buildDocker'),
        createMetadata = require('./createMetadata'),
        createChart = require('./createChart'),
        normalize = require('normalize-path')

async function readArgs(){
    return yargs.usage('Usage: ')
        .alias('p', 'project')
        .describe('project', 'path to a project config file')
        .string('project')

        .alias('n', 'name')
        .describe('name', 'project name (optional if the name is in a project/src/project.json file under identity.appName)')
        .string('name')

        .alias('c', 'config')
        .describe('config', 'path to a project config file (optional if the config is project/src/project.act)')
        .string('config')

        .alias('s', 'password')
        .describe('password', 'password to ssh private key')
        .string('password')
        
        .demandOption(['project'])
        .help()
        .argv;
}

async function optionsValidation(options){
    if (!options.hasOwnProperty('project'))
        throw new Error("A project path not set!")

    if (typeof options.project !== 'string')
        throw new Error("A project path must be a string!")
        
    if (!await fs.exists(options.project))
        throw new Error(`Path to a project (${options.project}) is invalid.`)

    if (!options.hasOwnProperty('config'))
        options.config = path.join(options.project, 'src', 'project.act')
    
    if (typeof options.config !== 'string')
        throw new Error("A config file path must be a string!")
        
    if (!await fs.exists(options.config))
        throw new Error(`Path to a config file (${options.config}) is invalid.`)

    if (!options.hasOwnProperty('name')){
        const packageJson = path.join(options.project, 'src', 'package.json')
        if (await fs.exists(packageJson))
            options.name = (require(packageJson).identity || {}).appName
        if (!options.hasOwnProperty('name'))
            throw new Error("A project name not set!")
    }
    
    if (typeof options.name !== 'string')
        throw new Error("A name must be a string!")

    if (options.hasOwnProperty('didProgress') && typeof options.didProgress !== 'function')
        throw new Error("A didProgress must be a function!")

    if (options.hasOwnProperty('password'))
        if (typeof options.password !== 'string')
            throw new Error("A password must be a string!")
}

async function getDocker(wd, projectDir, appName, version){
    return buildDocker(wd, projectDir, appName, version)
}

async function getHelm(dir, name, version, organization){
    return createChart(dir, name, version, organization)
}

async function getMetadata(metadataFile, name, version, organization){
    return createMetadata(metadataFile, name, version, organization)
}

async function getFeaturePack(metadata, helm, docker, tag, output){
    return fp({
        metadata, 
        helm,
        docker, 
        tag,
        output
    })
}

async function doUpload(manifest, pack, id){
    return uploadProject({
        manifest,
        pack,
        id
    })
}

async function doSign(key, manifest, file, password, id){
    return signManifest({
        key, 
        manifest,
        file, 
        password,
        id
    })
}

async function createWorkingDir(projectDir){
    do {
        var name = path.join(projectDir, randomstring.generate())
    } while (await fs.exists(name))
    await fs.mkdir(name)
    return normalize(path.resolve(name))
}

async function functionsFlow(config, didProgress=()=>{}){
    const doStep = (totalSteps => async (name, step) => {
        // console.log(`${name}...`)
        await new Promise (r=>r(didProgress(null, name, totalSteps--)))
        return step().catch(err=>{
            return (new Promise(r=>r(didProgress(err, name, 0)))).then(data=>{
                throw new Error(`A error has occured during ${name}: ${err.message}`)
            })
        })
    })(6)

    let docker, helm, metadata, featurePack, sign, upload, output;

    try {
        docker = await doStep('creating a docker save file', ()=>getDocker(config.dir, config.projectDir, config.appName, config.version))
        helm = await doStep('creating a helm chart file', ()=>getHelm(config.dir, config.appName, config.version, config.organization))
        metadata = await doStep('creating a metadata file', ()=>getMetadata(config.dir, config.appName, config.version, config.organization))
        featurePack = await doStep('creating a feature pack file', ()=>getFeaturePack(metadata.file, helm.file, docker.file, config.tag, config.dir))
        sign = await doStep('signing a feature pack', ()=>doSign(config.key, config.manifest, featurePack.featurePackFile, config.password, config.devID))
        upload = await doStep('uploading the project', ()=>doUpload(config.manifest, featurePack.featurePackFile, config.appID))    

        output = 'Your project has been successfully published.';
        doStep(output, async ()=>{})

        return {
            config,
            output,
            docker,
            helm,
            metadata,
            featurePack,
            sign,
            upload,
        }
    }
    catch(e){
        e.docker = docker
        e.helm = helm
        e.metadata = metadata
        e.featurePack = featurePack
        e.sign = sign
        e.upload = upload
        e.config = config
        throw e
    }
}

async function publish(config, didProgress){
    config.dir = await createWorkingDir(config.projectDir)
    config.manifest = path.join(config.dir, 'manifest.json')

    try{
        return await functionsFlow(config, didProgress)
    }
    finally{
        if (await fs.exists(config.dir)){
            fs.remove(config.dir).catch(err=>{
                if (err) console.warn(`Couldn't delete working dir ${err.path} (${err.code}).`);
            });
        }
    }
}

module.exports = {
    publish,
    readArgs,
    optionsValidation,
};
