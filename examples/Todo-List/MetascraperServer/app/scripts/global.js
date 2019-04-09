function show(elem) {
    // works in IE 9
    elem.className = elem.className.replace(/\bhidden\b/g, "");
}

function hide(elem) {
    if (elem.className.length > 0) {
        elem.className += " hidden";
    } else {
        elem.className = "hidden";
    }
}

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function responsive() {
    var x = document.getElementById("topnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function active(elem) {
    navItem.className = elem.className.replace(/\bactive\b/g, "");
    navGroup.className = elem.className.replace(/\bactive\b/g, "");
    elem.className = "active";
}

function logout() {
    meta.logout();
    location.href = "../login/login.htm";
}

// dynamically load global css file on all pages
meta.loadStyleSheet({
    url: "../styles/global.css"
});