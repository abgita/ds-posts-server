"use strict";

const { json } = require( "express" );
const express_enforces_ssl = require( "express-enforces-ssl" );
const helmet = require( "helmet" );
const rateLimit = require( "express-rate-limit" );
const hpp = require( "hpp" );

const ORIGIN = process.env.ORIGIN;

module.exports = {
    setupMiddlewares: function ( expressApp, ...middlewares ) {
        if ( process.env.NODE_ENV !== "development" ) {
            expressApp.enable( "trust proxy" );

            expressApp.use( express_enforces_ssl() );
        }

        expressApp.use( helmet() );

        expressApp.use( rateLimit( {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        } ) );

        expressApp.use( hpp( {} ) );
        expressApp.use( json() );

        if ( middlewares && middlewares.length > 0 ) {
            for ( let middleware of middlewares ) {
                expressApp.use( middleware );
            }
        }

        return expressApp;
    },

    allowOrigin: origin => {
        return function ( req, res, next ) {
            res.header( "Access-Control-Allow-Origin", origin | ORIGIN );

            next();
        }
    }
};