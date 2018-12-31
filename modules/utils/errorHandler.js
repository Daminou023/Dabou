import { stat } from "fs";

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

    function returnError(err, req, res, next) {
        
        const env   = process.env.NODE_ENV
        let status  = err.code || 500;
        let message = err.message || 'internal server error';

        if (env == 'development') {
            if (status == 500) // only show message if generic server error
            return res.status(status).json({message:message})
            
            return res.status(status).json(err)
        }

        switch (err.code) {
            case 404:
                message = 'sorry, nothing found'        
            break;
            case 400:
                message = 'sorry, bad request'        
            break;
            default:
                message = 'internal server error';
            break;        
        }
        res.status(status).json({message: message})
    }
    
	return {
        returnError: returnError,
        handleBadRequestResponse,
        handleUnknownInputResponse,
        handleNoResultsResponse
    }
}()

module.exports = ErrorHandler;


