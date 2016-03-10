var http = require('q-io/http');
var sprintf = require('sprintf-js').sprintf;

module.exports = {
  ordinal: ordinal,
  ensureArray: ensureArray,
  getJson: getJson,
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

function ensureArray(object, field) {
  if (!(object[field] instanceof Array)) {
    object[field] = [object[field]];
  }
}

function getJson(url) {

  function getBody(response) {
    if (response.status >= 400) {
      throw new Exception(response.status);
    }

    return response.body.read();
  }

  function parseJson(body) {
    return JSON.parse(body).data;
  }

  return http.request(url)
    .then(getBody)
    .then(parseJson);
}
