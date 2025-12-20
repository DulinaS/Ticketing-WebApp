//Create a new charge record for payments service
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from '@dulinatickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { PaymentCreatedPublisherKafka } from '../events/publishers/payment-created-publisher-kafka';
import { natsWrapper } from '../nats-wrapper';
import { kafkaWrapper } from '../kafka-wrapper';

const router = express.Router();

//Create the route handler for creating a new charge
router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('orderId').not().isEmpty().withMessage('OrderId is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    //Find the order in the payments service database
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    //Make sure the order belongs to the user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    //Make sure the order is not cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }
    //Here we would normally create a charge with Stripe
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, //Stripe works with cents
      source: token,
    });

    //If the charge is successful, we can create a payment record in our database
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    const eventData = {
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    };

    //Publish to NATS (OLD - will remove after full migration)
    await new PaymentCreatedPublisher(natsWrapper.client).publish(eventData);

    //Publish to Kafka (NEW)
    await new PaymentCreatedPublisherKafka(kafkaWrapper.producer).publish(
      eventData
    );
    console.log('Payment created event published to Kafka');

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
