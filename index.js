'use strict';

var shapefileStream = require( 'shapefile-stream' );
var rbush = require( 'rbush' );
var pointInPolygon = require( 'point-in-polygon' );
var simplify = require( 'simplify-js' );
var through = require( 'through2' );

function HierarchyLookup( rtree, polygons ){
  this.rtree = rtree;
  this.polygons = polygons;
}

HierarchyLookup.prototype.search = function search( lat, lon ){
  var bboxes = this.rtree.search( [ lon, lat, lon, lat ] );
  if( bboxes.length === 1 ){
    return this.polygons[ bboxes[ 0 ].id ].properties;
  }
  else {
    var pt = [ lon, lat ];
    for( var ind = 0; ind < bboxes.length; ind++ ){
      var polyObj = this.polygons[ bboxes[ ind ].id ];
      if( pointInPolygon( pt, polyObj.coordinates ) ){
        return polyObj.properties;
      }
    }
  }
};

function getBoundingBox( poly ){
  var firstPt = poly.shift();
  var bbox = [
    firstPt[ 0 ], firstPt[ 1 ],
    firstPt[ 0 ], firstPt[ 1 ]
  ];

  poly.forEach( function identifyBounds( pt ){
    var x = pt[ 0 ];
    if( x < bbox[ 0 ] ){
      bbox[ 0 ] = x;
    }
    else if( x > bbox[ 2 ] ){
      bbox[ 2 ] = x;
    }

    var y = pt[ 1 ];
    if( y < bbox[ 1 ] ){
      bbox[ 1 ] = y;
    }
    else if( y > bbox[ 3 ] ){
      bbox[ 3 ] = y;
    }
  });

  return bbox;
}

function simplifyCoords( coords ){
  var pts = coords.map( function mapToSimplifyFmt( pt ){
    return { x: pt[ 0 ], y: pt[ 1 ] };
  });

  var simplificationRate = 0.0026;
  var simplified = simplify( pts, simplificationRate, true );

  return simplified.map( function mapToGeoJsonFmt( pt ){
    return [ pt.x, pt.y ];
  });
}

function load(path, desiredProps, cb){
  var bboxes = [];
  var polygons = [];
  var id = 0;

  function indexPolygon( props, coords ){
    var simplified = simplifyCoords( coords );
    var propSubset = {};
    desiredProps.forEach( function ( propName ){
      propSubset[ propName ] = props[ propName ];
    });

    polygons.push({
      coordinates: simplified,
      properties: propSubset
    });

    var bbox = getBoundingBox( simplified );
    bbox.id = id++;
    bboxes.push(bbox);
  }

  function write( poly, enc, next ){
    if( poly.geometry !== null && poly.geometry.coordinates[ 0 ].length > 0 ){
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
  }

  function end( done ){
    var rtree = new rbush().load( bboxes );
    cb( new HierarchyLookup( rtree, polygons ) );
    done();
  }

  var rtreeCreator = through.obj( write, end );
  shapefileStream
    .createReadStream( path )
    .pipe( rtreeCreator );
}

module.exports = load;
