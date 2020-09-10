"use strict";

function handleError( res, publicError, privateError, errorCode = 500 ) {
    if ( privateError ) console.error( privateError )

    res.status( errorCode );
    res.json( { error: publicError } );
}

module.exports.handleError = handleError;