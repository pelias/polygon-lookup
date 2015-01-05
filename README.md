
**This module status is currently beta, the API may change in the future.**

The functionality and parameters are specific to Pelias, only use this module if you know what you're doing.

**This requires that the quattroshapes data has already been imported and the indeces have been refreshed and ready for querying**

## Installation

```bash
$ npm install pelias-hierarchy-lookup
```

[![NPM](https://nodei.co/npm/pelias-hierarchy-lookup.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-hierarchy-lookup)

## Usage

```javascript
var lookup = require('pelias-hierarchy-lookup'),
    stream = lookup.stream(),
    through = require('through2');

stream.pipe( through.obj( function( item, enc, next ){
  console.log( item );
  next();
}));

var centroid = { lat: 51.5328850, lon: -0.0652280 };
stream.write({ center_point: centroid } );
stream.end();
```

## NPM Module

The `pelias-hierarchy-lookup` npm module can be found here:

[https://npmjs.org/package/pelias-hierarchy-lookup](https://npmjs.org/package/pelias-hierarchy-lookup)

## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

### Running Unit Tests

```bash
$ npm test
```

### Continuous Integration

Travis tests every release against node version `0.10`

[![Build Status](https://travis-ci.org/pelias/pelias-hierarchy-lookup.png?branch=master)](https://travis-ci.org/pelias/pelias-hierarchy-lookup)