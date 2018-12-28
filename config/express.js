// IMPORT NODE PACKAGES:
import express        from 'express';			// Main express application
import compress       from 'compression';		// Allows you to compress your http response
import bodyParser     from 'body-parser';		// Several middleware to handle request data
import methodOverride from 'method-override';	// Provide suport for DELTE and PUT http Verbs
import morgan         from 'morgan';			// Simple logger middleware
import session        from 'express-session';	// Identify and track current user + session.
import router         from './routes';          // Routing middleware (default to index.js)
import passport       from 'passport';          // Authentication
import flash          from 'connect-flash';     // Flash messaging middleware to add messages to request
import ErrorHandler   from '../modules/utils/errorHandler';

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

    /**
     * REGISTER MIDDLEWARE HERE
     */

    // BODY-PARSER:
    app.use(bodyParser.urlencoded({
        extended:true
    }));
    app.use(bodyParser.json());

    // METHOD OVERRIDE:
    app.use(methodOverride());

    // SESSION HANDLING:
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }))

    // FLASH MIDDLEWARE
    app.use(flash())

    // REGISTER MIDDLEWARE FOR AUTHENTICATION USING PASSPORT
    app.use(passport.initialize())
    app.use(passport.session())

    // ROUTES:
    app.use('/', router);    

    // APPLICATION ERROR HANDLING: (this needs to be last)

    app.use(logErrors)
    app.use(clientErrorHandler)
    app.use(ErrorHandler.returnError)


    /**
     * UTILITY FUNCTIONS USED IN MIDDLEWARE
     */

    function logErrors (err, req, res, next) {
        if (!err.code) {
            console.error(err.stack)
        }
        next(err);
    };

    function clientErrorHandler(err, req, res, next) {
        next(err);
    }
    
    return app;
}