import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@dulinatickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { OrderCancelledPublisherKafka } from '../events/publishers/order-cancelled-publisher-kafka';
import { natsWrapper } from '../nats-wrapper';
import { kafkaWrapper } from '../kafka-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    //If order not found, throw error
    if (!order) {
      throw new NotFoundError();
    }
    //Make sure order belongs to the user making the request
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    //Prepare event data
    const eventData = {
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    };

    //Publish to Kafka (new system)
    await new OrderCancelledPublisherKafka(kafkaWrapper.producer).publish(
      eventData
    );

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
