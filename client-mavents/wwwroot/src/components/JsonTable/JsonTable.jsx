import React, { setState } from "react";
import "./jsontable.css";
function recursiveRow(val) {
  // const tdshow = { display: null };
  // const tdhide = { display: "none" };
  // const [showHide, setShowHide] = setState({ display: "none" });
  //const toggleTd = () => {};

  return typeof val == "undefined" ? (
    <div></div>
  ) : (
    (() => {
      return (
        <tr key={"tr_lv1_" + val[0]}>
          <td key={"td_lv1a_" + val[0]}>{val[0]}</td>
          <td key={"td_lv1b_" + val[0]}>
            <table key={"table_lv1_" + val[0]}>
              <tbody key={"tbody_lv1b_" + val[0]}>
                <tr key={"tr_lv2_" + val[0]}>
                  <td key={"td_lv2_" + val[0]}>
                    {(() => {
                      const v1 = val[1];
                      console.log(v1);
                      if (typeof v1 != "undefined") {
                        if (Array.isArray(v1) && typeof v1 != "string") {
                          return v1.map((b) =>
                            Object.keys(b).map((a) => (
                              <table key={"table_lv2_" + a}>
                                <tbody key={"tbody_lv2_" + a}>
                                  <tr key={"tr_lv3_" + a}>
                                    <td key={"td_lv2a_" + a}>{a}</td>
                                    <td key={"td_lv2b_" + b[a]}>{b[a]}</td>
                                  </tr>
                                </tbody>
                              </table>
                            ))
                          );
                        } else if (typeof v1 == "string") {
                          return v1;
                        } else if (typeof v1 == "number") {
                          return v1.toString();
                        } else if (typeof v1 == "boolean") {
                          return v1.toString();
                        } else {
                          return Object.entries(v1).map((x) => {
                            if (Array.isArray(x[1])) {
                              return x[1].map((a) => recursiveRow(a));
                            } else if (typeof x[1] == "object") {
                              console.log("object");
                              return (
                                <table key={"table_asdfs" + x[0]}>
                                  <tbody key={"tbody_asdfs" + x[0]}>
                                    <tr>
                                      <td key={"td_asdfs" + x[0]}>{x[0]}</td>
                                      <td>
                                        {Object.entries(x[1]).map((a) => {
                                          console.log(["a", a]);
                                          return (
                                            <table key={"table_asdfs" + x[0]}>
                                              <tbody key={"tbody_asdfs" + x[0]}>
                                                {recursiveRow(a)}
                                              </tbody>
                                            </table>
                                          );
                                        })}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              );
                            } else if (
                              typeof x[1] == "string" ||
                              typeof x[1] == "number"
                            ) {
                              if (typeof x[1] == "string" && x[1] === "") {
                                return (
                                  <tr>
                                    <td></td>
                                  </tr>
                                );
                              } else {
                                return (
                                  <table key={"table_lv4_" + x[0]}>
                                    <tbody key={"tbody_lv4_" + x[0]}>
                                      <tr key={"tr_lv4_" + x[0]}>
                                        {
                                          <td key={"td_lv3a_" + x[0]}>
                                            {x[0]}
                                          </td>
                                        }
                                        <td key={"td_lv3b_" + x[1]}>{x[1]}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                );
                              }
                            }
                          });
                        }
                      }
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      );
    })()
  );
}

const getRows = (jsondata) => {
  return Object.entries(jsondata).map(function (val, ind, arr) {
    return recursiveRow(val);
  });
};

export default function JsonTable(props) {
  console.log(props.jsondata.errors);
  if (props.jsondata.errors) {
    return <table></table>;
  } else {
    return (
      <table
        key={"tblJson"}
        className="table-dark"
        // className="table .table-sm table-dark table-responsive-sm"
      >
        <tbody>
          {getRows(props.jsondata)}
          {/* {props.jsondata ? (
          
          ) : (
            <tr>
              <td></td>
            </tr>
          )}
          } */}
        </tbody>
      </table>
    );
  }
}
