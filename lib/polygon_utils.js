'use strict';

var simplify = require( 'simplify-js' );

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

module.exports = {
  getBoundingBox: getBoundingBox,
  simplifyCoords: simplifyCoords
};
