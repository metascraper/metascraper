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


To learn more, [view Metascraper code examples](https://github.com/metascraper/metascraper/wiki). 
