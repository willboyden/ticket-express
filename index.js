const express = require("express");
const app = express();
const mysql = require("mysql");
const sqlqry = require("mysql-mavents");
const cors = require("cors");
//allows for environment variables to be set in .env file
require("dotenv").config();

var whitelist = [
  "https://localhost:44305",
  "https://localhost:44301",
  "https://localhost:44350",
  "*",
  "https://localhost:"
];
var corsOptionsDelegate = function(req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "express",
  password:
    "FromthefoolsgoldmouthpieceThehollowhornplaysWastedwordsprovedtowarn",
  database: "mavents"
});

//dynamically get port environment variable (set outside of application)
const port = process.env.PORT || 3000; //def to 3000 if envVar not set

//app.listen(port, () => console.log(`listening on port ${port}`));
app.listen(port, () => console.log(`listening on port ${port} testing ${""}`));

//function for getting generic Query, can be used with regular string as param
getQueryResultAsync = async function(sqlstr) {
  return new Promise(function(resolve, reject) {
    connection.query(sqlstr, function(err, rows) {
      if (rows === undefined) {
        console.log(sqlstr);
        reject(new Error("Error rows is undefined"));
        console.log(err);
        res.send("sorry had trouble finding that");
      } else {
        resolve(rows);
      }
    });
  });
};

//function for http response with the result of query
respondQryResAsync = async function(req, res, func, reqParams) {
  getQueryResultAsync(func(reqParams))
    .then(function(results) {
      console.log(func(reqParams));
      res.send(results);
    })
    .catch(function(err) {
      console.log("Promise rejection error: " + err);
      console.log(results);
      res.send("oops");
    });
};

//run at domain
app.get("/api/", cors(corsOptionsDelegate), async (req, res) => {
  res.send("Welcome to the Node.js maVents api");
});

//Http Get Methods, should follow this options param pattern
app.get("/api/genreSummary/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResAsync(req, res, sqlqry.getTicketMasterEventsByGenre);
});
app.get(
  "/api/genreSummary/:genre",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.getTicketMasterEventsByGenre,
      req.params.genre
    );
  }
);
app.get("/api/venueSummary/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResAsync(req, res, sqlqry.getVenueSummary);
});
app.get(
  "/api/venueSummary/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.getVenueSummary, req.params.venueName);
  }
);

app.get(
  "/api/GetSpecificStubhubVenueSummary/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.GetSpecificStubhubVenueSummary);
  }
);
app.get(
  "/api/GetSpecificStubhubVenueSummary/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.GetSpecificStubhubVenueSummary,
      req.params.venueName
    );
  }
);

app.get(
  "/api/GetSpecificTicketmasterVenueEventSummary/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.GetSpecificTicketmasterVenueEventSummary
    );
  }
);
app.get(
  "/api/GetSpecificTicketmasterVenueEventSummary/:venueName",
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.GetSpecificTicketmasterVenueEventSummary,
      req.params.venueName
    );
  }
);

app.get("/api/GetCityVenues/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResAsync(req, res, sqlqry.GetCityVenues);
});
//for now this is the same as if you give it a parameter
app.get(
  "/api/GetCityVenues/:includeNulls",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.GetCityVenues, req.params.includeNulls);
  }
);

app.get(
  "/api/GetSpecificStubhubVenueSummary/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.GetSpecificStubhubVenueSummary);
  }
);
//for now this is the same as if you give it a parameter
app.get(
  "/api/GetSpecificStubhubVenueSummary/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.GetSpecificStubhubVenueSummary,
      req.params.venueName
    );
  }
);

app.get(
  "/api/GetSpecificVenueSummary/:venueName/:dataSource",
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.GetSpecificVenueSummary, req.params);
  }
);
app.get(
  "/api/GetSpecificVenue/:venueName/:dataSource",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(req, res, sqlqry.GetSpecificVenue, req.params);
  }
);

app.get(
  "/api/selectedStubhubVenueEvent/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.selectedStubhubVenueEvent,
      req.params.venueName
    );
  }
);
app.get(
  "/api/GetSpecificVenue/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResAsync(
      req,
      res,
      sqlqry.GetSpecificVenueSummary,
      req.params.venueName
    );
  }
);
