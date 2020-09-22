const express = require( "express" );
const logger = require( "./utils/logger" );

const { setupMiddlewares } = require( "./utils/rest-api-utils" );
const { closeOnExit } = require( "./utils/server-utils" );

const postsModel = require( "./posts/model" );
const postsRouter = require( "./posts/router" );

function run() {
    const { URL, PORT } = process.env;

    const app = express();

    setupMiddlewares( app );

    app.use( "/posts", postsRouter );

    app.get( "*", ( req, res ) => {
        res.sendStatus( 404 );
    } );

    const server = app.listen( PORT, () => {
        logger.info( "Server running on %s:%s", URL, PORT );
    } );

    closeOnExit( server );
}

postsModel.init().then( run ).catch( logger.error );