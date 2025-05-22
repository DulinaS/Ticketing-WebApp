import express from 'express';
import {json} from 'body-parser';

//This is a named import, so we can import it in the index.ts file
//This imports a router object from the current-user.ts file
import { currentUserRouter } from './routes/current-user';

const app = express();
app.use(json());

//Route from the current-user.ts file
app.use(currentUserRouter);

app.listen(3000, () => {
  console.log('Auth service listening on port 3000!!');
});
