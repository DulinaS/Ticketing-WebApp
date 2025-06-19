import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null); // Clear any previous errors

      // Making the actual API request using axios
      const response = await axios[method](url, body);

      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess(response.data); // Call onSuccess with the response data
      }

      return response.data; // Return the response data
    } catch (err) {
      // If there's an error, show it in the UI
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors }; // Returning the doRequest function and errors state
};
