# Metascraper

Metascraper is designed with one principal in mind - reducing redundant code in javascript apps. Using Metascraper will automate the code needed for the common needs of most apps.

## Highlights:
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


## 1000ft view

### rest functions :

**get** `meta.get(options)` 

(get/read) calls `.receive()` using GET. same as `.read()`

**post** `meta.post(options)` 

(post/create) calls `.send()` using POST. same as `.create()`

**put** `meta.put(options)` 

(put/update) calls `.send()` using PUT. same as `.update()`

**del** `meta.del(options)` 

(delete/delete) calls `.send()` using DELETE
 
**create** `meta.create(options)` 

(post/create) calls `.send()` using POST. same as `.post()`

**read** `meta.read(options) `

(get/read) calls `.receive()` using GET. same as `.get()`

**update** `meta.update(options)` 

(put/update) calls `.send()` using PUT. same as `.put()`

**send** `meta.send(options)`

scrapes the page as json and sends resulting data to a REST url. Will add the Authorization header if token is available.

**receive** `meta.recieve(options)`

retrieves JSON data from a REST url and binds the data to the page. Will add the Authorization header if token is available.

**ajax** `meta.ajax(options)` 

makes an http call to a REST servive. 

## security functions :

**login** `meta.login(options)` 

automates a login by scraping a standard username/password login page, and does a POST to your authentication method. expects a JSON response that includes element called token `{ token: **token**, ... }`

**token** `meta.token()`

Retrieves the Authorization token from storage

**tokenize** `meta.tokenize(options)`

Adds the authorization token header to options.headers

## scrape html element values to json data functions

**scrape** `meta.scrape(stringify)` 

gets all of elements that has a data-value property, except for table and ul, from the page into json

**getValue** `meta.getValue(element)` 

returns value of HTML item, including input elements and multiple value elements such as when multiple is enabled on a &lt;select>. Otherwise returns innerHTML of element.


## paint html element values from json data functions

**bind** `meta.bind(data)` 

Full data bind. First populates all multiple item elements such as table or select, then sets values of all elements.

**paint** `meta.paint(data)` 

sets all single value elements (textboxes, checkboxes, etc) to the supplied data values.  Does not set multiple value elements, such as table, ul, etc  

**populate** `meta.populate(data)` 

Populates all elements that can have multiple rows or values, such as a table, ul,
or select.

**fill** `meta.fill(elem, val)` 

fills a multiple value element (select, table, list, etc) with an array of values. this can be explicitly called, if the JSON is a non-named array

**setValue** `meta.setValue(elem, val)` 

set a single value element (textbox, checkbox, etc) to a value

**formatValue** `meta.formatValue(elem, val)` 

prettifies a value on an element

```javascript
    dataTypesEnum: Object.freeze({
        date: "date",                   // 12/25/1990 or 2/15/2019
        time: "time",                   // 1:15:30 AM
        datetime: "datetime",           // 12/25/2018, 1:15:30 AM
        month: "month",                 // January
        month1: "month1",               // J
        month3: "month3",               // Jan
        monthNum: "monthNum",           // 1 index based month, January = 1
        monthNumPad: "monthNumPad",     // 1 index based month padded, January = 01
        day: "day",                     // Monday
        day1: "day1",                   // M
        day2: "day2",                   // Mo
        day3: "day3",                   // Mon
        dayNum: "dayNum",               // 1 index based day, 2 in 1/2/2003
        dayNumPad: "dayNumPad",         // 1 index based day padded, 02 in 1/2/2003
        year: "year",                   // 1990 or 2020
        year2: "year2",                 // 90 or 20 - always 2 digit year, even 100-999 and 10000+
        string: "string",
        number: "number",
        json: "json"
    }),
```

## master page functions

**loadHeader** `meta.loadHeader(opts)` 

dynamically loads an html file to the beginning of the html document

**loadFooter** `meta.loadFooter(opts)`

dynamically loads an html file to the end of the html document

**load** `meta.load(opts)`

dynamically loads an html file to any element. does not support script files

```javascript
// enum to determine where to place loaded HTML files
    loadTypesEnum: Object.freeze({
        Replace: 0,
        BeforeBeginAppend: 1,
        AfterBeginAppend: 2,
        BeforeEndAppend: 3,
        AfterEndAppend: 4,
    }),
```

## data storage functions

**store_get** `meta.store_get(name)`

retrieves value from storage previously set with `.store_set()`, returns null if expired or missing

**store_set** `meta.store_set(name, data, type, expiryhours)`

saves any value to storage with different types of expiration. type defaults to Forever. expiryhours defaults to 720 hours (30 days), and is ignored when type is forever. can also save objects, such as json


```javascript
// type
    storeTypesEnum: Object.freeze({
        ExpiryNoExtend: 1,      // extends the expiry each time it is read
        ExpiryExtend: 2,        // keep until expiry is met, extending expiry each time it is read
        OneTimeRead: 3,         // allows it to be read only once
        Forever: 4,             // DEFAULT - keeps until user deletes it
        Session: 5              // current session, does not go across tabs
    }),
```


## utility functions

**unique** `meta.unique()`

returns a unique number, not secure

**versionCheck** `meta.versionCheck(version, requiredVersion)`

compares versions returning true is version >= requiredVersion

```javascript
// all of these will return true
var isValid = meta.versionCheck(2, 1); 
isValid = meta.versionCheck('2.3.5', '2.3.4');
isValid = meta.versionCheck('2.0', '1.9.9.9.9'); 
isValid = meta.versionCheck('2.3.4.5.6', '2.3.4.5'); 
isValid = meta.versionCheck('3', '2.3.4.7.8.9'); 
```

**copy** `meta.copy(src)`

makes a copy of whatever you throw at it, even functions. all objects (json, array, html) are deep copies. 
value copy - null, undefined, number, string, date
deep copy - json, array, array of json, html node or element

**toString** `meta.toString(src)`

returns a common sense string of whatever you throw at it, such as bools, null, Arrays, JSON, NodeList 

**ready** `meta.ready(f)` 

calls function `f()` after DOM is loaded

**parseHTML** `meta.parseHTML(html, context)`

converts html string into DOM element(s)

**extend** `meta.extend(target, src)`

adds the option of src json object to target json object. 
    upon return, target will be target + src. 
    If attribute exists in both, src wins

**filter** `meta.filter(jsonArray, key, value, first)`

filters a json array to where a key matches a value
    jsonArray: the json Array you want filtered
    key: the key to match on
    value: the vlaue that the key should be
    first: true if the method returns the first found, false to return an array of eery match

**getElemAttr** `meta.getElemAttr(elem, attrName)`

safe function to get an attribute of an element. returns empty string ('') if anything goes wrong, such as elem doesnt exist

**getUrlParam** `meta.getUrlParam(name, url)`

gets a querystring value from a url. url is optional - uses current location if not specified

**select** `meta.select(options)`

returns first element that matches id

**selectAll** `meta.selectAll(filter, container)`

returns all elements that match filter. container defaults to document

```javascript
var all_p_elements                           = meta.selectAll("p");
var all_divs_with_error_or_popup_class       = meta.selectAll("div.error, div.popup");
var all_divs_inside_p_with_class_error       = meta.selectAll("div.error > p");
var all_spans_with_attr_data-src             = meta.selectAll("span[data-src]");
var all_inputs_with_attr_data-active_equal_1 = meta.selectAll("input[data-active=1]");
```

[Next >>](https://github.com/metascraper/metascraper/wiki).
