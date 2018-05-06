# Metascraper

Metascraper is designed with one principal in mind - reducing redundant code in javascript apps. Using Metascraper will automate the code needed for the most common needs in an application.

### Highlights:
- Retrieve and Bind
  - Retrieve JSON data from a server and automatically bind the result to a page using one line of code - `meta.get(obj)`
- Scrape and Send
  - Convert your page inputs to JSON and send to a REST service using `meta.post(obj)`, `meta.put(obj)`, or `meta.del(obj)`
- Security 
  - Most modern apps have a standard login using tokens. Use `meta.login(obj)` to automate this process and all future REST calls to your server will automatically add the `Authorization` header.
  
