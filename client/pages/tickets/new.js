import { useState } from 'react';
import useRequest from '../../hooks/use-request';

const newTicket = () => {
  //These are state hooks to manage the title and price of the ticket
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  //Using the custom Hook to make API requests to backend
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: (ticket) => console.log(ticket),
  });

  //This is called when the form is submitted
  const onSubmit = async (event) => {
    event.preventDefault(); //Prevent default form submission behavior
    await doRequest(); //Call the doRequest function from the custom hook
  };

  //This will set the float value to fixed 2 decimal places when the user leaves the price input field
  const onBlur = () => {
    const value = parseFloat(price);

    //If not a number, do nothing
    if (isNaN(value)) {
      return;
    }
    //Set the price to fixed 2 decimal places
    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>Create a New Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default newTicket;
