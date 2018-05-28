const   upload = require('../libES6/upload')

upload({
    pack: __dirname + '/test.js',
    manifest: __dirname + '/test.js',
    id: 'someFakeID'
})
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message))