import React, { useState, useEffect } from "react";

export default async function useFetch(url, defaultData) {
  const [data, updateData] = useState();
  //console.log(data);
  useEffect(() => {
    async function fetchData() {
      if (!url) {
        //updateData(defaultData);
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
