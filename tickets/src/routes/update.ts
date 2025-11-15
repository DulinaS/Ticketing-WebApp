import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from '@dulinatickets/common';

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

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
