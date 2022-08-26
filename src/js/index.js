/// <reference path="../../typedef.d.ts"/>
import { defaultServiceAvatarURL, offlineImgURL, onlineImgURL } from './constants.js';
import { FullServiceStateList, html, Restart, SetTechnicalWork, Uptime } from './utils.js';

/**
 * @param {string} id
 * @param {object} object
 */
function Service(id, object) {
  const { status, data } = object || {};
  const { uptime, memory } = data || {};

  const state = {
    techWorkingStatus: null,
  };

  const service = html`
    <div class="service-panel" type="${id}">
      <div class="service-panel-avatar">
        <div class="avatar">
          <img width="100" height="100" src="${defaultServiceAvatarURL}" />
        </div>
        <div class="status">
          <img width="100" height="100" src="${status === true ? onlineImgURL : offlineImgURL}" />
        </div>
      </div>
      <div class="service-panel-name">
        <div class="title">
          <p>${id}</p>
        </div>
        <div class="subtitle">
          <p>
            ${Uptime(uptime || 0)} • ${Math.round((memory?.rss / 1024 / 1024) * 100) / 100 || 0} MB
          </p>
        </div>
      </div>
      <div class="service-panel-restart">
        <button name="restart" loading>Restart</button>
      </div>
      <div class="service-panel-tw">
        <button name="technicalWork" loading>Tech-Working</button>
      </div>
    </div>
  `;

  // const serviceStatus = NonNullable(service.querySelector('span.service-status'));
  const restartButton = NonNullable(service.querySelector('button[name="restart"]'));
  const technicalWorkButton = NonNullable(service.querySelector('button[name="technicalWork"]'));

  restartButton.addEventListener('click', event => {
    restartButton.setAttribute('loading', 'true');
    Restart(id).finally(() => {
      restartButton.removeAttribute('loading');
      // GetFullStatus(id).then(response => checkStatus(response));
    });
  });

  technicalWorkButton.addEventListener('click', event => {
    if (state.techWorkingStatus === null) return;
    technicalWorkButton.setAttribute('loading', 'true');
    SetTechnicalWork(id, !state.techWorkingStatus).finally(() => updateTechnicalWorkButton());
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

  // Формирование статуса
  try {
    if (status === true) {
      restartButton.removeAttribute('loading');
      technicalWorkButton.removeAttribute('loading');

      if (data?.technicalWork) {
        state.techWorkingStatus = data?.technicalWork?.status;
        updateTechnicalWorkButton();
      }
    } else if (status === false) {
      restartButton.setAttribute('loading', 'true');
      technicalWorkButton.setAttribute('loading', 'true');
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

const rootDiv = document.querySelector('div#root');
AssertNonNullable(rootDiv);

const CreateServiceStateList = async () => {
  // Преобразование для сортировки
  const newList = [];
  for (const [id, data] of Object.entries(await FullServiceStateList())) {
    const { status } = data || {};

    newList.push([
      status,
      {
        id: id,
        object: data,
      },
    ]);
  }

  // Сортировка
  const newSortList = newList.sort((a, b) => b[0] - a[0]);
  for (const [status, data] of newSortList) {
    rootDiv.append(Service(data.id, data.object));
  }
};

(async () => {
  await CreateServiceStateList();
  setInterval(async () => {
    rootDiv.replaceChildren();
    await CreateServiceStateList();
  }, 60000);
})();
