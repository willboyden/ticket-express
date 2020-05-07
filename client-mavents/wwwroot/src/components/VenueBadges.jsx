import React, {useEffect} from 'react';

export default function  VenueBadges(props){
    const [minCost, setMinCost] = useState("NA");
    const [maxCost, setMaxCost] = useState("NA");
    const [eventCount, setEventCount] = useState("NA");

    
  const setLabelValues = (resp) => {
    setEventCount(
      alasql("select count(1) as val from ? order by [Event Date] limit 1", [
        resp,
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
  
return(
    <div className="row">
    <div className="col-12">
      <div className="row">
        <div className="col-3">
          <span className="badge">
            <h5>{props.venue.name}</h5>
          </span>
          <span className="badge">
            <h5>
              {eventCount ? eventCount.toString() + " Total Events" : ""}{" "}
            </h5>
          </span>
        </div>
        <div className="col-3">
          <span className="badge">
            <h5>
              Min Event Price ${minCost.mincost} {minCost.eventname}
            </h5>
          </span>
          <span className="badge">
            <h5>
              Max Event Price ${maxCost.maxcost} {maxCost.eventname}
            </h5>
          </span>
        </div>
        <div className="col-6"></div>
      </div>
    </div>
  </div>
);
   
}