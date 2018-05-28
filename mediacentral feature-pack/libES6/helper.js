const   path = require('path'),
        yargs = require('yargs'),
        timestamp = require('time-stamp'),
        compressjs = require('compressjs'),
        randomstring = require("randomstring"),
        archiver = require('simple-archiver')

        fs = require('./fs')

async function readArgs(){
    return yargs.usage('Usage: ')
        .alias('m', 'metadata')
        .describe('metadata', 'path to a metadata file based on the feature pack definition')
        .string('metadata')
        
        .alias('h', 'helm')
        .describe('helm', 'path to a helm chart file')
        .string('helm')

        .alias('d', 'docker')
        .describe('docker', 'a docker image file with the contents of build')
        .string('docker')

        .alias('t', 'tag')
        .describe('tag', 'a version tag')
        .string('tag')

        .alias('o', 'output')
        .describe('output', 'an output directory')
        .string('output')
        .default('output', '.')

        .demandOption(['metadata', 'helm', 'docker', 'tag'])
        .help()
        .argv;
}

async function validateFile(options, name){
    if (!options.hasOwnProperty(name))
        throw new Error(`Path to a ${name} file is not set!`)

    if (typeof options[name] !== 'string')
        throw new Error(`${name} must be a string!`)

    if (!await fs.exists(options[name]))
        throw new Error(`Path to a ${name} file (${options[name]}) is invalid.`)

    if (!(await fs.lstat(options[name]).then(s=>s.isFile())))
        throw new Error(`A (${name}) file (${options[name]}) musn't be a directory.`)
}

async function optionsValidation(options){
    if (!options.hasOwnProperty('tag'))
        throw new Error(`A version tag is not set!`)

    if (typeof options.tag !== 'string')
        throw new Error(`Tag must be a string!`)

    if (!options.hasOwnProperty('output'))
        throw new Error(`An output directory is not set!`)

    if (typeof options.output !== 'string')
        throw new Error(`An output directory must be a string!`)

    if (!await fs.exists(options.output))
        throw new Error(`Path to an output directory (${options.output}) is invalid.`)

    if (!(await fs.lstat(options.output).then(s=>s.isDirectory())))
        throw new Error(`An output musn't be a directory.`)

    return Promise.all([
        validateFile(options, 'metadata'),
        validateFile(options, 'helm'),
        validateFile(options, 'docker'),
    ])
}

async function createCompressNames(options){
    const fileBz2 = path.join(options.output, `${path.basename(options.helm, path.extname(options.helm))}-${options.tag}.tar.bz2`)
    if (await fs.exists(fileBz2))
        throw new Error(`File ${fileBz2} already exists`)
    do {
        var fileTar = path.join(options.output, `${timestamp('YYYY-MM-DD-mm-ss')}.${randomstring.generate(3)}.tar`)
    }while(await fs.exists(fileTar))
    return { 
        fileTar, 
        fileBz2 
    }
}

async function compress(files, fileTar, fileBz2){
    await archiver.archive(files, {
        format: 'tar',
        output: fileTar
    })
    return fs.writeFile(fileBz2, compressjs.Bzip2.compressFile(fs.readFileSync(fileTar)))
}

async function removeFile(file){
    return (await fs.exists(file)) && (await fs.unlink(file))
}

module.exports = {
    removeFile,
    compress,
    createCompressNames,
    readArgs,
    optionsValidation,
}