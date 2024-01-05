# `@soundworks/plugin-checkin`

> [`soundworks`](https://github.com/collective-soundworks/soundworks) plugin for assigning a ticket (unique index) to the client among the available ones. The number of available tickets can be limited and tickets can be associated with additional data.

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Server](#server)
  * [Client](#client)
- [API](#api)
  * [Classes](#classes)
  * [PluginCheckinClient](#plugincheckinclient)
  * [PluginCheckinServer](#plugincheckinserver)
- [Credits](#credits)
- [License](#license)

<!-- tocstop -->

## Installation

```sh
npm install @soundworks/plugin-checkin --save
```

## Usage

### Server

```js
// index.js
import { Server } from '@soundworks/core/server.js';
import pluginCheckin from '@soundworks/plugin-checkin/server.js';

const server = new Server();
server.pluginManager.register('checkin', pluginCheckin);
```

### Client

```js
// index.js
import { Client } from '@soundworks/core/client.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js';

const client = new Client();
client.pluginManager.register('checkin', pluginCheckin);

await client.start();

const checkin = await client.pluginManager.get('checkin');
const index = checkin.getIndex();
```

## API

<!-- api -->

### Classes

<dl>
<dt><a href="#PluginCheckinClient">PluginCheckinClient</a></dt>
<dd><p>Client-side representation of the soundworks&#39; checkin plugin.</p>
</dd>
<dt><a href="#PluginCheckinServer">PluginCheckinServer</a></dt>
<dd><p>Server-side representation of the soundworks&#39; checkin plugin.</p>
</dd>
</dl>

<a name="PluginCheckinClient"></a>

### PluginCheckinClient
Client-side representation of the soundworks' checkin plugin.

**Kind**: global class  

* [PluginCheckinClient](#PluginCheckinClient)
    * [.getIndex()](#PluginCheckinClient+getIndex) ⇒ <code>number</code>
    * [.getData()](#PluginCheckinClient+getData) ⇒ <code>mixed</code>

<a name="PluginCheckinClient+getIndex"></a>

#### pluginCheckinClient.getIndex() ⇒ <code>number</code>
Return the unique index given to the client

**Kind**: instance method of [<code>PluginCheckinClient</code>](#PluginCheckinClient)  
<a name="PluginCheckinClient+getData"></a>

#### pluginCheckinClient.getData() ⇒ <code>mixed</code>
Return the associated data given to the client (if any)

**Kind**: instance method of [<code>PluginCheckinClient</code>](#PluginCheckinClient)  
<a name="PluginCheckinServer"></a>

### PluginCheckinServer
Server-side representation of the soundworks' checkin plugin.

**Kind**: global class  

<!-- apistop -->

## Credits

[https://soundworks.dev/credits.html](https://soundworks.dev/credits.html)

## License

[BSD-3-Clause](./LICENSE)
