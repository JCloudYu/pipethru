Pipethru
========
Pipethru is a small utility module for users to fetch both remote and local sources sequentially and pipe the fetched results direct into stdout.
This utility was originally designed to fetch and merge multiple remote js/css files.
  
Pipe internet resources and merge them into a single file
```bash
pipethru url1 url2 url3 path4 > singleFile
```

Concat js files and pipe them through minify module
```bash
pipethru url1.js url2.js local.js | minify --js > minified.js
```
