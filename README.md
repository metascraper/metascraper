# Metascraper

Metascraper is designed with one principal in mind - reducing redundant code in javascript apps. Using Metascraper will automate the code needed for the common needs of most apps.

### Highlights:
  - Retrieve JSON data from server and bind the data to a page using one line of code - `meta.get(obj)`
  
  - Automatically convert your page inputs to JSON and send to a REST service using `meta.post(obj)`, `meta.put(obj)`, or `meta.del(obj)`
  
  - Use `meta.login(obj)` to fully automate your security process, including: 
    - convert login credentials to JSON data
    - send credentials JSON data to your server
    - retrieve and store your security token
    - redirect to another page
    - apply token to all future 'meta.xxx()' calls.
  
### Example:
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

##### JSON sent to server
```json
{"username":"someuser","password":"somepass"}
```

