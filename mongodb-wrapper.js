"use strict";

const MongoClient = require( 'mongodb' ).MongoClient;

class MongoDatabase {
    #dbName;
    #db = null;

    constructor( dbName = process.env.MONGODB_DB ) {
        this.#dbName = dbName;
    }

    connect( host = process.env.MONGODB_HOST, user = process.env.MONGODB_USER, pass = process.env.MONGODB_PASS ) {
        const uri = `mongodb+srv://${user}:${pass + host}`;

        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        return new Promise( ( resolve, reject ) => {
            MongoClient.connect( uri, opts, ( err, client ) => {
                if ( err ) {
                    reject( err );
                } else {
                    this.#db = client.db( this.#dbName );

                    resolve( this );
                }
            } );
        } );
    }

    collection( name ) {
        if ( this.#db === null ) return null;

        return this.#db.collection( name );
    }
}

module.exports = MongoDatabase;