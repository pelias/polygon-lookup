
var through = require('through2'),
    multiquery = require('./multiquery'),
    dbclient = require('pelias-dbclient')();

function streamFactory( opts ){

  var stream = through.obj( function( item, enc, next ) {

    multiquery( opts.backends, item[opts.prop], function( error, mem ){

      // An error occurred
      if( error ){
        console.error( 'hierarchy-lookup: query error', error );
      } else if( !mem ){
        console.error( 'hierarchy-lookup: no results' );
      } else if( mem ){

        // merge results in to item
        for( var attr in mem ){
          item[attr] = mem[attr];
        }
      }

      this.push( item );
      return next();

    }.bind(this));
  });

  // catch stream errors
  stream.on( 'error', console.error.bind( console, __filename ) );

  return stream;
}

module.exports = streamFactory;
