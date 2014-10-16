var monthChoiceUrl;
var weekdayChoiceUrl;
var dateChoiceUrl; 
var categoryChoiceUrl;
var districtChoiceUrl;
var resolutionChoiceUrl;
var timeChoiceUrl;
var initUrl;

// Adds url to base, adding and if needed
function addUrlPart(base, url) {
  if (url) {
    if (base != "") {
      base += " AND ";
    }
    base += url;
  }
  return base;
}

// Constructs url to filter
function filterData() {

  var url = "";
  var where = "?$where=";

  // Determine if by month & weekday or date
  // Date gets precedence
  if (dateChoiceUrl) {
    url = addUrlPart(url, dateChoiceUrl);
  } else if (monthChoiceUrl || weekdayChoiceUrl) {
    url = addUrlPart(url, monthChoiceUrl);
    url = addUrlPart(url, weekdayChoiceUrl);
  }

  // Category
  url = addUrlPart(url, categoryChoiceUrl);

  // District
  url = addUrlPart(url, districtChoiceUrl);

  // Resolution
  url = addUrlPart(url, resolutionChoiceUrl);

  // Time
  url = addUrlPart(url, timeChoiceUrl);

  // If we have anything to filter by, run query
  if (url != "") {
    url = where + url;
    console.log(url);
    getIncidents(apiUrl + url, "", 0);
  } else {
    // Do default search
    getIncidents(apiUrl + initUrl, "", 0);
  }
}

function resetMonth() { monthChoiceUrl = null; $("#month").val($("#month option:first").val()); }
function resetWeekday() { weekdayChoiceUrl = null; $("#weekday").val(""); }
function resetDate() { dateChoiceUrl = null; $("#datepicker").val(""); }
function resetCategory() { categoryChoiceUrl = null; $("#incident-category").val(""); }
function resetDistrict() { districtChoiceUrl = null; $("#pddistrict").val(""); }
function resetResolution() { resolutionChoiceUrl = null; $("#resolution").val(""); }
function resetTime() { timeChoiceUrl = null; $("#time-slider").slider('setValue', [0, 1440]); }

function resetUrls() {
  resetMonth();
  resetWeekday();
  resetDate();
  resetCategory();
  resetDistrict();
  resetResolution();
  resetTime();
}

$(document).ready(function() {

  // On change callbacks for all filters

  // Changed month
  $("#month").on("change", function() {

    if ($(this).val() != "") {
      var startDate = moment();
      var endDate = moment();
      startDate.month(parseInt($(this).val()));
      endDate.month(parseInt($(this).val()));
      startDate.startOf('month');
      endDate.endOf('month');
      monthChoiceUrl = "date >= '" + startDate.toISOString() + "' AND date <= '" + endDate.toISOString() + "'";
    } else {
      monthChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Reset date
    resetDate();
    // Get data
    filterData();
  });

  // Weekday
  $("#weekday").on("change", function() {

    if ($(this).val() != "") {
      weekdayChoiceUrl = "dayofweek = '" + $(this).val() + "'";
    } else {
      weekdayChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Reset date
    resetDate();
    // Get data
    filterData();
  });

  // Datepicker change
  $("#datepicker").on('changeDate', function(e) {

    if (e.date != "") {
      var startDate = moment(e.date);
      var endDate = moment(e.date);
      startDate.startOf('day');
      endDate.endOf('day');
      dateChoiceUrl = "date >= '" + startDate.toISOString() + "' AND date <= '" + endDate.toISOString() + "'";
    } else {
      dateChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Reset month and weekday
    resetMonth();
    resetWeekday();
    // Get data
    filterData();
    // Close datepicker
    $("#datepicker").datepicker("hide");
  });

  // Category
  $("#incident-category").on("change", function() {

    if ($(this).val() != "") {
      categoryChoiceUrl = "category = '" + $(this).val() + "'";
    } else {
      categoryChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Get data
    filterData();
  });

  // District
  $("#pddistrict").on("change", function() {

    if ($(this).val() != "") { 
      districtChoiceUrl = "pddistrict = '" + $(this).val() + "'";
    } else {
      districtChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Get data
    filterData();
  });

  // Resolution
  $("#resolution").on("change", function() {

    if ($(this).val() != "") {
      resolutionChoiceUrl = "resolution = '" + $(this).val() + "'";
    } else {
      resolutionChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Get data
    filterData();
  });

  // Time
  $("#time-slider").on('slideStop', function(e) {

    if (e.value[0] != 0 || e.value[1] != 1440) {
      var startTime = e.value[0];
      var endTime = e.value[1];

      // Convert minutes to time
      var startTimeStr = numToTime(startTime);
      var endTimeStr = numToTime(endTime);
      timeChoiceUrl = "time >= '" + startTimeStr + "' AND time <= '" + endTimeStr + "'";
    } else {
      timeChoiceUrl = null;
    }

    // Clear map
    clearMap();
    // Loading screen
    startLoadingScreen();
    // Get data
    filterData();
  });

  // Clear filters click
  $("#clear-filters").click(function() {

    // Clear map
    clearMap();

    // Reset Urls
    resetUrls();
    
    // Do initial query
    console.log(apiUrl + initUrl);
    getIncidents(apiUrl + initUrl, "", 0);
  });

}); // End document ready
