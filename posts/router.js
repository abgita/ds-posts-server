const express = require("express");
const posts = require("./model");

const {allowOrigin, allowMethods, rateLimit} = require("../utils/rest-api-utils");
const {handleError, handleSuccess, validateRequestInput} = require("../utils/server-utils");
const {body} = require("express-validator");

const STICKER_ID_LIMITS = [14, 20];
const TRACK_ID_LIMITS = [17, 25];

const validateNewPostInput = validateRequestInput([
    body("stickerId").isLength({min: STICKER_ID_LIMITS[0], max: STICKER_ID_LIMITS[1]}).trim().escape(),
    body("trackId").isLength({min: TRACK_ID_LIMITS[0], max: TRACK_ID_LIMITS[1]}).trim().escape()
]);

const router = express.Router();

const postRateLimitOpts = {
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: process.env.MAX_NEW_POSTS_PER_HOUR,
};

router.post("/", [rateLimit(postRateLimitOpts), validateNewPostInput], async (req, res) => {
    const stickerId = req.body.stickerId;
    const trackId = req.body.trackId;

    try {
        const post = await posts.addPost(stickerId, trackId);

        handleSuccess(res, post);
    } catch (err) {
        handleError(res, err);
    }
});

router.use(allowOrigin());

router.options("/", allowMethods(["POST"]), (_, res) => {
    res.send();
});

router.get("/latest", async (_, res) => {
    try {
        const posts_ = await posts.getLatest();

        handleSuccess(res, posts_);
    } catch (err) {
        handleError(res, err);
    }
});

router.get("/top", async (_, res) => {
    try {
        const posts_ = await posts.getMostUsed();

        handleSuccess(res, posts_);
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
