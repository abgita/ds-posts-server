"use strict";

const { MongoClient } = require( "mongodb" );

let client, database;

module.exports = {
    connect: async ( dbName = process.env.MONGODB_DB ) => {
        if ( client ) return;

        if ( !dbName ) {
            throw new Error( "Database name not specified!" );
        }

        const host = process.env.MONGODB_HOST;
        const user = process.env.MONGODB_USER;
        const pass = process.env.MONGODB_PASS;

        const uri = `mongodb+srv://${user}:${pass + host}`;

        const opts = { useNewUrlParser: true, useUnifiedTopology: true };

        client = new MongoClient( uri, opts );

        await client.connect();

        database = client.db( dbName );
    },

    getCollection: ( collectionName ) => {
        return database ? database.collection( collectionName ) : null;
    },

    close: async function () {
        await client.close();
    }
}