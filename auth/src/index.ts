import express from 'express';
import {json} from 'body-parser';

//This is a named import, so we can import it in the index.ts file
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';


const app = express();
app.use(json());

//Routes from the routes folder
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);


app.listen(3000, () => {
  console.log('Auth service listening on port 3000!!');
});
