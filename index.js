'use strict';

var rbush = require( 'rbush' );
var pointInPolygon = require( 'point-in-polygon' );

var polygonUtils = require( './lib/polygon_utils' );

function PolygonLookup( featureCollection ){
  if( featureCollection !== undefined ){
    this.loadPolygons( featureCollection );
  }
}

PolygonLookup.prototype.search = function search( lat, lon ){
  var bboxes = this.rtree.search( [ lon, lat, lon, lat ] );
  if( bboxes.length === 1 ){
    return this.polygons[ bboxes[ 0 ].id ].properties;
  }
  else {
    var pt = [ lon, lat ];
    for( var ind = 0; ind < bboxes.length; ind++ ){
      var polyObj = this.polygons[ bboxes[ ind ].id ];
      var polyCoords = polyObj.geometry.coordinates[ 0 ];
      if( pointInPolygon( pt, polyCoords ) ){
        return polyObj.properties;
      }
    }
  }
};

PolygonLookup.prototype.loadPolygons = function loadPolygons( featureCollection ){
  var bboxes = [];
  var polygons = [];
  var polyId = 0;

  function indexPolygon( poly ){
    var coords = poly.geometry.coordinates[ 0 ];
    polygons.push(poly);
    var bbox = polygonUtils.getBoundingBox( coords );
    bbox.polyId = polyId++;
    bboxes.push(bbox);
  }

  function indexFeature( poly ){
    switch( poly.geometry.type ){
      case 'Polygon':
        indexPolygon( poly );
        break;

      case 'MultiPolygon':
        var childPolys = poly.geometry.coordinates;
        for( var ind = 0; ind < childPolys.length; ind++ ){
          var childPoly = {
            type: 'Feature',
            properties: poly.properties,
            geometry: {
              type: 'Polygon',
              coordinates: childPolys[ ind ]
            }
          };
          indexPolygon( childPoly );
        }
        break;
    }
  }

  featureCollection.forEach( indexFeature );
  this.rtree = new rbush().load( bboxes );
  this.polygons = polygons;
};

module.exports = PolygonLookup;
