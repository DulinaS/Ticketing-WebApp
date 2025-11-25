import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@dulinatickets/common';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //create a new order
    res.send({});
  }
);

export { router as createOrderRouter };
