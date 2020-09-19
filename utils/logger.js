const { createLogger, format, transports } = require( "winston" );

const inProduction = process.env.NODE_ENV === "production";

const logger = createLogger( {
    level: "info",
    silent: inProduction,

    format: format.combine(
        format.errors( { stack: true } ),
        format.splat(),
        format.json()
    ),

    transports: []
} );

if ( !inProduction ) {
    logger.add( new transports.Console( {
        format: format.combine(
            format.colorize( { all: true } ),
            format.simple()
        )
    } ) );
}

module.exports = logger;