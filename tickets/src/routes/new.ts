//Responsible for creating a new ticket
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '@dulinatickets/common';
import { validateRequest } from '@dulinatickets/common';

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
  (req: Request, res: Response) => {
    res.sendStatus(200);
  }
);

export { router as createTicketRouter };
