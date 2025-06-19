import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/users/signup', // The URL where the request is made
    method: 'post', // The HTTP method, in this case, POST
    body: {
      // The data to send to the server
      email,
      password,
    },
    onSuccess: () => Router.push('/'), // Callback function after successful request
  });

  const onSubmit = async (event) => {
    event.preventDefault(); // Prevents the form from reloading the page
    await doRequest(); // Triggers the API request
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign UP</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};
