'use strict'
let should = require('should');
let mockery = require('mockery');
let sinon = require('sinon');
let path = require('path');

let sut;

let ramlParser = require('raml-1-parser');

let raml = ramlParser.loadRAMLSync(path.resolve(__dirname, '../RamlSamples/NetflixConductor.raml')).toJSON();

describe('Specification generator', () => {


    var fileSystemStub = {
        writeFileSync: function () {

        }
    };

    before(() => {
        mockery.enable({warnOnUnregistered: false});
        mockery.registerMock('fs', fileSystemStub);
        sut = require('../lib/specificationGenerator');
    });

    after(() => {
        mockery.deregisterMock('fs');
        mockery.disable;
    });

    it('Should exist', () => {
        should.exist(sut);
    });

    describe('getSpecification', () => {

        it('Should have getSpecificaton', () => {
            should.exist(sut.getSpecificaton);
        });
    
        it('GetSpecification should throw when there is no title', () => {
            (()=> {
                sut.getSpecificaton({});
            }).should.throw('Title property must exist');
        });
    
        it('GetSpecification should throw when there is no version', () => {
            (()=> {
                sut.getSpecificaton({
                    title: 'test'
                });
            }).should.throw('Version property must exist');
        });
    
        it('GetSpecification should throw when there is no resources', () => {
            (()=> {
                sut.getSpecificaton({
                    title: 'test',
                    version: '1.0'
                });
            }).should.throw('Resources property must exist and be of a type array');
        });
    
        it('GetSpecification should throw when resources property is no an array', () => {
            (()=> {
                sut.getSpecificaton({
                    title: 'test',
                    version: '1.0',
                    resources: {}
                });
            }).should.throw('Resources property must exist and be of a type array');
        });
    
        it('GetSpecification should return object', () => {
            should.exist(sut.getSpecificaton(raml));
        });
    
        it('GetSpecification should return serviceType', () => {
            var actual = sut.getSpecificaton(raml);
            actual.serviceType.should.equal('Netflix_Conductor');
        });
    
        it('GetSpecification should return serviceRealm', () => {
            var actual = sut.getSpecificaton(raml);
            actual.serviceRealm.should.equal('global');
        });
    
        it('GetSpecification should return serviceVersion', () => {
            var actual = sut.getSpecificaton(raml);
            actual.serviceVersion.should.equal(1);
        });
    
        it('GetSpecification should return description', () => {
            var actual = sut.getSpecificaton(raml);
            actual.description.should.equal('Orchestration service');
        });
    
        it('GetSpecification should return ops', () => {
            var actual = sut.getSpecificaton(raml);
            should.exist(actual.ops);
        });

        it('GetSpecification should consctruct operation properties', () => {
            var spec = sut.getSpecificaton(raml);
            should.exist(spec.ops.getMetadataWorkflow);
            spec.ops.getMetadataWorkflow.description.should.equal('Get workflows');
        });

        it('GetSpecification should consctruct operation example', () => {
            var spec = sut.getSpecificaton(raml);
            should.exist(spec.ops.getMetadataWorkflow.examples.getMetadataWorkflow);
        });

        it('GetSpecification should consctruct operation example with parameter from the body', () => {
            var spec = sut.getSpecificaton(raml);
            should.exist(spec.ops.postMetadataWorkflow.examples.postMetadataWorkflow);
            should.exist(spec.ops.postMetadataWorkflow.examples.postMetadataWorkflow.paramSet);
            should.exist(spec.ops.postMetadataWorkflow.examples.postMetadataWorkflow.paramSet.body);
            should.exist(spec.ops.postMetadataWorkflow.examples.postMetadataWorkflow.paramSet.body.data);
            should.exist(spec.ops.postMetadataWorkflow.examples.postMetadataWorkflow.paramSet.body.data.Workflow);
        });

        it('GetSpecification should consctruct operation example with url parameter', () => {
            var spec = sut.getSpecificaton(raml);
            should.exist(spec.ops.getMetadataWorkflowByName.examples.getMetadataWorkflowByName);
            should.exist(spec.ops.getMetadataWorkflowByName.examples.getMetadataWorkflowByName.paramSet);
            should.exist(spec.ops.getMetadataWorkflowByName.examples.getMetadataWorkflowByName.paramSet.path);
            should.exist(spec.ops.getMetadataWorkflowByName.examples.getMetadataWorkflowByName.paramSet.path.name);
        });

        it('GetSpecification should provide upstream support', () => {
            var spec = sut.getSpecificaton(raml, 'true');
            should.exist(spec.ops.getMetadataWorkflowByName.rest);
        });

        it('GetSpecification should provide upstream support with path', () => {
            var spec = sut.getSpecificaton(raml, 'true');
            spec.ops.getMetadataWorkflowByName.rest.path.should.equal('/metadata/workflow/{name}');
        });

        it('GetSpecification should provide upstream support with method', () => {
            var spec = sut.getSpecificaton(raml, 'true');
            spec.ops.getMetadataWorkflowByName.rest.method.should.equal('get');
        });

        it('GetSpecification should provide upstream support with queryParams', () => {
            var spec = sut.getSpecificaton(raml, 'true');
            spec.ops.getMetadataWorkflowByName.rest.queryParams[0].should.equal('name');
        });

    });

    describe('getOperationName', () => {
        
        it('getOperationName should build operation', () => {
            sut.getOperationName('/metadata/workflow', 'get').should.equal('getMetadataWorkflow');
        });
    
        it('getOperationName should build operation with parameters', () => {
            sut.getOperationName('/metadata/workflow/{name}', 'get').should.equal('getMetadataWorkflowByName');
        });

    });

    describe('Write specification', () => {
        it('Should write specification', () => {
            sut.writeSpecification(raml, path.resolve(__dirname, './test.js'));
        });
    });

    describe('getServiceDefinition', () => {
        it('Should generate service definition', () => {
            var actual = sut.getServiceDefinition(raml);
            should.exist(actual);
        });

        it('Should generate resource path', () => {
            var actual = sut.getServiceDefinition(raml);
            actual.ops.getMetadataWorkflow.path.should.equal('/metadata/workflow');
        });

        it('Should generate resource method', () => {
            var actual = sut.getServiceDefinition(raml);
            actual.ops.getMetadataWorkflow.method.should.equal('get');
        });

        it('Should generate body', () => {
            var actual = sut.getServiceDefinition(raml);
            actual.ops.postWorkflowByName.body[0].should.equal('WorkflowInput');
        });

        it('Should generate url params', () => {
            var actual = sut.getServiceDefinition(raml);
            actual.ops.postWorkflowByName.urlParameters[0].should.equal('name');
        });
    });
    
});
