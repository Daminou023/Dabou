const EH = require('./errorHandler')

const errorHandler = new EH();

const Utils = function () {

    this.handleNoResultsResponse  = errorHandler.handleNoResultsResponse
    this.handleBadRequestResponse = errorHandler.handleBadRequestResponse
}

module.exports = Utils;