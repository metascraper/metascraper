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

