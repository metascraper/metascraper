/*!
 * Metascraper JavaScript Library v0.6.1
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


    projectName: "Metascraper",
    version: "0.6.1",

    options: {
        webApiPrefix: "http://localhost/",	    	// fully qualified webapi root
        UnauthRedir: "/app/login.htm",                  // redirect on 401 Unauthorized
        attrName: "data-value",                         // property that is the value (key) of the element, sent on page scrape
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
        OneTimeSingleTab: 0,                            // (DEFAULT) Deletes after first read, does not go across tabs
        OneTimeAllTab: 1,                               // Deletes after first read, can be read by any tabs
        SessionSingleTab: 2,                            // Stays for entire session, does not go across tabs
        //SessionAllTab: 3,
        ForeverAllTab: 4                                // Stays for entire session, can be read by any tabs
    }),

    // enum to determine type of data expected to be in an element
    dataTypesEnum: Object.freeze({
        date: "date",
        time: "time",
        datetime: "datetime",
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

                else if (type == meta.dataTypesEnum.date || type == meta.dataTypesEnum.time || type == meta.dataTypesEnum.datetime) {
                    val = new Date(val);
                    if (type == meta.dataTypesEnum.date)
                        val = val.toLocaleDateString();
                    else if (type == meta.dataTypesEnum.time)
                        val = val.toLocaleTimeString();
                    else if (type == meta.dataTypesEnum.datetime)
                        val = val.toLocaleString();
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
    paint: function (data) {
        var attrName = meta.options.attrName;
        var elems = this.selectAll("[" + attrName + "]");   // scrape
        for (var i = 0; i < elems.length; i++) {
            // set the field to json dynamically
            var value = null;
            if (elems[i].hasAttribute(meta.options.attrMemberName)) {
                var member = elems[i].getAttribute(meta.options.attrMemberName)
                if (member && data[member])
                    value = data[member][elems[i].getAttribute(attrName)]
            } else
                value = data[elems[i].getAttribute(attrName)];
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
                    tr.setAttribute("onclick", rowClick);
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
    populate: function (data) {
        var attrArrayName = meta.options.attrArrayName;
        var elems = this.selectAll("[" + attrArrayName + "]");   // scrape
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
    bind: function(data) {
        //meta.template(data);
        meta.populate(data);
        meta.paint(data);
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

    // START jQuery functions wrappers 

    extend: function (target, src) { $.extend(target, src); },

    ajax: function (opts) { 
        $.ajax(opts); 
    },

    // START jQuery light

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
        if (!container) container = document; 
        return document.querySelectorAll(filter); 
    }, 

};