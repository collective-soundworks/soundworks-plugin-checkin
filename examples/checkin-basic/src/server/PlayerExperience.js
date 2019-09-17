import { Experience } from '@soundworks/core/server';

class PlayerExperience extends Experience {
  constructor(server, clientTypes, options = {}) {
    super(server, clientTypes);

    this.checkinAscending = this.require('checkin-ascending');
    this.checkinRandom = this.require('checkin-random');
  }

  start() {
    super.start();
  }

  enter(client) {
    super.enter(client);

    const clientCheckinAscending = this.checkinAscending.states.get(client.id);
    const clientCheckinRandom = this.checkinRandom.states.get(client.id);

    console.log(client.id,
      'ascending:', clientCheckinAscending.getValues(),
      'random:', clientCheckinRandom.getValues()
    );
  }

  exit(client) {
    super.exit(client);
  }
}

export default PlayerExperience;
