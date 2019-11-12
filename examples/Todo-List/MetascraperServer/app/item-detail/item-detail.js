const itemsUrl = 'http://localhost:49723/api/items/';

function saveClick() {
    var o = {
        url: itemsUrl,
        pk: "ItemId",   // set pk to the primary key to allow meta.save to work
        success: function (data) {
            location.href = "../item-list/item-list.htm";
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.save(o);  //  one call handles both create and update
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
    meta.delete(o);
}

function initPage() {
    var itemId = meta.getUrlParam('itemId') || "0";
    if (itemId !== "0") {
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

// DOM and scripts are loaded, call initPage(); 
function pageReady() {
    initPage();
    active(navItem);
}