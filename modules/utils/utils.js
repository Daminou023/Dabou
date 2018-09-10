const EH = require('./errorHandler')

const errorHandler = new EH();

const Utils = function () {

    this.handleUnknownInputResponse = errorHandler.handleUnknownInputResponse;
    this.handleNoResultsResponse    = errorHandler.handleNoResultsResponse;
    this.handleBadRequestResponse   = errorHandler.handleBadRequestResponse;
}

module.exports = Utils;