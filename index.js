'use strict';

var shapefileStream = require( 'shapefile-stream' );
var rbush = require( 'rbush' );
var pointInPolygon = require( 'point-in-polygon' );
var simplify = require( 'simplify-js' );
var through = require( 'through2' );

function getBoundingBox( poly ){
  var bbox = [
    poly[ 0 ][ 0 ],
    poly[ 0 ][ 1 ],
    poly[ 0 ][ 0 ],
    poly[ 0 ][ 1 ],
  ];

  for( var ind = 1; ind < poly.length; ind++ ){
    var pt = poly[ ind ];
    if( pt[ 0 ] < bbox[ 0 ] ){
      bbox[ 0 ] = pt[ 0 ];
    }

    if( pt[ 0 ] > bbox[ 2 ] ){
      bbox[ 2 ] = pt[ 0 ];
    }

    if( pt[ 1 ] < bbox[ 1 ] ){
      bbox[ 1 ] = pt[ 1 ];
    }

    if( pt[ 1 ] > bbox[ 3 ] ){
      bbox[ 3 ] = pt[ 1 ];
    }
  }

  return bbox;
}

function simplifyCoords( coords ){
  var simplificationRate = 0.0026;
  var pts = coords.map( function mapToSimplify( pt ){
    return { x: pt[ 0 ], y: pt[ 1 ] };
  });
  var simplified = simplify( pts, simplificationRate, true );
  return simplified.map( function mapToGeoJson( pt ){
    return [ pt.x, pt.y ];
  });
}

function extractProps( allProps, desiredProps ){
  var newProps = {};
  desiredProps.forEach( function ( prop ){
    newProps[ prop ] = allProps[ prop ];
  });
  return newProps;
}

function load(path, desiredProps, cb){
  var bboxes = [];
  var allPolygons = [];
  var id = 0;

  function indexPolygon( props, coords ){
    var simplified = simplifyCoords( coords );

    allPolygons.push({
      coordinates: simplified,
      properties: extractProps( poly.properties, desiredProps )
    });

    var bbox = getBoundingBox( simplified );
    bbox.id = id++;
    bboxes.push(bbox);
  }

  shapefileStream.createReadStream( path )
    .pipe( through.obj(
      function write( poly, enc, next ){
        if( poly.geometry !== null &&
          poly.geometry.coordinates[ 0 ].length > 0 ){
          switch( poly.geometry.type ){
            case 'Polygon':
              indexPolygon( poly.properties, poly.geometry.coordinates[ 0 ] );
              break;

            case 'MultiPolygon':
              var polys = poly.geometry.coordinates;
              polys.forEach( function indexPolyCoords( polyCoords ){
                indexPolygon( poly.properties, polyCoords[ 0 ] );
              });
              break;
          }
        }
        next();
      },
      function end( done ){
        var rtree = new rbush().load( bboxes );
        cb( allPolygons, rtree );
        done();
      }
    ));
}

function search( polygons, rtree, lat, lon ){
  var bboxes = rtree.search( [ lon, lat, lon, lat ] );
  if( bboxes.length === 1 ){
    return polygons[ bboxes[ 0 ].id ].properties;
  }
  else {
    for( var ind = 0; ind < bboxes.length; ind++ ){
      var polyObj = polygons[ bboxes[ ind ].id ];
      var poly = polyObj.coordinates;
      if( pointInPolygon( [ lon, lat ], poly ) ){
        return polyObj.properties;
      }
    }
  }
}

module.exports = {
  load: load,
  search: search
};
