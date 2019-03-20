function signupClicked() {
    var params = {
        url: 'http://localhost:49723/api/User/Signup',
        //withCredentials: true,    // CORS
        success: function (data) {
            alert('success');
            location.href = "../login/login.htm";
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('fail');
        }
    };
    meta.post(params);
}

function cancelClicked() {
    location.href = "../login/login.htm";
}

