const URL = process.env.URL;
const PORT = process.env.PORT;

const express = require( "express" );
const helmet = require( "helmet" );
const posts = require( "./posts" );

const { handleError, handleSuccess, validate } = require( "./utils" );
const { param, body } = require( 'express-validator' );

const validateNewPost = validate( [
    body( 'stickerId' ).isLength( { min: 15, max: 17 } ).trim().escape(),
    body( 'trackId' ).isLength( { min: 15, max: 25 } ).trim().escape()
] );

const validateGetPost = validate( [
    param( 'id' ).isLength( { min: 15, max: 35 } ).trim().escape()
] );

function run() {
    const app = express();

    app.use( helmet() );
    app.use( express.json() );

    app.post( "/", validateNewPost, async ( req, res ) => {
        const stickerId = req.body.stickerId;
        const trackId = req.body.trackId;

        try {
            const post = await posts.addPost( stickerId, trackId );

            handleSuccess( res, post );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.get( "/post/:id", validateGetPost, async ( req, res ) => {
        try {
            const post = await posts.getPost( req.params.id );

            handleSuccess( res, post );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.get( "/latest", async ( req, res ) => {
        try {
            const posts_ = await posts.getLatest();

            handleSuccess( res, posts_ );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.get( "/top", async ( req, res ) => {
        try {
            const posts_ = await posts.getMostUsed();

            handleSuccess( res, posts_ );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.listen( PORT, () => {
        console.log( "ds-posts-server server running on %s:%s", URL, PORT );
    } );
}

posts.init().then( run ).catch( console.error );