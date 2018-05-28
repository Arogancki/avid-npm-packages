#!/usr/bin/env node

const sign = require('../lib/sign.js')

sign()
    .then(d=>console.log(d.output))
    .catch(e=>console.error(e.message))