/// <reference path="../typedef.d.ts"/>
import ky from 'https://unpkg.com/ky@0.31.1';

const API_URL = {
  Communication: 'http://localhost:8881/',
  GamesService: 'http://localhost:8882/',
  WebHooks: 'http://localhost:9999/',
  DataBase: 'http://localhost:10000/',
  Subscribers: 'http://localhost:10001/',
  SlashCommands: 'http://localhost:10002/',
  Payment: 'http://localhost:10100/',
};

const API_ROUTE = {
  fullState: 'system/interactions/full',
  restart: 'system/interactions/restart',
  technicalWork: 'system/interactions/technicalWork/',
};

const kyBase = ky.extend({
  mode: 'no-cors',
});

const API = {
  Communication: {
    getFullStatus: () => kyBase.get(API_URL.Communication + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.Communication + API_ROUTE.restart),
    /**
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.Communication + API_ROUTE.technicalWork + state),
  },
  GamesService: {
    getFullStatus: () => kyBase.get(API_URL.GamesService + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.GamesService + API_ROUTE.restart),
    /**
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.GamesService + API_ROUTE.technicalWork + state),
  },
  WebHooks: {
    getFullStatus: () => kyBase.get(API_URL.WebHooks + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.WebHooks + API_ROUTE.restart),
    /**
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.WebHooks + API_ROUTE.technicalWork + state),
  },
  DataBase: {
    getFullStatus: () => kyBase.get(API_URL.DataBase + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.DataBase + API_ROUTE.restart),
    /**
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.DataBase + API_ROUTE.technicalWork + state),
  },
  Subscribers: {
    getFullStatus: () => kyBase.get(API_URL.Subscribers + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.Subscribers + API_ROUTE.restart),
    /**buildService
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.Subscribers + API_ROUTE.technicalWork + state),
  },
  SlashCommands: {
    getFullStatus: () => kyBase.get(API_URL.SlashCommands + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.SlashCommands + API_ROUTE.restart),
    /**buildService
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.SlashCommands + API_ROUTE.technicalWork + state),
  },
  Payment: {
    getFullStatus: () => kyBase.get(API_URL.Payment + API_ROUTE.fullState).json(),
    restart: () => kyBase.post(API_URL.Payment + API_ROUTE.restart),
    /**
     * @param {boolean} state
     */
    setTechnicalWork: state => kyBase.post(API_URL.Payment + API_ROUTE.technicalWork + state),
  },
};

function html(strings, ...values) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = String.raw({ raw: strings }, ...values);
  return wrapper.children[0];
}

/**
 *
 * @param {keyof typeof API} type
 */
function Service(type) {
  // src="https://cdn.discordapp.com/avatars/574514950215696386/d19b6be7d4eb271514e9ba7b4d0695db.png?size=2048"
  const state = {
    techWorkingStatus: null,
  };

  const service = html`
    <div class="service" type="${type}">
      <div class="service-left">
        <img
          width="100"
          height="100"
          src="https://cdn.discordapp.com/attachments/748413382142722130/750009283646849104/logo.png"
        />
        <p>${type}</p>
        <p>Status: <span class="service-status loading">Loading...</span></p>
      </div>
      <div class="service-right">
        <button name="restart" loading>Restart</button>
        <button name="technicalWork" loading>Tech-Working</button>
      </div>
    </div>
  `;

  const serviceStatus = NonNullable(service.querySelector('span.service-status'));
  const restartButton = NonNullable(service.querySelector('button[name="restart"]'));
  const technicalWorkButton = NonNullable(service.querySelector('button[name="technicalWork"]'));

  restartButton.addEventListener('click', event => {
    restartButton.setAttribute('loading', 'true');
    API[type].restart().finally(() => {
      restartButton.removeAttribute('loading');
      checkStatus();
    });
  });

  technicalWorkButton.addEventListener('click', event => {
    if (state.techWorkingStatus === null) return;
    technicalWorkButton.setAttribute('loading', 'true');
    API[type].setTechnicalWork(!state.techWorkingStatus).finally(() => updateTechnicalWorkButton());
  });

  function updateTechnicalWorkButton() {
    if (state.techWorkingStatus === null) {
      technicalWorkButton.classList.add('loading');
      technicalWorkButton.innerText = 'Tech-Working';
    } else {
      technicalWorkButton.classList.remove('loading');
      technicalWorkButton.innerText = state.techWorkingStatus
        ? 'Disable Tech-Working'
        : 'Enable Tech-Working';
    }
  }

  async function checkStatus() {
    API[type]
      .getFullStatus()
      .then(response => {
        serviceStatus.classList.remove('loading');
        technicalWorkButton.classList.remove('loading');
        serviceStatus.classList.add('good');
        serviceStatus.innerText = 'Online';

        state.techWorkingStatus = response.technicalWork.status;
        updateTechnicalWorkButton();
      })
      .catch(e => {
        serviceStatus.classList.remove('loading');
        technicalWorkButton.classList.remove('loading');
        serviceStatus.classList.add('bad');
        serviceStatus.innerText = 'Offline';
      });
  }

  checkStatus();
  setInterval(checkStatus, 15 * 1000);

  return service;
}

/**
 * @template T
 * @param {T} value
 * @returns {asserts value is NonNullable<T>}
 */
function AssertNonNullable(value) {
  if (value === null || value === undefined) throw new Error('Value expected to be NonNullable');
}

/**
 * @template T
 * @param {T} value
 * @returns {NonNullable<T>}
 */
function NonNullable(value) {
  return /** @type {NonNullable<T>} */ (value);
}

const rootDiv = document.querySelector('div#root');

AssertNonNullable(rootDiv);

for (const service of /** @type {Array<keyof typeof API>} */ (Object.keys(API))) {
  rootDiv.append(Service(service));
}
