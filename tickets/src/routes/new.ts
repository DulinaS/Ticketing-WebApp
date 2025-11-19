//Responsible for creating a new ticket
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '@dulinatickets/common';
import { validateRequest } from '@dulinatickets/common';
import { Ticket } from '../models/tickets';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

//requireAuth middleware is applied
//If only authorized then goes to next route handler and send status code
router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest, //Check the request format
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id, //We get the userId from the currentUser middleware
      //Current user is avalilable or not is checked in requireAuth middleware
    });

    await ticket.save(); //Save the ticket to the database

    //Publish an event saying that a ticket was created
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket); //201 is the status code for created
  }
);

export { router as createTicketRouter };
