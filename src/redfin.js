
var Redfin = {
  parseGisResponse: function(jsonStr) {
    var json= JSON.parse(jsonStr);
    var result = [];
    json.payload.homes.forEach(function(home) {
      var homeData = {
        mlsId: home.mlsId.value,
        price: home.price.value,
        sqFt: home.sqFt.value,
        beds: home.beds,
        baths: home.baths,
        street: home.streetLine.value,
        city: home.city,
        state: home.state, 
        zip: home.zip,
        yearBuilt: home.yearBuilt.value,
        url: 'https://www.redfin.com' + home.url,
      };
      result.push(homeData);
    });
    return result;
  }
};

module.exports = Redfin;
