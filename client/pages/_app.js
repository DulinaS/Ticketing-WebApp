import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <h1>Header! {currentUser.email}</h1>
      <Component {...pageProps} />
    </div>
  );
};

//fetch data during SSR
AppComponent.getInitialProps = async (appContext) => {
  //Current User for Header & Index.js
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  console.log('Fetched currentUser:', data);

  //Set of data we're trying fetch from Individual pages using getInitialProps
  //ex: Landing page
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  //console.log(pageProps);
  pageProps.currentUser = data; // Include currentUser in pageProps

  return {
    pageProps,
    ...data, //This same as data.currentUser
  };
};

export default AppComponent;
