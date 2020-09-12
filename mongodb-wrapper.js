"use strict";

const MongoClient = require( 'mongodb' ).MongoClient;

let db, collection;

module.exports = {
    connect: async ( dbName = process.env.MONGODB_DB, collectionName = process.env.MONGODB_COLLECTION ) => {
        if ( db ) return;

        if ( !dbName ) {
            throw new Error( "Database name not specified!" );
        }

        const host = process.env.MONGODB_HOST;
        const user = process.env.MONGODB_USER;
        const pass = process.env.MONGODB_PASS;

        const uri = `mongodb+srv://${user}:${pass + host}`;

        const opts = { useNewUrlParser: true, useUnifiedTopology: true };

        const connection = await MongoClient.connect( uri, opts );

        db = connection.db( dbName );

        if ( collectionName ) {
            collection = db.collection( collectionName );
        }
    },

    getCollection: ( collectionName ) => {
        return db ? db.collection( collectionName ) : null;
    },

    getDefaultCollection: () => {
        return collection;
    }
}