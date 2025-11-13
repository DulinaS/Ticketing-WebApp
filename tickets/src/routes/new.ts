//Responsible for creating a new ticket
import express, { Request, Response } from 'express';
import { requireAuth } from '@dulinatickets/common';

const router = express.Router();

//requireAuth middleware is applied
//If only authorized then goes to next route handler and send status code
router.post('/api/tickets', requireAuth, (req: Request, res: Response) => {
  res.sendStatus(200);
});

export { router as createTicketRouter };
