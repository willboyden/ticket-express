import React, { useState } from "react";
import { useEffect, NavLink } from "react";
import { ButtonGroup, Button } from "reactstrap";
import HtmlTable from "./getDataAsHtmlTable";
import * as alasql from "alasql";
import { set } from "d3";
alasql["private"].externalXlsxLib = require("xlsx");
var Navigation = require("react-router").Navigation;
export default function DataSets(props) {
  //const data = props.data;
  console.log("in datasets" + Navigation);
  const [ds_data, setDs_Data] = useState({ test: 1 });
  const [datakey, setDataKey] = useState("tblstubhubcity");

  useEffect(() => {
    (async () => {
      console.log(props);
      console.log(props.data);
      const pd = await props.data;
      console.log(pd[datakey]);
      setDs_Data(pd[datakey]);
      // const pd = await props.data();
      // console.log(pd[datakey]);
      // setDs_Data(pd[datakey]);
    })();
    //setData()
  }, [datakey]);

  const alacsv = () => {
    var f = datakey + ".csv";
    return alasql(`SELECT * INTO CSV(?) FROM ?`, [f, ds_data]);
  };
  const alajson = () => {
    var f = datakey + ".json";
    alasql(`SELECT * INTO JSON(?) FROM ?`, [f, ds_data]);
  };

  return (
    <div>
      <div>
        <ButtonGroup>
          <Button onClick={() => setDataKey("tblstubhubvenue")}>
            tblstubhubvenue
          </Button>
          <Button onClick={() => setDataKey("tblstubhubcity")}>
            tblstubhubcity
          </Button>
          <Button onClick={() => setDataKey("tblnewticketmastervenueevent")}>
            tblnewticketmastervenueevent
          </Button>
          <Button onClick={() => setDataKey("tblticketmastervenue")}>
            tblticketmastervenue
          </Button>
          <Button onClick={() => setDataKey("eventlist")}>eventlist</Button>
        </ButtonGroup>
      </div>

      <div>
        {/* <Button onClick={() => aladata()}>Download CSV</Button> */}
        <Button onClick={() => <NavLink to={alacsv()}></NavLink>}>
          Download CSV
        </Button>
        <Button onClick={() => <NavLink to={alajson()}></NavLink>}>
          Download JSON
        </Button>
        {/* <Button onClick={() => xlsxdata}>Download XLSX</Button> */}

        <div>
          <HtmlTable data={ds_data}></HtmlTable>
          {/* {JSON.stringify(ds_data)}
        <HtmlTable url={"/api/tblstubhubcity/"}></HtmlTable> */}
        </div>
      </div>
    </div>
  );
}
