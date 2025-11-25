import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/orders', async (req: Request, res: Response) => {
  //Just give all the orders for a user
  res.send({});
});

export { router as indexOrderRouter };
