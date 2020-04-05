import React, { useState, useContext, useEffect } from "react";
import MaMap from "./maMap";
import "bootstrap/dist/css/bootstrap.min.css";
import EventCalender from "./eventCalendar";
import DataContext from "./DataContext";
import { Button, ButtonGroup } from "reactstrap";
import JsonTable from "./JsonTable";
//import "./main.scss"; // webpack must be configured to do this

export default function EventFinder() {
  //1 react hook with method to set data and var to hold data
  var maMapRef = React.createRef();
  const [venue, setVenue] = useState({
    name: "Big Night Live",
    dataSource: "ticketmaster"
  });

  const [dateParam, setDateParam] = useState({});
  const [tbl, setTbl] = useState(<div></div>);
  const [dataSourceFilter, setDataSourceFilter] = useState("any");
  const [showMarkers, setShowMarkers] = useState(true);
  //const [ddlValue, setDdlValue] = useState()

  const toggleMarkers = () =>
    showMarkers ? setShowMarkers(false) : setShowMarkers(true);

  const requestUrlAsync = async function(url) {
    return new Promise(async (resolve, reject) => {
      await fetch(url)
        .then(async response => {
          return await resolve(response.json());
        })
        .catch(err => console.log("Asdfasfas" + err));
    });
  };
  async function venueJson(venue) {
    if (venue.dataSource == "ticketmaster") {
      return await requestUrlAsync(
        process.env.domain + "/api/ticketmasterApi/venues/" + venue.venueid
      ).then(async x => {
        const jsondata = await x;
        return <JsonTable jsondata={jsondata} />;
      });
    }
  }

  useEffect(() => {
    console.log("effff");
    (async () => {
      if (venue.name.includes("Big")) {
      } else
        console.log([Promise.resolve(venueJson(venue)), "venueJson(venue)"]);
      await venueJson(venue).then(async x => {
        const xd = await x;
        console.log([xd, "xd"]);
        setTbl(xd);
      });
    })();
  }, [venue]);

  const filterObj = { param: "dataSource" };
  //const filterData =
  const [items] = React.useState([
    {
      label: "any",
      value: "any",
      bColor: "purple"
    },
    {
      label: "stubhub",
      value: "stubhub",
      bColor: "Orange"
    },
    {
      label: "ticketmaster",
      value: "ticketmaster",
      bColor: "RoyalBlue"
    }
  ]);
  return (
    <div className="col-12">
      <div className="row">
        <div className="col-9">
          <h3 id="pageTitle">
            <span id="venueCount"></span>
            Click On A Venue To View Its Event Schedule
          </h3>

          <div>
            <span>Filter By Ticket Provider</span>
            <select
              value={dataSourceFilter}
              onChange={e => setDataSourceFilter(e.currentTarget.value)}
              style={{
                backgroundColor: items.filter(a =>
                  a.value == dataSourceFilter ? a.bColor : "white"
                )
              }}
            >
              {items.map(({ label, value, bColor }) => (
                <option
                  key={value}
                  value={value}
                  style={{ backgroundColor: bColor }}
                >
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => toggleMarkers()}
              className="btn btn-secondary"
            >
              Toggle Markers
            </button>
          </div>

          {/* <ButtonGroup>
            <Button
              id="btnResetTblCityCounts"
              onClick={() => setDataSourceFilter("any")}
            >
              Reset Map
            </Button>
            <Button
              id="btnStubhubFilter"
              onClick={() => setDataSourceFilter("stubhub")}
            >
              Stub Hub
            </Button>
            <Button
              id="btnTicketMasterFilter"
              onClick={() => setDataSourceFilter("ticketmaster")}
            >
              Ticketmaster
            </Button>
          </ButtonGroup> */}
        </div>
        <div className="col-3">{tbl}</div>
      </div>

      <div className="row">
        <div className="col-9">
          {/* 2 pass "data setter" to child of this component / sibling of component being effected by event  */}
          <MaMap
            ref={maMapRef}
            action={venue => {
              setVenue(venue);
              //venueJson(venue);
            }}
            dateClicked={dateParam}
            dataFilter={dataSourceFilter}
            showMarkers={showMarkers}
          ></MaMap>
        </div>
        <div className="col-3"></div>
      </div>

      <div className="row">
        <div className="col-9">
          {/* 3 use data in child component */}
          <EventCalender
            venue={venue}
            onDateClick={dateParam => setDateParam(dateParam)}
          />
        </div>
        <div className="col-3"></div>
      </div>
    </div>
  );
}
