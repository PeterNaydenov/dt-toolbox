## Release History

### 7.1.3 (2023-09-14)
- [x] Fix: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.2 (2023-09-12)
- [x] Fix: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;
- [ ] Bug: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.1 (2023-09-05 )
- [x] Fix: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;
- [ ] Bug: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.0 (2023-08-28)
- [x] Method `extractList` was added;
- [x] Fix: Method `model` recognizes '**files**' as a model;
- [x] Fix: Tuple model if data is just an array is wrong;
- [x] Fix: Convertor to files shows 'root' in the beginning of the path;
- [x] Fix: Convertor to breadcrumbs shows 'root' in the beginning of the path;
- [ ] Bug: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;



### 7.0.0 (2023-07-15)
- [x] Method `look` has new arguments: functions `next` and `finish`;
- [x] To stop iteration on current dt-line `return next()`;
- [x] To stop iteration on all dt-lines `return finish()`;
- [x] Method `insert` was renamed to `insertSegment`;
- [x] Method `listSegments` was added to show list of all segments in dt-object;
- [x] Method `insertSegment` expect the incoming data as dt-object, but if is not - will assume it as a standard javascript object and will convert it to dt-object automatically;
- [ ] Method `insertSegment` can recognize a dt model object.
- [ ] Bug: Method `model` doesn't recognize '**files**' as a model;
- [ ] Bug: Tuple model if data is just an array is wrong;
- [ ] Bug: Convertor to files shows 'root' in the beginning of the path;
- [ ] Bug: Convertor to breadcrumbs shows 'root' in the beginning of the path;
- [ ] Bug: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;



### 6.0.0 (2023-05-12)
- [x] Version 5 is full rethinking of the idea and rewrite from scratch;
- [x] Simplified API interface;
- [x] New internal data-model;
- [x] Multiple data inserts;
- [x] Predefined and custom filters for faster data scan;
- [x] Model and query functions to shape the results;



### 4.0.7 (2022-03-03)
- [x] Library '@peter.naydenov/walk' was included as a dependency;
- [x] Cleaning: Method 'help.generateObject' was removed. Not in use anymore;
- [x] Cleaning: Method 'help.generateList' was removed. Not in use anymore;
- [x] Cleaning: Old convertor file 'convertors_oldVersion.js' was removed;
- [x] Refactoring: Convertor 'standard' is using 'walk'; 
- [x] Fix: Initialization with 'tuples' doesn't work;



### 4.0.6 (2022-03-03)
- [x] Fix: Sometimes empty array structures are converted to empty objects;
- [ ] Bug: Initialization with 'tuples' doesn't work;



### 4.0.5 (2022-03-01)
- [x] Fix: Arrays are recognized as objects. Object members of arrays are recognized as arrays;
- [ ] Bug: Sometimes empty array structures are converted to empty objects;
- [ ] Bug: Initialization with 'tuples' doesn't work;



### 4.0.4 (2022-03-01)
- [x] Fix: Convertor for 'midFlat' is loosing empty data-structures;
- [x] Fix: Boolean values "true" are converted to 1(number);
- [x] Fix: Operation "add" treats numbers as string;
- [x] Fix: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Arrays are recognized as objects. Object members of arrays are recognized as arrays;
- [ ] Bug: Initialization with 'tuples' doesn't work;




### 4.0.3 (2022-02-23)
- [x] Fix: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Initialization with 'tuples' doesn't work;






### 4.0.2 (2022-02-21)
- [x] Fix: Methods 'keep' and 'remove' received `flat keys` instead of `breadcrumbs keys`. If need a `flat key`, its still available as third argument.
```js
    .remove ( (value, breadcrumbKey, flatKey)=> {
                                // ... set your filter here...
                    })
```
- [ ] Bug: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Initialization with 'tuples' doesn't work;





### 4.0.1 (2021-04-08)
- [x] Fix: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type. This update is coming as major release because may require some changes. Everything else is according documentation for version 3.x.x;
- [ ] Bug: Methods 'keep' and 'remove' received `flat keys` instead of `breadcrumbs keys`
- [ ] Bug: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Initialization with 'tuples' doesn't work;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;




### 3.1.0 ( 2021-03-25)
- [x] Methods "export" and "exportAll" were added;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;



### 3.0.2 ( 2021-02-28 )
- [x] Fix: Convert to 'standard' fails on some objects;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;





### 3.0.0 ( 2021-02-25 )
- [x] Complete rewrite of the library;
- [x] Dt-toolbox is using . Consider this for support of old browsers;
- [x] Export API was removed. Methods were moved to main API or removed;
- [x] Method that is searching for string in keys was renamed from 'folder' to 'find';
- [x] Method 'folder' works like 'space' in previous versions. That makes more sense...;
- [x] Method 'space' is depricated;
- [x] New method 'purify'. Removes empty structures from the selection;
- [x] Method 'loadFast' was depricated. Use 'load' instead;
- [x] Added support for different data-models: standard, tuples, flat, midFlat, breadcrumbs, files;
- [x] New method 'flatten' was added;
- [x] New method 'mix' was added;
- [x] New method 'keyPrefix' was added;
- [x] New method 'replace' was added;
- [x] New method 'combine' was added;
- [x] All methods expect data as 'flat'. Other models should be converted or provide an option/model param;
- [] Bug: Convert to 'standard' fails on some objects;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;





### 2.1.2 (2019-09-12)
- [x] Fix: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";
- [x] Browser version was updated;





### 2.1.1 (2019-06-06)
- [x] Fix: Build a ST object with repeating structure;
- [x] Browser version was updated;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";





### 2.1.0 (2019-06-02)
- [x] Modify methods ( add/update/overwrite ) can receive DT data model;
- [x] Browser version was updated;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";





### 2.0.2 (2019-05-30)
- [x] Fix: ST Build regression with boolean values;
- [x] Browser version was updated;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";




### 2.0.1 (2019-05-30)
- [x] Fix: ST Build (lib._build) was refactored;
- [x] Improvment: Method 'lib._toFolderFiles' has array of counters in sync with duplications;
- [x] Browser version was updated;
- [ ] Bug: ST Build regression with boolean values;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11".;





### 2.0.0 (2017-12-28)
- [x] Breaking change: Method ‘modifyKeys’ argument should be a function;
- [x] Test cases updates;
- [x] Browser version was updated;
- [ ] Problems with building heavy ST structures;
- [ ] Build a wrong ST object when similar namespaces are available. Example: "sample1" and "sample11";



### 1.8.0 (2017-12-28)
- [x] Method 'remove' has new argument-key. Evaluate the key name;
- [x] Method 'keep' has new argument-key. Evaluate the key name;
- [x] Test coverage - 100%;



### 1.7.0 (2017-12-24)
- [x] Browser version is available;
- [x] Dependencies updates ( Mocha, chai );
- [x] Istambul coverage tool was added;
- [x] Some minor project structure changes;
- [x] Unit tests updates for Mocha v.4;



### 1.6.0 (2017-04-22)
- [x] ExportAPI method `keyValue` returns a key-value string;



### 1.5.0 (2017-04-17)
- [x] ExportAPI method 'cut' will cut out number of key elements;
- [x] ExportAPI method 'file' will convert dt data to a 'file' model;
- [x] Fix: ExportAPI method 'map' could break the app if callback function does not return a string;



### 1.4.0 (2017-03-28)
- [x] Fix: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;


### 1.3.0 (2017-02-19)
- [x] API method 'invert' - selector. Invert existing selection;
- [ ] Warning: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;



### 1.2.0 (2017-02-16)
- [x] ExportAPI method 'list'. Returns findings in an array.
- [x] API method 'deepArray'  - selector
- [x] API method 'deepObject' - selector
- [x] API method 'loadFast' - load DT data without meta information calculation. 
- [x] ExportLib method `map` is 'root/' aware. 
- [ ] Warning: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.2 (2017-02-05)

 - [x] Fix: ExportAPI method `map` has `index` argument;
 - [ ] ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.1 (2017-02-04)

 - [x] Fix: Method `empty` now works as it was intended;
 - [x] Method `spreadAll` was added and could be used instead the chain: .select().all().spread()
 - [ ] ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Error: ExportAPI method `map` has no `index` argument;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.0

 - [x] Method `empty` returns empty DT object;
 - [x] Compare method were added: `identical`, `change`, `same`, `different`, `missing`
 - [ ] Error: Method `empty` is actually an object;
 - [ ] Error: ExportAPI method `map` has no `index` argument;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Warning: ExportAPI method `map` could break the app if callback function does not return a string;




### 1.0.2 (2017-01-14)
 - [x] Bug fix - init with files;



### 1.0.0 (2017-01-14)
 
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;



