const   sign = require('../libES6/sign')

sign()
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message))