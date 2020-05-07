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
const fetch = require("node-fetch");
// echo redis errors to the console
client.on("error", (err) => {
  console.log("Error " + err);
});

//logging, todo: write to json file
app.use((req, res, next) => {
  //console.log("%O", req);
  next();
});

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  corsOptions = { origin: true };
  callback(null, corsOptions); // callback expects two parameters: error and options
};

const lightsaleConnection = mysql.createConnection({
  host: process.env.lightsaledbhost,
  user: process.env.lightsaledbuser,
  password: process.env.lightsaledbpassword,
  database: process.env.lightsaledbdatabase,
  port: process.env.lightsaledbport,
});
var sqlqueries = {
  cityvenues: sqlqry.cityvenues(),
  stubhubEvents: sqlqry.stubhubEvents(),
  ticketmasterEvents: sqlqry.ticketmasterEvents(),
  events: sqlqry.events(),
  venueAddress: sqlqry.venueAddress(),
  eventlist: sqlqry.eventlist(),
};
var redisKeys = {
  cityvenues: "cityvenues",
  stubhubEvents: "stubhubEvents",
  ticketmasterEvents: "ticketmasterEvents",
  events: "events",
  venueAddress: "venueAddress",
  eventlist: "eventlist",
};

var sqlresults = {
  cityvenues: null,
  stubhubEvents: null,
  ticketmasterEvents: null,
  events: null,
  venueAddress: null,
  eventlist: null,
};
//check connection
// lightsaleConnection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   lightsaleConnection.end();
// });
//client.DEL("cityvenues");
getQueryResultAsync = async function (sqlstr) {
  return new Promise(function (resolve, reject) {
    console.log("getQueryResultAsync called");
    lightsaleConnection.query(sqlstr, function (err, rows) {
      if (rows === undefined) {
        // console.log(sqlstr);
        reject(new Error("Error rows is undefined" + err));
        console.log(err);
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
respondQryResultAsync = async function (req, res, func, reqParams) {
  // console.log(func);
  getQueryResultAsync(func(reqParams))
    .then(function (results) {
      // console.log(func(reqParams));
      res.send(results);
    })
    .catch(function (err) {
      console.log("Promise rejection error: " + err);
      res.send("oops");
    });
};

//2 objects with matching keys, this way we can set globals somewhat dynamically as we get back results
//here we load values with

const getSqlResult = (keyParam) => {
  if (sqlresults[keyParam] == null) {
    sqlresults[keyParam] = getQueryResultAsync(sqlqueries[keyParam]);
    return getQueryResultAsync(sqlqueries[keyParam]);
  } else {
    return sqlresults[keyParam];
  }
};

async function checkRedisStore() {
  Object.entries(redisKeys).map((x) => {
    let keyname = x["0"];

    client.get(keyname, (err, data) => {
      if (data) {
        console.log("found redis key --- " + keyname);
        return data;
        //Redis does not have this cached yet
      } else {
        console.log("getting result from sql for --- " + keyname);
        let sqlqrystr = sqlqueries[keyname];
        getQueryResultAsync(sqlqrystr).then((results) => {
          //set the redis key to that value and the sqlresults key to said value
          let result = JSON.stringify(results);
          client.set(keyname, result);
          sqlresults[keyname] = result;
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
}

//dynamically get port environment variable (set outside of application)
const port = process.env.PORT || 3000; //def to 3000 if envVar not set
//const port = 3000;
app.listen(port, async () => {
  console.log(`listening on port ${port} testing ${""}`);
  await checkRedisStore();
  client.keys("*", function (err, keys) {
    if (err) return console.log(err);
    for (var i = 0, len = keys.length; i < len; i++) {
      console.log("available reid key ---- " + keys[i]);
    }
    console.log();
  });
});

async function requestUrlAsync(
  url,
  resp,
  headers = {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  }
) {
  return new Promise(async (resolve, reject) => {
    await fetch(url, { headers: { headers } })
      .then(async (response) => {
        const rjson = await response.json();
        resp.send(rjson);
        console.log(rjson);
        // return resp;
      })
      .catch((err) => console.log("Asdfasfas" + err));
    //  return [url.varname, resolve(req)];
  });
}

app.get(
  "/api/ticketmasterApi/venues/:venueId",
  cors(corsOptionsDelegate),
  async (req, res) => {
    console.log("hit ticketmasterApi");
    const urlstr = `https://app.ticketmaster.com/discovery/v2/venues/${req.params.venueId}?apikey=${process.env.ticketmasterapikey}&locale=*`;
    requestUrlAsync(urlstr, res);
  }
);

const requestStubhubVenue = (res, id) => {
  const urlstr = `https://api.stubhub.com/partners/search/venues/v3/?id=${id}`;
  // const data = { id: { id }, rows: 500, country: countryNameStr };
  const headers = {
    Authorization: "Bearer " + process.env.subhubapikey,
    Accept: "application/json",
    "Accept-Encoding": "application/json",
  };

  console.log("hit ticketmasterApi");
  // const urlstr = `https://app.ticketmaster.com/discovery/v2/events/${req.params.eventId}/images?apikey=${process.env.ticketmasterapikey}&locale=*`;
  requestUrlAsync(urlstr, res, headers);
};

app.get(
  "/api/stubhubVenueApi/venues/:venueId",
  //def getStateData(stateCodeStr, countryNameStr, appToken):
  cors(corsOptionsDelegate),
  async (req, res) => {
    requestStubhubVenue(res, req.params.venueId);
    // console.log("hit ticketmasterApi");
    // const urlstr = `https://app.ticketmaster.com/discovery/v2/events/${req.params.eventId}/images?apikey=${process.env.ticketmasterapikey}&locale=*`;
    // requestUrlAsync(urlstr, res);
  }
);

app.get(
  "/api/ticketmasterApi/eventImages/:eventId",
  cors(corsOptionsDelegate),
  async (req, res) => {
    console.log("hit ticketmasterApi");
    const urlstr = `https://app.ticketmaster.com/discovery/v2/events/${req.params.eventId}/images?apikey=${process.env.ticketmasterapikey}&locale=*`;
    requestUrlAsync(urlstr, res);
  }
);

app.get("/api/cityVenues/", cors(corsOptionsDelegate), async (req, res) => {
  getRedisAsync("cityvenues")
    .then((x) => res.send(x))
    .catch(() => {
      // console.error;
      res.send(sqlresults["cityvenues"]);

      // async (req, res) => {
      //   console.log(sqlresults["cityVenues"]);
      //   res.send(sqlresults["cityVenues"]);
    });
});
const parseJsonAsync = (jsonString) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      //  console.log(jsonString);
      resolve(JSON.parse(jsonString));
    });
  });
};

const parseRedisAsync = (redisKey) => {
  return new Promise((resolve) => {
    getRedisAsync(redisKey).then(async (x) => {
      parseJsonAsync(x).then((jsonData) => {
        return resolve(jsonData);
      });
      //console.log(JSON.parse(x));
      // res.send(JSON.parse(x));
    });
  });
};

app.get("/api/eventlist/", cors(corsOptionsDelegate), async (req, res) => {
  console.log("eventlist hit");
  getRedisAsync("events")
    .then(async (jsonData) => {
      res.send(jsonData);
    })
    .catch(() => {
      console.error;
    });
});

app.get(
  "/api/cityVenues/:eventDate",
  cors(corsOptionsDelegate),
  async (req, res) => {
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
      req.params.venueName,
    ]);
    res.send(filteredData);
    // respondQryResultAsync(req, res, sqlqry.venueAddress, req.params.venueName);
  }
);

app.get("/api/events/", cors(corsOptionsDelegate), async (req, res) => {
  getRedisAsync("events")
    .then((x) => {
      res.send(JSON.parse(x));
    })
    .catch(() => {
      console.error;
    });
});
app.get(
  "/api/events/:venueName",
  cors(corsOptionsDelegate),
  async (req, res) => {
    console.log("hit events with param");
    getRedisAsync("events")
      .then((x) => {
        //  console.log(x);
        //let a = alasql("select * from ? Venue = ?", [x, req.params.venueName]);
        let a = alasql("select * from ? where Venue = ?", [
          JSON.parse(x),
          req.params.venueName,
        ]);
        // console.log(a);
        res.send(a);
      })
      .catch(() => {
        console.error;
      });
  }
);

// app.get(
//   "/api/events/:venueName",
//   cors(corsOptionsDelegate),
//   async (req, res) => {
//     let data = JSON.parse([sqlresults["events"]]);
//     var filteredData = alasql("select * from ? where Venue=?", [
//       data,
//       req.params.venueName
//     ]);
//     res.send(filteredData);
//   }
// );

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
  console.log("hit");
  // console.log(getRedisAsync("tblstubhubcity"));
  getRedisAsync("tblstubhubcity")
    .then((x) => res.send(x))
    .catch(console.error);
});

app.get(
  "/api/tblstubhubvenue/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblstubhubvenue")
      .then((x) => {
        res.send(x);
      })
      .catch(console.error);
  }
);

app.get(
  "/api/tblnewstubhubvenueevent/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblnewstubhubvenueevent")
      .then((x) => res.send(x))
      .catch(console.error);
  }
);

app.get(
  "/api/tblticketmastervenue/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblticketmastervenue")
      .then((x) => res.send(x))
      .catch(console.error);
  }
);

app.get(
  "/api/tblnewticketmastervenueevent/",
  cors(corsOptionsDelegate),
  async (req, res) => {
    getRedisAsync("tblnewticketmastervenueevent")
      .then((x) => res.send(x))
      .catch(console.error);
  }
);
