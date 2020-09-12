"use strict";

const { handleError } = require( "./utils" );
const db = require( './mongodb-wrapper' );

const EMPTY_OBJ = {};
const PROJECTION = { _id: 0 };

module.exports = {
    connect: db.connect,

    handlePostRequest: async ( id ) => {
        try {
            console.log( id );

            return { id: id };
        } catch ( error ) {
            throw new Error( 'Cannot get post!' );
        }
    },

    handleNewPost: async ( req, res ) => {
        const body = req.body;

        const post = {
            stickerId: body.stickerId,
            trackId: body.trackId
        }

        try {
            const { insertedId } = await db.getDefaultCollection().insertOne( ad );

            res.json( {
                postId: insertedId
            } );
        } catch ( error ) {
            handleError( res, 'Cannot post!', error, 505 );
        }
    }
};