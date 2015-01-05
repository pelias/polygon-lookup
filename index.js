
var isObject = require('is-object'),
    augmentStream = require('./lib/stream');

/**
  This stream accepts object and tries to lookup hierarchy info from the property
  defined by opts.prop (center_point by default).

  The results of the query will be merged in to the object before being piped downstream.
**/

function streamFactory( opts ){

  if( !isObject( opts ) ){ opts = {}; }

  if( 'string' !== typeof opts.prop ){
    console.warn( 'hierarchy-lookup: using default centroid property \'center_point\'' );
    opts.prop = 'center_point';
  }

  if( !Array.isArray( opts.backends ) ){
    console.warn( 'hierarchy-lookup: using default backends' );
    opts.backends = require('./lib/backends');
  }

  return augmentStream( opts );
}

module.exports.stream = streamFactory;