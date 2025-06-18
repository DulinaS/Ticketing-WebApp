import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body }) => {
  //Method should be either--> GET,POST,PATCH
  const [errors, setErrors] = useState(null); // errors is a state

  const doRequest = async () => {
    try {
      setErrors(null); //When making new request clear the errors state so previous wont be there
      const reponse = await axios[method](url, body);
      return Response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.messsage}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };
  //Api uda doRequest method eka thamai return krnne..
  //After user uses doRequest method it returns the response data or errors if exists
  return { doRequest, errors }; //We return a object that contains method andn error state
};
