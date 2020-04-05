import React, { useState, useContext, createContext, useEffect } from "react";
import { compareByFieldSpec } from "@fullcalendar/core";
//var urls = ["http://localhost:3000/api/cityVenues/"];

var urls = [
  {
    urlpath: process.env.domain + "/api/tblstubhubvenue/",
    varname: "tblstubhubvenue"
  },
  {
    urlpath: process.env.domain + "/api/tblnewticketmastervenueevent/",
    varname: "tblnewticketmastervenueevent"
  },
  {
    urlpath: process.env.domain + "/api/tblstubhubcity/",
    varname: "tblstubhubcity"
  },
  {
    urlpath: process.env.domain + "/api/tblticketmastervenue/",
    varname: "tblticketmastervenue"
  },
  {
    urlpath: process.env.domain + "/api/tblnewstubhubvenueevent/",
    varname: "tblnewstubhubvenueevent"
  }
];

// const requestAsync = function(url) {
//   return new Promise((resolve, reject) => {
//     console.log(url.urlpath);
//     var req = fetch(url.urlpath);
//     return resolve(req);
//   });
// };
const requestAsync = async function(url) {
  const varname = url.varname;
  const urlpath = url.urlpath;
  //  console.log(urlpath);
  return new Promise(async (resolve, reject) => {
    await fetch(urlpath)
      .then(async response => {
        const resp = await response;
        resp
          ? resolve({ key: { varname }, value: await resp.json() })
              .then(async result => {
                return await result;
                // return [(url.varname, result)];
              })
              .catch(err => console.log("Asdf"))
          : reject;
      })
      .catch(err => console.log("Asdfasfas" + err));
    //  return [url.varname, resolve(req)];
  });
};

export default async function StoreFetchDataParallelResults() {
  return fetchDataParallel(urls);
}
export async function fetchDataParallel(urls) {
  console.log("gettting data");
  try {
    var data = await Promise.all(urls.map(x => requestAsync(x))).then(x => {
      var d = {};
      x.map(async a => {
        // console.log(x[0]);
        const itm = await a;
        d[itm.key.varname] = itm.value;
      });
      return d;
    });
  } catch (err) {
    console.error("getParallel returned no data  ---------" + err);
  }
  return data;
}

async function useFetchWithParameters(params = "") {
  //const query = "";
  return await useFetch(params, {});
}

function getKeys(result) {
  if (result !== {} && result.length > 1) {
    return Object.keys(result[0]);
  } else {
    return [];
  }
}
function getHeader(objKeys) {
  if (objKeys !== {} && objKeys.length > 1) {
    return objKeys.map(x => <th key={"th" + x}>{x}</th>);
  }
}
const RenderRow = props => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key]}>{props.data[key]}</td>;
  });
};
function getRowsData(data, keys) {
  if (keys !== {} && keys.length > 1) {
    return data.map((row, index) => {
      return (
        <tr key={index}>
          <RenderRow key={index} data={row} keys={keys} />
        </tr>
      );
    });
  }
}

export function Example() {
  const [params, setParams] = useState("");
  const result = useFetchWithParameters(params);
  //var header = ;
  //getKeys(result);
  //console.log(["result", result[0].keys()]);

  const objKeys = getKeys(result);

  const header = getHeader(objKeys);

  const rows = getRowsData(result, objKeys);

  return (
    <div>
      <table>
        <thead>{header}</thead>
        <tbody>{rows}</tbody>
      </table>

      <input
        type="input"
        value={params}
        onChange={evt => setParams(evt.target.value)}
      />
      {/* {JSON.stringify(result)} */}
    </div>
  );
}

export function AsHtml(props) {
  //var header = ;
  //getKeys(result);
  console.log(["dtAsHtml", props]);

  const objKeys = getKeys(props.data);

  const header = getHeader(objKeys);

  const rows = getRowsData(props.data, objKeys);

  return (
    <div>
      <table>
        <thead>{header}</thead>
        <tbody>{rows}</tbody>
      </table>

      {/* <input
        type="input"
        value={props}
        onChange={evt => setParams(evt.target.value)}
      /> */}
    </div>
  );
}
