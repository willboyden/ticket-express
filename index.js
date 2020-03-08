const express = require("express");
const app = express();
const mysql = require("mysql");
//const sqlqry = require("mysql-mavents");
const sqlqry = require("./mysql-mavents");
const cors = require("cors");
//allows for environment variables to be set in .env file
require("dotenv").config();

cors("no cors");

app.use(express.static("./wwwroot"));

var whitelist = [
  "https://localhost:44305",
  "https://localhost:44301",
  "https://localhost:44350",
  "https://localhost:4435",
  "https://localhost:44350:",
  "http://localhost:4000;"
];
var corsOptionsDelegate = function(req, callback) {
  var corsOptions;
  // if (whitelist.indexOf(req.header("Origin")) !== -1) {
  //   corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  // } else {
  //   corsOptions = { origin: false }; // disable CORS for this request
  // }
  corsOptions = { origin: true };
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
        //      console.log(err);
        // res.send("sorry had trouble finding that");
      } else {
        resolve(rows);
      }
    });
  });
};

//function for http response with the result of query
respondQryResultAsync = async function(req, res, func, reqParams) {
  // console.log(func);
  getQueryResultAsync(func(reqParams))
    .then(function(results) {
      //    console.log(func(reqParams));
      res.send(results);
    })
    .catch(function(err) {
      console.log("Promise rejection error: " + err);

      //     console.log(results);
      res.send("oops");
    });
};

//run at domain
app.get("/api/", cors(corsOptionsDelegate), async (req, res) => {
  // console.log(sqlqry.GetSpecificTicketmasterVenueSummary);
  res.send("Welcome to the Node.js maVents api");
});

app.get("/api/stubhubEvents/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResultAsync(req, res, sqlqry.stubhubEvents);
});
app.get(
  "/api/stubhubEvents/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.stubhubEvents, req.params.venueName);
  }
);

app.get(
  "/api/ticketmasterEvents/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.ticketmasterEvents);
  }
);
app.get(
  "/api/ticketmasterEvents/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(
      req,
      res,
      sqlqry.ticketmasterEvents,
      req.params.venueName
    );
  }
);

app.get("/api/cityVenues/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResultAsync(req, res, sqlqry.cityVenues);
});
//for now this is the same as if you give it a parameter
app.get(
  "/api/cityVenues/:includeNulls",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.cityVenues, req.params.includeNulls);
  }
);

//works
app.get("/api/venueAddress/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResultAsync(req, res, sqlqry.venueAddress);
});
app.get(
  "/api/venueAddress/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.venueAddress, req.params.venueName);
  }
);

app.get(
  "/api/venueEvents/:venueName/:dataSource",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.venueEvents, req.params);
  }
);
