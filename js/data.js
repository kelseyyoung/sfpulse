var apiUrl = "http://data.sfgov.org/resource/tmnf-yvry.json";

var yellowIcon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
var greenIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
var redIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

var selectedMarker = null;

var dataHolder = {};
var incidentCategory = []; 
var markerArray = [];

function getIncidents(url, page, counter) { 

  console.log(url + page);

  var newCounter = counter;

  $.getJSON(url + page, function(data) {

    $.each(data, function(key, val) {

      newCounter++;
      
      // Parse point
      var point = val.location;
      var lon = point.longitude;
      var lat = point.latitude;

      // Create marker
      var marker = new google.maps.Marker({
	position: new google.maps.LatLng(lat, lon),
	map: map
      });

      // Store in dataHolder
      marker.set("id", newCounter); 
      dataHolder[newCounter] = val;

      // Store in markerArray
      markerArray.push(marker);

      if (val.resolution != "NONE") {
	marker.setIcon(greenIcon);
      } else {
	marker.setIcon(yellowIcon);
      }

      // Set callback
      /*
      google.maps.event.addListener(marker, "click", function() {
	selectMarker(marker);
	showIncident(dataHolder[marker.get("id")]);
      });
      */

      // Add marker to clusterer
      mc.addMarker(marker);

      // Add marker to spiderfier
      oms.addMarker(marker);

    });
  }).done(function() {

    //console.log("Done fetching data");
    //console.log(newCounter);

    if (counter != newCounter) {
      // Change page
      var newPage = "&$offset=" + newCounter;
      getIncidents(url, newPage, newCounter);
    } else {
      // Done, increment loadingScreenThresh
      loadingScreenThresh++;
    }
  });

}

function initData() {

  // Load initial points

  // Get first day for last month
  var firstDay = moment();
  firstDay.subtract(1, "month");
  firstDay.startOf('month');

  // Get last day for last month
  var lastDay = moment();
  lastDay.subtract(1, "month");
  lastDay.endOf("month");

  // Set initial URL, used when we clear all filters
  initUrl = "?$where=date >= '" + firstDay.toISOString() + "' AND date <= '" + lastDay.toISOString() + "'";

  getIncidents(apiUrl + initUrl, "", 0);

  // Get all categories
  var categoryUrl = apiUrl + "?$select=category&$group=category&$order=category ASC";
  $.getJSON(categoryUrl, function(data) {

    $.each(data, function(key, val) {
      $("#incident-category").append("" + 
	"<option value='" + val.category + "'>" + displayName(val.category) + "</option>"
      );
    });
  }).done(function() { loadingScreenThresh++; });

  // Get all districts
  var districtUrl = apiUrl + "?$select=pddistrict&$group=pddistrict&$order=pddistrict ASC";
  $.getJSON(districtUrl, function(data) {

    $.each(data, function(key, val) {
      $("#pddistrict").append("" + 
	"<option value='" + val.pddistrict + "'>" + displayName(val.pddistrict) + "</option>"
      );
    });
  }).done(function() { loadingScreenThresh++; });

  // Get all resolutions
  var resolutionUrl = apiUrl + "?$select=resolution&$group=resolution&$order=resolution ASC";
  $.getJSON(resolutionUrl, function(data) {

    $.each(data, function(key, val) {
      $("#resolution").append("" + 
	"<option value='" + val.resolution + "'>" + displayName(val.resolution) + "</option>"
      );
    });
  }).done(function() { loadingScreenThresh++; });

}

function selectMarker(newMarker) {

  if (selectedMarker) {
    // Unselect current marker
    if (dataHolder[selectedMarker.get("id")].resolution != "NONE") {
      selectedMarker.setIcon(greenIcon);
    } else {
      selectedMarker.setIcon(yellowIcon);
    }
    selectedMarker = null;
  }
  
  // Change new selectedMarker
  selectedMarker = newMarker;
  if (selectedMarker) {
    selectedMarker.setIcon(redIcon);
  }
}

function showIncident(data) {

  console.log(data);

  // Empty out well
  $("#incident-info > span").empty();

  //var incidentDate = new Date(parseInt(data.date) * 1000);
  //var dateToStr = incidentDate.customFormat("#DDDD# #MMMM# #D##th#, #YYYY#");
  var incidentDate = moment.unix(parseInt(data.date));

  // Append data
  // TODO: better time formatting?
  $("#incident-info > span").append("" +
    "<h4 class='text-center'>" + incidentDate.format("dddd, MMMM Do YYYY ") + data.time + "</h4>" +
    "<p><b>Location:</b> " + displayName(data.address) + "</p>" +
    "<p><b>Description:</b> " + displayName(data.descript) + "</p>"
  );

  console.log(data.resolution);

  if (data.resolution == 'NONE') {
    $("#incident-info > span").append("" +
    "<p><b>Resolution:</b> <span class='not-resolved'>" + displayName(data.resolution) + "</span></p>");
  } else {
    $("#incident-info > span").append("" +
    "<p><b>Resolution:</b> <span class='resolved'>" + displayName(data.resolution) + "</span></p>");
  }

  // Show well
  $("#incident-info").show();

}

function displayName(str) {
  return str.replace(/\w*/g, function(txt) { return txt.charAt(0).toUpperCase() +
    txt.substring(1).toLowerCase(); });
}

function clearMap() {

  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  mc.clearMarkers();

  markerArray = [];
}
