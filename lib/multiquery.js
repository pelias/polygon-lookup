
var async = require('async');
var winston = require( 'winston' );

/**
  Query multiple indeces concurrently and merge the resulting fields in to
  a 'memo' object which contains the results of all matching hits.
**/

function query( backends, centroid, done ){

  var hierarchy = {};
  var opts = {
    type: 'shape-point',
    fields: [ 'name.default', 'alpha3', 'admin1_abbr' ],
    strict: false
  };

  async.reduce( backends, hierarchy, callback.bind( this, centroid, opts ), done );
}

function callback( centroid, opts, memo, backend, cb ){ // jshint ignore:line
  backend.adapter.findAdminHeirachy( centroid, opts, function ( err, resp ) {

    if( err ){
      winston.warn( 'hierarchy-lookup:', err );
    } else if( !resp ){
      winston.warn( 'hierarchy-lookup: no results found for', backend.type );
    }

    if( resp && resp.length ){

      // map name
      if( resp[0]['name.default'] ){
        memo[backend.type] = resp[0]['name.default'];
      }

      // map alpha3
      if( !memo.hasOwnProperty('alpha3') && resp[0].alpha3 ){
        memo.alpha3 = resp[0].alpha3;
      }

      // map admin1_abbr
      if( !memo.hasOwnProperty('admin1_abbr') && resp[0].admin1_abbr ){
        memo.admin1_abbr = resp[0].admin1_abbr;
      }
    }

    // @todo: error not being bubbled up!
    // due to async.reduce failing on first error
    cb( undefined, memo );
  });
}

module.exports = query;
