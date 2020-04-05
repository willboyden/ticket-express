import React, {useState, useEffect} from 'react';

const ButtonFetchData = endPoint => {
  const [hasError, setErrors] = useState(false);
  const [data, setData] = useState({});

  async function fetchData() {
    const res = await fetch(endPoint);
    res
      .json()
      .then(res => setData(res))
      .catch(err => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  });

  return (
    <div>
      <button onClick={fetchData()} data={JSON.stringify(data)}></button>
      <hr />
      <span>Has error: {JSON.stringify(hasError)}</span>
    </div>
  );
};
export default ButtonFetchData;
