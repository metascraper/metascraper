const itemsUrl = 'http://localhost:49723/api/items/';

function saveClick() {
    var o = {
        url: itemsUrl,
        success: function (data) {
            location.href = "../item-list/item-list.htm";
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    if (hdnItemId.value === "0")
        meta.post(o);
    else
        meta.put(o);
}

function deleteClick() {
    if (!confirm('Delete this item?'))
        return;
    var itemId = Number(hdnItemId.value);
    var o = {
        url: itemsUrl + itemId,
        success: function (data) {
            location.href = "../item-list/item-list.htm";
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.del(o);
}

function initPage() {
    meta.loadHeader({
        url: '../header/header.htm',
        success: function (data) {
            active(navItem);
        }
    });

    var itemId = meta.getUrlParam('itemId') || "0";
    if (itemId) {
        btnDelete.classList.remove('none');
    } 
    var o = {
        url: itemsUrl + itemId,
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.get(o);

    
}

meta.ready(
    function () {
        initPage();
    }
);