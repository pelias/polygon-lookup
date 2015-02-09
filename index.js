'use strict';

var rbush = require( 'rbush' );
var pointInPolygon = require( 'point-in-polygon' );
var polygonUtils = require( './lib/polygon_utils' );

function PolygonLookup( featureCollection ){
  if( featureCollection !== undefined ){
    this.loadFeatureCollection( featureCollection );
  }
}

PolygonLookup.prototype.search = function search( lat, lon ){
  var bboxes = this.rtree.search( [ lon, lat, lon, lat ] );
  if( bboxes.length === 1 ){
    return this.polygons[ bboxes[ 0 ].polyId ];
  }
  else {
    var pt = [ lon, lat ];
    for( var ind = 0; ind < bboxes.length; ind++ ){
      var polyObj = this.polygons[ bboxes[ ind ].polyId ];
      var polyCoords = polyObj.geometry.coordinates[ 0 ];
      if( pointInPolygon( pt, polyCoords ) ){
        return polyObj;
      }
    }
  }
};

PolygonLookup.prototype.loadFeatureCollection = function loadFeatureCollection( collection ){
  var bboxes = [];
  var polygons = [];
  var polyId = 0;

  function indexPolygon( poly ){
    polygons.push(poly);
    var bbox = polygonUtils.getBoundingBox( poly.geometry.coordinates[ 0 ] );
    bbox.polyId = polyId++;
    bboxes.push(bbox);
  }

  function indexFeature( poly ){
    if( poly.geometry.coordinates[ 0 ] !== undefined &&
        poly.geometry.coordinates[ 0 ].length > 0){
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
  }

  collection.features.forEach( indexFeature );
  this.rtree = new rbush().load( bboxes );
  this.polygons = polygons;
};

module.exports = PolygonLookup;
