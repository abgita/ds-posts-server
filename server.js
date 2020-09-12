const URL = process.env.URL;
const PORT = process.env.PORT;

const express = require( "express" );
const helmet = require( "helmet" );
const pdb = require( "./posts-db" );

const { handleError, handleSuccess, validate } = require( "./utils" );
const { param } = require( 'express-validator' );

function run() {
    const app = express();

    app.use( helmet() );
    app.use( express.json() );

    app.post( "/", pdb.handleNewPost );

    app.get( "/:id", validate([
        param( 'id' ).isLength( { min: 6, max: 8 } ).trim().escape()
    ]), async ( req, res ) => {
        try {
            const result = await pdb.handlePostRequest( req.params.id );

            handleSuccess( res, result );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.listen( PORT, () => {
        console.log( "ds-posts-server server running on %s:%s", URL, PORT );
    } );
}

pdb.connect().then( run ).catch( console.error );