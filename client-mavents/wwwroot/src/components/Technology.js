import React from "react";

export default function Technology() {
  return (
    <div>
      <body className="c6">
        <p className="c8 c10">
          <span className="c0"></span>
        </p>
        <p className="c8">
          <h2 className="c7 c4">Data Collection</h2>
          <a
            href="https://github.com/willboyden/ticketDataCollection"
            target="_blank"
          >
            github
          </a>
        </p>
        <ul className="c3 lst-kix_gyzx9pg5k5m-0 start">
          <li className="c2">
            <span className="c0">
              (local) C# .Net Core Console Applications run on a scheduled
              routine calling Python and T-SQL scripts
            </span>
          </li>

          <li className="c2">
            <span>
              Python scripts to pull data from third party APIs, do some light
              data wrangling and save the data as json documents in a structured
              directory system{" "}
            </span>
            <span className="c0">&nbsp;</span>
          </li>
        </ul>
        <ul className="c3 lst-kix_gyzx9pg5k5m-1 start">
          <li className="c5">
            <span className="c0">Console apps run python scripts</span>
          </li>
          <li className="c5">
            <span className="c0">
              C# extracts, wrangles and formats data with T-SQL scripts saving
              to local MSSQL Server DB
            </span>
          </li>
          <li className="c5">
            <span className="c0">
              Update cloud data with latest pull (cloud can only host small
              subset of data being collected)
            </span>
          </li>
        </ul>
        <i>
          <p style={{ marginLeft: "2rem", textAlign: "left" }}>--Notes:</p>
          <ul
            style={{ marginLeft: "4rem", textAlign: "left" }}
            className="c3 lst-kix_xap17x11oy16-0 start"
          >
            <li className="c2">
              <span className="c0">
                eventually the python parts should be re-written in C# so there
                is less to manage(like python versions, environment ect). Or C#
                should be rewritten in python
              </span>
            </li>
            <li className="c2">
              <span className="c0">
                All technologies (other than windows task scheduler) can be run
                on both Windows and Linux including .Net Core and SQL Server (on
                most popular linux distrabutions){" "}
              </span>
            </li>
            <li className="c2">
              <span className="c0">
                Had I known this would end up being a primarily Node.js and
                MySQL (eventually MongoDB) project I would have used those for
                data collection
              </span>
            </li>
          </ul>
        </i>

        <p className="c8">
          <h2>Web Stack</h2>
        </p>
        <p className="c8">
          <span className="c7 c4">
            &nbsp; &nbsp; <b>Past</b>{" "}
          </span>
          <a
            href="https://github.com/willboyden/concertTicketWebCore"
            target="_blank"
          >
            github
          </a>
        </p>
        <p className="c8">
          <span className="c4">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span className="c0">
            Windows, IIS, SQL Server, .Net Core WebAPI, .NET Core MVC, jQuery +
            other JS libs
          </span>
        </p>
        <p className="c8">
          <span>&nbsp; &nbsp; </span>
          <span className="c7 c4">
            <b>Current</b>
          </span>
        </p>

        <p style={{ marginLeft: "1rem", textAlign: "left" }}>
          <span className="c0">
            Git for version control and moving project from local windows
            development environment to linux cloud hosting environment
          </span>
        </p>
        <p style={{ marginLeft: "1rem", textAlign: "left" }}>
          <span>
            (OS and such) Linux running on AWS cloud with Apache Http Server
          </span>
        </p>

        <ul className="c3 lst-kix_x9qnrmiz1czb-0">
          <h6>that Backend </h6>
          <a
            href="https://github.com/willboyden/ticket-express"
            target="_blank"
          >
            github
          </a>
        </ul>

        <ul className="c3 lst-kix_x9qnrmiz1czb-1 start">
          <li className="c5">
            <span className="c0">
              AWS RDS MySQLversion8 (finally a MySQL allowing for C.T.E.s !!!!)
            </span>
          </li>
          <li className="c5">
            <span className="c0">NodeJS </span>
          </li>
          <li className="c5">
            <span className="c0">Express - for creating REST APIs</span>
          </li>
          <li className="c5">
            <span className="c1">Coming Soon-</span>
            <span className="c0">
              &nbsp;MongoDB, Redis (for speed I think my entire DB could be
              saved in RAM with Redis, though rewriting queries will be a pain)
            </span>
          </li>
        </ul>
        <ul className="c3 lst-kix_x9qnrmiz1czb-0">
          <h6>Frontside </h6>
          <a href="https://github.com/willboyden/mavents-app" target="_blank">
            github
          </a>
        </ul>
        <ul className="c3 lst-kix_x9qnrmiz1czb-1 start">
          <li className="c5">
            <span className="c0">
              React.JS for responsive user interaction and clean reusable code
              base
            </span>
          </li>
          <li className="c5">
            <span className="c0">
              D3.js for Data Visualization with low level control
            </span>
          </li>
          <li className="c5">
            <span className="c0">
              Leaflet.JS (React version) for geographical data visualization and
              interaction
            </span>
          </li>
          <li className="c5">
            <span className="c0">
              Full-Calendar.JS (React version) for timeseries data visualization
              and interaction
            </span>
          </li>
          <li className="c5">
            <span className="c0">
              Bootstrap for layout and to save time in general with styling
            </span>
          </li>
          <li className="c5">
            <span className="c0">CSS cause well duh you gots to &nbsp;</span>
          </li>
          <li className="c5">
            <span className="c0">
              React Pivot Tables for Plotly Charts and well duh… pivot tables
            </span>
          </li>
        </ul>
        <p className="c8 c9">
          <span className="c0"></span>
        </p>
      </body>
    </div>
  );
}
