const emptyGroup = { "Group": { "Description": "" } };
var groupsUrl = 'http://localhost:49723/api/groups/';

/* user clicked on row, get the selected group and bind */
function rowClicked(groupId) {
    // setting "key" to "groupData" on function refreshData below allows us to access the json returned
    var group = meta.filter(meta.data.groupData.Groups, "GroupId", groupId, true);
    var json = { "Group" : group };
    // binds the selected group to the edit fields
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
        pk: "GroupId",
        success: function (data) {
            refreshData();
        },
        error: function (xhr) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.save(o);
}

/* user clicked create new */
function newClick() {
    hdnGroupId.value = "0";
    saveClick();
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
    // remove all the rows from the table
    while (tblGroups.rows.length > 1) {
        tblGroups.deleteRow(1);
    }
    // binds an empty group, which inheritly clears out all edit fields 
    meta.bind(emptyGroup);  
    var params = {
        url: groupsUrl,
        key: "groupData",
        error: function (jqXHR, textStatus, errorThrown) {
            divMessage.innerText = "An Error Occurred. Please Try Again.";
        }
    };
    meta.get(params);
    hide(btnSave);
    hide(btnDelete);
}

// headerLoaded is called from global.loggedIn.js
function headerLoaded() {
    active(navGroup);
}

meta.ready(function () {
    refreshData();
});