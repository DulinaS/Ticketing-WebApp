const LandingPage = ({ color }) => {
  console.log('I am in the component', color); // Logs the color data received
  return <h1>Landing Page</h1>; // Renders the landing page with the color data
};

LandingPage.getInitialProps = () => {
  console.log('I am on the server'); // Logs when the server-side code is executed

  return { color: 'red' }; // Returns the data (color) that will be passed to the component
};

export default LandingPage;
