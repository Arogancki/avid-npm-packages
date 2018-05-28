const Access = require('proxy-bal').Access;
const access = new Access();

const ServiceHost = require('./lib/service');
const Api = require('./lib/resources/api_specification.js');
const Impl = require('./lib/impl.js');

const impl = new Impl(process.env.BASE_URI || '<%= baseUri %>');
access.on('connected', function () {    
    access.registerService(new ServiceHost(access, Api, impl));
    
});

access.connect();
