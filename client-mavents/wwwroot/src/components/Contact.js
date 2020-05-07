import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  return (
    <div className="row">
      <div className="col-10">
        <h2>Contact</h2>
        <p style={{ textAlign: "left" }}>
          Hello, <br />
          My name is William Boyden.
          <br />
          Im a full stack web developer specializing in data analysis and
          visualization. <br />
          If you would like to in contact please reach me via
          <a href="https://linkedin.com/in/william-boyden-88a324b6">
            {" "}
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  );
}
