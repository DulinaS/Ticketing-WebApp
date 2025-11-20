//Fake implementation that JEST will use to create the initialized nats client
export const natsWrapper = {
  //Client with a publish function that does nothing but calls the callback
  //Callback is called to simulate successful publishing
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};
