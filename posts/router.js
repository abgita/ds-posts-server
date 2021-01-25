const express = require("express");
const posts = require("./model");

const {allowOrigin, rateLimit} = require("../utils/rest-api-utils");
const {handleError, handleSuccess, validateRequestInput} = require("../utils/server-utils");
const {validationResult} = require("express-validator");
const {param, body} = require("express-validator");

const STICKER_ID_LIMITS = [14, 20];
const TRACK_ID_LIMITS = [17, 25];

const MIN_ID_LENGTH = STICKER_ID_LIMITS[0] + TRACK_ID_LIMITS[0];

const validateNewPostInput = validateRequestInput([
    body("stickerId").isLength({min: STICKER_ID_LIMITS[0], max: STICKER_ID_LIMITS[1]}).trim().escape(),
    body("trackId").isLength({min: TRACK_ID_LIMITS[0], max: TRACK_ID_LIMITS[1]}).trim().escape()
]);

const validateGetPostInput = param("id").isLength({min: MIN_ID_LENGTH}).trim().escape().custom(value => {
    const pair = value.split(':');

    if (pair.length !== 2) return Promise.reject();

    const xl = pair[0].length;
    const yl = pair[1].length;

    if (xl >= STICKER_ID_LIMITS[0] && xl <= STICKER_ID_LIMITS[1] &&
        yl >= TRACK_ID_LIMITS[0] && yl <= TRACK_ID_LIMITS[1]) {
        return Promise.resolve(value);
    }

    return Promise.reject();
});

const router = express.Router();

const postRateLimitOpts = {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // limit each IP to 10 requests per windowMs
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

router.options("/", (_, res) => {
    res.send("POST");
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

router.get("/:id", validateGetPostInput, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return handleError(res, errors.array(), "Not found", 404);
    }

    try {
        const post = await posts.getPost(req.params.id);

        handleSuccess(res, post);
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
