
const ErrorHandler = function () {

    function handleNoResultsResponse(req, res, customMessage) {
        const message = {
            'status': 404,
            'message': customMessage ? customMessage : "sorry, nothing found!"
        }
        
        res.status(404).send(message);
    }

    function handleBadRequestResponse(req, res, customMessage) {
        const message = {
            'status': 400,
            'message': customMessage ? customMessage : "sorry, bad request"
        }
        
        res.status(400).send(message);
    }
    
	return {
        handleBadRequestResponse,
        handleNoResultsResponse
    }
}

module.exports = ErrorHandler;