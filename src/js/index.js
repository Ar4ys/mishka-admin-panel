import { defaultServiceAvatarURL, offlineImgURL, onlineImgURL } from './constants.js';
import { FullServiceStateList, html, Restart, SetTechnicalWork, Uptime } from './utils.js';

/**
 * @param {string} id
 * @param {StatusResponse[string]} response
 */
function Service(id, response) {
  const { status, data } = response || {};
  const { uptime, memory } = data || {};

  const state = {
    /**
     * @type {boolean | null}
     */
    techWorkingStatus: null,
  };

  const statusClass = status === null ? 'loading' : status ? 'online' : 'offline';

  const formattedUptime = Uptime(uptime || 0);
  const formattedMemory = Math.round((memory?.rss / 1024 / 1024) * 100) / 100 || 0;
  const service = html`
    <div class="service-panel" type="${id}">
      <div class="service-panel-left">
        <div class="service-panel-avatar">
          <div class="avatar">
            <img width="100" height="100" src="${defaultServiceAvatarURL}" />
          </div>
          <div class="status ${statusClass}"></div>
        </div>
        <div class="service-panel-name">
          <div class="title">
            <p>${id}</p>
          </div>
          <div class="subtitle">
            <p>${formattedUptime} • ${formattedMemory} MB</p>
          </div>
        </div>
      </div>
      <div class="service-panel-right">
        <div class="service-panel-restart">
          <button name="restart">Restart</button>
        </div>
        <div class="service-panel-tw">
          <button name="technicalWork">Enable Tech-Working</button>
        </div>
      </div>
    </div>
  `;

  // const serviceStatus = NonNullable(service.querySelector('span.service-status'));
  const restartButton = NonNullable(service.querySelector('button[name="restart"]'));
  const technicalWorkButton = NonNullable(service.querySelector('button[name="technicalWork"]'));
  const rightPanel = NonNullable(service.querySelector('div.service-panel-right'));

  restartButton.addEventListener('click', event => {
    restartButton.setAttribute('loading', 'true');
    Restart(id)
      .catch(error => {
        console.error('Error in Restart', error);
        alert('Unable to restart service');
      })
      .finally(() => {
        restartButton.removeAttribute('loading');
      });
  });

  technicalWorkButton.addEventListener('click', event => {
    if (state.techWorkingStatus === null) return;
    technicalWorkButton.setAttribute('loading', 'true');
    SetTechnicalWork(id, !state.techWorkingStatus)
      .then(() => (state.techWorkingStatus = !state.techWorkingStatus))
      .catch(error => {
        console.error('Error in SetTechnicalWork', error);
        alert('Unable to set technical work');
      })
      .finally(() => updateTechnicalWorkButton());
  });

  function updateTechnicalWorkButton() {
    technicalWorkButton.removeAttribute('loading');
    technicalWorkButton.innerText = state.techWorkingStatus
      ? 'Disable Tech-Working'
      : 'Enable Tech-Working';
  }

  // Формирование статуса
  try {
    if (status) {
      restartButton.removeAttribute('loading');
      technicalWorkButton.removeAttribute('loading');

      if (data?.technicalWork) {
        state.techWorkingStatus = data?.technicalWork?.status;
        updateTechnicalWorkButton();
      }
    } else {
      rightPanel.classList.add('hidden');
    }
  } catch (error) {
    console.log(error);
  }

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

const rootDiv = document.querySelector('div.service-panel-wrapper');
AssertNonNullable(rootDiv);

const CreateServiceStateList = async () => {
  const renderedService = Object.entries(await FullServiceStateList())
    .map(([id, response]) => ({
      id,
      response,
    }))
    .sort((a, b) => +(b.response.status ?? 0) - +(a.response.status ?? 0))
    .map(response => Service(response.id, response.response));

  rootDiv.append(...renderedService);
};

(async () => {
  await CreateServiceStateList();
  setInterval(async () => {
    rootDiv.replaceChildren();
    await CreateServiceStateList();
  }, 60 * 1000);
})();
