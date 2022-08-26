import ky from 'https://unpkg.com/ky@0.31.1';
import { requestForwardingServiceURL } from './constants.js';

export const kyBase = ky.extend({ mode: 'cors' });

/**
 * @param {string} method
 * @param {string} url
 */
export const DefaultOptions = (method, url) => ({ json: { method, url } });
export const FullServiceStateList = async () =>
  /**@type {object} */ (
    await kyBase
      .post(`${requestForwardingServiceURL}/State`, DefaultOptions('get', 'service/fullList'))
      .json()
  );
/**
 * @param {string} id
 */
export const GetFullStatus = id =>
  kyBase
    .post(`${requestForwardingServiceURL}/${id}`, DefaultOptions('get', 'system/state/full'))
    .json();
/**
 * @param {string} id
 */
export const Restart = (/** @type {string} */ id) =>
  kyBase.post(
    `${requestForwardingServiceURL}/${id}`,
    DefaultOptions('post', 'system/interactions/restart')
  );
/**
 * @param {string} id
 * @param {string | boolean} state
 */
export const SetTechnicalWork = (id, state) =>
  kyBase.post(
    `${requestForwardingServiceURL}/${id}`,
    DefaultOptions('post', `system/interactions/technicalWork/${state}`)
  );

/**
 * @param {number} n
 */
export const Uptime = n => {
  /**
   * @param {number} n
   */
  const convert = n => (n < 10 ? `0${n}` : n);

  const day = Math.floor(n / (60 * 60 * 24));
  const hours = Math.floor(n / (60 * 60) - day * 24);
  const minutes = Math.floor((n % (60 * 60)) / 60);
  const seconds = Math.floor(n % 60);

  return `${day}:${convert(hours)}:${convert(minutes)}:${convert(seconds)}`;
};

/**
 * @param {any} strings
 * @param {any[]} values
 */
export function html(strings, ...values) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = String.raw({ raw: strings }, ...values);
  return wrapper.children[0];
}
