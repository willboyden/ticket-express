import React, { useState, useEffect } from "react";
require("dotenv").config();

function useFetch(url, defaultData) {
  const [data, updateData] = useState(defaultData);
  //console.log(data);
  useEffect(() => {
    async function fetchData() {
      if (!url) {
        updateData(defaultData);
        return;
      }
      try {
        const resp = await fetch(url); // Fetch the resource
        const text = await resp.text(); // Parse it as text
        const data = JSON.parse(text); // Try to parse it as json
        updateData(data);
        // Do your JSON handling here
      } catch (err) {
        const resp = await fetch(url);
        const text = await resp.text();
        console.log("error in useFetch -> useEffect" + text);

        // This probably means your response is text, do you text handling here
      }
    }
    fetchData();
  }, [url]);

  return data;
}

function getKeys(result) {
  if (result != {} && result.length > 1) {
    return Object.keys(result[0]);
  } else {
    return [];
  }
}
function getHeader(objKeys) {
  if (objKeys != {} && objKeys.length > 1) {
    return (
      <tr>
        {objKeys.map(x => {
          // console.log(x);
          return <th key={x}>{x}</th>;
        })}
      </tr>
    );
  }
}

const RenderRow = props => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key] + index.toString()}>{props.data[key]}</td>;
  });
};
function getRowsData(data, keys) {
  if (keys != {} && keys.length > 1) {
    return data.map((row, index) => {
      return (
        <tr key={index}>
          <RenderRow key={index} data={row} keys={keys} />
        </tr>
      );
    });
  }
}

//example of url to pass in"/api/cityvenues/"
//this function should recieve either a url param or data NOT BOTH
export default function HtmlTable(props) {
  const [result, setResult] = useState({});

  const getResult = () => {
    if (typeof props.url != "undefined") {
      return useFetch(process.env.domain + props.url, {});
    } else if (typeof props.data != "undefined") {
      return props.data;
    }
  };

  useEffect(() => {
    setResult(getResult());
  });

  // console.log(["result", result]);

  const objKeys = getKeys(result);
  const header = getHeader(objKeys);
  const rows = getRowsData(result, objKeys);

  return (
    <div>
      <table>
        <thead>{header}</thead>
        <tbody>{rows}</tbody>
      </table>

      {/* <input
        type="input"
        value={params}
        onChange={evt => setParams(evt.target.value)}
      /> */}
      {/* {JSON.stringify(result)} */}
    </div>
  );
}
