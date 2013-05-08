/*
less = {
	env: "development", // or "production"
	async: false,       // load imports async
    fileAsync: false,   // load imports async when in a page under a file protocol
    poll: 1000,         // when in watch mode, time in ms between polls
    functions: {},      // user functions, keyed by name
    dumpLineNumbers: "comments", // or "mediaQuery" or "all"
    relativeUrls: false,// whether to adjust url's to be relative if false, url's are already relative to the
                            // entry less file
    rootpath: ":/css/"// a path to add on to the start of every url resource
};
*/

requirejs.config({
    baseUrl:    "../",
    paths: {
        "jquery":       "js/jquery-1.9.1",
        "ko":           "js/knockout-2.2.1.debug",
        "less":         "js/less-1.3.3.min",
        "socket.io":    "js/socket.io"
    }
});
            
require(["jquery", "ko", "socket.io", "less"], function($, ko) {
    require(["js/mocsarVM"], function (mocsar) {
        $(document).ready (function () {
            ko.applyBindings (mocsar());
        });
    });
});