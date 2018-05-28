#!/usr/bin/env node

const fp = require('../lib/pack.js')

fp()
    .then(d=>console.log(d.output))
    .catch(e=>console.error(e.message))