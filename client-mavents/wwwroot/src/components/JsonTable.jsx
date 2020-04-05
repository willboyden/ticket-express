import React from "react";
function recursiveRow(val) {
  return typeof val == "undefined" ? (
    <div></div>
  ) : (
    (() => {
      return (
        <tr>
          <td>{val[0]}</td>
          <td>
            <tr>
              <td>
                {(() => {
                  const v1 = val[1];
                  if (typeof v1 != "undefined") {
                    if (Array.isArray(v1) && typeof v1 != "string") {
                      return v1.map(b =>
                        Object.keys(b).map(a => (
                          <tr>
                            <td>{a}</td> <td>{b[a]}</td>
                          </tr>
                        ))
                      );
                    } else if (typeof v1 == "string") {
                      return v1;
                    } else {
                      return Object.entries(v1).map(x => {
                        if (Array.isArray(x[1])) {
                          return recursiveRow(x[1]);
                        } else if (typeof x[1] == "object") {
                          console.log("object");
                          return Object.entries(x[1]).map(a => {
                            console.log(["a", a]);
                            recursiveRow(a);
                          });
                        } else if (
                          typeof x[1] == "string" ||
                          typeof x[1] == "number"
                        )
                          return (
                            <tr>
                              {<td>{x[0]}</td>}
                              <td>{x[1]}</td>
                            </tr>
                          );
                      });
                    }
                  }
                })()}
              </td>
            </tr>
          </td>
        </tr>
      );
    })()
  );
}

const getRows = jsondata => {
  return Object.entries(jsondata).map(function(val, ind, arr) {
    return recursiveRow(val);
  });
};

export default function JsonTable(props) {
  console.log(props.jsondata.errors);
  if (props.jsondata.errors) {
    return <table></table>;
  } else
    return (
      <table className="table">
        <tbody>{getRows(props.jsondata)}</tbody>
      </table>
    );
}
