# DT Toolbox



Data manipulation tool:
  - Converts object to flatten version(DT) and reverse(ST);
  - Modify DT objects: add/update/overwrite;
  - Compare DT objects: identical/change/same/different/missing;
  - Select data in DT objects;
  - Accumulative filter selection: limit/keep/remove/deep;
  - Extract and manipulate data chunks;
  - Converts objects in key-value string;
  - Replacement for underscore/lodash libraries;

Deliberately designed to work nicely with JSON and simplify data creation, searching and extracting data processes. **Works in node projects and browsers**.





## What is DT?

DT format is a flatten version of the standard javascript object. **Keys** are structured like folders - `'root/sub_object/property'`. **Values** are always primitives. In this documentation are mentioned two formats - ST(standard) and DT(data). ST means non-flatten version of the object. Convertion between ST and DT is possible in both direction with one important note: If ST object contains empty structure like `key: []` (*key with empty array value*), then this structure will be lost. **Purpose of DT is to strip all boilerplate structure and keep only that is value related**.





## Installation

Install for node.js projects by writing in your terminal:
```
npm install dt-toolbox --save
```

Once it has been installed, it can be used by writing this line of JavaScript:
```js
let dtbox = require ( 'dt-toolbox')
```

**Installation for browsers**: Grab file 'dist/dt-toolbox.min.js' and put it inside the project. Request the file from HTML page. Global variable 'dtbox' is available for use.



## APIs Reference
Dtbox contains two different APIs. First is related to the library itself:

```
API = {
 // * DT I/O Operations
     init       : 'Start chain with data or empty'
   , load       : 'Load DT object or value'
   , preprocess : 'Convert ST to DT object. Change income data before add, update, overwrite'
   , add        : 'Add data and keep existing data'
   , update     : 'Updates only existing data'
   , overwrite  : 'Add new data to DT object. Overwrite existing fields'
   , insert     : 'Insert data on specified key, when the key represents an array'
   , spread     : 'Export DT object'
   , spreadAll  : 'Shortcut for chain: .select().all().spread()'
   , log        : 'Executes callback with errors list as argument'
   , empty      : 'Returns empty DT object'

// Compare Operations
   , identical  :  'Value compare. Reduce data to identical key/value pairs'
   , change     :  'Value compare. Reduce to key/value pairs with different values'
   , same       :  'Key compare. Returns key/value pairs where keys are the same'
   , different  :  'Key compare. Reduce data to key/value pairs that differ'
   , missing    :  'Key compare. Gets from DT key/value pairs that are missing'
       
 // * Selectors and Filters
   , select     : 'Init new selection'
   , parent     : 'Selector. Apply conditions starting from parent level'
   , folder     : 'Selector. Fullfil select with list of arguments that have specific string'
   , all        : 'Selector. Same as folder'
   , space      : 'Selector. Fullfil select with namespace members'
   , deepArray  : 'Selector. Fullfil '_select' with deepest array elements'
   , deepObject : 'Selector. Fullfil '_select' with deepest object elements'
   , invert     : 'Selector. Invert existing selection'
   , limit      : 'Filter.   Reduces amount of records in the selection'
   , keep       : 'Filter.   Keeps records in selection if check function returns true'
   , remove     : 'Filter.   Removes records from selection if check function returns true'
   , deep       : 'Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members'
}

```

Second set of functions are available for DT object in a callback of 'spread' and 'preprocess' functions. More details can be found later in the example section.

```

exportAPI = {
  // * Structure Manipulation 
     assemble     : 'Remove all duplications in the keys and shrinks th possible'
   , ignoreKeys   : 'Converts object with nosense keys in array'
   , cut          : 'Cut out number of key elements'
   , keyList      : 'Returns array of DT object keys'
   , valueList    : 'Returns array of DT object values'
   , list         : 'Returns array of items'
   , map          : 'Standard map function'
   , json         : 'Return JSON format of DT object'
   , file         : 'Returns file format array'
   , keyValue     : 'Returns key-value string'
   , build        : 'Build ST object'

  // * Data Manipulation 
   , modifyKeys   : 'Add modified keys back to DT object'
   , keepKeys     : 'Apply test on array of keys. Keep met the criteria'
   , removeKeys   : 'Apply test on array of keys. Remove met the criteria'
   , keepValues   : 'Apply test on values. Keep met the criteria'
   , removeValues : 'Apply test on values. Remove met the criteria'
}

```



# How it works?

1. First: Create data inside DT toolbox. Load already existing DT or init with some ST object. Mix if you need with other objects by using 'add/update/overwrite'. Use 'preprocess' to adapt data package before assimilate it.

2. Select! Without selection, DT Toolbox will always return empty object. Selectors will search in dt.value and result will be accumulated. Filters will be applied to already selected data.

3. Spread the data.

DT Toolbox supports chaining syntax and is that simple. Let's see some examples...










## Examples

### Basics
Let's have a ST object:

```js
let st = {
              name    : { 
                            firstName  : 'Peter' 
                          , surname : 'Naydenov'
                        }
            , friends : [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
         }

```
Same object in DT will look like:

```js
{
    'root/name/firstName' : 'Peter'
  , 'root/name/surname'   : 'Naydenov'
  , 'root/friends/0'      : 'Tisho'
  , 'root/friends/1'      : 'Dibo'
  , 'root/friends/2'      : 'Ivo'
  , 'root/friends/3'      : 'Vasil'
}
```

Convert any standard javascript object to DT using dt-toolbox:

```js
let dt = dtbox.init ( standard ).value
```





Let's play with DT Toolbox:

```js
let 
    dtResult
  , stResult
  , friendList
  ;

dtbox
    .init(st) // Init data. Converts ST to DT
    .select() // Starting new selection
    .all()    // Select all data
    .spread ( 'dt', dt => dtResult = dt            ) // returns DT object
    .spread ( 'dt', dt => stResult == dt.build()   ) // convert back to ST
    .select () // Start new selection. Will remove previous selection.
    .folder('friends') // select keys that contain 'friends'
    .spread ( 'dt' => friendList = dt.build() ) //= { friends :[ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ] }
    .spread ( 'dt' => friendList = dt.assemble().build() ) // = [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
    // 'assemble' removes all duplicated elements in the keys and simplifies the result.
    
```

### Convert ST to DT objects

```js
let dt = dtbox.init(st).value;

```

### Mixing objects - Add/Update/Overwrite

Add and update will consider existing data:
- 'Add' method will be applied only for non-existing properties;
- 'Update' method will works only on existing properties;

Overwrite will 'add' and 'update'.

```js

let user = { 
                name : 'Peter'
              , age  : 42
           }

dtbox
   .init ( user )
   .add  ({
                age : 25         // 'add' will ignore this. Age is already defined.
              , gender : 'male'  // Will add this.
          })
   .update ({
               age  : 50         // Will update
               eyes : 'blue'     // Will ignore this.
          })
  .overwrite ({
                age   : 43         // Will update
              , hobby : 'skating'  // Will add
          })

  // DT object (dtbox.value) will look like:
  /*
    {
        'root/name'   : 'Peter'
      , 'root/age'    : 43
      , 'root/gender' : 'male'
      , 'root/hobby'  : 'skating'
    }

  /*

```


### Parent

```js

let result;
let data = {
     'school' : [
                      { name: 'Ivan',   age: 14 }
                    , { name: 'Georgy', age: 15 }
                    , { name: 'Adi',    age: 11 }
                    , { name: 'Kati',   age: 11 }
                ]
    , 'sports' : [
                      { name: 'Iva',    age: 28 }
                    , { name: 'Stoyan', age: 36 }
                ]
    , 'work'   : [
                      { name: 'Hristo',   age: 38 }
                    , { name: 'Lachezar', age: 33 }
                    , { name: 'Veselina', age: 35 }
                    
                ]
    , 'recent' : {
                     'classmates' : [
                                         { name: 'Anton',     age: 42 }
                                       , { name: 'Miroslava', age: 42 }
                                    ]
                    , 'social' : [
                                       { name: 'Iliana', age: 61 }
                                     , { name: 'Tzvetan', age: 19 }
                                 ]
                 }
  }

// Let's create list of all contacts uder 40 years old:

dtbox
   .init ( data )
   .select ()
   .parent ( 'name', person => person.age < 40 )
   .spread ( 'dt' , dt => result = dt.assemble().ignoreKeys().build()   )

/*
   result will look like this:

   [ 
      { name: 'Tzvetan', age: 19 },
      { name: 'Ivan', age: 14 },
      { name: 'Iva', age: 28 },
      { name: 'Hristo', age: 38 },
      { name: 'Georgy', age: 15 },
      { name: 'Stoyan', age: 36 },
      { name: 'Lachezar', age: 33 },
      { name: 'Adi', age: 11 },
      { name: 'Veselina', age: 35 },
      { name: 'Kati', age: 11 } 
  ]

*/
```








## More 
Find more examples in `./test` folder. Almost 90 unit tests are on your disposal. Find what is possible start experimenting with the library. 

Let me know what you think by using twitter tag #dttoolbox.










## Tips

- DT format not depends on DT Toolbox. Use toolbox when language cannot provide better tools;
- Iteration on data with DT Toolbox could bring performance issues(anti-pattern). Iterate over data first and then use DT Toolbox;
- Working with flat objects (DT) could be relieving experience with extras - performance and readability gain;










## Known bugs
_(Nothing yet)_





## Roadmap
- Upgrade error handling. Add proper error messages;
- Create API methods documentation;










## Release History


### 2.0.1 (2019-05-30)
- [x] Fix: ST Build (lib._build) was refactored;
- [x] Improvment: Method 'lib._toFolderFiles' has array of counters in sync with duplications;
- [x] Browser version was updated;





### 2.0.0 (2017-12-28)
- [x] Breaking change: Method ‘modifyKeys’ argument should be a function;
- [x] Test cases updates;
- [x] Browser version was updated;
- [ ] Problems with building heavy ST structures;



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
- [x] ExportAPI method 'file' will convert dt data to file format;
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





## Credits
'dt-toolbox' was created by Peter Naydenov.





## License
'dt-toolbox' is released under the [MIT License](http://opensource.org/licenses/MIT).




