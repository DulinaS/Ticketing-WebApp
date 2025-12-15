import { useEffect, useState } from 'react';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import useRequest from '../../hooks/use-request';

const StripeCheckout = dynamic(
  () => import('react-stripe-checkout').then((mod) => mod.default),
  {
    ssr: false,
  }
);

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  //Custom hook to make payment request
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'), //On successful payment, redirect to orders page
  });

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
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })} //When payment is successful, call doRequest with the token ID
        stripeKey="pk_test_51Sc7r7A722iCwuWL24LZcLayv3xxFJxB0VTzdaoaBmRAAiQrX9boGMUE0boEjFVT6bgyPeg2K8cVkM27HNqRP0gn008euaMJb7"
        amount={order.ticket.price * 100} //Amount in cents
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
