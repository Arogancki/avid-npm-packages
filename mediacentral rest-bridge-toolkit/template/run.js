#!/usr/bin/env node

'use strict';

const Access = require('proxy-bal').Access;
const access = new Access();

const Module = require('<%= serviceType %>');

const impl = new Module.Impl(process.env.BASE_URI || '<%= baseUri %>');
access.on('connected', () => {    
    access.registerService(new Module.ServiceHost(access, Module.Api, impl));
});

access.connect();
