/* Simple cache implementation */

const cacheThis = function ( set, ttlMs ) {
    const cache = {
        content: undefined,
        expirationTime: 0,
        ttl: ttlMs,
        set: set
    };

    const getCached = async function () {
        const now = Date.now();

        if ( cache.content && now < cache.expirationTime ) {
            return cache.content;
        }

        return await getNew();
    };

    const getNew = async function () {
        const now = Date.now();

        const result = await cache.set();

        cache.expirationTime = now + cache.ttl;
        cache.content = result;

        return result;
    };

    return {
        ...cache,
        get: getCached,
        getNew: getNew
    };
};

module.exports = cacheThis;