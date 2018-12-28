import errorHandler from './errorHandler'

const RX = require('./regex')
const regexFactory = new RX();

var Utils = function() {
    return ({
        escapeSpecial              : regexFactory.escapeSpecial,
        removeWhiteSpace           : regexFactory.escapeWhiteSpace,
        handleUnknownInputResponse : errorHandler.handleUnknownInputResponse,
        handleNoResultsResponse    : errorHandler.handleNoResultsResponse,
        handleBadRequestResponse   : errorHandler.handleBadRequestResponse
    })
}()

module.exports = Utils;