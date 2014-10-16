
function loadStats() {
  loadCrimesPerWeekday();
}

var weekdayColors = [];
var weekdayHighlightColors = [];

// Crimes per weekday (pie)
function loadCrimesPerWeekday() {
  var weekdayStatsUrl = "?$select=COUNT(dayofweek),dayofweek&$group=dayofweek&$order=COUNT(dayofweek) DESC";
  $.getJSON(apiUrl + weekdayStatsUrl, function(data) {

    // Total up incidents
    var totalIncidents = 0;
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      totalIncidents += parseInt(item.count_dayofweek);
    }

    var chartData = [];
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var pct = parseFloat(((parseInt(item.count_dayofweek) / totalIncidents) * 100).toFixed(2));
      var randomColor = getRandomColor();
      var lightRandomColor = getLightenedColor(randomColor, 0.2); 

      chartData.push({
	value: pct,
	color: randomColor,
	highlight: lightRandomColor,
	label: item.dayofweek
      });
    }

    // Create chart and add data
    var weekdayChart = new Chart(document.getElementById("stats-weekday-canvas").getContext("2d")).Pie(chartData, {
      segmentShowStroke: false
    });

    loadCrimesPerCategory();

  });
}

// Crimes per category (pie)
function loadCrimesPerCategory() {
  var categoryStatsUrl = "?$select=COUNT(category),category&$group=category&$order=COUNT(category) DESC";
  $.getJSON(apiUrl + categoryStatsUrl, function(data) {

    // Total up categories
    var totalCategories = 0;
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      totalCategories += parseInt(item.count_category);
    }

    // Create chart and add data
    var categoryChart = new Chart(document.getElementById("stats-category-canvas").getContext("2d")).Pie(null, {
      segmentShowStroke: false
    });
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var pct = parseFloat(((parseInt(item.count_category) / totalCategories) * 100).toFixed(2));

      var randomColor = getRandomColor();
      var lightRandomColor = getLightenedColor(randomColor, 0.2); 

      categoryChart.addData({
	value: pct,
	color: randomColor,
	highlight: lightRandomColor,
	label: item.category
      });
    }

    loadCrimesPerHour(0, 0, [], []);

  });
}

// Crimes per hour (bar)
function loadCrimesPerHour(time, total, timeDataLabels, timeData) {

  if (time != 24) {
    var timeHolder = time;
    var nextTime = time + 1;
    if (time < 10) {
      time = "0" + time + ":00";
    } else {
      time = "" + time + ":00";
    }

    if (nextTime < 10) {
      nextTime = "0" + nextTime + ":00";
    } else {
      nextTime = "" + nextTime + ":00";
    }

    var hourlyStatsUrl = "?$select=COUNT(time)&$where=time >= '" + time + "' AND time < '" + nextTime + "'"; 
    $.getJSON(apiUrl + hourlyStatsUrl, function(data) {

      // Get count
      var incidentCount = data[0].count_time;
      
      // Add to total
      total += incidentCount;

      // Add data to timeData
      var key = time + " - " + nextTime;
      timeDataLabels.push(key);
      timeData.push(incidentCount);

      // Recursive calll
      loadCrimesPerHour(timeHolder + 1, total, timeDataLabels, timeData);
    });

  } else {
    // Create chart with timeData

    var randomColor = getRandomColor();
    var lightRandomColor = getLightenedColor(randomColor, 0.2); 

    var hourlyCrimes = new Chart(document.getElementById("stats-hourly-canvas").getContext("2d")).Bar({
      labels: timeDataLabels,
      datasets: [
	{
	  fillColor: randomColor,
	  strokeColor: randomColor,
	  highlightFill: lightRandomColor,
	  highlightStroke: lightRandomColor,
	  data: timeData
	}
      ]
    });
  }
}

function getRandomColor() {
  //return "#" + Math.floor(Math.random() * 16777215).toString(16);
  var r = (Math.round(Math.random()* 127) + 127).toString(16);
  var g = (Math.round(Math.random()* 127) + 127).toString(16);
  var b = (Math.round(Math.random()* 127) + 127).toString(16);
  return '#' + r + g + b;
}

function getLightenedColor(hex, pct) {
  var newColor = "#";
  hex = hex.substr(1);
  for (var i = 0; i < 3; i++) {
    var c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * pct)), 255)).toString(16);
    newColor += ("00" + c).substr(c.length);
  }
  return newColor;
}
