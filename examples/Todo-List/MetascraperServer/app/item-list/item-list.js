function initPage() {
    meta.loadHeader({
        url: '../header/header.htm',
        success: function (data) {
            active(navItem);
        }
    });

    var params = {
        url: 'http://localhost:49723/api/items',
        error: function (xhr, textStatus, errorThrown) {
            divMessage.innerHTML = "An Error Occurred";
        }
    };
    meta.get(params);
};

meta.ready(
    function () {
        initPage();
    }
);
