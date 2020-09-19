const express = require( "express" );
const posts = require( "./model" );

const { allowOrigin } = require( "../utils/rest-api-utils" );
const { handleError, handleSuccess, validateRequestInput } = require( "../utils/server-utils" );
const { param, body } = require( "express-validator" );

const validateNewPostInput = validateRequestInput( [
    body( "stickerId" ).isLength( { min: 15, max: 18 } ).trim().escape(),
    body( "trackId" ).isLength( { min: 17, max: 25 } ).trim().escape()
] );

const validateGetPostInput = validateRequestInput( [
    param( "id" ).isLength( { min: 38 } ).trim().escape().custom( value => {
        const pair = value.split( ':' );

        if ( pair.length !== 2 ) return Promise.reject();

        const xl = pair[0].length;
        const yl = pair[1].length;

        if ( xl >= 15 && xl <= 18 && yl >= 17 && yl <= 25 ) {
            return Promise.resolve( value );
        }

        return Promise.reject();
    } )
] );

const router = express.Router();

router.get( "/", async ( req, res ) => {
    res.sendStatus( 404 );
} );

router.post( "/", validateNewPostInput, async ( req, res ) => {
    const stickerId = req.body.stickerId;
    const trackId = req.body.trackId;

    try {
        const post = await posts.addPost( stickerId, trackId );

        handleSuccess( res, post );
    } catch ( err ) {
        handleError( res, err );
    }
} );

router.use( allowOrigin() );

router.get( "/latest", async ( req, res ) => {
    try {
        const posts_ = await posts.getLatest();

        handleSuccess( res, posts_ );
    } catch ( err ) {
        handleError( res, err );
    }
} );

router.get( "/top", async ( req, res ) => {
    try {
        const posts_ = await posts.getMostUsed();

        handleSuccess( res, posts_ );
    } catch ( err ) {
        handleError( res, err );
    }
} );

router.get( "/:id", validateGetPostInput, async ( req, res ) => {
    try {
        const post = await posts.getPost( req.params.id );

        handleSuccess( res, post );
    } catch ( err ) {
        handleError( res, err );
    }
} );

module.exports = router;