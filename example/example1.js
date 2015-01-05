
var lookup = require('../index'),
    stream = lookup.stream(),
    through = require('through2');

stream.pipe( through.obj( function( item, enc, next ){
  console.log( item );
  next();
}));

var centroid = { lat: 51.5328850, lon: -0.0652280 };
stream.write({ center_point: centroid } );
stream.end();