#!/usr/bin/env node

'use strict';

let ramlParser = require('raml-1-parser');
let fs = require('fs');
let path = require('path');
const Helper = require('../lib/helper');
const specificationGenerator = require('../lib/specificationGenerator');


const argv = require('yargs')
    .usage('Usage: ')

    .alias('r', 'raml')
    .describe('r', 'Path to the yaml specification')

    .alias('u', 'upstream')
    .describe('u', 'Generate upstream support (true/false)')
    .default('u', false)

    .alias('o', 'output')
    .describe('o', 'Output folder to place the result')
    .default('o', './out/')

    .demandOption(['r'])

    .help()

    .argv;

let outputFolder = Helper.getPath(argv.output);

// Check that RAML file exists
if (!fs.existsSync(argv.raml)) {
    console.error(`File ${argv.raml} does not exists`);
    process.exit(1);
}

if (fs.existsSync(outputFolder)) {
    console.error(`Dir ${outputFolder} already exists`);
    process.exit(1);
}

let ramlData = ramlParser.loadRAMLSync(argv.raml).toJSON();

if (!ramlData) {
    console.error('Cannot read raml file');
}

Helper.createFoldersSync('../template', outputFolder);

// Add specification file
specificationGenerator.writeSpecification(ramlData, outputFolder + 'module/lib/resources/api_specification.js', argv.upstream);

Helper.Copy('../template', outputFolder, specificationGenerator.getServiceDefinition(ramlData));