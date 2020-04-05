import React, { useEffect, useState } from "react";
import "../App.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import ReactDOM from "react-dom";
import * as alasql from "alasql";
import { Calendar } from "@fullcalendar/core";

export default function EventCalendar(props) {
  const [venueData, setVenueData] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  const [calDate, setCalDate] = useState(new Date());
  const [eventCount, setEventCount] = useState("NA");
  const [minCost, setMinCost] = useState("NA");
  const [maxCost, setMaxCost] = useState("NA");

  var calendarRef = React.createRef();
  const [calendar, setCalendar] = useState(
    <FullCalendar
      ref={calendarRef}
      defaultView="dayGridMonth"
      plugins={[dayGridPlugin, interactionPlugin]}
      events={venueData}
      eventRender={EventDetail}
      dateClick={handleDateClick}
      defaultDate={new Date()}
      //ref={calendar}
      customButtons={{
        btnDetails: {
          text: "Event Details",
          click: () => {
            showDetail === true ? setShowDetail(false) : setShowDetail(true);
            //myCustomButton.text = btnText;
          }
        }
      }}
      header={{
        left: "prev,next today btnDetails",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
      }}
    />
  );

  const setLabelValues = resp => {
    setCalDate(
      alasql(
        "select [Event Date] as [val] from ? order by [Event Date] limit 1",
        [resp]
      )[0].val
    );
    console.log(
      alasql(
        "select [Event Date] as [val], [Event Name] from ? order by [Event Date] limit 1",
        [resp]
      )[0].val
    );
    // setCalDate(firstEventDate);
    setEventCount(
      alasql("select count(1) as val from ? order by [Event Date] limit 1", [
        resp
      ])[0].val
    );
    setMinCost(
      alasql(
        "select min([Min Cost]) as mincost, [Event Name] as eventname from ? group by [Event Name] order by [Min Cost] limit 1",
        [resp]
      )[0]
    );
    setMaxCost(
      alasql(
        "select min([Max Cost]) as maxcost, [Event Name] as eventname from ? group by [Event Name] order by [Max Cost] limit 1",
        [resp]
      )[0]
    );
  };

  const col = x => {
    if (x.dataSource == "ticketmaster") {
      return "RoyalBlue";
    } else if (x.dataSource == "stubhub") {
      return "DarkOrange";
    } else {
      return "purple";
    }
  };

  const EventDetail = ({ event, el }) => {
    const minCost = event.extendedProps.minCost
      ? event.extendedProps.minCost
      : "Missing";
    const maxCost = event.extendedProps.maxCost
      ? event.extendedProps.maxCost
      : "Missing";
    const content = (
      <div>
        <b>{event.title}</b>
        <div>
          Min Cost:<b>{minCost}</b>
          Max Cost:<b>{maxCost}</b>
        </div>
      </div>
    );
    if (showDetail === true) {
      ReactDOM.render(content, el);
    } else {
      //tooltip, for now would rather have events not expand calendar
      // const contentTooltip = (
      //   <div style={{ overflow: "hidden" }}>
      //     <ReactTooltip id={event.id + "toolTip"}>{content}</ReactTooltip>
      //     <div>
      //       <p data-tip={content} data-for={event.id + "toolTip"}>
      //         {event.title}
      //       </p>
      //     </div>
      //   </div>
      // );
      // console.log(el);
      // ReactDOM.render(contentTooltip, el);
    }
    return el;
  };

  const handleDateClick = arg => {
    // alert(arg.dateStr);
    props.onDateClick(arg.dateStr);
  };

  useEffect(() => {
    if (props) {
      fetch(process.env.domain + `\/api/events/${props.venue.name}/`)
        .then(async response => response.json())
        .then(async res => {
          const resp = await res;

          setLabelValues(resp);
          console.log(eventCount);
          setVenueData(
            resp.map((x, i) => ({
              id: x["Event Name"] + i.toString(),
              date: x["Event Date"],
              title: x["Event Name"],
              color: col(x),
              extendedProps: {
                dataSource: x["dataSource"],
                minCost: x["Min Cost"],
                maxCost: x["Max Cost"]
              }
            }))
          );
          //venueData.map(event => calendar.ref.current.getApi().addEvent(event)); //update with new events

          calendar.ref.current.getApi().getEventSources().length == 0
            ? calendar.ref.current.getApi().addEventSource(venueData)
            : calendar.ref.current
                .getApi()
                .getEventSources()
                .forEach(es => es.remove()),
            calendar.ref.current.getApi().addEventSource(venueData); // calendar.ref.current.getApi().refetchEvents(venueData);

          calendar.ref.current.getApi().gotoDate(calDate); //goto new day
        });
    }
  }, [props, showDetail]); //use effect when there is change to this var
  // const btnText =
  //   showDetail == true ? "Minimize Event Details" : "Show Full Event Details";
  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-3">
              <h5>{props.venue.name}</h5>
              <h5>
                {eventCount ? eventCount.toString() + " Total Events" : ""}{" "}
              </h5>
            </div>
            <div className="col-3">
              <h5>
                Min Event Price ${minCost.mincost} {minCost.eventname}
              </h5>
              <h5>
                Max Event Price ${maxCost.maxcost} {maxCost.eventname}
              </h5>
            </div>
            <div className="col-6"></div>
          </div>
        </div>
      </div>
      <div>{calendar}</div>
    </div>
  );
}
