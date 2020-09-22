"use strict";

const logger = require( "./logger" );

const onExitListeners = [];

const onExit = function ( listener ) {
    onExitListeners.push( listener );
};

const exit = async function () {
    logger.info( "Shutting down server" );

    for ( let listener of onExitListeners ) {
        await listener();
    }

    process.exit( 0 )
};

process.on( "SIGTERM", exit );
process.on( "SIGINT", exit )

const handleError = function ( res, privateError, publicError, errorCode = 500 ) {
    if ( privateError ) logger.error( privateError );

    res.status( errorCode );

    if ( typeof publicError === "string" && publicError.length > 0 ) {
        res.json( { error: publicError } );
    } else {
        res.send();
    }
};

const handleSuccess = function ( res, publicMsg, successCode = 200 ) {
    res.status( successCode );

    if ( !publicMsg ) {
        res.send();
    } else if ( typeof publicMsg === "string" && publicMsg.length > 0 ) {
        res.json( { message: publicMsg } );
    } else {
        res.json( publicMsg );
    }
};

const { validationResult } = require( "express-validator" );

const validateRequestInput = function ( validations ) {
    return async ( req, res, next ) => {
        await Promise.all( validations.map( validation => validation.run( req ) ) );

        const errors = validationResult( req );

        if ( errors.isEmpty() ) {
            return next();
        }

        handleError( res, errors.array(), null, 400 )
    };
};

const closeOnExit = function ( server ) {
    onExit( () => {
        return new Promise( ( resolve ) => {
            server.close( () => {
                resolve();

                logger.info( "Server closed" );
            } );
        } );
    } );
}

module.exports = {
    handleError: handleError,
    handleSuccess: handleSuccess,
    validateRequestInput: validateRequestInput,
    onExit: onExit,
    closeOnExit: closeOnExit
};