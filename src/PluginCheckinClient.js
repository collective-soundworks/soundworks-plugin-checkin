const pluginFactory = function(Plugin) {
  /**
   * Client-side representation of the soundworks' checkin plugin.
   */
  class PluginCheckinClient extends Plugin {
    constructor(client, id, options) {
      super(client, id);

      const defaults = {};

      this.options = Object.assign(defaults, options);

      this._state = {
        index: null,
        data: null,
      };
    }

    /** @private */
    async start() {
      await super.start();

      return new Promise((resolve, reject) => {
        this.client.socket.addListener(`sw:plugin:${this.id}:res`, async (index, data) => {
          if (index === null) {
            throw new Error(`[soundworks:plugin-checkin] Could not retrieve index`);
          } else {
            this._state.index = index;
            this._state.data = data;
            resolve();
          }
        });

        this.client.socket.send(`sw:plugin:${this.id}:req`);
      });
    }

    /**
     * Return the unique index given to the client
     * @return {number}
     */
    getIndex() {
      return this._state.index;
    }

    /**
     * Return the associated data given to the client (if any)
     * @return {mixed}
     */
    getData() {
      return this._state.data;
    }
  }

  return PluginCheckinClient;
};

export default pluginFactory;

