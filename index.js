const express = require("express");
const app = express();
const mysql = require("mysql");
const fetch = require("node-fetch");
const alasql = require("alasql");
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

getQueryResultAsync = async function(sqlstr) {
  return new Promise(function(resolve, reject) {
    console.log("getQueryResultAsync called");
    lightsaleConnection.query(sqlstr, function(err, rows) {
      if (rows === undefined) {
        console.log(sqlstr);
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
console.log(sqlqry.cityVenues.toString());
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

async function createRedisStore() {
  console.log("creating Redis Store");
  getQueryResultAsync(sqlqry.stubhubEvents()).then(results => {
    client.setex("stubhubEvents", 3600, JSON.stringify(results));
    console.log("2");
  });
  getQueryResultAsync(sqlqry.ticketmasterEvents()).then(results => {
    client.setex("ticketmasterEvents", 3600, JSON.stringify(results));
    console.log("3");
  });
  getQueryResultAsync(sqlqry.events()).then(results => {
    client.setex("events", 3600, JSON.stringify(results));
    console.log("4");
  });

  getQueryResultAsync(sqlqry.venueAddress()).then(results => {
    client.setex("venueAddress", 3600, JSON.stringify(results));
    console.log("5");
  });

  getQueryResultAsync(sqlqry.venueEvents()).then(results => {
    client.setex("venueEvents", 3600, JSON.stringify(results));
    console.log("6");
  });

  // return x;
}
// var events = "";
// var stubhubEvents = "";
// var ticketmasterEvents = "";
// var events = "";
// var venueAddress = "";

//var venueEvents = "";

//2 objects with matching keys, this way we can set globals somewhat dynamically as we get back results
//here we load values with
var sqlqueries = {
  cityVenues: sqlqry.cityVenues(),
  stubhubEvents: sqlqry.stubhubEvents(),
  ticketmasterEvents: sqlqry.ticketmasterEvents(),
  events: sqlqry.events(),
  venueAddress: sqlqry.venueAddress()
};

//initialize this to the sql values so we dont error out if Redis has not been set
// var sqlresults = {
//   cityVenues: getQueryResultAsync(sqlqry.cityVenues()).then(results => {
//     return results;
//   }),
//   stubhubEvents: getQueryResultAsync(sqlqry.stubhubEvents()).then(results => {
//     return results;
//   }),
//   ticketmasterEvents: getQueryResultAsync(sqlqry.ticketmasterEvents()).then(
//     results => {
//       return results;
//     }
//   ),
//   events: getQueryResultAsync(sqlqry.events()).then(results => {
//     return results;
//   }),
//   venueAddress: getQueryResultAsync(sqlqry.venueAddress()).then(results => {
//     return results;
//   })
// };
var sqlresults = {
  cityVenues: null,
  stubhubEvents: null,
  ticketmasterEvents: null,
  events: null,
  venueAddress: null
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

var tt = "heeeee";
//dynamically get port environment variable (set outside of application)
//const port = process.env.PORT || 3000; //def to 3000 if envVar not set
const port = 3000;
app.listen(port, async () => {
  console.log(`listening on port ${port} testing ${""}`);
  useRedisStore();
});

app.get("/api/cityVenues/", cors(corsOptionsDelegate), async (req, res) => {
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

//run at domain
app.get("/api/", cors(corsOptionsDelegate), async (req, res) => {
  // console.log(sqlqry.GetSpecificTicketmasterVenueSummary);
  res.send("Welcome to the Node.js maVents api");
});

app.get("/api/stubhubEvents/", cors(corsOptionsDelegate), async (req, res) => {
  //respondQryResultAsync(req, res, sqlqry.stubhubEvents);
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
    // respondQryResultAsync(req, res, sqlqry.ticketmasterEvents);
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
    var filteredData = alasql("select * from ? where name =?", [
      data,
      req.params.venueName
    ]);
    res.send(filteredData);
    // respondQryResultAsync(req, res, sqlqry.venueAddress, req.params.venueName);
  }
);

app.get("/api/events/", cors(corsOptionsDelegate), async (req, res) => {
  res.send(sqlresults["venueAddress"]);
  //respondQryResultAsync(req, res, sqlqry.events);
});
app.get(
  "/api/events/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    let data = JSON.parse([sqlresults["events"]]);
    var filteredData = alasql("select * from ? where Event = ?", [
      data,
      req.params.venueName
    ]);
    res.send(filteredData);
    //respondQryResultAsync(req, res, sqlqry.events, req.params.venueName);
  }
);

app.get(
  "/api/venueEvents/:venueName/:dataSource",
  cors(corsOptionsDelegate),
  async (req, res) => {
    respondQryResultAsync(req, res, sqlqry.venueEvents, req.params);
  }
);
