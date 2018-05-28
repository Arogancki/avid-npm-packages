const   fp = require('../lib/pack')

fp({
    tag: '1.1.0',
    metadata: '.gitignore',
    helm: 'package.json',
    docker: 'README.md',
    output: 'bin'
})
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message))