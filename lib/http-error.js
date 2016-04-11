const inherits = require('util').inherits;

module.exports = HttpError;

function HttpError(message, statusCode) {
  Error.call(this);
  this.message = message;
  this.statusCode = statusCode;
}

inherits(HttpError, Error);
