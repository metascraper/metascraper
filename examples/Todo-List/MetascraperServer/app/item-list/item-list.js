
function initPage() {
    var params = {
        url: 'http://localhost:49723/api/items',
        error: function (xhr, textStatus, errorThrown) {
            divMessage.innerHTML = "An Error Occurred";
        }
    };
    meta.get(params);
}

// headerLoaded is called from global.loggedIn.js
function headerLoaded() {
    active(navItem);
}

//you could also do:
//meta.ready(  
//    function () {
//        initPage();
//    }
//);
meta.ready(initPage);

