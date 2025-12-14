import express, { Request, Response } from 'express';
import { Ticket } from '../models/tickets';

const router = express.Router();

//Gives all the tickets which are not reserved so that user can book them
router.get('/api/tickets', async (req: Request, res: Response) => {
  //Just give all the tikcets
  const tickets = await Ticket.find({
    //Only fetch tickets which are not reserved
    orderId: undefined,
  });

  res.send(tickets);
});

export { router as indexTicketRouter };
