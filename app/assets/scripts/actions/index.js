import fetch from 'isomorphic-fetch';
import _ from 'lodash';

import config from '../config';

export const REQUEST_NATIONAL = 'REQUEST_NATIONAL';
export const RECEIVE_NATIONAL = 'RECEIVE_NATIONAL';
export const INVALIDATE_NATIONAL = 'INVALIDATE_NATIONAL';

export const REQUEST_NUT = 'REQUEST_NUT';
export const RECEIVE_NUT = 'RECEIVE_NUT';
export const INVALIDATE_NUT = 'INVALIDATE_NUT';

// National

export function invalidateNational () {
  return { type: INVALIDATE_NATIONAL };
}

export function requestNational () {
  return { type: REQUEST_NATIONAL };
}

export function receiveNational (data, error = null) {
  return { type: RECEIVE_NATIONAL, data: data, error, receivedAt: Date.now() };
}

export function fetchNational () {
  // Fake data load.
  return (dispatch) => {
    var national = require('../data/national.json');
    dispatch(requestNational());
    setTimeout(() => dispatch(receiveNational(national)), 300);
  };
  // return getAndDispatch(`${config.api}/National`, requestNational, receiveNational);
}

// National

export function invalidateNut () {
  return { type: INVALIDATE_NUT };
}

export function requestNut () {
  return { type: REQUEST_NUT };
}

export function receiveNut (data, error = null) {
  return { type: RECEIVE_NUT, data: data, error, receivedAt: Date.now() };
}

export function fetchNut (nut) {
  // Fake data load.
  return (dispatch) => {
    var national = require('../data/national.json');
    var res = national.results.find(o => _.kebabCase(o.name) === nut);
    dispatch(requestNut());
    setTimeout(() => dispatch(receiveNut(res)), 300);
  };
  // return getAndDispatch(`${config.api}/National`, requestNational, receiveNational);
}

// Fetcher function

function getAndDispatch (url, requestFn, receiveFn) {
  return fetchDispatchFactory(url, null, requestFn, receiveFn);
}

function fetchDispatchFactory (url, options, requestFn, receiveFn) {
  return function (dispatch, getState) {
    dispatch(requestFn());

    fetchJSON(url, options)
      .then(json => dispatch(receiveFn(json)), err => dispatch(receiveFn(null, err)));
  };
}

export function fetchJSON (url, options) {
  return fetch(url, options)
    .then(response => {
      return response.text()
      // .then(body => ((new Promise(resolve => setTimeout(() => resolve(body), 1000)))))
      .then(body => {
        var json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          console.log('json parse error', e);
          return Promise.reject({
            error: e.message,
            body
          });
        }

        return response.status >= 400
          ? Promise.reject(json)
          : Promise.resolve(json);
      });
    });
}
