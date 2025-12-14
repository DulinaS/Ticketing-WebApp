const OrderIndex = ({ orders }) => {
  const orderList = orders.map((order) => {
    return (
      <ul key={order.id}>
        {orders.map((order) => {
          return (
            <li key={order.id}>
              <p>Order ID: {order.id}</p>
              <p>Ticket: {order.ticket.title}</p>
              <p>Price: {order.ticket.price}</p>
              <Link
                href="/tickets/[ticketId]"
                as={`/tickets/${order.ticket.id}`}
              >
                View Ticket
              </Link>
            </li>
          );
        })}
      </ul>
    );
  });

  return (
    <div>
      <h1>Your Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Ticket</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{orderList}</tbody>
      </table>
    </div>
  );
};
OrderIndex.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/orders');
  return { orders: data };
};
export default OrderIndex;
