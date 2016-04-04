const _ = require('lodash');
const http = require('q-io/http');
const XML = require('pixl-xml');

module.exports = {
  ordinal: ordinal,
  getXml: getXml,
  asArray: asArray,
};

function ordinal(num) {
  var rem = num % 10;

  if (rem === 1 && num !== 11) {
    return num + 'st';
  }

  if (rem === 2 && num !== 12) {
    return num + 'nd';
  }

  if (rem === 3 && num !== 13) {
    return num + 'rd';
  }

  return num + 'th';
}

function getXml(url) {

  function getBody(response) {
    if (response.status >= 400) {
      throw new Error(response.status + ': ' + url);
    }

    return response.body.read();
  }

  function parseXml(body) {
    return XML.parse(body);
  }

  return http.request(url)
    .then(getBody)
    .then(parseXml);
}

function asArray() {
  if (arguments.length > 0 && arguments[0] === undefined) {
    return [];
  }
  return _.castArray.apply(this, arguments);
}
