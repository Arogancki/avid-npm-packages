//'use strict'

var fs = require('fs');
var formatter = require('esformatter');
var includes = require('array-includes');

SpecificationGenerator = function () {};

SpecificationGenerator.getSpecificaton = function (raml, doUpstream) {
    
    if(!raml.hasOwnProperty('title')) {
        throw new Error('Title property must exist');
    }

    if(!raml.hasOwnProperty('version')) {
        throw new Error('Version property must exist');
    }

    if(!raml.hasOwnProperty('resources') || !Array.isArray(raml.resources)) {
        throw new Error('Resources property must exist and be of a type array');
    }

    var result = {
        serviceType: raml.title.split(' ').join('_'),
        serviceRealm: 'global',
        serviceVersion: parseInt(raml.version),
        description: raml.description || raml.title,
        ops: {}
    };

    // ok lets generate some operations

    raml.resources.forEach(resource => {

        if(resource.hasOwnProperty('methods') && Array.isArray(resource.methods)) {

            resource.methods.forEach(method => {
                var operationName = this.getOperationName(resource.displayName, method.method);
                result.ops[operationName] = {
                    description: method.description,
                    examples: {}
                };
                // generate operation example
                result.ops[operationName].examples[operationName] = {
                    paramSet: {}
                }
                // body params
                if (method.body &&  method.body['application/json'] && method.body['application/json'] && method.body['application/json'].type) {
                    method.body['application/json'].type.forEach(bodyParameter => {
                        if (!result.ops[operationName].examples[operationName].paramSet.body) {
                            result.ops[operationName].examples[operationName].paramSet.body = {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                data: {}
                            };
                        }
                        result.ops[operationName].examples[operationName].paramSet.body.data[bodyParameter] = {};
                    });
                }
                // url params
                var urlParams = resource.relativeUriPathSegments.filter(segment => {
                    return segment.charAt(0) === '{';
                }).map(segment => {
                    return segment.substring(1, segment.length -1);
                });

                urlParams.forEach(parameter => {
                    if (!result.ops[operationName].examples[operationName].paramSet.path) {
                        result.ops[operationName].examples[operationName].paramSet.path = {};
                    }
                    result.ops[operationName].examples[operationName].paramSet.path[parameter] = {};
                });
                
                if (doUpstream == 'true') {
                    // generate upstream support
                    result.ops[operationName].rest = {
                        path: resource.relativeUri,
                        method: method.method
                    };
                    if (urlParams.length > 0) {
                        result.ops[operationName].rest.queryParams = urlParams;
                    }
                }

            });

        }        
    });
    return result;
};

SpecificationGenerator.writeSpecification = function (raml, file, doUpstream) {

    const options = {
        indent : {
          value : '  '
        },
        lineBreak : {
          before : {
            // at least one line break before BlockStatement
            BlockStatement : '>=1',
            // only one line break before DoWhileStatementOpeningBrace
            DoWhileStatementOpeningBrace : 1,
            // ...
          }
        },
        whiteSpace : {
          // ...
        }
      };;

    var api = this.getSpecificaton(raml, doUpstream);
    var code = `module.exports = ${JSON.stringify(api)}`;
    fs.writeFileSync(file, formatter.format(code, options), {encoding: 'utf-8', flag: 'w'});
};

SpecificationGenerator.getOperationName = function (resource, method) {

    var path = resource.split('/').filter(segment => {
        return segment && segment.length !== 0;
    }).map(segment=> {
        if (segment.charAt(0) === '{') {
            var trimmed = segment.substring(1, segment.length -1);
            return 'By' + trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    });
    return method + path.join('').replace(/{/gi,'_').replace(/}/gi,'');
};

SpecificationGenerator.getServiceDefinition = function (raml) {
    
    if(!raml.hasOwnProperty('title')) {
        throw new Error('Title property must exist');
    }

    if(!raml.hasOwnProperty('version')) {
        throw new Error('Version property must exist');
    }

    if(!raml.hasOwnProperty('resources') || !Array.isArray(raml.resources)) {
        throw new Error('Resources property must exist and be of a type array');
    }

    var result = {
        serviceType: raml.title.split(' ').join('_'),
        serviceRealm: 'global',
        serviceVersion: parseInt(raml.version),
        componentVersion: raml.version,
        description: raml.description || raml.title,
        projectName: raml.title.split(' ').join('-').toLowerCase(),
        baseUri: raml.baseUri,
        ops: {}
    };

    // ok lets generate some operations

    raml.resources.forEach(resource => {

        if(resource.hasOwnProperty('methods') && Array.isArray(resource.methods)) {
            resource.methods.forEach(method => {
                const operation = {
                    description: method.description,
                    path: resource.relativeUri,
                    method: method.method,
                    validation: []
                };

                if (method.body && method.body['application/json']) {
                    operation.body = method.body['application/json'].type;
                }

                if (typeof method.responses === 'object'){
                    operation.validation = Object.keys(method.responses).map((k)=>{
                        const v = method.responses[k];
                        const validation = {
                            code: v.code || ''
                        };
                        if (typeof v.body === 'object'){
                            validation.type = Object.keys(v.body)[0] || '';
                            // supports only for application/json at the moment
                            if (validation.type.toLowerCase()==='application/json'){
                                validation.properties = (v.body[validation.type].type || {}).properties || {};
                            }
                        }
                        return validation;
                    })
                }

                const filtrOut = ['__METADATA__', 'typePropertyKind'];
                operation.validation.toString = ()=>JSON.stringify(
                    operation.validation, 
                    (k,v)=>includes(filtrOut, k) ? undefined : v, 
                    '\t'
                );

                result.ops[this.getOperationName(resource.displayName, method.method)] = operation;

                // figure out url params
                var segments = resource.displayName.split('/');
                segments.forEach(segment => {
                    if (segment.charAt(0) === '{') {
                        var urlParameter = segment.substring(1, segment.length -1);
                        if (!result.ops[this.getOperationName(resource.displayName, method.method)].urlParameters) {
                            result.ops[this.getOperationName(resource.displayName, method.method)].urlParameters = [];
                        }
                        result.ops[this.getOperationName(resource.displayName, method.method)].urlParameters.push(urlParameter);
                    } 
                });
            });
        }
    });

    return result;
};

module.exports = SpecificationGenerator;