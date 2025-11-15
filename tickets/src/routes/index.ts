import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  //Just give all the tikcets
  const tickets = await Ticket.find({});

  res.send(tickets);
});

export { router as indexTicketRouter };
