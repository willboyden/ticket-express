import React, { useState, useEffect, useContext } from "react";
import MaMap from "./components/maMap";
import { useRoutes, A, useRedirect } from "hookrouter";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StyleSheets/navBar.css";
import EventFinder from "./components/EventFinder";
import EventCalendar from "./components/eventCalendar";
import Home from "./components/Home";
import Technology from "./components/Technology";
import CommingSoon from "./components/CommingSoon";
import Contact from "./components/Contact";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { DataProvider } from "./components/DataContext";
import { UserProvider } from "./components/UserContext";
import PivotTableWrapper from "./components/PivotTableWrapper";
import DataSets from "./components/DataSets";
//import "./main.scss"; // webpack must be configured to do this

import StoreFetchDataParallel from "./components/FetchDataParallel";

export default function App() {
  const [dateParam, setDateParam] = useState({});
  const [sidenavWidth, SetSidenavWidth] = useState("250px");
  const [mainMarginLeft, SetMainMrginLeft] = useState("250px");
  const user = { name: "Jane", loggedIn: true };
  //TestC();

  //1 react hook with method to set data and var to hold data
  const [venue, setVenue] = useState({
    name: "Big Night Live",
    dataSource: "ticketmaster",
  });
  const data = async () => await StoreFetchDataParallel(urls);
  //console.log(data);

  //  console.log(data);
  const routes = {
    "/": () => <Home />,

    "/eventfinder": () => (
      <DataProvider value={data}>
        <UserProvider value={user}>
          <EventFinder />
        </UserProvider>
      </DataProvider>
    ),
    "/exploredata": () => <PivotTableWrapper data={data} />,
    "/datasets": () => <DataSets data={data} />,
    "/eventcalendar": () => <EventCalendar venue={venue} />,
    "/venuemap": () => <MaMap />,
    "/technology": () => <Technology />,
    "/contact": () => <Contact />,
    "/comingsoon": () => <CommingSoon />,
    "/privacypolicy": () => <PrivacyPolicy />,
    "/*": () => <PrivacyPolicy />,
  };

  require("dotenv").config();
  //StoreFetchDataParallel(urls);
  //
  var urls = [
    {
      urlpath: process.env.domain + "/api/tblstubhubvenue/",
      varname: "tblstubhubvenue",
    },
    {
      urlpath: process.env.domain + "/api/tblnewticketmastervenueevent/",
      varname: "tblnewticketmastervenueevent",
    },
    {
      urlpath: process.env.domain + "/api/tblstubhubcity/",
      varname: "tblstubhubcity",
    },
    {
      urlpath: process.env.domain + "/api/tblticketmastervenue/",
      varname: "tblticketmastervenue",
    },
    {
      urlpath: process.env.domain + "/api/tblnewstubhubvenueevent/",
      varname: "tblnewstubhubvenueevent",
    },
  ];
  //const x = StoreFetchDataParallel(urls);

  //x.then(y => console.log(y));

  function openNav() {
    SetSidenavWidth("250px");
    SetMainMrginLeft("250px");
  }
  function closeNav() {
    SetSidenavWidth("0px");
    SetMainMrginLeft("0px");
  }

  function navClick() {
    console.log("clicked");
    sidenavWidth == "250px" ? closeNav() : openNav();
  }

  const routeResult = useRoutes(routes);

  // console.log(data ? data : null);
  return (
    <DataProvider value={data}>
      <UserProvider value={user}>
        <div id="divOutterWrapper">
          {/* <div>{data ? data : null}</div> */}

          <div
            id="mySidenav"
            className="sidenav"
            style={{ width: sidenavWidth }}
          >
            <a className="closebtn" onClick={navClick}>
              &times;
            </a>
            <A href="/" onClick={() => closeNav()}>
              Home
            </A>
            <A href="/eventfinder" onClick={() => closeNav()}>
              Event Finder
            </A>
            <A href="/exploredata" onClick={() => closeNav()}>
              Explore Data
            </A>
            <A href="/eventcalendar" onClick={() => closeNav()}>
              Event Calendar
            </A>
            <A href="/venuemap" onClick={() => closeNav()}>
              Venue Map
            </A>
            <A href="/datasets" onClick={() => closeNav()}>
              Data Sets
            </A>
            <A href="/technology" onClick={() => closeNav()}>
              Technology
            </A>
            <A href="/contact" onClick={() => closeNav()}>
              Contact
            </A>
            <A href="/commingsoon" onClick={() => closeNav()}>
              Comming Soon
            </A>
            <A href="/privacypolicy" onClick={() => closeNav()}>
              Privacy Policy
            </A>
          </div>
          <span style={{ cursor: "pointer" }} onClick={navClick}>
            &#9776;
          </span>
          <div
            id="main"
            className="container"
            style={{
              marginLeft: mainMarginLeft,
            }}
          >
            <div className="row">{routeResult}</div>
          </div>
        </div>
      </UserProvider>
    </DataProvider>
  );
}
