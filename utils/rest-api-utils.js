"use strict";

const {json, urlencoded} = require("express");
const express_enforces_ssl = require("express-enforces-ssl");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const {handleError} = require("./server-utils");

const ORIGIN = process.env.ORIGIN;

module.exports = {
    setupMiddlewares: function (expressApp, ...middlewares) {
        if (process.env.NODE_ENV !== "development") {
            expressApp.enable("trust proxy");

            expressApp.use(express_enforces_ssl());
        }

        expressApp.use(helmet());

        expressApp.use(rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        }));

        expressApp.use(hpp({}));
        expressApp.use(urlencoded({limit: 100, parameterLimit: 2}));
        expressApp.use(json({limit: 100}));

        expressApp.use((err, req, res, next) => {
            if (err.statusCode === 413) {
                handleError(res, null, null, err.statusCode);
            } else {
                next();
            }
        });

        if (middlewares && middlewares.length > 0) {
            for (let middleware of middlewares) {
                expressApp.use(middleware);
            }
        }

        return expressApp;
    },

    allowOrigin: (origin = ORIGIN) => {
        return function (req, res, next) {
            res.header("Access-Control-Allow-Origin", origin);

            next();
        }
    },
    
    cacheControl: maxAge => {
        return function (req, res, next) {
            res.header('Cache-control', 'private, max-age=' + maxAge)

            next()
        }
    },

    handleCORSPreflightRequest: options => {
        const {
            origin = ORIGIN,
            methods,
            headers = ["Content-Type", "x-requested-with"],
            maxAge = 86400 /*24 hours in seconds*/
        } = options;

        return (_, res) => {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Methods", methods.join(" "));
            res.header("Access-Control-Allow-Headers", headers.join(", "));
            res.header("Access-Control-Max-Age", maxAge);

            res.sendStatus(204);
        };
    },

    rateLimit: rateLimit
};
