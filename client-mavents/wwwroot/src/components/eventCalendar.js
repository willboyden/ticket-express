import React, { useEffect, useState } from "react";
import "../App.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGrid from "@fullcalendar/timegrid";

import ReactDOM from "react-dom";
import * as alasql from "alasql";
//import { Calendar } from "@fullcalendar/core";

export default function EventCalendar(props) {
  const [venueData, setVenueData] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  const [calDate, setCalDate] = useState(new Date());

  const [style, setStyle] = useState({ background: "blanchedalmond" });

  var calendarRef = React.createRef();
  const handleDateClick = (arg) => {
    //alert(arg.dateStr);
    props.onDateClick(arg.dateStr);
  };

  const fullScreenClass = {
    backgroundImage:
      "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAAnklEQVR4Ae2WVQEDMRAFn4RIi8OVtBIiIQ7KzO3dlN+8z4MJbEDGGPPXTA+SukQevTlKlCq6RFFSor7RXFR1qkehawTRo9uqIOaoPyTqQ0Wporh76GJdFg+zqbS4odm8s6nAkVQ1Tc+kqQqkano5pKpdFTVhTG8EwyKLwPLmF+xHbkH8psofEx918PFHOX85+YbrFn+B5K/Ef4wxxswAnU97CHDaZQMAAAAASUVORK5CYII=)",
    backgroundSize: "26px 26px",
  };

  const fullscreenClick = (calendarRef) => {
    console.log(calendarRef.current.getApi());
  };

  const handleEventClick = (arg) => {
    arg.jsEvent.preventDefault(); // don't let the browser navigate

    if (arg.event.url) {
      window.open(arg.event.url);
    }
    console.log(arg);
    props.onEventClick(arg.eventStr);
  };

  const [calendar, setCalendar] = useState(
    <FullCalendar
      ref={calendarRef}
      defaultView="dayGridMonth"
      plugins={[dayGridPlugin, interactionPlugin, timeGrid]}
      events={venueData}
      eventRender={EventDetail}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      defaultDate={new Date()}
      //ref={calendar}
      customButtons={{
        btnDetails: {
          text: "Event Details",
          click: () => {
            showDetail === true ? setShowDetail(false) : setShowDetail(true);
            //myCustomButton.text = btnText;
          },
        },
        btnFullScreen: {
          className: { fullScreenClass },
          click: () => {
            showDetail === true ? setShowDetail(false) : setShowDetail(true);
            //myCustomButton.text = btnText;
          },
        },
      }}
      header={{
        left: "prev,next today btnDetails",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
      }}
    />
  );

  const col = (x) => {
    console.log(x);
    if (x.dataSource == "ticketmaster") {
      return "RoyalBlue";
    } else if (x.dataSource == "stubhub") {
      console.log(x.dataSource);
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

  useEffect(() => {
    if (props) {
      fetch(process.env.domain + `\/api/events/${props.venue.name}/`)
        .then(async (response) => response.json())
        .then(async (res) => {
          const resp = await res;

          setCalDate(
            alasql(
              "select [Event Date] as [val] from ? order by [Event Date] limit 1",
              [resp]
            )[0].val
          );
          //console.log(eventCount);
          // console.log(["res[p", resp]);
          setVenueData(
            resp.map((x, i) => ({
              id: x["EventId"],
              date: x["Event Date"],
              title: x["Event Name"],
              color: col(x),
              url: x["url"],
              extendedProps: {
                dataSource: x["dataSource"],
                minCost: x["Min Cost"],
                maxCost: x["Max Cost"],
              },
            }))
          );
          //venueData.map(event => calendar.ref.current.getApi().addEvent(event)); //update with new events

          calendar.ref.current.getApi().getEventSources().length == 0
            ? calendar.ref.current.getApi().addEventSource(venueData)
            : calendar.ref.current
                .getApi()
                .getEventSources()
                .forEach((es) => es.remove()),
            calendar.ref.current.getApi().addEventSource(venueData); // calendar.ref.current.getApi().refetchEvents(venueData);

          calendar.ref.current.getApi().gotoDate(calDate); //goto new day
        });
    }
  }, [props, showDetail]); //use effect when there is change to this var
  // const btnText =
  //   showDetail == true ? "Minimize Event Details" : "Show Full Event Details";
  return (
    <div>
      <div style={style}>{calendar}</div>
    </div>
  );
}
