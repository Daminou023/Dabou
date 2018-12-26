const EH = require('./errorHandler')
const RX = require('./regex')

const errorHandler = new EH();
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