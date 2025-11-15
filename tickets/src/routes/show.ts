//Responsible for creating a new ticket
import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';
import { NotFoundError } from '@dulinatickets/common';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  //We have to validate the user id first
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new NotFoundError();
  }

  const ticket = await Ticket.findById(req.params.id);
  //Returns ticket or NULL

  if (!ticket) {
    throw new NotFoundError();
  }

  //If ticket exist send it - default status code 200
  res.send(ticket);
});

export { router as showTicketRouter };
