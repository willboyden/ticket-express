import React, { useContext, createContext } from "react";
import UserContext from "../UserContext";
import DataContext from "../DataContext";
import "bootstrap/dist/css/bootstrap.min.css";
//import StoreFetchDataParallel from "./FetchDataParallel";
import home from "./home.css"; //playing around with css grid, in the end entire website should be grid instead of bootstrap
export default function Home() {
  // const [eventsData, setEventsData] = useState({});
  // var x = getParallel(["/api/evets"]);
  const data = useContext(DataContext);
  const user = useContext(UserContext);
  const d = async () => {
    return data;
  };
  return (
    <div className="col-10">
      <div className="grid-container">
        <div className="header">
          <h1>Welcome to MAvents</h1>
        </div>

        <div className="main">
          <div>
            <p>This Website exists to serve two purposes.</p>
          </div>

          <div>
            <p>
              First and foremost, I hope to provide a means to explore events
              and venues in Massachusetts based on artist, ticket price and
              selected dates amongst other criteria. If explore this aspect of
              the website head over to the "Event Finder".
            </p>
          </div>

          <div>
            <p>
              Additionally, this website presents results of data analytics,
              provides data sets and tools for exploratory data analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
//return <div>{user.name}</div>; shows how to get data from UserContext
