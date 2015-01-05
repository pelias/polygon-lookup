
var dbclient = require('pelias-dbclient')(),
    Backend = require('geopipes-elasticsearch-backend');

var backends = [
  { type: 'admin0',                   adapter: new Backend(dbclient.client, 'pelias', 'admin0') },
  { type: 'admin1',                   adapter: new Backend(dbclient.client, 'pelias', 'admin1') },
  { type: 'admin2',                   adapter: new Backend(dbclient.client, 'pelias', 'admin2') },
  { type: 'local_admin',              adapter: new Backend(dbclient.client, 'pelias', 'local_admin') },
  { type: 'locality',                 adapter: new Backend(dbclient.client, 'pelias', 'locality') },
  { type: 'neighborhood',             adapter: new Backend(dbclient.client, 'pelias', 'neighborhood') }
];

module.exports = backends;