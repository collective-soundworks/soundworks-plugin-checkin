
const serviceFactory = function(Service, Parameters) {
  return class Checkin extends Service {
    constructor(client, name, options) {
      super(client, name);

      // we don't have client-side options here
      const defaults = {};

      this.configure(defaults);
    }

    async start() {
      super.start();

      this.state = await this.client.stateManager.create(`s:${this.name}`);
      this.started();

      const unsubscribe = this.state.subscribe(({ index, label }) => {
        if (index !== null) {
          this.ready();
        } else {
          this.error();
        }

        unsubscribe();
      });
    }
  }
}

// not mandatory
serviceFactory.defaultName = 'checkin';

export default serviceFactory;
