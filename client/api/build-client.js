/* import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    //We are on server
    //During SSR, requests should be made to ingress-nginx service
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    //We are on browser
    // /---> base URL -> ticketing.dev
    return axios.create({
      baseURL: '/',
    });
  }
}; */

import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on server - use ingress-nginx controller
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: {
        ...req?.headers,
        Host: 'ticketing.dev',
      },
    });
  }

  // Browser
  return axios.create({ baseURL: '/' });
};
