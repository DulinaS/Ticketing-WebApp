/* //This is the ticket details page where user can see ticket details and purchase the ticket
//This shows ticket title, price and a purchase button
//purchase button makes a request to create an order for this ticket

import useRequest from '../../hooks/use-request'; //Importing the custom hook to make API requests
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: `/api/orders`, //API endpoint to create an order
    method: 'post',
    body: {
      ticketId: ticket.id, //Sending the ticket ID in the request body
    },
    onSuccess: () =>
      Router.push('/orders/[orderId]', `/orders/${OrderShow.id}`), //Navigate to order experience page on success
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={(e) => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

//We will implement getInitialProps to fetch ticket details to show on this page
TicketShow.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
 */

import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: `/api/orders`,
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
