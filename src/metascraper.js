/*!
 * Metascraper JavaScript Library v1.0.0
 * https://metascraper.com/
 *
 * Copyright Metascraper
 * Released under the MIT license
 * https://en.wikipedia.org/wiki/MIT_License
 *
 * Date: 2019-04-08T12:34Z
 */

var meta = {

    projectName: "Metascraper",
    version: "1.0.0",

    modes: {
        developer: 0,
        warning: 5,
        error: 9
    },

    options: {
        webApiPrefix: "http://localhost:54702/api/",    // fully qualified webapi root
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
        tokenName: "Token",                             // name of security token in storage, used in data return value on login
        scrape: true,                                   // should it scrape the page on send?
        mode: 5
    },

    // enum to determine where to place loaded HTML files
    loadTypesEnum: Object.freeze({
        Replace: 0,
        BeforeBeginAppend: 1,
        AfterBeginAppend: 2,
        BeforeEndAppend: 3,
        AfterEndAppend: 4
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
        dayNum: "dayNum",               // 1 index based day, 2 in Jan 2,2003
        dayNumPad: "dayNumPad",         // 1 index based day padded, 02 in Jan 2,2003
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
        if (opts.data) {
            if (!request.data)
                request.data = {};
            this.extend(request.data, opts.data);
        }

        // default options
        var o = {
            contentType: "application/json",
            dataType: "json",
            data: request
        };

        // update o with options
        this.extend(o, opts);

        // set the proper url (unless it is fully qualified)
        if (o.url.indexOf('://') === -1)     // bit of a hack, should work
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
        var idx = o.url.indexOf('://');
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


    // easy save. calls create or update based on primary key having value 
    // 0 is not value, -1 is
    // set the [pk:str] property to the primary key
    // 
    // opts {
    //      url: http://www.server.com/api/whatever
    //      data: { data }
    //      pk: "primary_key"
    //      key: "key_to_data"  - see meta.data for more information 
    //      success: function (data, textStatus, xhr)
    //      error: function (xhr, textStatus, errorThrown)
    //      async: true | false
    //      headers: { "header1" : "value1, "header2": "value2" }
    //      statusCode: {
    //          404: function() {
    //              alert( "page not found" );
    //          }
    //      }
    //  }
    //
    // key: 
    save: function (opts) {
        if (this.isNullOrUndefined(opts.pk) || opts.pk.length === 0)
            throw arguments.callee.toString() + ' - required parameter [pk] not found';

        opts.data = this.scrape();
        opts.scrape = false;

        if (opts.data[opts.pk] && opts.data[opts.pk] !== "0") {
            meta.update(opts);
        } else {
            meta.create(opts);
        }

    },

    // START - security functions

    // authorize - verifies user has a valid token, returns true/false
    // opts: {
    //  url: 'http://yourserver.com/login.html?reason=noauth'     // optional url to navigate if not authorized
    // }
    authorize: function (opts) {
        var noToken = meta.isNullOrUndefined(this.token());
        if (noToken && opts && opts.url) {
            window.location.href = opts.url;
        }
        return !noToken;
    },

    token: function () {
        var store = window.localStorage;
        return store.getItem(meta.options.tokenName);
    },

    tokenize: function (opts) {
        var token = meta.token();
        if (this.isNullOrUndefined(token))
            return;
        var authHeader = { 'Authorization': 'Bearer ' + token };
        if (this.isNullOrUndefined(opts.headers))
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
            store.setItem(meta.options.tokenName, data[meta.options.tokenName]);
            if (success)
                success(data, textStatus, jqXHR);
        };

        this.post(o);
    },

    // logout - secure logout, removes token
    // opts: {
    //  url: 'http://whatever.com/home.htm'     // optional url to navigate to after logout completes
    // }
    logout: function (opts) {
        var store = window.localStorage;
        store.removeItem(meta.options.tokenName);
        if (opts && opts.url) {
            windows.location.href = opts.url;
        }
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
        else if (elem && elem.innerHTML)
            return elem.innerHTML;
    },


    // gets all of the data from the page into json
    // scrapes anything that has a data-value property, except for table and ul

    //scrape: function (stringify) {        // 2018.08.23 - removing stringify since ajax now does meta.tostring
    scrape: function () {
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
                var scrapeit = JSON.parse(elems[i].getAttribute(meta.options.attrScrapeName));
                if (scrapeit === false)
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

        return jsonRequest;
    },


    // START - paint functions

    // handle any data type formatting
    formatValue: function (elem, val) {
        try {
            if (elem.hasAttribute(meta.options.attrTypeName)) {
                var type = elem.getAttribute(meta.options.attrTypeName);
                if (type === meta.dataTypesEnum.string) {
                    // do nothing
                }

                else if (type === meta.dataTypesEnum.number)
                    val = new Number(val);

                else if (type === meta.dataTypesEnum.date || type === meta.dataTypesEnum.time || type === meta.dataTypesEnum.datetime ||
                    type === meta.dataTypesEnum.month || type === meta.dataTypesEnum.month1 || type === meta.dataTypesEnum.month3 ||
                    type === meta.dataTypesEnum.monthNum || type === meta.dataTypesEnum.monthNumPad ||
                    type === meta.dataTypesEnum.day || type === meta.dataTypesEnum.day1 || type === meta.dataTypesEnum.day2 ||
                    type === meta.dataTypesEnum.day3 ||
                    type === meta.dataTypesEnum.dayNum || type === meta.dataTypesEnum.dayNumPad ||
                    type === meta.dataTypesEnum.year || type === meta.dataTypesEnum.year2
                ) {
                    val = new Date(val);
                    if (type === meta.dataTypesEnum.date)
                        val = val.toLocaleDateString();
                    else if (type === meta.dataTypesEnum.time)
                        val = val.toLocaleTimeString();
                    else if (type === meta.dataTypesEnum.datetime)
                        val = val.toLocaleString();
                    else if (type === meta.dataTypesEnum.month) {
                        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        val = monthNames[val.getMonth()];
                    }
                    else if (type === meta.dataTypesEnum.month1) {
                        var month1Names = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                        val = monthNames[val.getMonth()];
                    }
                    else if (type === meta.dataTypesEnum.month3) {
                        var month3Names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        val = monthNames[val.getMonth()];
                    }
                    else if (type === meta.dataTypesEnum.monthNum) {
                        val = val.getMonth() + 1;
                    }
                    else if (type === meta.dataTypesEnum.monthNumPad) {
                        var month = val.getMonth() + 1;
                        val = month < 10 ? '0' + month.toString() : month.toString();
                    }
                    else if (type === meta.dataTypesEnum.day) {
                        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        val = dayNames[val.getDay()];
                    }
                    else if (type === meta.dataTypesEnum.day1) {
                        var day1Names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                        val = day1Names[val.getDay()];
                    }
                    else if (type === meta.dataTypesEnum.day2) {
                        var day2Names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                        val = day2Names[val.getDay()];
                    }
                    else if (type === meta.dataTypesEnum.day3) {
                        var day3Names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        val = day3Names[val.getDay()];
                    }
                    else if (type === meta.dataTypesEnum.dayNum) {
                        val = val.getDate();
                    }
                    else if (type === meta.dataTypesEnum.dayNumPad) {
                        var day = val.getDate();
                        val = day < 10 ? '0' + day.toString() : day.toString();
                    }
                    else if (type === meta.dataTypesEnum.year)
                        val = val.getFullYear();
                    else if (type === meta.dataTypesEnum.year2) {
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

                else if (type === meta.dataTypesEnum.json)
                    val = JSON.stringify(val);

            }
        } catch (e) {
            // continue regardless of error
        }
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
                var member = elems[i].getAttribute(meta.options.attrMemberName);
                if (member && data[member]) {
                    value = data[member][elems[i].getAttribute(attrName)];
                }
            } else {
                value = data[elems[i].getAttribute(attrName)];
            }
            if (!meta.isNullOrUndefined(value)) {
                meta.setValue(elems[i], value);
            } else {
                meta.log('metascraper::paint', 'unable to find data-value [' + elems[i].getAttribute(attrName) + ']', meta.modes.warning);
            }
        }
    },


    // fills a multiple value element (select, table, list, etc) with an array of values 
    // this can be explicitly called, if the JSON is a non-named array
    fill: function (elem, data) {
        var a, linkText;
        var dataValue = elem.getAttribute(meta.options.attrName);
        // handle a select
        if (elem instanceof HTMLSelectElement) {
            if (this.isNullOrUndefined(dataValue) || !elem.hasAttribute(meta.options.attrTextName))
                return;
            var dataText = elem.getAttribute(meta.options.attrTextName);
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
            var thead = elem.tHead; // grab the header row
            if (this.isNullOrUndefined(thead) || this.isNullOrUndefined(thead.rows) || thead.rows.length === 0)
                return;
            var headCells = thead.rows[0].cells; // grab the header cells
            if (this.isNullOrUndefined(headCells) || headCells.length === 0)
                return;
            var rowHref = meta.getElemAttr(thead.rows[0], meta.options.attrHrefName); // custom data-href
            var rowClick = meta.getElemAttr(thead.rows[0], meta.options.attrClickName); // custom data-click           
            var rowClass = meta.getElemAttr(thead.rows[0], meta.options.attrClassName); // custom data-class
            for (var r = 0; r < data.length; r++) { // forEach item in data
                var tbody = elem.tBodies[0];
                if (meta.isNullOrUndefined(tbody)) {
                    tbody = elem.appendChild(document.createElement('tbody'));
                }
                var tr = tbody.insertRow(-1); // create a new table row 
                if (rowHref && rowHref.length > 0 && rowClick && rowClick.length > 0) {
                    throw 'ERROR reported by ' + meta.projectName + '. Cannot apply ' + meta.options.attrHrefName + ' and ' + meta.options.attrClickName + ' to a tr element.';
                }
                if (rowHref && rowHref.length > 0) {      // does the row have an href?
                    var rowHrefVal = dataValue.length > 0
                        ? rowHref.replace(meta.options.indexName, data[r][dataValue])
                        : rowHref;
                    tr.setAttribute("onclick", "location.href = '" + rowHrefVal + "'");
                }
                if (rowClick && rowClick.length > 0) {      // does the row have an click?
                    var rowClickVal = dataValue.length > 0
                        ? rowClick.replace(meta.options.indexName, data[r][dataValue])
                        : rowClick;
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
                            a = document.createElement('a');
                            linkText = document.createTextNode(cellText);
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
            var ulDataText = meta.getElemAttr(elem, meta.options.attrTextName);
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
                    a = document.createElement('a');
                    linkText = document.createTextNode(liText);
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
    bind: function (data, container) {
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
            url: opts.url

        };
        // merge the options
        this.extend(o, opts);
        o.success = function (data, textStatus, jqXHR) {
            // could not use insertAdjacentHTML since it creates the node
            // and sometimes we dont want the node to be closed
            if (o.loadType === meta.loadTypesEnum.BeforeBeginAppend)
                elem.outerHTML = data + elem.outerHTML;
            else if (o.loadType === meta.loadTypesEnum.AfterBeginAppend)
                elem.innerHTML = data + elem.innerHTML;
            else if (o.loadType === meta.loadTypesEnum.BeforeEndAppend)
                elem.innerHTML = elem.innerHTML + data;
            else if (o.loadType === meta.loadTypesEnum.AfterEndAppend)
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
        };
        // merge the options
        this.extend(o, opts);
        this.load(o);
    },

    loadFooter: function (opts) {
        var o = {
            elem: document.body,
            loadType: meta.loadTypesEnum.BeforeEndAppend
        };
        // merge the options
        this.extend(o, opts);
        this.load(o);
    },

    // dynamically loads a javascript file
    // example:
    // var o = {
    //     url: "http://www.yourServer.com/jsFile.js",
    //     success: function () {
    //         yourFunction();
    //     }
    // };
    // meta.loadScript(o);
    //
    loadScript: function (opts) {
        if (meta.isNullOrUndefined(opts.url)) {
            meta.log('metascraper::loadScript', 'unable to find required attribute [url]', meta.modes.error);
        }

        var success = opts.success;
        var o = {
            method: "GET"
        };
        meta.extend(o, opts);
        o.success = function (data, textStatus, jqXHR) {
            var script = document.createElement('script');
            //script.setAttribute('nonce', '<%=nonce%>');
            script.textContent = data;
            document.head.appendChild(script);
            if (success)
                success(data, textStatus, jqXHR);
        };
        meta.ajax(o);
    },

    // dynamically loads a file to a <link> element
    // NOTE: see loadStyleSheet(opts) for a quick easy method to dynamically load a css stylesheet file
    // example (load favicon.ico):
    // var o = {
    //   rel: "icon",
    //   type: "image/x-icon",
    //   url: "favicon.ico"
    // }
    // meta.loadLinkFile(o);
    // ************************
    // other examples:
    // meta.loadLinkFile({
    //   rel: "preload",
    //   url: "myFont.woff2",
    //   as:  "font",
    //   type: "font/woff2",
    //   crossorigin: "anonymous"
    // });
    // ***********************
    // meta.loadLinkFile({
    //   rel: "apple-touch-icon-precomposed",
    //   url: "favicon144.png",
    //   type: "image/png",
    //   sizes: "144x144"
    // });
    //
    loadLinkFile: function (opts) {
        if (meta.isNullOrUndefined(opts.rel)) {
            meta.log('metascraper::loadLinkFile', 'unable to find required attribute [rel]', meta.modes.error);
        }
        if (meta.isNullOrUndefined(opts.type)) {
            meta.log('metascraper::loadLinkFile', 'unable to find required attribute [type]', meta.modes.error);
        }
        if (meta.isNullOrUndefined(opts.url)) {
            meta.log('metascraper::loadLinkFile', 'unable to find required attribute [url]', meta.modes.error);
        }

        var link = document.createElement("link");

        if (link.readyState) {  //IE
            link.onreadystatechange = function () {
                if (link.readyState === "loaded" ||
                    link.readyState === "complete") {
                    link.onreadystatechange = null;
                    if (opts.success) {
                        opts.success();
                    }
                }
            };
        } else {  //Others
            link.onload = function () {
                if (opts.success) {
                    opts.success();
                }
            };
        }

        meta.extend(link, opts);
        link.href = opts.url;   // metascraper uses url, link uses href.

        document.getElementsByTagName("head")[0].appendChild(link);
    },

    // dynamically loads a css stylesheet file
    // NOTE: see loadLinkFile for a powerful method to dynamically load a <link> file
    // example:
    // var o = {
    //   url: "http://www.yourServer.com/cssFile.css",
    //   media="screen and (min-width: 600px)"      /* OPTIONAL */
    // };
    // meta.loadStyleSheet(o);
    //
    loadStyleSheet: function (opts) {
        var o = {
            rel: "stylesheet",
            type: "text/css"
        };
        meta.extend(o, opts);
        meta.loadLinkFile(o);
    },

    // START store functions

    // data - access data responses from ajax when user sets key property when calling ajax
    // example: 
    // meta.ajax({
    //  url: 'http://www.metascraper.com/api/somewhere",
    //  key: 'myData'
    // })
    // after the response is returned access the data by:
    // var myData = meta.data.myData;  
    // var myData = meta.data["myData"];
    // you can also use data for page level storage
    data: {},


    // expiry defaults to 720 hours (30 days), can be ignored when type is forever
    // can take objects, such as json
    // type defaults to Forever
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
        };
        var storage = type === meta.storeTypesEnum.Session
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
        if (this.isNullOrUndefined(json)) {
            storage = window.sessionStorage;
            json = storage.getItem(name);
        }
        // value doesnt exist at all
        if (this.isNullOrUndefined(json))
            return null;

        try {
            var obj = JSON.parse(json);
            var expiry, now;
            if (obj.type === meta.storeTypesEnum.Session)
                return obj.value;
            else if (obj.type === meta.storeTypesEnum.Forever)
                return obj.value;
            else if (obj.type === meta.storeTypesEnum.OneTimeRead) {
                var value = obj.value;
                storage.setItem(name, null);
                return value;
            } else if (obj.type === meta.storeTypesEnum.ExpiryNoExtend) {
                expiry = new Date();
                expiry.setTime(obj.created);
                expiry.setMinutes(expiry.getMinutes() + obj.expiry);
                now = new Date();
                if (now.getTime() <= expiry.getTime())
                    return obj.value;
            } else if (obj.type === meta.storeTypesEnum.ExpiryExtend) {
                expiry = new Date();
                expiry.setTime(obj.lastread);
                expiry.setMinutes(expiry.getMinutes() + obj.expiry);
                now = new Date();
                if (now.getTime() <= expiry.getTime()) {
                    obj.lastread = now.getTime();
                    // update the lastread value
                    storage.setItem(name, JSON.stringify(obj));
                    return obj.value;

                }
            }
        }
        catch (e) {
            // continue regardless of error
            meta.log('metascraper::store_get', 'error getting value: [' + name + '], error: [' + meta.toString(e) + '], returning null', meta.modes.warning);
        }
        return null;
    },


    // START util functions

    // filters a json array to where a key matches a value
    //
    //  jsonArray:  the json Array you want filtered
    //  key:        the key to match on
    //  value:      the vlaue that the key should be
    //  first:      true if the method returns the first found, false to return an array of every match
    filter: function (jsonArray, key, value, first) {
        var arr = [];
        for (var i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i][key] === value)
                if (first)
                    return jsonArray[i];
                else
                    arr.push(jsonArray[i]);
        }
        return arr;
    },

    // gets a querystring value from a url
    // 
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
    //
    // returns empty string ('') if anything goes wrong, such as elem doesnt exist
    getElemAttr: function (elem, attrName) {
        if (elem && elem.hasAttribute && elem.getAttribute && elem.hasAttribute(attrName))
            return elem.getAttribute(attrName);
        return '';
    },

    // unique: returns a unique number
    unique: function () {
        var d = new Date();
        return d.getTime();
    },

    // makes a copy of whatever you throw at it
    // 
    // value copy - null, undefined, number, string, date, 
    // deep copy - json, array, array of json, html node or element
    // can copy functions too 
    copy: function (src) {
        // Handle the 3 simple types or null or undefined
        if (src === null || typeof src !== "object") return src;

        // handle html element
        if (src instanceof Node) {
            if (src.outerHTML) {    // handle elements                
                return this.parseHTML(src.outerHTML);
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
                if (this.isNullOrUndefined(orig)) continue;
                copy = this.copy(orig);
                docfrag.appendChild(copy);
            }
            return docfrag;
        }

        // handle array and json objects
        if (src.constructor === Array || src.constructor === Object) {
            try {
                return JSON.parse(JSON.stringify(src));
            } catch (jsonErr) {
                console.log('Error: meta.copy: unable to parse source as json');
            }
        }

        // handle date
        if (src.constructor === Date) {
            var target = new Date();
            target.setTime(src.getTime());
            return target;
        }

        // unknown - fallback
        return new src.constructor(src);
    },

    // makes a reasonable string of whatever you throw at it
    toString: function (src) {
        if (src === null || typeof src !== "object")
            return src + '';

        if (src.constructor === Array || src.constructor === Object) {
            try {
                return JSON.stringify(src);
            } catch (jsonErr) {
                console.log('Error: meta.toString: unable to parse source as json');
            }
        }

        // handle html element
        if (src instanceof Node) {
            if (src.outerHTML)     // handle elements                
                return src.outerHTML;
        }

        if (src instanceof NodeList) {
            var html = '';
            if (src && src.childNodes && src.childNodes.length && src.childNodes.length > 0) {
                for (var i = 0; i < src.childNodes.length; i++) {
                    if (this.isNullOrUndefined(src.childNodes[i]))
                        continue;

                    if (src.childNodes[i].outerHTML) {
                        html += src.childNodes[i].outerHTML;
                    } else if (src.childNodes[i].textContent) {
                        html += src.childNodes[i].textContent;
                    }
                }
            }
            return html;
        }

        return src.toString();
    },

    log: function (funcName, description, mode) {
        if (mode >= this.options.mode) {
            var msg = funcName + '::' + description;
            switch (mode) {
                case this.modes.error:
                    console.error ? console.error("ERROR  " + msg) : console.log("ERROR  " + msg);
                    break;
                case this.modes.warning:
                    console.warn ? console.warn("WARNING  " + msg) : console.log("WARNING  " + msg);
                    break;
                default:
                    console.log(msg);
            }
        }
    },

    tryParseJsonObject: function (jsonString) {
        try {
            var o = JSON.parse(jsonString);
            if (o && typeof o === "object") {
                return o;
            }
        } catch (e) {
            this.log('meta.tryParseJsonObject', 'Unable to parse value - error: ' + e + ' - value: ' + meta.toString(jsonString), this.modes.warning);
        }
        return false;
    },

    // check if the value is a json object
    // 
    // returns true or false if the value is a JSON object 
    // returns false for primitive values - strings, numbers, dates, null, undef, etc.
    isJson: function (json) {
        try {
            var jsonStr = JSON.stringify(json);
            return this.tryParseJsonObject(jsonStr) !== false;
        } catch (e) {
            this.log('meta.isJson', 'error: ' + e + ' - value: ' + meta.toString(jsonString), this.modes.warning);
        }
        return false;
    },

    // loops through all keys of json and calls f(key, value) for each item 
    eachJsonKey: function (json, f) {
        for (var i = 0; i < Object.keys(json).length; i++) {
            var key = Object.keys(json)[i];
            f(key, json[key]);
        }
    },

    // compares all types of versions
    // 
    // can check numbers, semvers, and most any numeric values with unlimited separators
    // ex 2 > 1, 2.3.5 > 2.3.4, 2.0 > 1.9.9,  2.3.4.5.6 > 2.3.4.5, 3 > 2.3.5.4.7.8.9, etc
    versionCheck: function (semVer, requiredSemVer) {
        if (semVer === requiredSemVer)  // they should be strings
            return true;

        var semVerArr = semVer.toString().split('.');
        var requiredSemVerArr = requiredSemVer.toString().split('.');
        // for (var i = 0; i < semVerArr.length; i++) {
        //     if (requiredSemVerArr.length == i)
        for (var i = 0; i < requiredSemVerArr.length; i++) {
            if (semVerArr.length === i)
                return false;
            if (parseInt(semVerArr[i]) > parseInt(requiredSemVerArr[i]))
                return true;
            if (parseInt(semVerArr[i]) < parseInt(requiredSemVerArr[i]))
                return false;
        }
        return true;
    },


    // executes a function asyncronously
    //
    // f = function (opts) - function to be called asynchronously
    // options { 
    //      success: function (f_return_value)
    //      error: function (error)
    //  }
    async: function (f, options) {
        // prevent value from being changed on async call
        //var optionsCopy = this.copy(options);
        // async it up, yeah
        window.setTimeout(function () {
            var opts = {
                data: void 0,
                success: function () { },
                error: function () {
                    var status = textStatus || 'Unhandled Error';
                    throw { "errorThrown": errorThrown, "textStatus": status };
                }
            };
            meta.extend(opts, options);
            try {
                var val = f(opts.data);
                opts.success(val);
            } catch (e) {
                opts.error(e);
            }
        }
            , 1, options);
    },

    // isNullOrUndefined: returns true if value is null or undefined, false otherwise
    isNullOrUndefined: function (val) {
        return val === null || val === void 0;
    },

    // extend: deep extend of src into target
    // 
    // handles values of null, undefined, dates
    // html nodes and functions are by reference, not by value, so changing the value of one affects the other
    // NOTE: target will be modified
    extend: function (target, src) {
        for (var key in src) {
            var srcVal = src[key];
            if (srcVal === null || typeof srcVal !== 'object' || srcVal instanceof Node) {
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
                if (this.isNullOrUndefined(target[key]))
                    target[key] = Array.isArray(src) ? [] : {};
                target[key] = this.extend(target[key], srcVal);
            }
        }
        return target;
    },

    // Performs a HTTP request. Its use is not recommended.
    // 
    // opts {
    //      method: GET | POST | PUT | DELETE
    //      url: http://www.server.com/api/whatever
    //      data: { data }
    //      key: "key_to_data"  - see meta.data for more information 
    //      success: function (data, textStatus, xhr)
    //      error: function (xhr, textStatus, errorThrown)
    //      async: true | false
    //      headers: { "header1" : "value1, "header2": "value2" }
    //      statusCode: {
    //          404: function() {
    //              alert( "page not found" );
    //          }
    //      }
    //  }
    //
    // key: 
    ajax: function (opts) {
        // Set Object.assign pollyfill for older browsers
        //this.checkObjectAssign();
        // Set new XHR request
        var xhr = new XMLHttpRequest();
        // Set the default values for the request
        var options = {
            method: 'GET',
            async: true,
            headers: {},
            key: "",
            success: function (data, textStatus, xhr) { },
            error: function (xhr, textStatus, errorThrown) {
                var status = textStatus || 'Unhandled Error';
                throw { "errorThrown": errorThrown, "textStatus": status };
            }
        };
        // add the options from ajaxSetup
        this.extend(options, this.ajaxSetup);
        // set the included options
        this.extend(options, opts);
        // Check if url set, otherwise throw an error
        if (!options.url) throw new Error('url parameter must be set.', 'Missing option');
        // Fix request method if entered wrong
        options.method = options.method.toUpperCase();
        // Check the method of request if supported, otherwise throw an error
        var requestMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        if (requestMethods.indexOf(options.method) < 0) {
            throw 'Request method "' + options.method +
            '" is not supported. Use one of GET | POST | PUT | DELETE';
        }
        // Set statechange handle
        xhr.addEventListener("readystatechange", function (e) {
            if (xhr.readyState === 4) {
                // if different functions set for status run those
                if (options.statusCode && options.statusCode[xhr.status]) {
                    options.statusCode[xhr.status](xhr.response, xhr.statusText, xhr);
                    options.error(xhr, xhr.statusText, xhr.response);
                }
                else {
                    //check status and run determined option
                    if (xhr.status === 200) {
                        var responseData;
                        try {
                            responseData = JSON.parse(xhr.response);
                        } catch (e) {
                            responseData = xhr.response;
                        }
                        if (options.key.length > 0) {
                            meta.data[options.key] = responseData;
                        }
                        options.success(responseData, xhr.statusText, xhr);
                    }
                    else options.error(xhr, xhr.statusText, xhr.response);
                }
            }
        }, false);
        xhr.open(options.method, options.url, options.async);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        this.eachJsonKey(options.headers, function (key, value) {
            xhr.setRequestHeader(key, value);
        });
        // check the data format
        // if FormData send as is else set the header for JSON and send string
        if (options.data instanceof FormData) {
            xhr.send(options.data);
        } else {
            try {
                if (options.data && typeof options.data !== "string") {
                    options.data = meta.toString(options.data);
                }
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(options.data);
            } catch (e) {
                throw new e;
            }
        }
    },

    // ajaxSetup - gets/sets key-value pairs that can be sent with every ajax call. 
    // these can later be overriden by the options passed into meta.ajax(opts)
    // Its use is not recommended.
    // example: 
    // meta.ajaxSetup = {
    //  type: 'POST',
    //  data: {
    //   'AppToken': '9229345A-1D0B-4631-A6C1-086B8F7858CE'
    //  }
    // };
    ajaxSetup: {},

    // ready - executes function f() when page DOM is loaded
    ready: function (f) {
        var state = document.readyState;
        if (state === 'interactive' || state === 'complete')
            f();
        else
            setTimeout(function () { meta.ready(f); }, 100);
    },

    select: function (id) {
        return document.getElementById(id);
    },

    selectAll: function (filter, container) {
        container = container || document;
        return container.querySelectorAll(filter);
    },

    // converts a string into HTML documentFragment
    parseHTML: (function () {
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            rhtml = /<|&#?\w+;/,
            // close tags for XHTML
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
            if (this.isNullOrUndefined(html)) return null;
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
    }())

};