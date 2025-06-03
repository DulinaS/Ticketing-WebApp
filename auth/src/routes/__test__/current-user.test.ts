import request from 'supertest';
import { app } from '../../app';

it('Responds with details about the current user', async () => {
  //First need to be signedup/ authenticated with app
  //In this when signed up a cookie is sent to the user
  //That cookie is needed to get the current user

  //In setup.ts we have a method to make authenticated followup requests
  //It returns a cookie, using that we can make authenticated requests

  const cookie = await global.signin();
  if (!cookie) {
    throw new Error('Cookie not set after signup');
  }
  // Make an authenticated request to get current user details
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  // Assert that the current user's email matches the one used during signup
  expect(response.body.currentUser.email).toEqual('test@test.com');
});

/*
//Remove 'requireAuth' in current-user route path in order to this to work.
it('responds with null if not authenticated', async () => {
  // Send a request to get current user details without any authentication (no cookie)
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  // Assert that if the user is not authenticated, the response body is null
  expect(response.body.currentUser).toEqual(null);
});
*/
