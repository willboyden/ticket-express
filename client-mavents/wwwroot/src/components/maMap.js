import useSWR from "swr";
import React, { useEffect, useState } from "react";
import { Map, Marker, Popup, TileLayer, Circle } from "react-leaflet";
require("dotenv").config();
// import { Icon, Circle } from "leaflet";

export default function MaMap(props) {
  //leaving this here for now, would be nice to move any data fetching out of rendering functions if possible

  const fetcher = async (...args) =>
    fetch(...args).then(async response => response.json());
  const domain = process.env.domain + "/api/";
  const endpoint = "cityVenues/";
  //const apiUrl = domain + endpoint;

  //allow for click on calendar to show only venues with events on that day
  const dte = typeof props.dateClicked == "string" ? props.dateClicked : "";
  const [apiUrl, setApiUrl] = useState(domain + endpoint + dte);
  useEffect(() => {
    if (props) {
      return async () => setApiUrl(domain + endpoint + dte);
    }
  }, [props]); //use effect when there is change to this var

  const { data, error } = useSWR(apiUrl, fetcher);

  const datums = data && !error ? data : [];
  // console.log(props.data);
  if (error) return <div>failed to load</div>;

  const col = x => {
    if (x.dataSource == "ticketmaster") {
      return "RoyalBlue";
    } else if (x.dataSource == "stubhub") {
      return "DarkOrange";
    } else {
      return "purple";
    }
  };
  // if (typeof datums[1] != "undefined") console.log(props.dataFilter(datums[1]));
  console.log(["datums", datums]);
  return (
    <Map center={[41.98, -71.3824]} zoom={8}>
      <TileLayer
        url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        minZoom={1}
        maxZoom={18}
        id="mapbox/streets-v11"
        accessToken="pk.eyJ1Ijoid2lsbGJveWRlbiIsImEiOiJjazVvdzA4cmEwMDVxM21xbzNiNGxyMGRvIn0.wZFONFwh4vNyRCjkViUg4w"
      />

      {datums
        .filter(
          x =>
            x.latitude != null &&
            x.longitude != null &&
            (x.dataSource == props.dataFilter || props.dataFilter == "any") //comeback: this hurst reusability. with chould be passed into the map
        )
        .map((datum, i) =>
          props.showMarkers ? (
            <Marker
              key={i}
              position={{ lat: datum.latitude, lng: datum.longitude }}
              onMouseOver={e => {
                e.target.openPopup();
              }}
              onMouseOut={e => {
                e.target.closePopup();
              }}
              onClick={() => {
                props.action(datum);
              }}
            >
              <Circle
                key={datum.name}
                center={[datum.latitude, datum.longitude]}
                fillColor={col(datum)}
                color={col(datum)}
                radius={500}
                fillOpacity={0.5}
              />
              <Popup>
                <span>
                  {datum.name}
                  <br />
                  {datum.dataSource}
                </span>
              </Popup>
            </Marker>
          ) : (
            <Circle
              key={datum.name}
              center={[datum.latitude, datum.longitude]}
              fillColor={col(datum)}
              color={col(datum)}
              radius={500}
              fillOpacity={0.5}
            />
          )
        )}
    </Map>
  );
}
