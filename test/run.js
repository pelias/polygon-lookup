
var tape = require('tape');
var common = {};

var tests = [
  require('./exports.js')
];

tests.map(function(t) {
  t.all(tape, common);
});