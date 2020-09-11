"use strict";

const { handleError } = require( "./utils" );
const MongoDatabase = require( './mongodb-wrapper' );

const EMPTY_OBJ = {};
const PROJECTION = { _id: 0 };

class PostsDb {
    #mdb = null;
    #posts = null;
    #docsCount = 10;
    #nextCount = 0;
    #waiting = false;

    constructor() {
        const dbName = process.env.MONGODB_DB;
        const host = process.env.MONGODB_HOST;
        const user = process.env.MONGODB_USER;
        const pass = process.env.MONGODB_PASS;

        const db = new MongoDatabase( dbName );

        db.connect( host, user, pass ).then( ds => {
            this.#posts = db.collection( process.env.MONGODB_COLLECTION );

            this.#waiting = false;
            this.count();
        } ).catch( err => console.error( err ) );

        this.#mdb = db;

        this.#docsCount = 10;
        this.#nextCount = 0;
        this.#waiting = true;
    }

    count() {
        const now = Date.now();

        if ( !this.#waiting && now >= this.#nextCount ) {
            this.#posts.countDocuments().then( count => {
                this.#docsCount = count;
                this.#nextCount = now + (60 * 20) * 1000; // next count in 20 minutes from now.
                this.#waiting = false;
            } ).catch( err => console.error( "Error getting db documents count!", err ) );

            this.#waiting = true;
        }

        return this.#docsCount;
    }

    find() {
        return new Promise( ( resolve, _ ) => {
            let any = this.#posts.find( EMPTY_OBJ, PROJECTION );

            any.toArray( function ( err, result ) {
                if ( err ) throw err;

                resolve( result );
            } );
        } );
    }
}

const sdb = new PostsDb();

module.exports = {
    handlePostRequest: async ( req, res ) => {
        res.header( "Access-Control-Allow-Origin", process.env.ORIGIN );

        try {
            let { offset = 0, limit = 6 } = req.params;

            if ( typeof offset !== 'number' ) offset = parseInt( offset );
            if ( typeof limit !== 'number' ) limit = parseInt( limit );

            const stickers = await sdb.find( offset, limit );

            const count = sdb.count();

            res.json( {
                stickers: stickers,
                count: count
            } );
        } catch ( err ) {
            handleError( res, 'Cannot get stickers!', err );
        }
    },

    handleNewPost: (req, res) => {
        res.header( "Access-Control-Allow-Origin", process.env.ORIGIN );
    }
};