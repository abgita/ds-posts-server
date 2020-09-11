const ORIGIN = process.env.ORIGIN;

const { handleError } = require( "./utils" );
const express = require( 'express' );
const helmet = require("helmet");
const app = express();

const url = process.env.URL;
const port = process.env.PORT;

app.use(helmet());
app.use( express.json() );

app.post( '/post', handleNewPost );

app.listen( port, () => {
    console.log( "ds-posts-server server running on %s:%s", url, port );
} );

async function handleNewPost ( req, res ){
    res.header( "Access-Control-Allow-Origin", ORIGIN );

    res.json( { error: "Nothing" } );
}