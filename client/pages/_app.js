import 'bootstrap/dist/css/bootstrap.css';

//When ever we go to a page in pages, this adds styling to it
export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
