const publish = require('../lib/publish');

publish()
    .then(d=>console.log(d))
    .catch(e=>console.error(e.message));
