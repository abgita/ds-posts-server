"use strict";

const logger = require( "./logger" );

const onExitListeners = [];

function onExit( listener ) {
    onExitListeners.push( listener );
}

const exit = async function () {
    logger.info( "Shutting down server" );

    for ( let listener of onExitListeners ) {
        await listener();
    }

    process.exit( 0 )
}

process.on( "SIGTERM", exit );
process.on( "SIGINT", exit )

function handleError( res, privateError, publicError, errorCode = 500 ) {
    if ( privateError ) logger.error( privateError );

    res.status( errorCode );

    if ( typeof publicError === "string" && publicError.length > 0 ) {
        res.json( { error: publicError } );
    } else {
        res.send();
    }
}

function handleSuccess( res, publicMsg, successCode = 200 ) {
    res.status( successCode );

    if ( !publicMsg ) {
        res.send();
    } else if ( typeof publicMsg === "string" && publicMsg.length > 0 ) {
        res.json( { message: publicMsg } );
    } else {
        res.json( publicMsg );
    }
}

const { validationResult } = require( "express-validator" );

function validateRequestInput( validations ) {
    return async ( req, res, next ) => {
        await Promise.all( validations.map( validation => validation.run( req ) ) );

        const errors = validationResult( req );

        if ( errors.isEmpty() ) {
            return next();
        }

        handleError( res, errors.array(), null, 400 )
    };
}

module.exports = {
    handleError: handleError,
    handleSuccess: handleSuccess,
    validateRequestInput: validateRequestInput,
    onExit: onExit
};