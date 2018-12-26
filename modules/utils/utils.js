const EH = require('./errorHandler')
const RX = require('./regex')

const errorHandler = new EH();
const regexFactory = new RX();

const Utils = function () {
    this.escapeSpecial              = regexFactory.escapeSpecial;
    this.removeWhiteSpace           = regexFactory.escapeWhiteSpace;
    this.handleUnknownInputResponse = errorHandler.handleUnknownInputResponse;
    this.handleNoResultsResponse    = errorHandler.handleNoResultsResponse;
    this.handleBadRequestResponse   = errorHandler.handleBadRequestResponse;
}

module.exports = Utils;