// Modules to import
const https = require("https");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

// One day in milliseconds (used in date calculations)
const ONEDAY = 1000 * 60 * 60 * 24;

// This function changes a date to Mmm dd, yyyy format.
function formatedDate(date) {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"];
  var monthOfDate = monthNames[date.getMonth()];
  var dateOfDate = date.getDate();
  var yearOfDate = date.getFullYear();
  return monthOfDate + " " + dateOfDate + ", " + yearOfDate
}

// Create a prompt and save the chosen date.
var QUESTION = "\nThis program returns the stock quotes of home24 for the " +
    "trading days of the calendar week of \na chosen date. Please choose a date" +
    " followed by your Alpha Vantage API key. Use this format: \ndd.mm.yyyy." +
    "key (separation by dots only, no whitespace): ";

readline.question(QUESTION, function(dateAndKey) {
  // Transform the input date into an array.
  var inputDateAndKey = dateAndKey.split(".", 4);
  // Use the items of the array to construct a UTC date.
  var chosenDate = new Date(Date.UTC(inputDateAndKey[2], inputDateAndKey[1]-1, inputDateAndKey[0]));
  readline.close();

  // Log the head line section for the stock quotes display.
  var headLine = "\nhome24 (H24.DEX)\nXETRA.  Currency in EUR"
  console.log(headLine);

  // Calculate the start of the calendar week that the chosen date falls into
  var calendarWeekStart;

  switch (chosenDate.getDay()) {
    case 0:
      calendarWeekStart = new Date(chosenDate - (6 * ONEDAY));
      break;
    case 1:
      calendarWeekStart = chosenDate;
      calendarWeekEnd = new Date(chosenDate + (4 * ONEDAY));
      break;
    case 2:
      calendarWeekStart = new Date(chosenDate - (1 * ONEDAY));
      break;
    case 3:
      calendarWeekStart = new Date(chosenDate - (2 * ONEDAY));
      break;
    case 4:
      calendarWeekStart = new Date(chosenDate - (3 * ONEDAY));
      break;
    case 5:
      calendarWeekStart = new Date(chosenDate - (4 * ONEDAY));
      break;
    case 6:
      calendarWeekStart = new Date(chosenDate - (5 * ONEDAY));
      break;
  }

  // Calculate the last trading day (Fri) of that calendar week
  var calendarWeekEnd = new Date(calendarWeekStart*1 + 4*ONEDAY);

  // Build an array holding the trading days of that calendar week (Mon -Fri)
  var tradingDatesInCalendarWeek = new Array();
  var msCalendarWeekEnd = calendarWeekEnd * 1;
  for (var msCounter = calendarWeekStart * 1; msCounter <= msCalendarWeekEnd; msCounter += ONEDAY) {
    tradingDatesInCalendarWeek.push(new Date(msCounter));
  }

  // Log the range of the calendar week for the stock quotes display.
  var rangeOfCalendarWeek = formatedDate(calendarWeekStart) + " - " + formatedDate(calendarWeekEnd);
  console.log("Time Period: " + rangeOfCalendarWeek + "\n");

  // Send a GET request to the API of Alpha Vantage to retrieve stock quote data
  const URL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_" +
        "ADJUSTED&symbol=H24.DEX&apikey=" + inputDateAndKey[3] + "&outputsize=full";
  https.get(URL, function(response) {

    var stockData = '';

    // A piece of the stock data response has been recieved
    response.on("data", function(stockDataPiece) {
      stockData += stockDataPiece;
    });

    // The whole stock data response has been received. Store the result.
    response.on("end", function() {
      const stockDataResponse = JSON.parse(stockData);

      // Construct an object holding the stock quotes linked to a trading day.
      var stockValuePerDay = {};
      for (tradingDate in stockDataResponse["Time Series (Daily)"]) {
        tradingDay = new Date(tradingDate);
        stockValueOfTradingDay = Number(stockDataResponse["Time Series (Daily)"][tradingDate]["5. adjusted close"]).toFixed(2);
        stockValuePerDay[tradingDay] = stockValueOfTradingDay;
      }

      // Construct an array to hold the stock quotes for each trading date of the calendar week.
      var stockValuesOfCalendarWeek = [];
      for (tradingDate in tradingDatesInCalendarWeek) {
        // If the stockValuePerDay object holds a trading day with a stock quote, add that stock quote to the array
        if (stockValuePerDay[tradingDatesInCalendarWeek[tradingDate]]) {
          stockValuesOfCalendarWeek.push(stockValuePerDay[tradingDatesInCalendarWeek[tradingDate]]);
        }
        // If the stockValuePerDay object does not hold a trading day with a stock quote, add "-" to the array
        else {
          stockValuesOfCalendarWeek.push("-");
        }
      }

      // Display the first line of a table displaying the trading days of the week
      var tradingWeek = ["Mo", "Tu", "We", "Th", "Fr"];
      console.log(tradingWeek.join("\t"));

      // Display the second lind of a table displaying the stock quotes
      console.log(stockValuesOfCalendarWeek.join("\t") + "\n");
    })
  })
})
