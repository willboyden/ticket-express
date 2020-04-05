import React, { useContext, useEffect, useState } from "react";
import PivotTableWithUI from "./PivotTableWithUI";
import alasql from "alasql";
//const contextdata = useContext(DataContext);

//not that we may want to switch back to passing in picotState as a param
export default function PivotTableWrapper(data) {
  function useBtn(txaVal) {
    const [value, setValue] = useState("");
    const button = (
      <button
        value={txaVal}
        onClick={e => {
          setValue(e.target.value);
          data
            .data()
            .then(d => {
              console.log(alasql(value, [d["tblstubhubcity"]]));
              console.log(d["tblstubhubcity"]);
              setDataKey("tblstubhubcity");
              // console.log(filteredData);
            })
            .catch(err => console.log(err));
        }}
      >
        Send Query
      </button>
    );

    return [value, button];
  }
  // function useTextArea() {
  //   const [value, setValue] = useState("");

  //   const input = (
  //     <textarea
  //       value={value}
  //       onChange={e => {
  //         console.log(e.target.value);
  //         setValue(e.target.value);
  //       }}
  //     ></textarea>
  //   );
  //   return [value, input];
  // }

  //["asdfdasf", data.data().then(x => console.log(["x", x]))];
  const [isLoading, setIsLoading] = useState(false);
  // const [userinp, userInput] = useTextArea(txaValue);
  const [usernameBtn, userInputBtn] = useBtn({});
  const [btnList, setBtnList] = useState([]);
  const [qryBtnList, setQryBtnList] = useState([]);
  const [qryParamsArr, setQryParamsArr] = useState([]);
  const [qryStr, setQryStr] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [txaValue, setTxaValue] = useState("select * from ? limit 10");
  const [dataKey, setDataKey] = useState("tblstubhubcity");
  const [ptable, setPtable] = useState([]);

  const [textAreaEl, SetTextAreaEl] = useState([]);

  const [pivotState, setPivotState] = useState({
    mode: "demo",
    filename: "Event Data Explorer",
    // textarea: 'Sample Dataset: Tips',
    pivotState: {
      data: filteredData,
      rendererName: "Grouped Column Chart",
      plotlyOptions: { width: 900, height: 500 },
      plotlyConfig: {},
      tableOptions: {
        clickCallback: function(e, value, filters, pivotData) {
          var names = [];
          pivotData.forEachMatchingRecord(filters, function(record) {
            console.log("in click call back");
            names.push(record.Meal); //left over from example comeback later
          });
          alert(names.join("\n"));
        }
      }
    }
  });

  useEffect(() => {
    async function fetchData() {
      //     console.log("pivottablewrapper useEffect fetchData hit");
      if (data) {
        setIsLoading(true);
        const result = await data;
        // setDataResolved(result);
        //  setIsLoading(false);
        result.data().then(x => {
          setQryBtnList(
            Object.keys(x).map(b => {
              //  console.log(b);

              return (
                <button
                  value={b}
                  onClick={e => {
                    // console.log(e.target.value);
                    //       console.log(x[b]);
                    //   console.log(userInput.props.value + b);
                    console.log(qryParamsArr);
                    const ar = qryParamsArr;
                    ar.push(x[b]);
                    setQryParamsArr(ar);

                    const tv = txaValue;
                    console.log(txaValue);
                    setTxaValue(tv + b);
                  }}
                >
                  {b}
                </button>
              );
            })
          );

          if (filteredData != x) {
            //    setFilteredData(alasql(txaValue, [x.tblstubhubcity]));
            // pivotState.pivotState.data = filteredData;
            setPivotState({
              mode: "demo",
              filename: "Event Data Explorer",
              // textarea: 'Sample Dataset: Tips',
              pivotState: {
                data: filteredData,
                rendererName: "Grouped Column Chart",
                plotlyOptions: { width: 900, height: 500 },
                plotlyConfig: {},
                tableOptions: {
                  clickCallback: function(e, value, filters, pivotData) {
                    var names = [];
                    pivotData.forEachMatchingRecord(filters, function(record) {
                      console.log("in click call back");
                      names.push(record.Meal); //left over from example comeback later
                    });
                    alert(names.join("\n"));
                  }
                }
              }
            });
            console.log(["passing dataKey " + dataKey]);
            setPtable(
              <PivotTableWithUI
                data={filteredData}
                pivotState={pivotState}
                dataKey={dataKey}
              ></PivotTableWithUI>
            );
            setIsLoading(false);
          }
          setBtnList(
            Object.keys(x).map(b => {
              return (
                <button
                  value={b}
                  onClick={e => {
                    setFilteredData(x[b]);
                    setDataKey(b);
                    //  setTxaValue(e.target.value);
                  }}
                >
                  {b}
                </button>
              );
            })
          );
        });
      }
    }
    fetchData();
  }, [filteredData, txaValue]);

  return (
    <div>
      <div className="row text-center">
        <div className="col-md-3 text-center">
          <p>...or paste some data:</p>

          {/* {userInput} */}
          {userInputBtn}
          {btnList}
          {qryBtnList}

          <textarea
            value={txaValue}
            onChange={e => {
              console.log(e.target.value);
              const val = e.target.value;
              setTxaValue(val);
            }}
          ></textarea>
        </div>
      </div>
      <div className="row text-center">
        <br />
      </div>
      {ptable}
    </div>
  );
}
