import React, { useContext, createContext } from "react";
import StoreFetchDataParallel from "./FetchDataParallel";
import UserContext from "./UserContext";
import DataContext from "./DataContext";
export default function Home() {
  // const [eventsData, setEventsData] = useState({});
  // var x = getParallel(["/api/evets"]);
  const data = useContext(DataContext);
  const user = useContext(UserContext);
  const d = async () => {
    return data;
  };

  return <div>{user.name}</div>;
}
