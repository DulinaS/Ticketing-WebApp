import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/orders', async (req: Request, res: Response) => {
  //create a new order
  res.send({});
});

export { router as showOrderRouter };
