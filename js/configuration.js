const config = {
  CLIENT_ID: "change-this.apps.googleusercontent.com", // Client ID from the Google Developer Console
  API_KEY: "change-this", // API key from the Google Developer Console
  DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"], // Array of API discovery doc URLs for APIs used by the quickstart
  SCOPES: "https://www.googleapis.com/auth/spreadsheets", // Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
  SPREADSHEET_ID: "change-this", // Spreadsheet id from Google Sheets URL
  CHORES_RANGE: "Chores!A2:D", // Chores sheet name and range in A1 notation
  BOOKINGS_RANGE: "Bookings!A2:G", // Booked chores sheet name and range in A1 notation
  SUMS_RANGE: "Sums!A2:B" // Summary calculations sheet name and range in A1 notation
};
