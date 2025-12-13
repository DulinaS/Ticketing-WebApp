import { useEffect, useState } from 'react';

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  //This effect will run once when the component is mounted
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    //Call it immediately to set the initial time left
    findTimeLeft();
    //Set an interval to call findTimeLeft every second so that timeLeft updates
    const timerId = setInterval(findTimeLeft, 1000);

    //Cleanup function to clear the interval when the component is unmounted
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <h1>Order Detail</h1>
      <p>Order ID: {order.id}</p>
      <p>Ticket: {order.ticket.title}</p>
      <p>Price: {order.ticket.price}</p>
      <p>Time left to pay: {timeLeft} seconds</p>

      <button className="btn btn-primary">Pay Now</button>
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
