import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

//This AppComponent is a top level component that wraps all other components
//It allows us to do things like persisting state or add a header/footer that shows on all pages
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />

      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};
//pageProps is what's returned from individual pages' getInitialProps
//What it does is it allows us to run some code before any page is rendered

//fetch data during SSR
AppComponent.getInitialProps = async (appContext) => {
  //Current User for Header & Index.js
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  //Set of data we're trying fetch from Individual pages using getInitialProps
  //ex: Landing page
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  /* //console.log(pageProps);
  pageProps.currentUser = data; // Include currentUser in pageProps */

  return {
    pageProps,
    ...data, //This same as data.currentUser
  };
};

export default AppComponent;
