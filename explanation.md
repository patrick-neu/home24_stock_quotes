## Input and Date calculations

To work with the date and API key input of the user, I used the `readline` module provided by Node.js. Since a user could choose any date, I used a `switch` statement to determine the start of the calendar week of the chosen date. I conducted date calculations using the `Date.UTC()` method, so that calculations with the equivalent of one day in milliseconds return valid results.

---

## HTTP Request and Using the Alpha Vantage API

For the Alpha Vantage API query, I used the following endpoint and path:

`https://www.alphavantage.co/query?`

To retrieve content from a ["Daily Adjusted"](https://www.alphavantage.co/documentation/) query for home24 the required parameters are `function=TIME_SERIES_DAILY_ADJUSTED`, `symbol` and `apikey`. To find the `symbol` value for home24, I conducted a ["Search Endpoint"](https://www.alphavantage.co/documentation/) query with the parameters `function=SYMBOL_SEARCH`, `keywords=home24` and `apikey`. The two best matches were:

![Search Endpoint Query](search_endpoint_query.png)

Using `symbol=H24.FRK` resulted in an invalid API call. Therefore, I used `symbol=H24.DEX` as a parameter to build the URL for the HTTP request.

To conduct the HTTP request, I used the `https` module provided by Node.js. I stored all the incoming data pieces of the response. I used the `JSON.parse()` method, to transform the data into a JavaScript object.

Because the JavaScript object has several nested objects, I created a new object called `stockValuePerDay` with all the trading dates as properties and the corresponding adjusted stock closing value as their value.

---

## Collecting the Stock Values for the Chosen Calendar Week

I then created the array `stockValuesOfCalendarWeek`, to hold the adjusted closing values for each trading day of the calendar week. I used an `if...else` statement to deal with trading days, that have no corresponding values (e.g. because that day was a public holiday).
