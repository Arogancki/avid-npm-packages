const publish = require('../libES6/publish');

publish()
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message));
