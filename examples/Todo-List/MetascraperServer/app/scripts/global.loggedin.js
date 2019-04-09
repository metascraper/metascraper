// verify the user is logged in, if not redirect to the login page
meta.authorize({
    url: "../login/login.htm"
});

// user verified, load the global file
meta.loadScript({
    url: "../scripts/global.js"
});

// using meta.ready to load the header file because of need for the DOM to be loaded
meta.ready(function () {

    // load the header file
    meta.loadHeader({
        url: '../header/header.htm',
        success: function (data) {
            // headerLoaded may be a custom function on each page
            if (headerLoaded) {
                headerLoaded();   
            }

        }
    });

});  // end meta.ready
