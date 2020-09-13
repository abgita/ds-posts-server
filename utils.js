"use strict";

const { validationResult } = require( 'express-validator' );

const utils = {
    handleError: ( res, privateError, publicError, errorCode = 500 ) => {
        if ( privateError ) {
            if ( privateError instanceof Error || typeof privateError === 'string' ) {
                console.error( privateError );
            } else {
                console.error( JSON.stringify( privateError ) );
            }
        }

        res.status( errorCode );

        if ( typeof publicError === 'string' && publicError.length > 0 ) {
            res.json( { error: publicError } );
        } else {
            res.send();
        }
    },

    handleSuccess: ( res, publicMsg, successCode = 200 ) => {
        res.status( successCode );

        if ( !publicMsg ) {
            res.send();
        } else if ( typeof publicMsg === 'string' && publicMsg.length > 0 ) {
            res.json( { message: publicMsg } );
        } else {
            res.json( publicMsg );
        }
    },

    validate: validations => {
        return async ( req, res, next ) => {
            await Promise.all( validations.map( validation => validation.run( req ) ) );

            const errors = validationResult( req );

            if ( errors.isEmpty() ) {
                return next();
            }

            utils.handleError( res, errors.array(), null, 400 )
        };
    }
};

module.exports = utils;