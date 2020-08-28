# `@soundworks/plugin-checkin`

> [`soundworks`](https://github.com/collective-soundworks/soundworks) plugin for assigning a ticket (unique index) to the client among the available ones. The number of available tickets can be limited and tickets can be associated with additional data.

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Example](#example)
- [Usage](#usage)
  * [Server installation](#server-installation)
    + [Registering the plugin](#registering-the-plugin)
    + [Requiring the plugin](#requiring-the-plugin)
  * [Client installation](#client-installation)
    + [Registering the plugin](#registering-the-plugin-1)
    + [Requiring the plugin](#requiring-the-plugin-1)
  * [Accessing index and data client side](#accessing-index-and-data-client-side)
- [Credits](#credits)
- [License](#license)

<!-- tocstop -->

## Installation

```sh
npm install @soundworks/plugin-checkin --save
```

## Example

A working example can be found in the [https://github.com/collective-soundworks/soundworks-examples](https://github.com/collective-soundworks/soundworks-examples) repository.

## Usage

### Server installation

#### Registering the plugin

```js
// index.js
import { Server } from '@soundworks/core/server';
import pluginCheckinFactory from '@soundworks/plugin-checkin/server';

const server = new Server();
server.pluginManager.register('checkin', pluginCheckinFactory, {
  // order in which the tickets are assigned
  // defaults to 'ascending'
  order: 'random',
  // number of tickets that can be delivered, must be defined
  // if order is set to random
  capacity: 4,
  // data associated to each delivered index, if capacity is not defined
  // or data.length < capacity, capacity is set to data.length
  data: ['a', 'b', 'c', 'd'],
}, []);
```

#### Requiring the plugin

```js
// MyExperience.js
import { AbstractExperience } from '@soundworks/core/server';

class MyExperience extends AbstractExperience {
  constructor(server, clientType) {
    super(server, clientType);
    // require plugin in the experience
    this.checkin = this.require('checkin');
  }
}
```

### Client installation

#### Registering the plugin

```js
// index.js
import { Client } from '@soundworks/core/client';
import pluginCheckinFactory from '@soundworks/plugin-checkin/client';

const client = new Client();
client.pluginManager.register('checkin', pluginCheckinFactory, {}, []);
```

#### Requiring the plugin

```js
// MyExperience.js
import { Experience } from '@soundworks/core/client';

class MyExperience extends Experience {
  constructor(client) {
    super(client);
    // require plugin in the experience
    this.checkin = this.require('checkin');
  }
}
```

### Accessing index and data client side

The following API is only available client-side

```js
const { index, data } = this.checkin.getValues();
// or individually
const index = this.checkin.get('index');
const data = this.checkin.get('data');
```

## Credits

The code has been initiated in the framework of the WAVE and CoSiMa research projects, funded by the French National Research Agency (ANR).

## License

BSD-3-Clause
