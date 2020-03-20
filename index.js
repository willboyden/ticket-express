const express = require("express");
const app = express();
const mysql = require("mysql");
const fetch = require("node-fetch");
//const sqlqry = require("mysql-mavents");
const sqlqry = require("./mysql-mavents");
const cors = require("cors");
var compression = require("compression");
//allows for environment variables to be set in .env file
require("dotenv").config();

cors("no cors");
app.use(compression());

app.use(express.static("./build"));

const redis = require("redis");
// create and connect redis client to local instance.
const client = redis.createClient(6379);

// echo redis errors to the console
client.on("error", err => {
  console.log("Error " + err);
});
//console.log(client)
var whitelist = [
  "https://localhost:44305",
  "https://localhost:44301",
  "https://localhost:44350",
  "https://localhost:4435",
  "https://localhost:44350:",
  "http://localhost:4000;",
  "http://localhost:3000;"
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

const lightsaleConnection = mysql.createConnection({
  host: process.env.lightsaledbhost,
  user: process.env.lightsaledbuser,
  password: process.env.lightsaledbpassword,
  database: process.env.lightsaledbdatabase,
  port: 3306
});

//check connection
// lightsaleConnection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   lightsaleConnection.end();
// });

//dynamically get port environment variable (set outside of application)
//const port = process.env.PORT || 3000; //def to 3000 if envVar not set
const port = 3000;
//app.listen(port, () => console.log(`listening on port ${port}`));
app.listen(port, () => console.log(`listening on port ${port} testing ${""}`));
//console.log(process.env.lightsaledbhost);
//function for getting generic Query, can be used with regular string as param
getQueryResultAsync = async function(sqlstr) {
  return new Promise(function(resolve, reject) {
    lightsaleConnection.query(sqlstr, function(err, rows) {
      if (rows === undefined) {
        console.log(sqlstr);
        reject(new Error("Error rows is undefined" + err));
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

app.get("/api/cityVenues/redis", cors(corsOptionsDelegate), (req, res) => {
  // key to store results in Redis store
  console.log("hit");
  const cityVenuesRedisKey = "user:cityVenues";

  // Try fetching the result from Redis first in case we have it cached
  return client.get(cityVenuesRedisKey, (err, cityVenues) => {
    // If that key exists in Redis store
    if (cityVenues) {
      console.log("success");
      return res.json(JSON.parse(cityVenues));
    } else {
      // Key does not exist in Redis store

      // Fetch directly from remote api
      fetch("http://52.2.126.232/api/cityVenues/")
        .then(response => response.json())
        .then(cityVenues => {
          // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
          client.setex(cityVenuesRedisKey, 3600, JSON.stringify(cityVenues));

          console.log("saved to redis?");
          // Send JSON response to client
          return res.json(cityVenues);
        })
        .catch(error => {
          // log error message
          console.log(error);
          // send error to the client
          return res.json(error.toString());
        });
    }
  });
});

//run at domain
app.get("/api/", cors(corsOptionsDelegate), async (req, res) => {
  // console.log(sqlqry.GetSpecificTicketmasterVenueSummary);
  res.send("Welcome to the Node.js maVents api");
});

app.get(
  "/api/stubhubEvents/redis",
  cors(corsOptionsDelegate),
  async (req, res) => {
    const dataKey = "user:stubhubEvents";
    return client.get(dataKey, (err, data) => {
      // If that key exists in Redis store
      if (data) {
        return res.json(JSON.parse(data));
      } else {
        fetch("http://52.2.126.232/api/stubhubEvents/")
          .then(response => response.json())
          .then(data => {
            // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
            client.setex(dataKey, 3600, JSON.stringify(data));
            console.log("saved to redis?");
            // Send JSON response to client
            return res.json(data);
          })
          .catch(error => {
            return res.json(error.toString());
          });
      }
    });
    respondQryResultAsync(req, res, sqlqry.stubhubEvents);
  }
);
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
  "/api/cityVenues/:eventDate",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.cityVenues, req.params.eventDate);
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

app.get("/api/events/", cors(corsOptionsDelegate), async (req, res) => {
  respondQryResultAsync(req, res, sqlqry.events);
});
app.get(
  "/api/events/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.events, req.params.venueName);
  }
);

app.get(
  "/api/venueEvents/:venueName/:dataSource",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.venueEvents, req.params);
  }
);
