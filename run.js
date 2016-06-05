var fs = require('fs');
var _ = require('lodash');

var Redfin = require('./src/redfin');
var Zimas = require('./src/zimas');

var REQUEST_DELAY = 8000;
var RANDOM_DELAY = 2000;

var input = fs.readFileSync(process.argv[2]);
var outputFile = process.argv[3];

var homes = Redfin.parseGisResponse(input);

var labelFlag = false;
var i = 0;
homes.forEach(function(home) {
  (function(i) {
    setTimeout(function() {
      console.log([
        home.street,
        home.city,
        home.state,
        home.zip,
      ].join(', '));
      Zimas.searchByStreet(home.street, function(err, matches) {
        home.zimas_pin = '';
        home.zimas_address = '';
        home.zimas_zoning = '';
        if (matches) {
          home.zimas_pin = matches.pin;
          home.zimas_address = matches.address;
          home.zimas_zoning = matches.zoning;
        }

        if (!labelFlag) {
          var labels = _.map(home, function(value, key) {
            return key;
          });
          fs.appendFile(outputFile, labels.join(', ') + '\n', function() {});
          labelFlag = true;
        }

        var data = _.map(home, function(value, key) {
          return value;
        });
        fs.appendFile(outputFile, data.join(', ') + '\n', function() {});
      });
    }, i * REQUEST_DELAY + Math.random() * RANDOM_DELAY);
  })(i);
  i++;
});
