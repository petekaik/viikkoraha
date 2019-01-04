jQuery(document).ready(function() {
  console.log("document ready function kicked in");

  jQuery(".settings").click(function() {
    console.log("settings toggle");
    //jQuery('.panels').hide();
    //jQuery('#header').hide();
    jQuery("#settingspanel").toggle();
    //jQuery('#headertext').text('Asetukset').enhanceWithin();
    //jQuery('#dashboardbutton').hide();
  });

  jQuery("#dashboardbutton").click(function() {
    jQuery("#chorespanel").toggle();
    if ($("#dashboardpanel").css("display") == "none") {
      // about to show dashboard so update summary
      getSummary();
      listHistory();
    } else {
      /* alternate logic   */
    }
    console.log("dashboard toggle");
    jQuery("#dashboardpanel").toggle();
  });

  // Authentication
  /*function onSignIn(googleUser) {
		var profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
		console.log('Name: ' + profile.getName());
		console.log('Image URL: ' + profile.getImageUrl());
		console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	}*/
  jQuery("#chores").on("click", ".chorebuttons", function() {
    var choredetails = [];
    choredetails[0] = new Date().toISOString();
    choredetails[1] = jQuery(this).attr("id");
    choredetails[2] = jQuery(this).attr("description");
    choredetails[3] = jQuery(this).attr("value");
    choredetails[4] = "=VIIKKO.NRO(VASEN(A:A;10); 2)";
    choredetails[5] = name;
    choredetails[6] = "pending";
    console.log(choredetails[1] + " clicked");
    //console.log(choredetails);
    //hide task buttons and show confirmation details
    jQuery(".chorebuttons").hide();
    jQuery("#confirmationtext")
      .html("<h2>" + choredetails[2] + "</h2>	")
      .enhanceWithin();
    jQuery("#confirmation").show();
    jQuery("#confirm").click(function() {
      console.log(jQuery(this).attr("id") + " clicked");
      bookChore(choredetails);
      choredetails = null; // laatta
    });
    jQuery("#cancel").click(function() {
      console.log(jQuery(this).attr("id") + " clicked");
      jQuery("#confirmation").hide();
      jQuery(".chorebuttons").show();
      $("#notification")
        .fadeIn(400, function() {
          $("#notification").addClass("error");
          $("#notification").html("<h3>Viikkorahan lisäys peruutettu</h3>");
        })
        .delay(2000)
        .fadeOut(400, function() {
          $("#notification").removeClass("error");
          $("#notification").text("");
        });
      choredetails = null; // laatta
    });
  });

  jQuery("#choreshistorylist").on("click", ".summaryrows", function() {
    var bookingdetails = [];
    bookingdetails[0] = jQuery(this).attr("id");
    bookingdetails[1] = "paid";
    bookingdetails[2] = name;
    approveChore(bookingdetails);
  });
});

// Move these to configuration.js
// Client ID and API key from the Developer Console
// Array of API discovery doc URLs for APIs used by the quickstart
// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.

var authorizeButton = document.getElementById("authorize-button");
var signoutButton = document.getElementById("signout-button");

var name = "";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: config.API_KEY,
      clientId: config.CLIENT_ID,
      discoveryDocs: config.DISCOVERY_DOCS,
      scope: config.SCOPES
    })
    .then(function() {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      var isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      console.log("isSignedIn: " + isSignedIn);
      updateSigninStatus(isSignedIn);
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    console.log("User is authenticated");
    var user = gapi.auth2.getAuthInstance().currentUser.get();
    var profile = user.getBasicProfile();
    console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
    name = profile.getName();
    console.log("Name: " + name);
    jQuery("#profile").html(
      "<p>Kirjautunut sisään käyttäjänä </br>" + name + "</p>"
    );
    console.log("Image URL: " + profile.getImageUrl());
    jQuery("#profile").append('<img src="' + profile.getImageUrl() + '">');
    console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.
    jQuery("#signinnotification").hide();
    listChores();
  } else {
    jQuery("#chores").html("");
    jQuery("#signinnotification").show();
    jQuery("#profile").html("<p>Kirjaudu sisään</p>");
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  console.log("User initiated sign in");
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  console.log("User signed out");
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Print the names and prices of tasks in a spreadsheet:
 */
function listChores() {
  console.log("Listing chores from Google sheets");
  jQuery("#loading").show();
  var data = "";
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: config.SPREADSHEET_ID,
      range: config.CHORES_RANGE
    })
    .then(
      function(response) {
        var range = response.result;
        if (range.values.length > 0) {
          for (i = 0; i < range.values.length; i++) {
            var row = range.values[i];
            //console.log(row);
            data +=
              '<button id="' +
              row[0] +
              '" value="' +
              row[2] +
              '" class="chorebuttons" description="' +
              row[1] +
              '">' +
              row[3] +
              "<br/>" +
              row[0] +
              ": " +
              row[2] +
              "€</button>";
          }
        } else {
          data = "<p>No data found.</p>";
        }
        jQuery("#chores")
          .html(data)
          .enhanceWithin();
        jQuery("#loading").hide();
        jQuery("#chores").show();
      },
      function(response) {
        data = "<p>Error: " + response.result.error.message + "</p>";
        jQuery("#chores")
          .html(data)
          .enhanceWithin();
        jQuery("#loading").hide();
        jQuery("#chores").show();
      }
    );
}

function bookChore(choredetails) {
  // maailman rumin kiertotie monta kertaa laukeavalle insertille
  if (choredetails != null) {
    console.log("Booking a chore with values: " + choredetails);
    var params = {
      // The ID of the spreadsheet to update.
      spreadsheetId: config.SPREADSHEET_ID, // TODO: Update placeholder value.

      // The A1 notation of a range to search for a logical table of data.
      // Values will be appended after the last row of the table.
      range: config.BOOKINGS_RANGE, // TODO: Update placeholder value.

      // How the input data should be interpreted.
      valueInputOption: "USER_ENTERED", // TODO: Update placeholder value.

      // How the input data should be inserted.
      insertDataOption: "INSERT_ROWS" // TODO: Update placeholder value.
    };
    //console.log("params: " + params);

    var valueRangeBody = {
      // TODO: Add desired properties to the request body.
      values: [choredetails]
    };
    //console.log("valueRangeBody: " + valueRangeBody);
    //console.log('valueRangeBody: ' + valueRangeBody.values);

    var request = gapi.client.sheets.spreadsheets.values.append(
      params,
      valueRangeBody
    );
    request.then(
      function(response) {
        // TODO: Change code below to process the `response` object:
        console.log(response.result);
        jQuery("#confirmation").hide();
        jQuery(".chorebuttons").show();
        // notifikaatio ei vielä toimi nätisti
        $("#notification")
          .fadeIn(400, function() {
            $("#notification").addClass("ok");
            $("#notification").html("<h3>Viikkorahaa lisätty :)</h3>");
          })
          .delay(2000)
          .fadeOut(400, function() {
            $("#notification").removeClass("ok");
            $("#notification").text("");
          });
      },
      function(reason) {
        console.error("error: " + reason.result.error.message);
        $("#notification")
          .fadeIn(400, function() {
            $("#notification").addClass("error");
            $("#notification").html(
              "<h3>" + reason.result.error.message + "</h3>"
            );
          })
          .delay(2000)
          .fadeOut(400, function() {
            $("#notification").removeClass("error");
            $("#notification").text("");
          });
      }
    );
  }
}

function approveChore(bookingdetails) {
  // maailman rumin kiertotie monta kertaa laukeavalle insertille
  if (bookingdetails != null) {
    console.log("Approving a chore with values: " + bookingdetails);
    // First element is the id of the item clicked which is the row in sheet to be updated
    row = bookingdetails.shift();
    var params = {
      // The ID of the spreadsheet to update.
      spreadsheetId: config.SPREADSHEET_ID, // TODO: Update placeholder value.

      // The A1 notation of a range to search for a logical table of data.
      // Values will be appended after the last row of the table.
      range: "Bookings!G" + row + ":H", // TODO: Update placeholder value.

      // How the input data should be interpreted.
      valueInputOption: "USER_ENTERED" // TODO: Update placeholder value.
    };
    //console.log("params: " + params);

    var valueRangeBody = {
      // TODO: Add desired properties to the request body.
      values: [bookingdetails]
    };
    //console.log("valueRangeBody: " + valueRangeBody);
    //console.log('valueRangeBody: ' + valueRangeBody.values);

    var request = gapi.client.sheets.spreadsheets.values.update(
      params,
      valueRangeBody
    );
    request.then(
      function(response) {
        console.log(response.result);
        // Notification for success
        $("#notification")
          .fadeIn(400, function() {
            $("#notification").addClass("ok");
            $("#notification").html("<h3>Viikkorahatehtävä maksettu</h3>");
          })
          .delay(2000)
          .fadeOut(400, function() {
            $("#notification").removeClass("ok");
            $("#notification").text("");
          });
        // Update css class accordingly
        $("#" + row).removeClass("pending");
        $("#" + row).addClass("paid");
        getSummary();
      },
      function(reason) {
        console.error("error: " + reason.result.error.message);
        // Notification for error
        $("#notification")
          .fadeIn(400, function() {
            $("#notification").addClass("error");
            $("#notification").html(
              "<h3>" + reason.result.error.message + "</h3>"
            );
          })
          .delay(2000)
          .fadeOut(400, function() {
            $("#notification").removeClass("error");
            $("#notification").text("");
          });
      }
    );
  }
}

function getSummary() {
  console.log("Get chores summaries");
  var data = "";
  var sum = 0;
  //var labelsvalues = [];
  //var seriesvalues = [];
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: config.SPREADSHEET_ID,
      range: config.SUMS_RANGE
    })
    .then(
      function(response) {
        var range = response.result;
        if (range.values.length > 0) {
          /*for (i = 0; i < range.values.length; i++) {
				var row = range.values[i];
				console.log(row);
				data += '<div id="week' + row[0] + '" class="">Viikko ' + row[0] + ': ' + row[1] + '€</div>';
				sum = sum + parseInt(row[1]);
				labelsvalues.push(row[0]);
				seriesvalues.push(row[1]);
			}*/
          jQuery("#summarytext").html(
            "<h2>Viikkorahaa maksamatta " +
              range.values[0][1] +
              "€</h2><p>Viikkorahaa tienattu tähän mennessä " +
              range.values[1][1] +
              "€</p>"
          );
          //console.log("Total sum: " + sum + "€");
          console.log(data);
          //console.log(labelsvalues);
          //console.log(seriesvalues);
          //Graafitesti
          /*new Chartist.Line('#weeklygraph', {
				labels: labelsvalues,
				series: [seriesvalues]
			}, {
				showArea: true
			});*/
        } else {
          data = "<p>No data found.</p>";
        }
        //jQuery('#choreshistorylist').html(data);
      },
      function(reason) {
        data = "<p>Error: " + reason.result.error.message + "</p>";
        jQuery("#summarytext").html(data);
      }
    );
}

function listHistory() {
  console.log("Get chores history from sheets");
  var data = "";
  //var sum = 0;
  //var labelsvalues = [];
  //var seriesvalues = [];
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: config.SPREADSHEET_ID,
      range: "Bookings!A:G"
    })
    .then(
      function(response) {
        var range = response.result;
        console.log(range);
        //var graphvalues = JSON.stringify(range.values);
        //console.log(graphvalues);
        if (range.values.length > 0) {
          // First row has labels - Start iterating from second row
          for (i = 1; i < range.values.length; i++) {
            var row = range.values[i];
            //console.log(row);
            data =
              '<div id="' +
              (i + 1) +
              '" class="' +
              row[1] +
              " " +
              row[6] +
              ' summaryrows">' +
              new Date(row[0]).toLocaleDateString("fi") +
              " " +
              row[1] +
              ": " +
              row[3] +
              "€</div>" +
              data;
            //sum = sum + parseInt(row[3]);
            /*labelsvalues.push(row[0]);
				seriesvalues.push(row[3]);*/
          }
          //data = '<div id="summary"></div>' + data;
          //jQuery('#summarytext').html('<h1>Viikkorahaa tulossa ' + sum + '€</h1>');
          //console.log("Total sum: " + sum + "€");
          // Graafitesti - ei näyttänyt hyvältä
          /*new Chartist.Line('#fullhistorygraph', {
				//labels: labelsvalues,
				series: [seriesvalues]
			});*/
        } else {
          data = "<p>No data found.</p>";
        }

        jQuery("#choreshistorylist").html(data);
      },
      function(reason) {
        data = "<p>Error: " + reason.result.error.message + "</p>";
        jQuery("#choreshistorylist").html(data);
      }
    );
}
