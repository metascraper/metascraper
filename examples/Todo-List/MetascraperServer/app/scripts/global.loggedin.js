var _loaded = { isGlobalLoaded: false, isHeaderLoaded: false };


// verify the user is logged in, if not redirect to the login page
meta.authorize({
    url: "../login/login.htm"
});

// user verified, load the global file
meta.loadScript({
    url: "../scripts/global.js",
    success: function () {
        _loaded.isGlobalLoaded = true;
        checkPageReady();
    }
});


function checkPageReady() {
    // verify page is ready and script is loaded
    if (!(_loaded.isGlobalLoaded && _loaded.isHeaderLoaded))
        return;

    // headerLoaded may be a custom function on each page
    if (typeof headerLoaded === "function") {
        headerLoaded();
    }
    // pageReady may be a custom function on each page
    if (typeof pageReady === "function") {
        pageReady();
    }
};

// using meta.ready to load the header file because of need for the DOM to be loaded
meta.ready(function () {

    // load the header file
    meta.loadHeader({
        url: '../header/header.htm',
        success: function (data) {
            _loaded.isHeaderLoaded = true;
            checkPageReady();
        }
    });

});  // end meta.ready
