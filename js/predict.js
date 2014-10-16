// Take current day of week and time
// And predict which block(s) (multiple if tie)?
// are most likely to have crime occuring
// within the next hour(?)

// Predict which crime is most likely to happen
// within the next hour

function getPredictions() {
  predictBlock();
}

function predictBlock() {
  // Get current day of week
  var now = moment();
  var dayOfWeek = now.format("dddd");
  console.log(dayOfWeek);

  // Get current hour timespan
  var timeNow = now.format("HH:mm");
  var timeHourLater = now.add(1, 'hour').format("HH:mm");

  // Construct query
  var predictionUrl = "?$select=address,COUNT(address)&$group=address&$order=COUNT(address) DESC&$limit=1&$where=dayofweek = '" + dayOfWeek + "' AND time >= '" + timeNow + "' AND time <= '" + timeHourLater + "'";
  console.log(predictionUrl);

  $.getJSON(apiUrl + predictionUrl, function(data) {
    console.log(data);
    var item = data[0];
    var address = item.address;

    // Put block in modal
    $("#predict-block").html(displayName(address));

    // Get coordinate for this address
    var coordinateUrl = "?$select=location&$limit=1&$where=address = '" + address + "'";
    $.getJSON(apiUrl + coordinateUrl, function(coordData) {
      console.log(coordData);
      var coordItem = coordData[0];
      var coordinate = coordItem.location;
      var lat = coordinate.latitude;
      var lon = coordinate.longitude;

      // Put coords in predict-goto
      $("#predict-goto").data("lat", lat);
      $("#predict-goto").data("lon", lon);
    });
  });
  
  var categoryPredictionUrl = "?$select=category,COUNT(category)&$group=category&$order=COUNT(category) DESC&$limit=1&$where=dayofweek = '" + dayOfWeek + "' AND time >= '" + timeNow + "' AND time <= '" + timeHourLater + "'";
  console.log(categoryPredictionUrl);

  $.getJSON(apiUrl + categoryPredictionUrl, function(data) {
    console.log(data);
    var item = data[0];
    var category = item.category;

    // Put category in modal
    $("#predict-category").html(displayName(category)); 
  });

}
