import { assert } from 'chai';

import { Server } from '@soundworks/core/server.js';
import { Client } from '@soundworks/core/client.js';

import ServerPluginCheckin from '../src/ServerPluginCheckin.js';
import ClientPluginCheckin from '../src/ClientPluginCheckin.js';

const config = {
  app: {
    name: 'test-plugin-position',
    clients: {
      test: {
        runtime: 'node',
      },
    },
  },
  env: {
    port: 8080,
    serverAddress: '127.0.0.1',
    useHttps: false,
    verbose: false,
  },
};

describe('# PluginCheckin', () => {
  it(`order ascending`, async () => {
    const server = new Server(config);
    server.pluginManager.register('checkin', ServerPluginCheckin);
    await server.start();

    const client1 = new Client({ role: 'test', ...config });
    client1.pluginManager.register('checkin', ClientPluginCheckin);
    await client1.start();

    {
      const checkin = await client1.pluginManager.get('checkin');
      const index = checkin.getIndex();
      const data = checkin.getData();
      assert.equal(index, 0);
      assert.equal(data, null);
    }

    const client2 = new Client({ role: 'test', ...config });
    client2.pluginManager.register('checkin', ClientPluginCheckin);
    await client2.start();

    {
      const checkin = await client2.pluginManager.get('checkin');
      const index = checkin.getIndex();
      assert.equal(index, 1);
    }

    // client1 disconnect
    await client1.stop();

    const client3 = new Client({ role: 'test', ...config });
    client3.pluginManager.register('checkin', ClientPluginCheckin);
    await client3.start();

    {
      // should get index 0 as it has been released by clientA
      const checkin = await client3.pluginManager.get('checkin');
      const index = checkin.getIndex();
      assert.equal(index, 0);
    }

    await client2.stop();
    await client3.stop();
    await server.stop();
  });

  it(`options`, async () => {
    const server = new Server(config);
    server.pluginManager.register('checkin', ServerPluginCheckin, {
      capacity: 2,
      data: [{ color: 'green' }, { color: 'yellow' }],
    });
    await server.start();

    const client1 = new Client({ role: 'test', ...config });
    client1.pluginManager.register('checkin', ClientPluginCheckin);
    await client1.start();

    {
      const checkin = await client1.pluginManager.get('checkin');
      const index = checkin.getIndex();
      const data = checkin.getData();
      assert.equal(index, 0);
      assert.deepEqual(data, { color: 'green' });
    }

    const client2 = new Client({ role: 'test', ...config });
    client2.pluginManager.register('checkin', ClientPluginCheckin);
    await client2.start();

    {
      const checkin = await client2.pluginManager.get('checkin');
      const index = checkin.getIndex();
      const data = checkin.getData();
      assert.equal(index, 1);
      assert.deepEqual(data, { color: 'yellow' });
    }

    const client3 = new Client({ role: 'test', ...config });
    client3.pluginManager.register('checkin', ClientPluginCheckin);

    try {
      await client3.start();
    } catch (err) {
      console.log(err.message);
    }

    await client1.stop();
    await client2.stop();
    await server.stop();
  });
});
