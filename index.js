const express = require("express");
const app = express();
const mysql = require("mysql");
const alasql = require("alasql");
//const sqlqry = require("mysql-mavents");
const sqlqry = require("./mysql-mavents");

const cors = require("cors");
var compression = require("compression");
//allows for environment variables to be set in .env file
require("dotenv").config();
const { promisify } = require("util");

cors("no cors");
app.use(compression());

app.use(express.static("./build"));

const redis = require("redis");

// create and connect redis client to local instance.
const client = redis.createClient(process.env.redisport, process.env.redisip);
const getRedisAsync = promisify(client.get).bind(client);

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
  port: process.env.lightsaledbport
});

//check connection
// lightsaleConnection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   lightsaleConnection.end();
// });

getQueryResultAsync = async function(sqlstr) {
  return new Promise(function(resolve, reject) {
    console.log("getQueryResultAsync called");
    lightsaleConnection.query(sqlstr, function(err, rows) {
      if (rows === undefined) {
        // console.log(sqlstr);
        reject(new Error("Error rows is undefined" + err));
        //      console.log(err);
        // res.send("sorry had trouble finding that");
      } else {
        console.log("hit getQueryResultAsync else statement");
        // console.log(resolve(rows));
        resolve(rows);
      }
    });
  });
};
//console.log(sqlqry.cityVenues.toString());
//function for http response with the result of query
respondQryResultAsync = async function(req, res, func, reqParams) {
  // console.log(func);
  getQueryResultAsync(func(reqParams))
    .then(function(results) {
      // console.log(func(reqParams));
      res.send(results);
    })
    .catch(function(err) {
      console.log("Promise rejection error: " + err);
      res.send("oops");
    });
};

//2 objects with matching keys, this way we can set globals somewhat dynamically as we get back results
//here we load values with
var sqlqueries = {
  cityVenues: sqlqry.cityVenues(),
  stubhubEvents: sqlqry.stubhubEvents(),
  ticketmasterEvents: sqlqry.ticketmasterEvents(),
  events: sqlqry.events(),
  venueAddress: sqlqry.venueAddress()
};

var sqlresults = {
  cityVenues: null,
  stubhubEvents: null,
  ticketmasterEvents: null,
  events: null,
  venueAddress: null
};
const getSqlResult = keyParam => {
  if (sqlresults[keyParam] == null) {
    sqlresults[keyParam] = getQueryResultAsync(sqlqueries[keyParam]);
    return getQueryResultAsync(sqlqueries[keyParam]);
  } else {
    return sqlresults[keyParam];
  }
};

async function useRedisStore() {
  console.log("using Redis Store");
  Object.entries(sqlqueries).map(x => {
    client.get(x["0"], (err, data) => {
      //  console.log(data);
      if (data) {
        console.log("found Redis data key for " + x["0"]);
        sqlresults[x["0"]] = data;
        //return data;
        //Redis does not have this cached yet
      } else {
        console.log("getting result from sql");
        getQueryResultAsync(x["1"]).then(results => {
          //set the redis key to that value and the sqlresults key to said value
          client.setex(x["0"], 3600, JSON.stringify(results));
          sqlresults[x["0"]] = data;
          if (data) {
          }
          // client.get(x["0"]),
          //   (err, data) => {
          //     //  console.log(data);
          //     if (data) {
          //       return data;
          //     }
          //   };
          console.log("ssql result cahed to redis");
        });
      }
    });
  });
  return sqlresults;
}

//dynamically get port environment variable (set outside of application)
//const port = process.env.PORT || 3000; //def to 3000 if envVar not set
const port = 3000;
app.listen(port, async () => {
  console.log(`listening on port ${port} testing ${""}`);
  await useRedisStore();
});

app.get("/api/cityVenues/", cors(corsOptionsDelegate), async (req, res) => {
  console.log(sqlresults["cityVenues"]);
  res.send(sqlresults["cityVenues"]);
});
//for now this is the same as if you give it a parameter
app.get(
  "/api/cityVenues/:eventDate",
  cors(corsOptionsDelegate),
  async (req, res) => {
    alasql;
    respondQryResultAsync(req, res, sqlqry.cityVenues, req.params.eventDate);
  }
);

app.get("/api/", cors(corsOptionsDelegate), async (req, res) => {
  res.send("Welcome to the Node.js maVents api");
});

app.get("/api/stubhubEvents/", cors(corsOptionsDelegate), async (req, res) => {
  res.send(sqlresults["stubhubEvents"]);
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
    res.send(sqlresults["stubhubEvents"]);
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
//#region
//works
app.get("/api/venueAddress/", cors(corsOptionsDelegate), async (req, res) => {
  // respondQryResultAsync(req, res, sqlqry.venueAddress);
  res.send(sqlresults["venueAddress"]);
});
//use alasql to do an in memory query of our Redis Data
app.get(
  "/api/venueAddress/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    let data = JSON.parse([sqlresults["venueAddress"]]);
    var filteredData = alasql("select * from ? where Venue =?", [
      data,
      req.params.venueName
    ]);
    res.send(filteredData);
    // respondQryResultAsync(req, res, sqlqry.venueAddress, req.params.venueName);
  }
);

app.get("/api/events/", cors(corsOptionsDelegate), async (req, res) => {
  res.send(getSqlResult("events"));
});
app.get(
  "/api/events/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    let data = JSON.parse([sqlresults["events"]]);
    var filteredData = alasql("select * from ? where Venue=?", [
      data,
      req.params.venueName
    ]);
    res.send(filteredData);
  }
);

app.get(
  "/api/venueEvents/:venueName/:dataSource",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.venueEvents, req.params);
  }
);
//#endregion

//Redis Endpoints
app.get("/api/tblstubhubcity/", cors(corsOptionsDelegate), async (req, res) => {
  getRedisAsync("tblstubhubcity")
    .then(x => res.send(x))
    .catch(console.error);
});

app.get(
  "/api/tblstubhubvenue/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblstubhubvenue")
      .then(x => res.send(x))
      .catch(console.error);
  }
);

app.get(
  "/api/tblnewstubhubvenueevent/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblnewstubhubvenueevent")
      .then(x => res.send(x))
      .catch(console.error);
  }
);

app.get(
  "/api/tblticketmastervenue/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblticketmastervenue")
      .then(x => res.send(x))
      .catch(console.error);
  }
);

app.get(
  "/api/tblnewticketmastervenueevent/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblnewticketmastervenueevent")
      .then(x => res.send(x))
      .catch(console.error);
  }
);
