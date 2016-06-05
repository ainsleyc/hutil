var request = require('request');

var ignoredNamePrefixes = {
  north: true,
  south: true,
  east: true,
  west: true,
  n: true,
  s: true,
  e: true,
  w: true,
};

var ignoredNameSuffixes = {
  dr: true,
  ave: true,
  unit: true,
  blvd: true,
  st: true,
  ter: true,
  ln: true,
  ct: true,
  pl: true,
  rd: true,
  way: true,
};

function getAddressSearchUrl(number, streetName) {
  return 'http://zimas.lacity.org/ajaxSearchResults.aspx?search=address&HouseNumber=' + number + '&StreetName=' + streetName + '#';
}

function getAddressNumber(street) {
  var regex = /^(\d*)\s/;
  var result = regex.exec(street);
  return result ? result[0] : null;
}

function getAddressName(street) {
  var tokens = street.split(' ');
  var result = [];
  var pastPrefix = false;
  for (var i = 1; i < tokens.length; i++) {
    if (pastPrefix || !ignoredNamePrefixes[tokens[i].toLowerCase()]) {
      pastPrefix = true;
      if (ignoredNameSuffixes[tokens[i].toLowerCase()] || tokens[i].charAt(0) == '#') {
        break;
      } else {
        result.push(tokens[i]);
      }
    }
  }
  return result.join(' ');
}

function getPinUrl(pin) {
  return 'http://zimas.lacity.org/map.aspx?pin=' + pin + '&ajax=yes'
}

function getZoningCode(zimasHTML) {
  var regex = /ZimasData.openDataLink\('ZONING', '([\w-]*)'\)/;
  var match = regex.exec(zimasHTML);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

function parseSearchResult(body) {
  var regex = /ZimasData.navigateDataToPin\('([\w ]*)', '([\w ]*)'/
  var results = regex.exec(body);
  if (results) {
    return {
      pin: results[1],
      address: results[2],
    };
  } else {
    return null;
  }
}

var Zimas = {
  searchByStreet: function(street, cb) {
    if (street) {
      var number = getAddressNumber(street);
      var streetName = getAddressName(street);
      request(getAddressSearchUrl(number, streetName), function(err, resp, body) {
        if (err) { return cb(err); }

        var matches = parseSearchResult(body);
        if (matches) {
          request(getPinUrl(matches.pin), function(err, resp, body) {
            if (err) { return cb(err, matches); }

            matches.zoning = getZoningCode(body);
            return cb(null, matches);
          });
        } else {
          return cb(null, null);
        }
      });
    }
  },
};

module.exports = Zimas;
