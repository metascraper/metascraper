**Metascraper 1.1.0** (released October 30 2019)
This is a major update. The following major new features were added: 
* meta.options.attrKeyName: defines key to use to a link
* meta.attr: function to get and/or set/create the value of an elements attribute and safely returns an attribute of an element
* meta.elem: creates and returns an element and optionally adds attributes and appends new element to another element
* meta.encode: encodes a value to base64 string
* meta.decode: decodes a base64 string to a string
* meta.sortJson: sorts a json array based on a key

In addition, the following items were fixed and/or added: 
* meta.send: extends request with opts.data instead of request
* meta.del: depracated in favor or meta.delete
* meta.filter: depracated in favor or meta.filterJson
* meta.logout: url will now use webApiPrefix as needed
* meta.fill: uses meta.attrKeyName when defined, other cleanup
* meta.ajax: adds options.beforeSend and allows user to cancel
* meta.getValue: correctly applies value to textarea
* meta.receive: added container property so that data gets bound only to container
* meta.ready: uses queue to ensure functions are executed in correct order


**Metascraper 1.0.0** (released April 09 2019)
This is a major update. The following major new features were added: 
* meta.loadLinkFile: dynamically loads a file to a <link> element
* meta.loadStyleSheet: dynamically loads a css stylesheet file

In addition, the following items were fixed and/or added: 
* meta.loadScript: logging when required attribute [url] is missing


**Metascraper 0.8.0** (released March 14 2019)
This is a major update. The following major new features were added: 
* meta.modes: enum used for logging severity
* meta.save: easy save. calls create or update based on primary key having value 
* meta.authorize: verifies user has a valid token, returns true/false
* meta.logout: secure logout, removes token
* meta.loadScript: loads a script file
* meta.data: access data responses from ajax calls when user sets key property
* meta.log: console logging
* meta.tryParseJsonObject: safe json parse, returns false if parse fails
* meta.isJson: determines if the value is a json object
* meta.eachJsonKey: loops through all keys of json and calls f(key, value) for each item
* meta.async: executes a function asynchronously
* meta.isNullOrUndefined: returns true if value is null or undefined, false otherwise
* meta.ajaxSetup: gets/sets key-value pairs that can be sent with every ajax call. 

In addition, the following items were fixed and/or added: 
* multiple: changed (!(obj)) to this.isNullOrUndefined(obj)
* multiple: updated == to ===
* meta.options.UnauthRedir: removed in favor of opts.url
* multiple: completely removed dependence to jQuery
* meta.send: request.data defaulted to empty object
* meta.getValue: validates innerHTML exists on fallback return 
* meta.scrape: removing stringify since ajax now does meta.tostring
* meta.paint: logging when data-value is missing in returning json
* meta.fill: fixed issue where new rows were being inserted into head if tbody was missing
* meta.store_get: logging when requested value has an error
* meta.getElemAttr: removed error handling, instead checkes that value exists
* meta.toString: fixed issue where primitive may not return as string, also fixed NodeList not working, also falls back to toString when parsing unknown object
* meta.extend: fixed issue when tarket key had children and wasnt defined
* meta.ajax: refactored


**Metascraper 0.7.0** (released May 21 2018)
This is a major update. The following major new features were added: 
* meta.copy: makes a copy of whatever you throw at it
* meta.parseHTML: parses html string into DOM object(s) 
* meta.store_set: saves any value to storage with different types of expiration
* meta.store_get: gets value set with meta.store_set, returning null if expired or missing
* meta.toString: makes a string output of whatever you throw at it
* meta.versionCheck: compares versions numbers, semvers, or values with unlimited (.) separators
* data-type now includes 13 additional date types

In addition, the following items were fixed and/or added: 
* meta.paint: data-value no longer required to have data-member
* meta.paint: can be focused to any container, defaults to document
* meta.populate: can be focused to any container, defaults to document
* meta.bind: can be focused to any container, defaults to document
* meta.selectAll: can be focused to any container, defaults to document
* meta.extend: implemented deep copy
* meta.options.webApiPrefix: default value updated

**Metascraper 0.6.2** (released May 05 2018)

This is a maintenance release. The following items were fixed and/or added: 
* meta.paint: data-value now required to have data-member
* meta.fill: data-click on table row allows {{*index}}
* meta.load: fixed issue with success getting ignored

**Metascraper 0.6.1** (released May 04 2018)

Alpha Release

