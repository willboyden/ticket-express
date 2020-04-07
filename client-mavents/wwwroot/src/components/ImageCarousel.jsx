import React, { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";

export default function ImageCarousel(props) {
  //const imgArr = useState(props.imgArr);
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {props.imgArr.map((v, i) => (
        <Carousel.Item key={"c_" + i.toString()}>
          <img className="d-block w-100" src={v} alt="First slide" />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
