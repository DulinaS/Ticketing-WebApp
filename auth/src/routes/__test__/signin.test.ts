import request from 'supertest';
import { app } from '../../app';

//Test case for checking its a authenticated email (signed up email)
it('fails when a email that does not exist is suuplied', async () => {
  await request(app)
    .post('/api/users/signin') //In signin its defined how to check the email is signed up one or not we're just sending test info to it
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

//In here we have to first check whether its a signed up email to check the pasword is correctness
//using await tell to wait until first request complete before trying next
it('fails when an incorrect password is supplied', async () => {
  //First we have to be signed up to check for password validity
  await request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com', // Sending a dummy email for signup
      password: 'password', // Sending a dummy password for signup
    })
    .expect(201); // Expect the response status code to be 201 (Created)

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'dbvhjdsbhvd', //incorrect password
    })
    .expect(400);
});

//Check cookie after successful signup and signin
it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com', // Sending a dummy email for signup
      password: 'password', // Sending a dummy password for signup
    })
    .expect(201); // Expect the response status code to be 201 (Created)

  //After signin a response is sent to user
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password', //correct password
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
