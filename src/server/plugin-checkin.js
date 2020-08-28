const schema = {
  index: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  data: {
    type: 'any',
    default: null,
    nullable: true,
  },
};

const pluginFactory = function(AbstractPlugin) {
  return class CheckinPlugin extends AbstractPlugin {
    constructor(server, name, options) {
      super(server, name);

      const defaults = {
        order: 'ascending', // ['ascending', 'random']
        capacity: Infinity,
        infos: [],
      };

      this.options = this.configure(defaults, options);

      this.states = new Map();

      /** @private */
      this._availableIndices = []; // array of available indices
      this._nextAscendingIndex = 0; // next index when _availableIndices is empty
      this.server.stateManager.registerSchema(`s:${this.name}`, schema);
    }

    configure(defaults, options) {
      options = super.configure(defaults, options);

      if (options.order !== 'ascending' && options.order !== 'random') {
        options.order = 'ascending';
      }

      if (options.capacity < 1) {
        options.capacity = Infinity;
      }

      // clamp capacity to given positions and data
      const numData = options.data.length > 0 ? options.data.length : Infinity;

      if (numData < options.capacity) {
        options.capacity = Math.min(options.capacity, numData);
        console.warn(`[${this.name}] capacity cropped to number of data: ${numData}`);
      }

      if (options.order === 'random' && options.capacity === Infinity) {
        throw new Error(`[${this.name}] Invalid "capacity": must be finite when "order" is set to "random"`);
      }

      return options;
    }

    start() {
      this.server.stateManager.observe(async (schemaName, stateId, clientId) => {
        // when a client launches the checkin plugin, it creates a shared state
        if (schemaName === `s:${this.name}`) {
          const state = await this.server.stateManager.attach(schemaName, stateId);

          this.states.set(clientId, state);

          state.onDetach(() => {
            const index = state.get('index');

            this._releaseIndex(index);
            this.states.delete(clientId);
          });

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

          state.set({ index: index, data: datum });
        }
      });

      this.started();
      this.ready();
    }

    connect(client) {
      super.connect(client);
    }

    disconnect(client) {
      super.disconnect(client);
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
}

export default pluginFactory;
