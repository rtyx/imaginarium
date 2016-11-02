var events = require('events');
var myEmitter = Object.create(new events.EventEmitter);

module.exports = myEmitter;
