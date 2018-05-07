# Metascraper

Metascraper is designed with one principal in mind - reducing redundant code in javascript apps. Using Metascraper will automate the code needed for the common needs of most apps.

### Highlights:
  - Retrieve JSON data from a server and automatically bind the result to a page using one line of code - `meta.get(obj)`
  - Automatically convert your page inputs to JSON and send to a REST service using `meta.post(obj)`, `meta.put(obj)`, or `meta.del(obj)`
  - Use `meta.login(obj)` to automate the login process, including converting login credentials to JSON, sending credentials JSON to your server, retrieving and storing your token, and applying that token to all future 'meta.xxx()' calls.
  
