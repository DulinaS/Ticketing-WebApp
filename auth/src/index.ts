import express from 'express';
import { json } from 'body-parser';

//This is a named import, so we can import it in the index.ts file
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';
import { errorHandler } from './middlewares/error_handler';

const app = express();
app.use(json());

//Routes from the routes folder
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

//Error handler middleware
app.use(errorHandler);
//This is a middleware that will handle any errors that occur in the application

app.listen(3000, () => {
  console.log('Auth service listening on port 3000!!!');
});
