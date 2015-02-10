/**
 * @file The package's unit tests.
 */

'use strict';

var tape = require( 'tape' );
var PolygonLookup = require( '../index' );
var rbush = require( 'rbush' );

tape( 'Exports a function', function ( test ){
  test.equal( typeof PolygonLookup, 'function', 'Is a function.' );
  test.end();
});

tape( 'PolygonLookup() constructor accepts optional argument', function ( test ){
  test.plan( 3 );
  test.equal( PolygonLookup.length, 1, 'Accepts 1 argument.' );

  /**
   * Hackishly mock away `loadFeatureCollection()` to test that it gets called
   * by PolygonLookup().
   */
  var originalFunc = PolygonLookup.prototype.loadFeatureCollection;
  PolygonLookup.prototype.loadFeatureCollection = function mock(arg){
    test.deepEqual( arg, featureCollection, 'Argument matches expected.' );
    test.pass( 'loadFeatureCollection() called.' );
  };

  var featureCollection = {};
  var lookup = new PolygonLookup(featureCollection);
  PolygonLookup.prototype.loadFeatureCollection = originalFunc;
});

tape( 'loadFeatureCollection() sets properties.', function ( test ){
  var collection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [ 0, 1 ],
            [ 2, 1 ],
          ]]
        }
      }
    ]
  };

  var lookup = new PolygonLookup();
  lookup.loadFeatureCollection( collection );
  test.ok( lookup.rtree instanceof rbush, 'Sets `rtree`.' );
  test.deepEqual( lookup.polygons, collection.features, 'Sets `polygons`.' );
  test.end();
});
