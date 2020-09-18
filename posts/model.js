"use strict";

const { onExit } = require( "../utils/server-utils" );
const db = require( '../mongo-wrapper' );

let stats, posts;

const cache = {
    mostUsed: {
        content: undefined,
        expirationTime: 0,

        fetch: function () {
            return collectionFindArray( stats.pairs, findOpts.pairs );
        }
    }
};

const tryGetFromCache = async function ( cache ) {
    if ( cache.content && Date.now() < cache.expirationTime ) {
        return cache.content;
    }

    const result = await Promise.resolve( cache.fetch() );

    cache.expirationTime = Date.now() + 3600 * 1000;
    cache.content = result;

    return result;
}

const updateUsage = async function ( collection, filter ) {
    const result = await collection.findOneAndUpdate(
        filter,
        { $inc: { usage: 1 } },
        { upsert: true, returnOriginal: false }
    );

    return result.value ? result.value.usage : 0;
};

const findOpts = {
    pairs: { sort: { usage: -1 }, projection: { _id: 0 }, limit: 20 },
    posts: { sort: { $natural: -1 }, projection: { _id: 0 }, limit: 10 },
};

const collectionFindArray = function ( collection, opts, query ) {
    return collection.find( query, opts ).toArray();
};

module.exports = {
    init: async () => {
        await db.connect();

        onExit( db.close );

        stats = {
            stickers: db.getCollection( "stickers-stats" ),
            tracks: db.getCollection( "tracks-stats" ),
            pairs: db.getCollection( "pairs-stats" )
        };

        posts = db.getCollection( "posts" );
    },

    addPost: async ( stickerId, trackId ) => {
        const pairId = stickerId + ':' + trackId;

        const updatePairUsage = updateUsage( stats.pairs, { "id": pairId } );
        const updateStickerUsage = updateUsage( stats.stickers, { "id": stickerId } );
        const updateTrackUsage = updateUsage( stats.tracks, { "id": trackId } );

        await Promise.all( [
            updatePairUsage,
            updateStickerUsage,
            updateTrackUsage
        ] );

        const post = { pairId: pairId };

        await posts.insertOne( post );

        return { id: pairId };
    },

    getPost: async ( id ) => {
        try {
            return { id: id };
        } catch ( error ) {
            throw new Error( 'Cannot get post!' );
        }
    },

    getLatest: async () => {
        return await collectionFindArray( posts, findOpts.posts );
    },

    getMostUsed: async () => {
        return await tryGetFromCache( cache.mostUsed );
    }
};