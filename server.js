const { URL, PORT, ORIGIN } = process.env;

const express = require( "express" );
const express_enforces_ssl = require( 'express-enforces-ssl' );
const hpp = require( 'hpp' );
const helmet = require( "helmet" );
const rateLimit = require( "express-rate-limit" );
const posts = require( "./posts" );
const { param, body } = require( "express-validator" );
const { handleError, handleSuccess, validate } = require( "./utils" );

const validateNewPostInput = validate( [
    body( 'stickerId' ).isLength( { min: 15, max: 18 } ).trim().escape(),
    body( 'trackId' ).isLength( { min: 15, max: 25 } ).trim().escape()
] );

const validateGetPostInput = validate( [
    param( 'id' ).isLength( { min: 40 } ).trim().escape().custom( value => {
        const pair = value.split( ':' );

        if ( pair.length !== 2 ) return Promise.reject();

        const xl = pair[0].length;
        const yl = pair[1].length;

        if ( xl >= 15 && xl <= 18 && yl >= 15 && yl <= 25 ) {
            return Promise.resolve( value );
        }

        return Promise.reject();
    } )
] );

function run() {
    const app = express();

    app.enable( 'trust proxy' );

    app.use( helmet() );

    app.use( rateLimit( {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    } ) );

    app.use( express_enforces_ssl() );
    app.use( hpp({}) );
    app.use( express.json() );

    app.post( "/", validateNewPostInput, async ( req, res ) => {
        console.log( req );

        const stickerId = req.body.stickerId;
        const trackId = req.body.trackId;

        try {
            const post = await posts.addPost( stickerId, trackId );

            handleSuccess( res, post );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.get( "/", async ( req, res ) => {
        res.sendStatus( 404 );
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

    app.get( "/:id", validateGetPostInput, async ( req, res ) => {
        try {
            const post = await posts.getPost( req.params.id );

            handleSuccess( res, post );
        } catch ( err ) {
            handleError( res, err );
        }
    } );

    app.listen( PORT, () => {
        console.log( "ds-posts-server server running on %s:%s", URL, PORT );
    } );
}

posts.init().then( run ).catch( console.error );