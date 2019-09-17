import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';


class PlayerExperience extends Experience {
  constructor(client, options = {}, emulate = false) {
    super(client);

    this.checkinAscending = this.require('checkin-ascending');
    this.checkinRandom = this.require('checkin-random');

    const $mainContainer = document.querySelector('#container');

    if (emulate === true) { // emulated client
      this.$container = document.createElement('div');
      $mainContainer.appendChild(this.$container);
      this.$container.style.width = '250px';
      this.$container.style.height = '300px';
      this.$container.style.float = 'left';
    } else {
      this.$container = $mainContainer;
    }

    this.renderApp();

    this.client.serviceManager.observe(status => {
      if (status['checkin-random'] === 'ready') {
        this.renderApp(status, this.checkinRandom.state.getValues());
      } else {
        this.renderApp(status);
      }
    });
  }

  start() {
    super.start();

    this.renderApp(
      this.checkinAscending.state.getValues(),
      this.checkinRandom.state.getValues()
    );
  }

  renderApp(asc, rand) {
    render(html`
      <div>
        <h3 style="padding: 20px">${this.client.id !== null ? `client id: ${this.client.id}` : ''}</h3>
        <pre style="padding: 20px; font-size: 11px;"><code style="padding: 20px">
${JSON.stringify(asc, null, 2)}
${JSON.stringify(rand, null, 2)}
        </code><pre>
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
