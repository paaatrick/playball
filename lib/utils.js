var http = require('q-io/http');
var sprintf = require('sprintf-js').sprintf;
var XML = require('pixl-xml');

module.exports = {
  ordinal: ordinal,
  getXml: getXml,
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
      throw new Exception(response.status);
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
