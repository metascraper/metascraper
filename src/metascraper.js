/*!
 * Metascraper JavaScript Library v0.7.0
 * https://metascraper.com/
 *
 * Copyright Metascraper
 * Released under the MIT license
 * https://en.wikipedia.org/wiki/MIT_License
 *
 * Date: 2018-04-27T12:34Z
 */

if ("undefined" == typeof jQuery) throw new Error("Metascraper requires jQuery");

var meta = {

    //_self: this,

    projectName: "Metascraper",
    version: "0.7.0",

    options: {
        webApiPrefix: "http://localhost:54702/api/",    // fully qualified webapi root
        UnauthRedir: "/app/login.htm",                  // redirect on 401 Unauthorized
        attrName: "data-value",                         // property that is the value (id/key) of the element, sent on page scrape
        attrMemberName: "data-member",                  // name of the data to use, can be blank for json root 
        attrArrayName: "data-array",                    // array to use to populate multi-elements 
        attrTextName: "data-text",                      // array - display value
        attrHrefName: "data-href",                      // link for multi-elements (table, ul)
        attrClickName: "data-click",                    // onclick for multi-elements (table, ul)
        attrTypeName: "data-type",                      // type of data, used for formatting (date, string, number, json(?), etc)
        attrClassName: "data-class",                    // applies a class to a multi element, such as <td> or <tr>
        attrScrapeName: "data-scrape",                  // bool whether to scrape field, default to true
        indexName: "{{*index}}",                        // apply the primary key to a link
        tokenName: "{{*token}}",                        // name of security token in storage
        scrape: true                                    // should it scrape the page on send?
    },

    // enum to determine where to place loaded HTML files
    loadTypesEnum: Object.freeze({
        Replace: 0,
        BeforeBeginAppend: 1,
        AfterBeginAppend: 2,
        BeforeEndAppend: 3,
        AfterEndAppend: 4,
    }),

    storeTypesEnum: Object.freeze({
        ExpiryNoExtend: 1,      // extends the expiry each time it is read, 30 days from set
        ExpiryExtend: 2,        // keep until expiry is met, extending each time it is read, 30 days since last get
        OneTimeRead: 3,         // allows it to be read only once
        Forever: 4,             // DEFAULT - keeps until user deletes it
        Session: 5              // current session, does not go across tabs
    }),

    // enum to determine type of data expected to be in an element
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

    // START - RestApi functions

    send: function (opts) {
        // scrape page for data, and allow user to override data items
        var shouldScrape = meta.options.scrape;
        if (typeof opts.scrape !== 'undefined') {
            shouldScrape = opts.scrape;
        }
        // create the page data
        var request = shouldScrape ? this.scrape(true) : {};
        if (opts.data)
            this.extend(request.data, opts.data);

        // default options
        var o = {
            contentType: "application/json",
            dataType: "json",
            data: request
        };

        // update o with options
        this.extend(o, opts);

        // set the proper url (unless it is fully qualified)
        if (o.url.indexOf('://') == -1)     // bit of a hack, should work
            o.url = this.options.webApiPrefix + o.url;

        this.tokenize(o);
        this.ajax(o);
    },

    receive: function (opts) {
        var success = opts.success;

        // default options
        var o = {
            contentType: "application/json",
            dataType: "json"
        };

        // update o with options
        this.extend(o, opts);

        // we need to override the success piece to save the token, then do the client callback
        o.success = function (data, textStatus, jqXHR) {
            meta.bind(data);
            if (success)
                success(data, textStatus, jqXHR);
        };

        // set the proper url (unless it is fully qualified)
        var idx = o.url.indexOf('://')
        if (idx === -1 || idx > 7)     // bit of a hack, should work
            o.url = this.options.webApiPrefix + o.url;

        this.tokenize(o);
        this.ajax(o);
    },

    get: function (opts) {
        var d = { method: "GET" };
        this.extend(d, opts);
        this.receive(d);
    },

    post: function (opts) {
        var d = { method: "POST" };
        this.extend(d, opts);
        this.send(d);
    },

    put: function (opts) {
        var d = { method: "PUT" };
        this.extend(d, opts);
        this.send(d);
    },

    // this had to be renamed to del, delete is a js keyword
    del: function (opts) {
        var d = { method: "DELETE" };
        this.extend(d, opts);
        this.send(d);
    },

    create: function (opts) {
        this.post(opts);
    },

    read: function (opts) {
        this.get(opts);
    },

    update: function (opts) {
        this.put(opts);
    },


    // START - security functions
    
    token: function () {
        var store = window.localStorage;
        return store.getItem(meta.options.tokenName);
    },

    tokenize: function (opts) {
        var token = meta.token();
        if (!(token))
            return;
        var authHeader = { 'Authorization': 'Bearer ' + token };
        if (!(opts.headers))
            opts.headers = {};
        this.extend(opts.headers, authHeader);
    },

    login: function (opts) {
        var success = opts.success;
        var o = {
            url: "Auth/Login"
        };

        // merge the options
        this.extend(o, opts);

        // we need to override the sucess piece to save the token, then do the client callback
        o.success = function (data, textStatus, jqXHR) {
            var store = window.localStorage;
            store.setItem(meta.options.tokenName, data.token);
            if (success)
                success(data, textStatus, jqXHR);
        };

        this.post(o);
    },


    // START - DOM scrape functions

    // gets the value of an element
    // if the value can be multiple values (SELECT with multiple enabled), then an array is returned
    getValue: function (elem) {
        // add the field to json dynamically
        if (elem instanceof HTMLInputElement)
            if (elem.type === "checkbox")
                return elem.checked;
            else
                return elem.value;
        else if (elem instanceof HTMLSelectElement)
            if (elem.multiple) {
                var value = [];
                var collection = elem.selectedOptions;
                for (var i = 0; i < collection.length; i++) {
                    value.push(collection[i].value);
                }
                return value;
            }
            else
                return elem.value;
        else
            return elem.innerHTML;
    },

    // gets all of the data from the page into json
    // scrapes anything that has a data-value property, except for table and ul
    scrape: function (stringify) {
        var jsonRequest = {};
        var attrName = meta.options.attrName;
        
        var elems = this.selectAll("[" + attrName + "]");
        for (var i = 0; i < elems.length; i++) {
            // check for elements that do not be scraped (table/ul)
            if (elems[i] instanceof HTMLTableElement || elems[i] instanceof HTMLUListElement) {
                continue;
            }
            // check no-scrape
            if (elems[i].hasAttribute(meta.options.attrScrapeName)) {
                var scrapeit = JSON.parse(elems[i].getAttribute(meta.options.attrScrapeName))
                if (scrapeit == false)
                    continue;
            }
            // add the field to json dynamically
            // removed ability to have multiple json objects in a call
            // because rest does not handle it well
            /*if (elems[i].hasAttribute(meta.options.attrMemberName)) {
                
                var member = elems[i].getAttribute(meta.options.attrMemberName)
                if (!(jsonRequest[member]))
                    jsonRequest[member] = {};
                jsonRequest[member][elems[i].getAttribute(attrName)] = meta.getValue(elems[i]);

            } else {
                jsonRequest[elems[i].getAttribute(attrName)] = meta.getValue(elems[i]);
            }*/
            jsonRequest[elems[i].getAttribute(attrName)] = meta.getValue(elems[i]);
        }

        if (stringify)
            return JSON.stringify(jsonRequest);
        else
            return jsonRequest;
    },

    // START - paint functions

    // handle any data type formatting
    formatValue: function (elem, val) {
        try {
            if (elem.hasAttribute(meta.options.attrTypeName)) {
                var type = elem.getAttribute(meta.options.attrTypeName);
                if (type == meta.dataTypesEnum.string) {
                    // do nothing
                }

                else if (type == meta.dataTypesEnum.number)
                    val = new Number(val);

                else if (type == meta.dataTypesEnum.date || type == meta.dataTypesEnum.time || type == meta.dataTypesEnum.datetime ||
                        type == meta.dataTypesEnum.month || type == meta.dataTypesEnum.month1 || type == meta.dataTypesEnum.month3 ||
                        type == meta.dataTypesEnum.monthNum || type == meta.dataTypesEnum.monthNumPad ||
                        type == meta.dataTypesEnum.day || type == meta.dataTypesEnum.day1 || type == meta.dataTypesEnum.day2 ||
                        type == meta.dataTypesEnum.day3 || 
                        type == meta.dataTypesEnum.dayNum || type == meta.dataTypesEnum.dayNumPad || 
                        type == meta.dataTypesEnum.year || type == meta.dataTypesEnum.year2
                        )
                {
                    val = new Date(val);
                    if (type == meta.dataTypesEnum.date)
                        val = val.toLocaleDateString();
                    else if (type == meta.dataTypesEnum.time)
                        val = val.toLocaleTimeString();
                    else if (type == meta.dataTypesEnum.datetime)
                        val = val.toLocaleString();
                    else if (type == meta.dataTypesEnum.month) 
                    {
                        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        val = monthNames[val.getMonth()];
                    } 
                    else if (type == meta.dataTypesEnum.month1)
                    {
                        var monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                        val = monthNames[val.getMonth()];
                    } 
                    else if (type == meta.dataTypesEnum.month3)
                    {
                        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        val = monthNames[val.getMonth()];
                    } 
                    else if (type == meta.dataTypesEnum.monthNum)
                    {
                        val = val.getMonth() + 1;
                    }
                    else if (type == meta.dataTypesEnum.monthNumPad)
                    {
                        var month = val.getMonth() + 1;
                        val = month < 10 ? '0' + month.toString() : month.toString();
                    }  
                    else if (type == meta.dataTypesEnum.day)
                    {
                        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        val = dayNames[val.getDay()];
                    } 
                    else if (type == meta.dataTypesEnum.day1)
                    {
                        var dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                        val = dayNames[val.getDay()];
                    } 
                    else if (type == meta.dataTypesEnum.day2)
                    {
                        var dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                        val = dayNames[val.getDay()];
                    } 
                    else if (type == meta.dataTypesEnum.day3)
                    {
                        var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        val = dayNames[val.getDay()];
                    } 
                    else if (type == meta.dataTypesEnum.dayNum)
                    {
                        val = val.getDate();
                    }
                    else if (type == meta.dataTypesEnum.dayNumPad)
                    {
                        var day = val.getDate();
                        val = day < 10 ? '0' + day.toString() : day.toString();
                    }
                    else if (type == meta.dataTypesEnum.year)
                        val = val.getFullYear();
                    else if (type == meta.dataTypesEnum.year2) {
                        var year = val.getFullYear();
                        if (year > -10 && year < 10) {
                            if (year < 0) {
                                val = '-0' + (year * -1).toString();
                            } else {
                                val = '0' + year.toString();
                            }
                        } else if (year < 100 && year > -100) {
                            val = year;
                        } else {      // this works for all 3+ digit years 
                            var yearStr = year.toString();
                            yearStr = year.substr(yearStr.length - 2, 2);
                            if (year < 0)
                                yearStr = '-' + yearStr;
                            val = parseInt(yearStr);  
                        } 
                    }
                }

                else if (type == meta.dataTypesEnum.json)
                    val = JSON.stringify(val);

            }
        } catch (e) { }
        return val;
    },

    // set a single value element (textbox, checkbox, etc) to a value
    setValue: function (elem, val) {
        val = meta.formatValue(elem, val);

        // html select
        if (elem instanceof HTMLSelectElement)
            elem.value = val;
        //elem.options.namedItem(val).selected = true;

        // html inputs
        else if (elem instanceof HTMLInputElement)
            if (elem.type === "checkbox")
                elem.checked = val;
            else
                elem.value = val;

        // everything else
        else
            elem.innerHTML = val;
    },

    // sets all single value elements (textboxes, checkboxes, etc) to the supplied data values. 
    // does not set multiple value elements, such as table, ul, etc  
    paint: function (data, container) {
        container = container || document; 
        var attrName = meta.options.attrName;
        var elems = this.selectAll("[" + attrName + "]", container);   // scrape
        for (var i = 0; i < elems.length; i++) {
            // set the field to json dynamically
            var value = null;
            if (elems[i].hasAttribute(meta.options.attrMemberName)) {
                var member = elems[i].getAttribute(meta.options.attrMemberName)
                if (member && data[member]) {
                    value = data[member][elems[i].getAttribute(attrName)];
				}
            } else {
                value = data[elems[i].getAttribute(attrName)];
			}
            if (!(value == null))
                meta.setValue(elems[i], value);
        }
    },


    // fills a multiple value element (select, table, list, etc) with an array of values 
    // this can be explicitly called, if the JSON is a non-named array
    fill: function (elem, data) {
        var dataValue = elem.getAttribute(meta.options.attrName)
        // handle a select
        if (elem instanceof HTMLSelectElement) {
            if (!(dataValue) || !elem.hasAttribute(meta.options.attrTextName))
                return;
            var dataText = elem.getAttribute(meta.options.attrTextName)
            var className = elem.getAttribute(meta.options.attrClassName);

            for (var x = 0; x < data.length; x++) {
                var opt1 = document.createElement("option");
                if (className && className.length > 0)
                    opt1.classList.add(className);
                opt1.value = data[x][dataValue];
                opt1.text = meta.formatValue(elem, data[x][dataText]);
                elem.add(opt1, null);
            }
        } else if (elem instanceof HTMLTableElement) {
            var headRow = elem.tHead; // grab the header row
            if ((!(headRow)) || (!(headRow.rows)) || headRow.rows.length == 0)
                return;
            var headCells = headRow.rows[0].cells; // grab the header cells
            if ((!(headCells)) || headCells.length == 0)
                return;
            var rowHref = meta.getElemAttr(headRow.rows[0], meta.options.attrHrefName); // custom data-href
            var rowClick = meta.getElemAttr(headRow.rows[0], meta.options.attrClickName); // custom data-click           
            var rowClass = meta.getElemAttr(headRow.rows[0], meta.options.attrClassName); // custom data-class
            for (var r = 0; r < data.length; r++) { // forEach item in data
                var tr = elem.insertRow(-1); // create a new table row 
                if (rowHref && rowHref.length > 0 && rowClick && rowClick.length > 0) { 
                    throw 'ERROR reported by ' + meta.projectName + '. Cannot apply ' + meta.options.attrHrefName + ' and ' + meta.options.attrClickName + ' to a tr element.';
                }
                if (rowHref && rowHref.length > 0) {      // does the row have an href?
                    var rowHrefVal = (dataValue.length > 0) ? rowHref.replace(meta.options.indexName, data[r][dataValue]) : rowHref;
                    tr.setAttribute("onclick", "location.href = '" + rowHrefVal + "'");
                }
                if (rowClick && rowClick.length > 0) {      // does the row have an click?
                    var rowClickVal = (dataValue.length > 0) ? rowClick.replace(meta.options.indexName, data[r][dataValue]) : rowClick;
                    tr.setAttribute("onclick", rowClickVal);
                }
                if (rowClass && rowClass.length > 0) {      // does the row have a class?
                    tr.classList.add(rowClass);
                }
                for (var c = 0; c < headCells.length; c++) { // loop through the columns 
                    var td = tr.insertCell(-1); // create new columns
                    if (!headCells[c].hasAttribute(meta.options.attrTextName))
                        continue;
                    var cellHref = meta.getElemAttr(headCells[c], meta.options.attrHrefName);
                    var cellClick = meta.getElemAttr(headCells[c], meta.options.attrClickName);
                    var dataColumnValue = headCells[c].getAttribute(meta.options.attrTextName);
                    var cellClass = meta.getElemAttr(headCells[c], meta.options.attrClassName);
                    if (cellClass && cellClass.length > 0) { 
                        td.classList.add(cellClass);
                    }
                    if (!(data[r][dataColumnValue] === undefined)) {
                        var cellText = meta.formatValue(headCells[c], data[r][dataColumnValue]); // set cell value
                        if (cellHref && cellHref.length > 0) {
                            var a = document.createElement('a');
                            var linkText = document.createTextNode(cellText);
                            a.appendChild(linkText);
                            //a.title = "my title text";
                            if (cellClick && cellClick.length > 0) {      // does the row have an click?
                                a.setAttribute("onclick", cellClick.replace(meta.options.indexName, data[r][dataValue]));
                            }
                            a.href = cellHref.replace(meta.options.indexName, data[r][dataValue]);
                            td.innerHTML = a.outerHTML;
                        }
                        else {
                            td.innerHTML = cellText;
                            if (cellClick && cellClick.length > 0) {      // does the row have an click?
                                td.setAttribute("onclick", cellClick.replace(meta.options.indexName, data[r][dataValue]));
                            }
                        }
                    }

                }
            }
        } else if (elem instanceof HTMLUListElement) {
            var ulDataText = meta.getElemAttr(elem, meta.options.attrTextName)
            if (!ulDataText)
                return;
            var ulHref = meta.getElemAttr(elem, meta.options.attrHrefName);
            var ulClick = meta.getElemAttr(elem, meta.options.attrClickName);
            var ulClassName = meta.getElemAttr(elem, meta.options.attrClassName);
            for (var i = 0; i < data.length; i++) { // forEach item in data
                var li = document.createElement("li");
                if (ulClassName && ulClassName.length > 0)
                    li.classList.add(ulClassName);
                var liText = meta.formatValue(elem, data[i][ulDataText]);
                if (ulHref && ulHref.length > 0) {
                    var a = document.createElement('a');
                    var linkText = document.createTextNode(liText);
                    a.appendChild(linkText);
                    //a.title = "my title text";
                    if (ulClick && ulClick.length > 0) {      // does the row have an click?
                        a.setAttribute("onclick", ulClick.replace(meta.options.indexName, data[i][dataValue]));
                    }
                    a.href = ulHref.replace(meta.options.indexName, data[i][dataValue]);
                    li.appendChild(a);
                }
                else {
                    li.appendChild(document.createTextNode(liText));
                    if (ulClick && ulClick.length > 0) {      // does the row have an click?
                        li.setAttribute("onclick", ulClick.replace(meta.options.indexName, data[i][dataValue]));
                    }
                }
                
                if (data[i][dataValue])
                    li.setAttribute("id", data[i][dataValue]);      // added line
                elem.appendChild(li);
            }
        }
    },

    // fills all the multiple value elements (select, table, etc) 
    // does not set any values
    populate: function (data, container) {
        container = container || document; 
        var attrArrayName = meta.options.attrArrayName;
        var elems = this.selectAll("[" + attrArrayName + "]", container);   // scrape
        for (var i = 0; i < elems.length; i++) {
            // set the field to json dynamically
            var fillData = data[elems[i].getAttribute(attrArrayName)]
                ? data[elems[i].getAttribute(attrArrayName)]
                : data;
            //if (!Array.isArray(fillData)) [
            //    fillData = [ fillData ];
            meta.fill(elems[i], fillData);
        }
    },

    // Full data bind. First populates all multiple item elements such as table or select,
    // then sets values of all elements.
    // container is optional
    bind: function(data, container) {
        container = container || document; 
        meta.populate(data, container);
        meta.paint(data, container);
    },

    // START master page functions

    load: function (opts) {
        var success = opts.success;
        var elem = opts.elem;
        var o = {
            method: "GET",
            url: opts.url,
            
        };
        // merge the options
        this.extend(o, opts);
        o.success = function (data, textStatus, jqXHR) {
            // could not use insertAdjacentHTML since it creates the node
            // and sometimes we dont want the node to be closed
            if (o.loadType == meta.loadTypesEnum.BeforeBeginAppend)
                elem.outerHTML = data + elem.outerHTML;
            else if (o.loadType == meta.loadTypesEnum.AfterBeginAppend)
                elem.innerHTML = data + elem.innerHTML;
            else if (o.loadType == meta.loadTypesEnum.BeforeEndAppend)
                elem.innerHTML = elem.innerHTML + data;
            else if (o.loadType == meta.loadTypesEnum.AfterEndAppend)
                elem.innerHTML = elem.outerHTML + data;
            else
                elem.innerHTML = data;
            if (success)
                success(data, textStatus, jqXHR);
        };
        
        this.ajax(o);
    },

    loadHeader: function (opts) {
        var o = {
            elem: document.body,
            loadType: meta.loadTypesEnum.AfterBeginAppend
        }
        // merge the options
        this.extend(o, opts);
        this.load(o);
    },

    loadFooter: function (opts) {
        var o = {
            elem: document.body,
            loadType: meta.loadTypesEnum.BeforeEndAppend
        }
        // merge the options
        this.extend(o, opts);
        this.load(o);
    },

    // START store functions

    // type defaults to Forever
    // expiry defaults to 720 hours (30 days), can be ignored when type is forever
    // can take objects, such as json
    store_set: function (name, data, type, expiryhours) {
        type = type || meta.storeTypesEnum.Forever;
        expiryhours = expiryhours || 720;

        var dataStr = this.toString(data);

        var now = new Date();
        var obj = {
            value: dataStr,
            type: type,
            expiry: expiryhours,
            created: now.getTime(),
            lastread: now.getTime()
        }
        var storage = (type === meta.storeTypesEnum.Session)
                ? window.sessionStorage
                : window.localStorage;
        var objStr = JSON.stringify(obj);
        storage.setItem(name, objStr);
    },

    // gets the value if its available, else null
    store_get: function (name) {
        // get the value from local storage
        var storage = window.localStorage;
        var json = storage.getItem(name);
        // didnt exist, check session
        if (!(json)) {
            storage = window.sessionStorage;
            json = storage.getItem(name);
        }
        // value doesnt exist at all
        if (!(json)) 
            return null;

        try {
            var obj = JSON.parse(json);
            if (obj.type == meta.storeTypesEnum.Session)
                return obj.value;
            else if (obj.type == meta.storeTypesEnum.Forever)
                return obj.value;
            else if (obj.type == meta.storeTypesEnum.OneTimeRead) {
                var value = obj.value;
                storage.setItem(name, null);
                return value;
            } else if (obj.type == meta.storeTypesEnum.ExpiryNoExtend) {
                var expiry = new Date();
                expiry.setTime(obj.created);
                expiry.setHours(expiry.getHours() + obj.expiry);
                var now = new Date();
                if (now.getTime() <= expiry.getTime())
                    return obj.value;
            } else if (obj.type == meta.storeTypesEnum.ExpiryExtend) {
                var expiry = new Date();
                expiry.setTime(obj.lastread);
                expiry.setHours(expiry.getHours() + obj.expiry);
                var now = new Date();
                if (now.getTime() <= expiry.getTime()) {
                    obj.lastread = now.getTime();
                    // update the lastread value
                    storage.setItem(name, JSON.stringify(obj));
                    return obj.value;

                }
            }
        } catch (e) { };
        return null; 
    },

    // START util functions

    /// filters a json array to where a key matches a value
    /// jsonArray: the json Array you want filtered
    /// key: the key to match on
    /// value: the vlaue that the key should be
    /// first: true if the method returns the first found, false to return an array of every match
    filter: function(jsonArray, key, value, first) {
        var arr = []
        for (var i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i][key] == value)
                if (first)
                    return jsonArray[i];
                else
                    arr.push(jsonArray[i]);
        }
        return arr;
    },

    // gets a querystring value from a url
    // url is optional - uses current location if not specified
    getUrlParam: function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    // safe function to get an attribute of an element
    // returns empty string ('') if anything goes wrong, such as elem doesnt exist
    getElemAttr: function (elem, attrName) {
        try {
            return elem.getAttribute(attrName);
        } catch (e) { }
        return '';
    },

    // returns a unique number, not secure
    unique: function () {
        var d = new Date();
        return d.getTime();
    },

    // makes a copy of whatever you throw at it
    // all objects (json, array, html) are deep copies
    // value copy - null, undefined, number, string, date, 
    // deep copy - json, array, array of json, html node or element
    // functions too
    copy: function(src) {
        // Handle the 3 simple types or null or undefined
        if (src === null || typeof src != "object") return src;

        // handle html element
        if (src instanceof Node) {
            if (src.outerHTML) {    // handle elements                
                return this.parseHTML(src.outerHTML)
            } else {                // everything else
                return src.cloneNode(true);
            }
        }

        if (src instanceof NodeList) {
            var docfrag = document.createDocumentFragment();
            var len = src.childNodes ? src.childNodes.length : src.length;
            var orig;
            var copy;
            for (var i = 0; i < len; i++) {
                orig = null;
                if (src.childNodes && src.childNodes.length && src.childNodes[i])
                    orig = src.childNodes[i];
                else if (src.length && src[i])
                    orig = src[i];
                if (!(orig)) continue;
                var copy = this.copy(orig);
                docfrag.appendChild(copy);
            }
            return docfrag;
        }

        // handle array and json objects
        if (src.constructor === Array || src.constructor === Object) {
            try {
                return JSON.parse(JSON.stringify(src)); 
            } catch (jsonErr) {
                console.log('Error: meta.copy: unable to parse source as json')
            }
        } 

        // handle date
        if (src.constructor === Date) {
            target = new Date();
            target.setTime(src.getTime());
            return target;
        }

        // unknown - fallback
        return new src.constructor(src);
    },

    toString: function(src) {
        if (src === null || typeof src != "object") 
            return src;

        if (src.constructor === Array || src.constructor === Object) {
            try {
                return JSON.stringify(src); 
            } catch (jsonErr) {
                console.log('Error: meta.toString: unable to parse source as json')
            }
        }

        // handle html element
        if (src instanceof Node) {
            if (src.outerHTML)     // handle elements                
                return src.outerHTML;
        }

        if (src instanceof NodeList) {
            var html = '';
            if (docfrag && docfrag.childNodes && docfrag.childNodes.length && docfrag.childNodes.length > 0) {
                for (var i = 0; i < docfrag.childNodes.length; i++) {
                    if (!(docfrag.childNodes[i])) continue;
                    if (docfrag.childNodes[i].outerHTML) {
                        html += docfrag.childNodes[i].outerHTML;
                    } else if (docfrag.childNodes[i].textContent) {
                        html += docfrag.childNodes[i].textContent;
                    }
                }
            }
            return html;
        }

        if (src.constructor === Date) {
            return src.toString();
        }

        console.log('Error: meta.toString: unable to parse source');

    },

    // can check numbers, semvers, and most any numeric values with unlimited separators
    // ex 2 > 1, 2.3.5 > 2.3.4, 2.0 > 1.9.9,  2.3.4.5.6 > 2.3.4.5, 3 > 2.3.5.4.7.8.9, etc
    versionCheck: function(semVer, requiredSemVer) {
        if (semVer === requiredSemVer)  // they should be strings
            return true;
        
        semVerArr = semVer.toString().split('.');
        requiredSemVerArr = requiredSemVer.toString().split('.');
       // for (var i = 0; i < semVerArr.length; i++) {
       //     if (requiredSemVerArr.length == i)
        for (var i = 0; i < requiredSemVerArr.length; i++) {
            if (semVerArr.length == i)
                  return false;
            if (parseInt(semVerArr[i]) > parseInt(requiredSemVerArr[i]))
                return true; 
            if (parseInt(semVerArr[i]) < parseInt(requiredSemVerArr[i]))
                return false; 
        }
        return true;
    },

    // START jQuery light 
    
    // deep extend of src into target
    // need to check values of null, undefined, dates
    // html nodes and functions are by reference, not by value, so changing the value of one affects the other
    extend: function (target, src) { 
        for (var key in src) {
            var srcVal = src[key];
            if (srcVal === null || typeof srcVal != 'object' || srcVal instanceof Node) {
                //console.log('key:' + key);
                target[key] = srcVal;
            }
            else if (src.constructor === Date) {
                //console.log('date:' + key);
                var d = new Date();
                d.setTime(srcVal.getTime());
                target[key] = d;
            } else {
                //console.log('extending:' + key);
                // create a default value
                target[key] = Array.isArray(src) ? [] : {};     
                target[key] = this.extend(target[key], srcVal);
            }
        }
        return target;
    },

    ajax: function (opts) { 
        $.ajax(opts); 
    },
    
    ready: function (f) {
        var state = document.readyState;
        if (state === 'interactive' || state === 'complete')
            f()
        else
            setTimeout(function () { meta.ready(f) }, 100);
    },
    
    select: function (id) { 
        return document.getElementById(id); 
    },        
          
    selectAll: function (filter, container) {
        container = container || document; 
        return container.querySelectorAll(filter); 
    },
    
    parseHTML : (function() {
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            rhtml = /<|&#?\w+;/,
            wrapMap = {
                // Support: IE9
                option: [1, "<select multiple='multiple'>", "</select>"],

                thead: [1, "<table>", "</table>"],
                col: [2, "<table><colgroup>", "</colgroup></table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

                _default: [0, "", ""]
            };
        
        //
        // @param {String} html A string containing html
        // @param {Document} context
        // 
        return function parseHTML(html, context) {
            if (!(html)) return null;
            context = context || document;

            var tmp, tag, wrap, j,
                fragment = context.createDocumentFragment();

            if (!rhtml.test(html)) {
                fragment.appendChild(context.createTextNode(html));

                // Convert html into DOM nodes
            } else {
                tmp = fragment.appendChild(context.createElement("div"));

                // Deserialize a standard representation
                tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                tmp.innerHTML = wrap[1] + html.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

                // Descend through wrappers to the right content
                j = wrap[0];
                while (j--) {
                    tmp = tmp.lastChild;
                }

                // Remove wrappers and append created nodes to fragment
                fragment.removeChild(fragment.firstChild);
                while (tmp.firstChild) {
                    fragment.appendChild(tmp.firstChild);
                }
            }

            return fragment;
        };
    }()),


};