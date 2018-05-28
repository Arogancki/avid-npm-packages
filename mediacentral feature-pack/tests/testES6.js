const   fp = require('../libES6/pack')

fp({
    tag: '1.1.0',
    metadata: './a/b/c/.gitignore',
    helm: './a/b/c/package.json',
    docker: './a/b/c/.babelrc',
    output: 'bin'
})
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message))