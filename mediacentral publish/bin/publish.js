#!/usr/bin/env node

const publish = require('../lib/publish.js');

publish()
    .then(d=>console.log(d.output))
    .catch(e=>console.error(e.message));
