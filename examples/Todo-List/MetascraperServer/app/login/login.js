function loginClicked() {
    var params = {
        url: 'http://localhost:49723/api/User/Login',
        //withCredentials: true,      // CORS
        success: function (data) {
            location.href = '../item-list/item-list.htm';
        },
        error: function (jqXHR, textStatus, errorThrown) {
            show(divLoginFailed);
        }
    };
    meta.login(params);
}
