import React, { useState, useContext, useEffect } from "react";
import MaMap from "./maMap";
import "bootstrap/dist/css/bootstrap.min.css";
import EventCalender from "./eventCalendar";
import DataContext from "./DataContext";
import { Button, ButtonGroup } from "reactstrap";
import JsonTable from "./JsonTable/JsonTable";
import ImageCarousel from "./ImageCarousel";
import AccordionVertical from "./AccordionVertical";
//import "./main.scss"; // webpack must be configured to do this

export default function EventFinder() {
  //1 react hook with method to set data and var to hold data
  // var maMapRef = React.createRef();
  const [venue, setVenue] = useState({
    name: "Big Night Live",
    dataSource: "ticketmaster",
  });
  const [eventParam, setEventParam] = useState({});
  const [dateParam, setDateParam] = useState({});
  const [tbl, setTbl] = useState(<React.Fragment></React.Fragment>);
  const [dataSourceFilter, setDataSourceFilter] = useState("any");
  const [showMarkers, setShowMarkers] = useState(true);
  const [imgCarousel, setImageCarousel] = useState(
    <React.Fragment></React.Fragment>
  );
  //const [ddlValue, setDdlValue] = useState()
  const [items] = React.useState([
    {
      label: "any",
      value: "any",
      bColor: "purple",
    },
    {
      label: "stubhub",
      value: "stubhub",
      bColor: "Orange",
    },
    {
      label: "ticketmaster",
      value: "ticketmaster",
      bColor: "RoyalBlue",
    },
  ]);

  const toggleMarkers = () =>
    showMarkers ? setShowMarkers(false) : setShowMarkers(true);

  const requestUrlAsync = async function (url) {
    return new Promise(async (resolve, reject) => {
      await fetch(url)
        .then(async (response) => {
          return await resolve(response.json());
        })
        .catch((err) => console.log("Asdfasfas" + err));
    });
  };

  async function venueJson(venue) {
    if (venue.dataSource == "ticketmaster") {
      return await requestUrlAsync(
        process.env.domain + "/api/ticketmasterApi/venues/" + venue.venueid
      ).then(async (x) => {
        const jsondata = await x;
        const data = jsondata;
        return data;
      });
    } else if (venue.dataSource == "stubhub") {
      return await requestUrlAsync(
        process.env.domain + "/api/stubhubVenueApi/venues/" + venue.venueid
      ).then(async (x) => {
        const jsondata = await x;
        const data = jsondata;
        return data;
      });
    }
  }

  async function getImageArr(jsondata) {
    const imagesArr = [];
    Object.entries(jsondata).map(function (val, ind, arr) {
      if (val[0] == "images") {
        arr[ind][1] = arr[ind][1].map((v, i) => {
          imagesArr.push(v["url"]);
        });
      }
      return val;
    });
    return imagesArr;
  }

  useEffect(() => {
    //  console.log("effff");
    (async () => {
      // if (venue.name.includes("Big")) {
      //   } else {
      //console.log([Promise.resolve(venueJson(venue)), "venueJson(venue)"]);
      venueJson(venue).then(async (a) => {
        const b = await a;
        setTbl(<JsonTable jsondata={b} />);

        const imgArr = await getImageArr(b).then(async (c) => {
          const d = await c;
          return d;
        });

        setImageCarousel(
          imgArr.length >= 1 ? (
            <ImageCarousel imgArr={imgArr}></ImageCarousel>
          ) : (
            <React.Fragment></React.Fragment>
          )
        );
      });
      // }
    })();
  }, [venue]);

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
              onChange={(e) => setDataSourceFilter(e.currentTarget.value)}
              style={{
                backgroundColor: items.filter((a) =>
                  a.value == dataSourceFilter ? a.bColor : "white"
                ),
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
        </div>
        <div className="col-3"></div>
      </div>

      <div className="row">
        <div className="col-9">
          {/* 2 pass "data setter" to child of this component / sibling of component being effected by event  */}
          <MaMap
            style={{ height: "100%" }}
            // ref={maMapRef}
            action={(venue) => {
              setVenue(venue);
              //venueJson(venue);
            }}
            dateClicked={dateParam}
            dataFilter={dataSourceFilter}
            showMarkers={showMarkers}
          ></MaMap>
        </div>
        <div style={{ maxHeight: "20rem" }} className="col-3">
          <div
            style={{
              width: "fit-content",
              maxWidth: "40rem",
            }}
          >
            {imgCarousel}
            <AccordionVertical
              cardhead="Venue Details"
              cardbody={tbl}
            ></AccordionVertical>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-9">
          {/* 3 use data in child component */}
          <EventCalender
            venue={venue}
            onEventClick={(eventId) => {
              setSelectedEvent(eventId);
            }}
            onDateClick={(dateParam) => {
              setDateParam(dateParam);
              console.log(dateParam);
            }}
            onEventClick={(eventParam) => {
              setEventParam(eventParam);
              console.log(eventParam);
            }}
          />
        </div>
        <div className="col-3"></div>
      </div>
    </div>
  );
}

//   return (
//     <div className="col-12">
//       <div className="row">
//         <div className="col-9">
//           <h3 id="pageTitle">
//             <span id="venueCount"></span>
//             Click On A Venue To View Its Event Schedule
//           </h3>

//           <div>
//             <span>Filter By Ticket Provider</span>
//             <select
//               value={dataSourceFilter}
//               onChange={(e) => setDataSourceFilter(e.currentTarget.value)}
//               style={{
//                 backgroundColor: items.filter((a) =>
//                   a.value == dataSourceFilter ? a.bColor : "white"
//                 ),
//               }}
//             >
//               {items.map(({ label, value, bColor }) => (
//                 <option
//                   key={value}
//                   value={value}
//                   style={{ backgroundColor: bColor }}
//                 >
//                   {label}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={() => toggleMarkers()}
//               className="btn btn-secondary"
//             >
//               Toggle Markers
//             </button>
//           </div>
//         </div>
//         <div className="col-3"></div>
//       </div>

//       <div className="row">
//         <div className="col-6">
//           {/* 2 pass "data setter" to child of this component / sibling of component being effected by event  */}
//           <MaMap
//             style={{ height: "100%" }}
//             // ref={maMapRef}
//             action={(venue) => {
//               setVenue(venue);
//               //venueJson(venue);
//             }}
//             dateClicked={dateParam}
//             dataFilter={dataSourceFilter}
//             showMarkers={showMarkers}
//           ></MaMap>
//         </div>
//         {/* <div style={{ maxHeight: "20rem" }} className="col-3">
//           <div style={{ width: "fit-content", minWidth: "45rem" }}>
//             { {imgCarousel}
//             <AccordionVertical
//               cardhead="Venue Details"
//               cardbody={tbl}
//             ></AccordionVertical> }
//           </div>
//         </div> */}
//         <div className="col-6">
//           {/* 3 use data in child component */}
//           <EventCalender
//             venue={venue}
//             onEventClick={(eventId) => {
//               setSelectedEvent(eventId);
//             }}
//             onDateClick={(dateParam) => {
//               setDateParam(dateParam);
//               console.log(dateParam);
//             }}
//             onEventClick={(eventParam) => {
//               setEventParam(eventParam);
//               console.log(eventParam);
//             }}
//           />
//         </div>
//         {/* <div className="col-3"></div> */}
//       </div>
//     </div>
//   );
// }

{
  /* <ButtonGroup>
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
          </ButtonGroup> */
}
