import { useState } from 'react';
import axios from 'axios';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]); //new state variable & function for errors

  const onSubmit = async (event) => {
    event.preventDefault();

    //we pass email,password as second argument,
    //1st argument is the path
    try {
      const response = await axios.post('/api/users/signup', {
        email,
        password,
      });
      console.log(response.data);
    } catch (err) {
      //Set the state of errors state variable using the error catched
      setErrors(err.response.data.errors);
    }
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
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {errors.map((err) => (
              <li key={err.messsage}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};
