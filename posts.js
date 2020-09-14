"use strict";

const db = require( './mongodb-wrapper' );

let stats, posts;

const cache = {
    mostUsed: {
        content: undefined,
        expirationTime: 0
    }
}

async function get( cache, fetch ) {
    if ( cache.content && Date.now() < cache.expirationTime ) {
        return cache.content;
    }

    const result = await Promise.resolve( fetch() );

    cache.expirationTime = Date.now() + 3600 * 1000;
    cache.content = result;

    return result;
}

async function updateUsage( collection, filter ) {
    const result = await collection.findOneAndUpdate(
        filter,
        { $inc: { usage: 1 } },
        { upsert: true, returnOriginal: false }
    );

    return result.value ? result.value.usage : 0;
}

module.exports = {
    init: async () => {
        await db.connect();

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

        const post = {
            pairId: pairId
            /*date: new Date()*/
        };

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
        return await posts.find( {}, { sort: { $natural: -1 }, projection: { _id: 0 }, limit: 10 } ).toArray();
    },

    getMostUsed: async () => {
        const fetch = () => {
            return stats.pairs.find( {}, { sort: { usage: -1 }, projection: { _id: 0 }, limit: 20 } ).toArray();
        };

        return await get( cache.mostUsed, fetch );
    }
};