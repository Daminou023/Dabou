
const ErrorHandler = function () {

    function handleNoResultsResponse(req, res, customMessage) {
        const message = {
            'message': customMessage ? customMessage : "sorry, nothing found!"
        }
        
        res.status(404).send(message);
    }

    function handleUnknownInputResponse(req, res, customMessage) {
        const message = {
            'message': customMessage ? customMessage : "sorry, nothing found!"
        }
        res.status(404).send(message);   
    }

    function handleBadRequestResponse(req, res, customMessage) {
        const message = {
            'message': customMessage ? customMessage : "sorry, bad request"
        }
        res.status(400).send(message);
    }
    
	return {
        handleBadRequestResponse,
        handleUnknownInputResponse,
        handleNoResultsResponse
    }
}

module.exports = ErrorHandler;