#!/usr/bin/env node

const upload = require('../lib/upload.js')

upload()
    .then(d=>console.log(d.output))
    .catch(e=>console.error(e.message))