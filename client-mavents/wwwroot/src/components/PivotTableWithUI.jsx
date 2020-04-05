import React, { useContext, useEffect, useState } from "react";
//import cities from "../../examples/cities";
import { sortAs } from "../Utilities";
import TableRenderers from "../TableRenderers";
import createPlotlyComponent from "react-plotly.js/factory";
import createPlotlyRenderers from "../PlotlyRenderers";
import PivotTableUI from "../PivotTableUI";
import "./pivottable.css";
import "../ButtonFetchData";
import "./FetchDataParallel";
import DataContext from "./DataContext";
import alasql from "alasql";
const Plot = createPlotlyComponent(window.Plotly);
React.createElement(Plot);
console.log(window);

function PivotTableUISmartWrapper(props) {
  console.log(["pivotState in PivotTableUISmartWrapper", props.pivotState]);
  const [newPivotState, SetNewPivotState] = useState({});
  const [pivotTableUI, SetPivotTableUI] = useState(<div></div>);
  const [windowWidth, SetWindowWidth] = useState(window.innerWidth);
  const [windowHeight, SetWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    //  console.log("in use effect");
    //   async () => {
    //  SetPivotTableUI("hi");
    window.addEventListener("resize", () => {
      SetWindowWidth(window.innerWidth);
      SetWindowHeight(window.innerHeight);
    });
    //  console.log(props.pivotState);
    SetPivotTableUI(
      <PivotTableUI
        plotlyOptions={{
          width: window.innerWidth / 2,
          height: window.innerHeight / 2
        }}
        renderers={Object.assign(
          {},
          TableRenderers,
          createPlotlyRenderers(Plot)
        )}
        onChange={s => {
          // console.log(["s", s]);
          SetPivotTableUI(<PivotTableUI {...s}></PivotTableUI>);
        }}
        {...props.pivotState.pivotState}
        unusedOrientationCutoff={Infinity}
      />
    );
    //   };
  }, [props.dataKey, window.innerWidth, window.innerHeight]);

  return pivotTableUI;
}

export default function PivotTableWithUI(props) {
  const [pivotUI, SetPivotUI] = React.useState(<div></div>);
  const [pivotData, SetPivotData] = React.useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dataResolved, setDataResolved] = useState([]);

  function dtButton(d, dkey) {
    return dtAsHtml(d[dKey]);
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // if (data) {
      //  const result = dataResolved.length > 1 ? dataResolved : await data;
      // setDataResolved(result);
      //  setIsLoading(false);
      if (typeof props.data.data == "function") {
        props.data
          .data()
          .then(d => {
            const pivotstate = {
              mode: "demo",
              filename: "Event Data Explorer",
              // textarea: 'Sample Dataset: Tips',
              pivotState: {
                data: d[props.dataKey],
                rendererName: "Grouped Column Chart",
                plotlyConfig: {
                  layout: {
                    title: "A Fancy Plot",
                    autosize: true
                  }
                },
                aggregatorName: "Sum over Sum",
                vals: ["Select Value", "Select Value"],
                rendererName: "Grouped Column Chart"
              }
            };
            SetPivotUI(
              <PivotTableUISmartWrapper
                pivotState={pivotstate}
                dataKey={props.dataKey}
              />
            );
          })
          .catch(err => console.log(err));
      } else {
        console.log(["in else", props.data]);
        const pivotstate = {
          mode: "demo",
          filename: "Event Data Explorer",
          // textarea: 'Sample Dataset: Tips',
          pivotState: {
            data: props.data, //notice the difference here
            rendererName: "Grouped Column Chart",
            plotlyConfig: {},
            aggregatorName: "Sum over Sum",
            vals: ["Tip", "Total Bill"],
            rendererName: "Grouped Column Chart"
          }
        };
        SetPivotUI(
          <PivotTableUISmartWrapper
            pivotState={pivotstate}
            dataKey={props.dataKey}
          />
        );
      }

      setIsLoading(false);
      // SetPivotUI(<PivotTableUISmartWrapper pivotState={pivotstate} />);

      //  });
      // }
    }

    fetchData();
  }, [props]);

  return (
    <div className="row">
      <h2 className="text-center"></h2>
      <br />
      {pivotUI}
    </div>
  );
}
