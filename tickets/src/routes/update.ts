import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@dulinatickets/common';
import { TicketUpdatedPublisherKafka } from '../events/publishers/ticket-updated-publisher-kafka';
import { kafkaWrapper } from '../kafka-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided an must be greater than 0'),
  ],
  validateRequest, //According to the above criteria we chcek using this middleware
  async (req: Request, res: Response) => {
    //Returns ticket or NULL
    const ticket = await Ticket.findById(req.params.id);

    //No Ticket Found
    if (!ticket) {
      throw new NotFoundError();
    }

    //Check if the ticket is reserved
    if (ticket.orderId) {
      throw new BadRequestError('Cannot update a reserved Ticket'); //Cannot edit a reserved ticket
    }

    //Check the request userId and ticket's userID equal
    //If yes -> Allow modify
    //If not throw a not authorozed error
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    //Apply the update to ticket
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    //Save to mongodb database
    await ticket.save();
    console.log('Updated ticket:', ticket);

    //Prepare event data
    const eventData = {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    };

    //Publish to Kafka
    await new TicketUpdatedPublisherKafka(kafkaWrapper.producer).publish(
      eventData
    );

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
