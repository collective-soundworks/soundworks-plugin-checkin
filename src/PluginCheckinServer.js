const pluginFactory = function(Plugin) {
  /**
   * Server-side representation of the soundworks' checkin plugin.
   */
  class PluginCheckinServer extends Plugin {
    constructor(server, id, options = {}) {
      super(server, id);

      const defaults = {
        order: 'ascending', // ['ascending', 'random']
        capacity: Infinity,
        data: [],
      };

      this.options = Object.assign(defaults, options);

      if (this.options.order !== 'ascending' && this.options.order !== 'random') {
        throw new TypeError(`[soundworks:plugin-checkin] Invalid value (${this.options.order}) for "order" option, should be "ascending" or "random"`);
      }

      if (options.capacity < 1) {
        throw new TypeError(`[soundworks:plugin-checkin] Invalid value (${this.options.capacity}) for "capacity" option, should be strictly positive or Infinity`);
      }

      // clamp capacity to given data
      const numData = this.options.data.length > 0 ? this.options.data.length : Infinity;

      if (numData < this.options.capacity) {
        this.options.capacity = Math.min(this.options.capacity, numData);
        console.warn(`[${this.name}] capacity cropped to number of data: ${numData}`);
      }

      if (this.options.order === 'random' && this.options.capacity === Infinity) {
        throw new Error(`[${this.name}] Invalid "capacity": must be finite when "order" is set to "random"`);
      }

      this._availableIndices = []; // array of available indices
      this._nextAscendingIndex = 0; // next index when _availableIndices is empty
      this._clientIndexMap = new Map();
    }

    /** @private */
    async start() {
      await super.start();
    }

    /** @private */
    async stop()  {
      await super.stop();
    }

    /** @private */
    addClient(client) {
      super.addClient(client);

      client.socket.addListener(`sw:plugin:${this.id}:req`, () => {
        client.socket.removeAllListeners(`sw:plugin:${this.id}:req`);
        // set client index
        const { capacity, order, data } = this.options;
        let index = null;
        let datum = null;

        if (order === 'random') {
          index = this._getRandomIndex();
        } else {
          index = this._getAscendingIndex();
        }

        if (index !== null && data[index]) {
          datum = data[index];
        }

        this._clientIndexMap.set(client, index);

        client.socket.send(`sw:plugin:${this.id}:res`, index, datum);
      });
    }

    /** @private */
    removeClient(client) {
      const index = this._clientIndexMap.get(client);
      this._clientIndexMap.delete(client);
      this._releaseIndex(index);

      super.removeClient(client);
    }

    /** @private */
    _getRandomIndex() {
      for (let i = this._nextAscendingIndex; i < this.options.capacity; i++) {
        this._availableIndices.push(i);
      }

      this._nextAscendingIndex = this.options.capacity;
      const numAvailable = this._availableIndices.length;

      if (numAvailable > 0) {
        const random = Math.floor(Math.random() * numAvailable);
        return this._availableIndices.splice(random, 1)[0];
      }

      return null;
    }

    /** @private */
    _getAscendingIndex() {
      if (this._availableIndices.length > 0) {
        this._availableIndices.sort((a, b) => a - b);
        return this._availableIndices.splice(0, 1)[0];
      } else if (this._nextAscendingIndex < this.options.capacity) {
        return this._nextAscendingIndex++;
      }

      return null;
    }

    /** @private */
    _releaseIndex(index) {
      if (Number.isInteger(index)) {
        this._availableIndices.push(index);
      }
    }
  }

  return PluginCheckinServer;
};

export default pluginFactory;
