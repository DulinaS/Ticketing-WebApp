import axios from 'axios';

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  //axios.get('/api/users/currentuser');
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async ({ req }) => {
  //Window is obejct that exisits only on browser
  if (typeof window === 'undefined') {
    //If undefined we are on server
    /* Request should be made to http://SERVICENAME.NAMESPACE/api/users/currentuser */
    const { data } = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        headers: req.headers,
      }
    );

    return data;
  } else {
    //In browser--> Navigating to another page
    //If window defined, we are in browser
    // Requests can be made with base url of ''
    const { data } = await axios.get('/api/users/currentuser');

    //Return Current userS
    return data;
  }
  return {};
};

export default LandingPage;

/* axios.get('/api/users/currentuser').catch((err) => {
    console.log(err.message);
  }); */
