const schema = {
  index: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  label: {
    type: 'string',
    default: null,
    nullable: true,
  },
};

/**
 * The `'checkin'` service simply assigns a ticket (unique index) to the client
 * among the available ones. The ticket can optionally be associated with
 * coordinates or label according to the server `setup` configuration.
 */
const serviceFactory = function(Service) {
  return class CheckinService extends Service {
    constructor(server, name, options) {
      super(server, name);

      const defaults = {
        order: 'ascending', // ['ascending', 'random']
        capacity: Infinity,
        labels: [],
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

      // clamp capacity to given positions and labels
      const numLabels = options.labels.length > 0 ? options.labels.length : Infinity;

      if (numLabels < options.capacity) {
        options.capacity = Math.min(options.capacity, numLabels);
        console.warn(`[${this.name}] capacity cropped to number of labels: ${numLabels}`);
      }

      if (options.order === 'random' && options.capacity === Infinity) {
        throw new Error(`[${this.name}] Invalid "capacity": must be finite when "order" is set to "random"`);
      }

      return options;
    }

    start() {
      this.server.stateManager.observe(async (schemaName, clientId) => {
        // when a client launches the checkin service, it creates a shared state
        if (schemaName === `s:${this.name}`) {
          const state = await this.server.stateManager.attach(schemaName, clientId);

          this.states.set(clientId, state);

          state.onDetach(() => {
            const index = state.get('index');

            this._releaseIndex(index);
            this.states.delete(clientId);
          });

          // set client index
          const { capacity, order, labels } = this.options;
          let index = null;
          let label = null;

          if (order === 'random') {
            index = this._getRandomIndex();
          } else {
            index = this._getAscendingIndex();
          }

          if (index !== null && labels[index]) {
            label = labels[index];
          }

          state.set({ index, label });
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

// not mandatory
serviceFactory.defaultName = 'default-service-name';

export default serviceFactory;
