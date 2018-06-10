// IMPORT NODE PACKAGES:
import express from 'express';						// main express application
import compress from 'compression';					// allows you to compress your http response
import bodyParser from 'body-parser';				// several middleware to handle request data
import methodOverride from 'method-override';		// provide suport for DELTE and PUT http Verbs
import morgan from 'morgan';						// simple logger middleware
import session from 'express-session';				// identify and track current user + session.
import router from './router';						// routing middleware

// INITIALISE AN EXPRESS APPLICATION
module.exports = () => {
    const app = express();
    const config = require('./config');

    // USE MORGAN LOGER IF IN DEV MODE:
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    // SESSION HANDLING:
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }))


    // BODY-PARSER:
    app.use(bodyParser.urlencoded({
        extended:true
    }));
    app.use(bodyParser.json());

    // ROUTES:
    app.use('/', router);


    // METHOD OVERRIDE:
    app.use(methodOverride());


    // APPLICATION ERROR HANDLING: (this needs to be last)
    app.use(logErrors)
    app.use(clientErrorHandler)
    app.use(errorHandler)


    function logErrors (err, req, res, next) {
    console.error(err.stack)
    next(err);
    };

    function clientErrorHandler(err, req, res, next) {
        next(err);
    }

    function errorHandler(err, req, res, next) {
        res.status(500).json('internal server error');
    }
    
    return app;
}