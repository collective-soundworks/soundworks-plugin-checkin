import '@babel/polyfill';
import isMobile from 'is-mobile';
// import { Client } from '@soundworks/core/client';
import * as soundworks from '@soundworks/core/client';
import { Client } from '@soundworks/core/client';

import checkinServiceFactory from '@soundworks/service-checkin/client';

import PlayerExperience from './PlayerExperience';

async function init(emulate = false) {
  try {
    const client = new soundworks.Client();

    client.registerService('checkin-ascending', checkinServiceFactory, {}, []);
    client.registerService('checkin-random', checkinServiceFactory, {}, []);

    const config = window.soundworksConfig;
    await client.init(config);

    const playerExperience = new PlayerExperience(client, config, emulate);

    document.body.classList.remove('loading');

    await client.start()
    playerExperience.start();

    // hardcore QoS
    client.socket.addListener('close', () => {
      setTimeout(() => window.location.reload(true), 2000);
    });
  } catch(err) {
    console.error(err);
  }
}

window.addEventListener('load', () => {
  if (isMobile()) {
    init();
  } else {
    for (let i = 0; i < 10; i++) { init(true); }
  }
});

// hardcore QoS
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.location.reload(true);
  }
}, false);
