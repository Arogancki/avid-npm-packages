const   path = require('path'),
        yargs = require('yargs'),
        sshpk = require('sshpk'),
        sha512 = require('js-sha512').sha512,
        
        fs = require('./fs')

async function readPrivateKey(file, passphrase){
    let options = {
        filename: file
    }
    if (passphrase){
        options.passphrase = passphrase;
    }
    return sshpk.parsePrivateKey(await fs.readFile(file), 'ssh', options)
}

async function readFilesRecursive(file){
    if (await fs.lstat(file).then(s=>s.isFile())){
        return [file]
    }
    return fs.readdir(file)
    .then(f=>Promise.all(f
        .map(f=>path.join(file, f))
        .map(readFilesRecursive)).then(f=>f
            .reduce((p,v)=>{
                return [...p, ...v]
            }, []))
    )
}

async function writeJsonFile(file, object){
    return fs.writeFile(file, JSON.stringify(object, null, 2))
}

async function getHashes(keyFile, password, dir, files){
    const hashes = {}
    const privateKey = await readPrivateKey(keyFile, password)
    await Promise.all(files.map(f=>
        fs.readFile(path.join(dir, f), 'utf8').then(data=>
            hashes[f !== '' ? f : path.basename(dir)] = privateKey.createSign('sha512').update(data).sign().toString()
        )
    ))
    return hashes
}

async function readArgs(){
    return yargs.usage('Usage: ')
        .alias('k', 'key')
        .describe('key', 'path to a private key')
        .string('key')
        // .default('k', 'id_rsa')

        .alias('m', 'manifest')
        .describe('manifest', 'path to a new or existing manifest file')
        .default('manifest', './manifest.json')
        .string('manifest')

        .alias('f', 'file')
        .describe('file', 'path to a directory or file to sign')
        .default('file', '.')
        .string('file')

        .alias('p', 'password')
        .describe('password', 'password to the private key')
        .string('password')

        .alias('i', 'id')
        .describe('id', 'developers ID (assigned by Avid)')
        .string('id')

        .demandOption(['key'])
        .help()
        .argv;
}

async function optionsValidation(options){

    if (!options.hasOwnProperty('key'))
        throw new Error("A key file not set!")

    if (!options.hasOwnProperty('file'))
        throw new Error("File not set!")
    
    if (!options.hasOwnProperty('manifest'))
        throw new Error("A manifest file not set!")

    if (typeof options.key !== 'string'){
        throw new Error(`Path to a key file must be a string.`)
    }

    if (typeof options.manifest !== 'string'){
        throw new Error(`Path to a manifest file must be a string.`)
    }

    if (typeof options.file !== 'string' && !Array.isArray(options.file)){
        throw new Error(`File to sign must be a string or array of strings.`)
    }

    if (options.password && typeof options.password !== 'string'){
        throw new Error(`Password must be a string.`)
    }

    if (options.id && typeof options.id !== 'string'){
        throw new Error(`developers ID must be a string.`)
    }

    if (!await fs.exists(options.key))
        throw new Error(`Path to a key file (${options.key}) is invalid.`)

    if (Array.isArray(options.file)){
        await Promise.all(options.file
            .map(f=>fs.exists(f)
                .then(exists=>{
                if (!exists)
                    throw new Error(`Path to a directory or file to sign (${f}) is invalid.`)
                })
            ))
    }
    else if (!await fs.exists(options.file))
        throw new Error(`Path to a directory or file to sign (${options.file}) is invalid.`)

    if (await fs.exists(options.manifest) && !(await fs.lstat(options.manifest).then(s=>s.isFile())))
        throw new Error(`A manifest file (${options.manifest}) musn't be a directory.`)

    if (!(await fs.lstat(options.key).then(s=>s.isFile())))
        throw new Error(`A key file (${options.key}) musn't be a directory.`)
}

async function readFiles(file){
    return (Array.isArray(file) ? Promise.all(file
        .map(fi=>readFilesRecursive(fi)))
        .then(files=>files
            .reduce((p,v)=>{
                return [...p, ...v]
            }, [])
        ) : readFilesRecursive(file))
        .then(files=>files.map(f=>path.relative(file, f)));
}

module.exports = {
    readArgs,
    optionsValidation,
    readFiles,
    writeJsonFile,
    getHashes
}