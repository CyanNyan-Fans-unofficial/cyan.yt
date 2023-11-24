let config = {
    // Prefix map
    // "Prefix" => "Redirect to host"
    mappings: {
    },

    // default redirect
    proto: "https",
    status: 302,
    strips: ["www"],

    // If non match, redirect to this host
    fallback: null
}



// Match prefix array with target array.
function matchPrefix(prefix, target, case_insensitive) {
    return prefix.every((elem, i) => (target[i] == elem));
}


// Lookup and replace host with redirect map
function replaceHost(url, redirects) {
    let host = url.host;
    let pathname = url.pathname;
    let { mappings, strips, fallback } = redirects;

    let host_array = host.split('.');

    // Process path name
    pathname = pathname.toLowerCase();

    // let path_array = pathname.split('/');

    // Strip the ending slash
    while (pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, pathname.length - 1);
    }

    let path_array = pathname.split('/');
    let path_addition;
    if (path_array.length > 2) {
        pathname = `/${path_array[1]}/`;
        path_addition = `/${path_array.slice(2).join('/')}`;
    }

    // Try prefix full match
    let result = Object.keys(mappings).find(
        prefix => matchPrefix(prefix.split('.'), host_array)
    );

    // Try strip prefix and match
    if (!result && strips.includes(host_array[0])) {
        result = Object.keys(mappings).find(
            prefix => matchPrefix(prefix.split('.'), host_array.slice(1))
        );
    }

    if (!result) {
        return fallback;
    }

    if (typeof mappings[result] === 'object') {
        let mapping = mappings[result][pathname];
        if (!mapping) {
            return mappings[result].fallback;
        }

        if (pathname.endsWith('/')) {
            return mapping + path_addition + url.search;
        }

        return mapping;
    }

    return mappings[result];

}

// Redirect handler
async function handleRedirect(request) {
    let { proto, status } = config;

    let requestURL = new URL(request.url);

    // Rewrite the host name
    let host = replaceHost(requestURL, config);

    // If no match, then return 404
    if (host == null || host == requestURL.host) {
        // return new Response(null, { status: 404 });
        return await fetch(request);
    }

    let realHost = host;
    let realStatus = status || 301;

    if (Array.isArray(host)) {
        [realHost, realStatus] = host;
    }

    let strict_host = true;

    if (!realHost.includes('://')) {
        realHost = (proto || 'https') + '://' + realHost;
        strict_host = false;
    }

    // Generate response
    let url = new URL(realHost);

    if (!strict_host) {
        url.pathname += requestURL.pathname;
        url.search = requestURL.search;
    }

    return Response.redirect(url.toString(), realStatus);

    // return new Response(url.toString());
}



addEventListener('fetch', function (event) {
    var response = handleRedirect(event.request);
    event.respondWith(response);
});
