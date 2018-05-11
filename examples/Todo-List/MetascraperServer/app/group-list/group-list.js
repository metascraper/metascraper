const emptyGroup = { "Group": { "Description": "" } };
var groupData = {};
var groupsUrl = 'http://localhost:49723/api/groups/';

/* user clicked on row, get the selected group and bind */
function rowClicked(groupId) {
    var group = meta.filter(groupData, "GroupId", groupId, true);
    var json = { "Group" : group };
    meta.bind(json);
    /* update the screen to show save/delete buttons, focus on the textbox */
    show(btnSave);
    show(btnDelete);
    txtDescription.focus();
}

/* user editted an existing group and clicked save */
function saveClick() {
    var o = {
        url: groupsUrl,
        success: function (data) {
            refreshData();
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.put(o);
}

/* user editted an existing group and clicked create new */
function newClick() {
    var o = {
        url: groupsUrl,
        success: function (data) {
            refreshData();
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    hdnGroupId.value = "0";
    meta.post(o);
}

/* user selected a row and clicked delete */
function deleteClick() {
    if (!confirm('Delete this group?'))
        return;
    var groupId = Number(hdnGroupId.value);
    var o = {
        url: groupsUrl + groupId,
        success: function (data) {
            refreshData();
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.del(o);
}

/* refresh all data on the page */
function refreshData() {
    while (tblGroups.rows.length > 1) {
        tblGroups.deleteRow(1);
    }
    meta.bind(emptyGroup);
    var params = {
        url: groupsUrl,
        success: function (data) {
            groupData = data.Groups;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.get(params);
    hide(btnSave);
    hide(btnDelete);
}

meta.ready(function () {
    var dom = this;
    meta.loadHeader({
        url: '../header/header.htm',
        success: function (data) {
            active(navGroup);
        }
    });

    refreshData();
});