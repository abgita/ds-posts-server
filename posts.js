"use strict";

const { handleError } = require( "./utils" );
const db = require( './mongodb-wrapper' );
const forge = require( 'node-forge' );

const EMPTY_OBJ = {};
const PROJECTION = { _id: 0 };

let log, posts;

module.exports = {
    init: async () => {
        try {
            await db.connect();
        } catch ( err ) {
            throw err;
        }

        posts = db.getCollection( "posts" );
        log = db.getCollection( "log" );
    },

    getPost: async ( id ) => {
        try {
            console.log( id );

            return { id: id };
        } catch ( error ) {
            throw new Error( 'Cannot get post!' );
        }
    },

    handleNewPost: async ( stickerId, songId ) => {
        const post = {
            stickerId: stickerId,
            songId: songId
        };

        getPostHash( post ).then( console.log );

        try {
            const { insertedId } = await posts.insertOne( post );

            return { id: insertedId };
        } catch ( error ) {
            throw new Error( 'Cannot post!' );
        }
    }
};

const md = forge.md.md5.create();

async function getPostHash( post ) {
    const ids = post.stickerId + post.songId;

    md.update( ids );

    return md.digest().toHex();
}