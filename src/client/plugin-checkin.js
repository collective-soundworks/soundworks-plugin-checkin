
const serviceFactory = function(Service, Parameters) {
  return class Checkin extends Service {
    constructor(client, name, options) {
      super(client, name);

      const defaults = {};

      this.configure(defaults);
    }

    async start() {
      this.started();

      this.client.socket.addListener(`s:${this.name}:init-values:response`, async (index, data) => {
        if (index === null) {
          this.error();
        } else {
          this.state = await this.client.stateManager.create(`s:${this.name}`, { index, data });
          this.ready();
        }
      });

      this.client.socket.send(`s:${this.name}:init-values:request`);
    }

    getValues() {
      return this.state.getValues();
    }

    get(name) {
      return this.state.get(name);
    }
  }
}

export default serviceFactory;
