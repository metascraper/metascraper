# Metascraper

Metascraper is designed with one principal in mind - reducing redundant code in javascript apps. Using Metascraper will automate the code needed for the common needs of most apps.

### Highlights:
  - Easy to use, zero setup, and blazingly fast. Reference the script on your page and immediately start using Metascraper. 
  
  - Retrieve JSON data from server and bind the data to a page using one line of code - `meta.get(obj)`
  
  - Automatically convert your page inputs to JSON and send to a REST service using `meta.post(obj)`, `meta.put(obj)`, or `meta.del(obj)`
  
  - Use `meta.login(obj)` to fully automate your app client security, including: 
    - convert login credentials to JSON data
    - send credentials JSON data to your server
    - retrieve and store your security token
    - redirect to another page
    - apply token to all future 'meta.xxx()' calls.
    
  - Load headers, footers, and other DOM elements using `meta.loadHeader(obj)`, `meta.loadFooter(obj)`, and `meta.load(obj)`
  
### Example Code:
##### login.html
```html
<h3>login</h3>
<p>login by entering your credentials.</p>

<div>
    <input type='text' data-value='username' />
</div>
<div>
    <input type='password' data-value='password' />
</div>

<div id='divLoginFailed' class='hidden'>Login failed. Please try again.</div>
<button onclick='loginClicked()'>login</button>
<a href='../signup/signup.htm'>sign up</a>
```

##### login.js
```javascript
function loginClicked() {
    var params = {
        url: 'http://www.yourserver.com/api/auth',
        //withCredentials: true,      // CORS
        success: function (data) {
            location.href = '../item-list/item-list.htm';
        },
        error: function (xhr, textStatus, errorThrown) {
            divLoginFailed.className = '';
        }
    };

    meta.login(params);
}
```

##### JSON sent on meta.login(obj)
```json
{"username":"someuser","password":"somepass"}
```

##### item-list.htm
```html
<h3>Item List</h3>
<table data-array="Items" data-value="ItemId">
    <thead>
        <tr>
            <th data-text="Description" data-href="../item-detail/item-detail.htm?itemId={{*index}}">
                Name
            </th>
            <th data-text="CreateDate" data-type="date">
                Created Date
            </th>
            <th data-text="Group">
                Group
            </th>
            <th data-text="IsComplete">
                Completed
            </th>
        </tr>
    </thead>
</table>
<div id="divMessage" style="color: red"></div>
<a href="../item-detail/item-detail.htm" class="createNew">Create New</a>
```

##### item-list.js
```javascript
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
```

##### JSON recieved from meta.get(obj)
```json
{"Items":
  [
    {"ItemId":19,"Description":"Item 1","IsComplete":true,"GroupId":12,"Group":"Group 4","CreateDate":"2018-05-04T23:00:51.713","UserId":0,"Username":null},
    {"ItemId":20,"Description":"Item 2","IsComplete":false,"GroupId":13,"Group":"Group 3","CreateDate":"2018-05-05T23:00:51.713","UserId":0,"Username":null},
    {"ItemId":21,"Description":"Item 3","IsComplete":false,"GroupId":12,"Group":"Group 4","CreateDate":"2018-05-06T23:00:51.713","UserId":0,"Username":null},
    {"ItemId":22,"Description":"Item 4","IsComplete":true,"GroupId":11,"Group":"Group 1","CreateDate":"2018-05-03T23:00:51.713","UserId":0,"Username":null}
  ]
}
```
