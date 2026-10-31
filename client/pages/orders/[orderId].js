import { useEffect, useState } from 'react';
import Router from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Use Stripe's test token directly (simulates successful card payment)
      // In a real app, you would collect card details with Stripe Elements
      const testToken = 'tok_visa'; // Stripe's test token for Visa

      // Send payment to backend
      await doRequest({ token: testToken });
    } catch (err) {
      console.error(err);
      alert('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <h1>Order Detail</h1>
      <p>Order ID: {order.id}</p>
      <p>Ticket: {order.ticket.title}</p>
      <p>Price: ${order.ticket.price}</p>
      <p>Time left to pay: {timeLeft} seconds</p>

      <button
        className="btn btn-primary"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : `Pay $${order.ticket.price}`}
      </button>

      <div className="mt-3">
        <small className="text-muted">
          Test Mode: Click pay to simulate payment with test card
        </small>
      </div>

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
