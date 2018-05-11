function signupClicked() {
    var params = {
        url: 'http://localhost:49723/api/signup',
        //withCredentials: true,    // CORS
        success: function (data) {
            alert('success');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('fail');
        }
    };
    meta.post(params);
}

