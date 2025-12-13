import { useState } from 'react';

const newTicket = () => {
  //These are state hooks to manage the title and price of the ticket
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

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
      <form>
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
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default newTicket;
