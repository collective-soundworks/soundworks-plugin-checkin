import '@babel/polyfill';
import 'source-map-support/register';

import { Server } from '@soundworks/core/server';
import getConfig from './utils/getConfig';

import assert from 'assert';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import checkinServiceFactory from '@soundworks/service-checkin/server';
import PlayerExperience from './PlayerExperience';

const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
const pid = process.pid;

console.log(`
---------------------------------------------------------------------------
- running "${config.app.name}" application (env: "${ENV}", process: ${pid})
---------------------------------------------------------------------------
`);

(async function launch() {
  try {
    const server = new Server();

    // test options parsing
    server.registerService('checkin-test-1', checkinServiceFactory, {
      capacity: Infinity,
      order: 'ascending',
    }, []);

    server.registerService('checkin-test-2', checkinServiceFactory, {
      capacity: Infinity,
      order: 'ascending',
      labels: ['a', 'b', 'c', 'd'],
    }, []);

    server.registerService('checkin-test-3', checkinServiceFactory, {
      capacity: -1,
      order: 'random',
      labels: ['a', 'b', 'c', 'd'],
    }, []);

    server.registerService('checkin-test-4', checkinServiceFactory, {
      capacity: Infinity,
      order: 'niap',
    }, []);

    // test with clients
    server.registerService('checkin-ascending', checkinServiceFactory, {
      capacity: 5,
      order: 'ascending',
      labels: ['A', 'B', 'C', 'D', 'E', 'F']
    }, []);

    server.registerService('checkin-random', checkinServiceFactory, {
      capacity: 10,
      order: 'random',
    }, []);

    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: { name: config.app.name },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          assetsDomain: config.env.assetsDomain,
        }
      };
    });

    console.log('> assert configuration options');
    const checkin1 = server.serviceManager.get('checkin-test-1');
    const checkin2 = server.serviceManager.get('checkin-test-2');
    const checkin3 = server.serviceManager.get('checkin-test-3');
    const checkin4 = server.serviceManager.get('checkin-test-4');

    assert.equal(checkin1.options.capacity, Infinity);
    assert.equal(checkin1.options.order, 'ascending');
    assert.deepEqual(checkin1.options.labels, []);

    assert.equal(checkin2.options.capacity, 4);
    assert.equal(checkin2.options.order, 'ascending');
    assert.deepEqual(checkin2.options.labels, ['a', 'b', 'c', 'd']);

    assert.equal(checkin3.options.capacity, 4);
    assert.equal(checkin3.options.order, 'random');
    assert.deepEqual(checkin3.options.labels, ['a', 'b', 'c', 'd']);

    assert.equal(checkin4.options.capacity, Infinity);
    assert.equal(checkin4.options.order, 'ascending');
    assert.deepEqual(checkin4.options.labels, []);
    console.log('------------------------------------------------------');


    // html template and static files (in most case, this should not be modified)
    server.configureHtmlTemplates({ compile }, path.join('.build', 'server', 'tmpl'))
    server.router.use(serveStatic('public'));
    server.router.use('build', serveStatic(path.join('.build', 'public')));

    const playerExperience = new PlayerExperience(server, 'player');

    await server.start();
    playerExperience.start();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});
