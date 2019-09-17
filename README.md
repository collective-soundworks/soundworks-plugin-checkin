# `@soundworks/service-checkin`

> The `checkin` service simply assigns a ticket (unique index) to the 
> client among the available ones. The ticket can optionally be associated 
> with coordinates or label according to the server `setup` configuration.

## Install

```sh
npm install --save @soundworks/service-checkin
```

## Usage

### client

#### registering the service

```js
// index.js
import { Client } from '@soundworks/core/client';
import serviceCheckinFactory from '@soundworks/service-checkin/client';

const client = new Client();
client.registerService('checkin', serviceCheckinFactory, {}, []);
```

#### requiring the service 

```js
// MyExperience.js
import { Experience } from '@soundworks/core/client';

class MyExperience extends Experience {
  constructor() {
    super();
    this.checkin = this.require('checkin');
  }

  start() {
    const index = this.checkin.state.get('index');
    const label = this.checkin.state.get('label');
  }
}
```

#### options

### server

#### registering the service

```js
// index.js
import { Server } from '@soundworks/core/server';
import serviceCheckinFactory from '@soundworks/service-checkin/server';

const server = new Server();
server.registerService('platform', serviceCheckinFactory, {
  order: 'ascending',
  capacity: 4,
  labels: ['a', 'b', 'c', 'd'],
}, []);
```

#### requiring the service 

```js
// MyExperience.js
import { Experience } from '@soundworks/core/server';

class MyExperience extends Experience {
  constructor() {
    super();
    this.checkin = this.require('checkin');
  }
}
```

#### options

- `order`: order in which the indexes are attributed to clients, `random` or `ascending` (default)
- `capacity`: number of places that can be attributed
- `labels`: optionnal labels associated with the index

## License

BSD-3-Clause

