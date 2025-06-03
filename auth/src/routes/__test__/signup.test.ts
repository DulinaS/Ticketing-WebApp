import request from 'supertest'; // Import supertest to make HTTP requests in tests
import { app } from '../../app'; // Import the Express app to test its routes

// Define a test case to check user signup functionality
it('returns a 201 on successful signup', async () => {
  // Make a POST request to the signup endpoint with dummy user data
  return request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com', // Sending a dummy email for signup
      password: 'password', // Sending a dummy password for signup
    })
    .expect(201); // Expect the response status code to be 201 (Created)
});

//Define a test case to check user signup with invalid email
it('return a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'testtestcom', // Sending a dummy invalid email for signup
      password: 'password', // Sending a dummy password for signup
    })
    .expect(400); // Expect the response status code to be 400
});

//Define a test case to check user signup with invalid password
it('return a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com', // Sending a dummy  email for signup
      password: '44', // Sending a dummy invalid password for signup
    })
    .expect(400); // Expect the response status code to be 400
});

//Define a test case to check user signup with empty email & password
it('return a 400 with missing email & passowrd', async () => {
  return request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: '', // Sending a dummy empty email for signup
      password: '4', // Sending a dummy empty password for signup
    })
    .expect(400); // Expect the response status code to be 400
});

// Using 'await' ensures that the first request completes before moving on
//Define a test case to check duplicate emails
it('dissallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com', // Sending a test email for signup
      password: 'password', // Sending a test password for signup
    })
    .expect(201);

  //Tries to signup with same email but returns a error---> in signup.ts we have defined it
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com', // Using the same email as before
      password: 'password', // Using the same password as before
    })
    .expect(400); // Expect an error response (HTTP 400) due to duplicate email
});

// Test to check if a cookie is set after a successful signup
it('sets a cookie after succcesful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup') // The route to create a new user
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  // Check that the response includes a 'Set-Cookie' header
  expect(response.get('Set-Cookie')).toBeDefined();
});
