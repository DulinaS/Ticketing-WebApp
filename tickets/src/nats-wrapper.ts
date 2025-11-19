import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan; //? means it can be undefined

  //Getter to access the client
  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  //Cluster ID, Client ID, URL needed to connect to NATS(See publisher.ts in NATS-TEST)
  //ClusterID can be seein nats-depl.yaml
  //Getter to access the client
  connect(cluserId: string, clientId: string, url: string) {
    this._client = nats.connect(cluserId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this._client!.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
