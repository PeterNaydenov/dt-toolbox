# DT Toolbox v.6.x.x

 - [Documentation for old v.4.x.x and 3.x.x is here](https://github.com/PeterNaydenov/dt-toolbox/blob/master/README_v.4.x.x.md)



## About version 6.x.x
* Version 6 is full rethinking of the idea and rewrite from scratch;
* Simplified API interface;
* New internal data-model;
* Multiple data inserts;
* Predefined and custom filters for faster data scan;
* Model and query functions to shape results;



## Description
DT-Toolbox is created to simplify the work with deep nested javascript objects. The library was created as an immutable data-storage(dt-object), internally based on data-model called `DT-model`.

 ## What is DT-model?
It's an internal 'dt-object' data description. Data is an array of lines where each line has 4 components:
```js
[  // dt-model
      [ name, flatData, breadcrumbs, edges ]  // dt-line
    , [ name, flatData, breadcrumbs, edges ]  // dt-line
    // ...
]
// Where ->
// name: string. Name of the dt-line;
// flatData:  object or array of primitive types;
// breadcrumbs: string. Bredcrumbs description of the current dt-line;
// edges: string[]. List of breadcrumbs of the related dt-lines;
```

This data-description is easy to read, saved, or transfered.


## Installation
Install for node.js projects by writing in your terminal:
```
npm install dt-toolbox
```

Once it has been installed, it can be used by writing this line of JavaScript:
```js
import dtbox from 'dt-toolbox'
```



## How it works?

Use Dt-toolbox methods(init and load) to create a `dt-object`. 

DT-object:
- Provides multiple insertion of data chunks. Data from each insertion stays differentiated;
- Has prebuilded filters for fast search of data;
- Can create and register a customized filters for fast search of data;
- Can apply `query functions` to find, extract and reshape the data;
- Can apply `model function` to reshape the final result;
- Can executes 'query' and 'model' function over all available data in the storage (All insertions);
- Execution of query/model functions will not change anything inside the host dt-object;

The **dt-object** contains internally a `dt-storage` object, that is available during call of the 'query' or 'model' functions. Dt-storage have couple of methods for searching data as well can create a new **DT-model** structures and fill them with data. 

Query functions are returning a **new instance of dt-object** with the result, created by dt-storage. Remember - **data inside dt-object never get modified**.

**Filters** can significantly improve the speed of searching information inside dt-objects by creating a shorter scan-list according some specific preferences. Library is coming with `list of predefined filters`:
```js
  'list'        : 'Scan only dt-lines where flatData is an array'
, 'listObject'  : 'Scan objects that are members of array'
, 'object'      : 'Scan just dt-lines where flatData is an object'
, 'root'        : 'Scan only root dt-lines of each data insert'
```
Filters are very simple functions to build. Here is one example of how we can create filter for finding object with specific key and value in it.
```js
function findBlueEyesFn ({ // We have named arguments
                      name        // Name of dt-line
                    , flatData     // The data. Flat object or array
                    , breadcrumbs // Location description
                    , edges       // List of breadcrumbs related to this dt-line
                }) {
    if ( flatData.eyes === 'blue' )   return true   // confirm that dt-line should be in that filter list 
    return false // ignore this dt-line
 }

 // Register a filter to some dt-object:
 dt.setupFilter ( 
                     'blueEyes'     // filter name
                    , findBlueEyesFn // provide a filter function
                )
// Filter function will be executed on each dt-line to create a filter scan-list

 // Using the filter during execution of query/model functions:
 dt.query ( store => {
                store
                  .use ( 'blueEyes' ) // Set the name of the filter 
                  .look ( ({}) => {
                            // ... will scan only dt-lines selected by filter
                        })
        })
```

Take a look on the library APIs and see the '**Examples**' section bellow.

### dt-toolbox API Fast Reference

```js
    init    : 'Create a new dt-object from data that is not a DT-model and needs a convertion'
  , load    : 'Create a new dt-object from data that is a DT-model'
  , flat     : 'Convert a data to DT-model without creation of dt-object'
  , convert : 'Direct convertion from model to model without creation of dt-object'
  , getWalk : 'Returns a instance of "walk" library'
```

### dt-object API Fast Reference

```js
    insert   : 'Inserts a new data in the dt-object. Insertion should be provided as dt-object.'
  , 'export' : 'Returns the DT-model from dt-object - part or full'
  , copy     : 'Creates a copy of original provided data'
  , query    : 'Executes a "query" function on the dt-object. Returns a new dt-object with the result'
  , model    : 'Executes a "model" function on the dt-object. Returns a data model'
  , setupFilter : 'Evaluate data according "filter" function and create a shorter scan list that can be used by "dt-storage" during execution of query and model functions'
  , index    : 'Provides a copy of specified dt-line by breadcrumbs'
```

### dt-storage API Fast Reference

Object `dt-storage` is available as argument to '**query**' and '**model**' functions. Methods of 
'dt-storage' can scan DT-model for data and build a new DT-model structure and fields. 

*Important*: Result of building a DT-model returns as a separate dt-object and will not modify anything inside actual dt-object.

```js
 // Scan methods
, from : 'Scan deeper from specified dt-line by location(breadcrumbs)'
, use  : 'Use filter name to execute `look` on shorter list of dt-lines.'
, get  : 'Take a single dt-line with specific breadcrumbs'
, find  : 'String search for exact object name'
, like : 'String search in dt-line name'
, look : 'Executes on each object property in the selection list'

// DT-model structure and fields creation:
  set     : 'Define new dt-line record'
, connect : 'Creates a list of connections between two already existing dt-lines'
, save    : 'Save a property to flatData object in existing dt-line'
, push    : 'Save a value to flatData array of existing dt-line'

```



## DT Toolbox API

### dtbox.init ()
Create a new dt-object from data that is not a DT-model and needs a convertion. Please take a look on section `Init/Export Data-Models` for more details.

```js
const data = {  // Standard JS object
                      name: 'Peter'
                    , familyMembers : [ 'Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ]
                    , shoes : {
                                      winter : [ 'Keen', 'Head']
                                    , summer : [ 'Lotto', 'Asics' ]
                            }
            };

const midData = { // Midflat model object
                      'root' : { name: 'Peter' }
                    , 'familyMembers' :  ['Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ]
                    , 'shoes/winter' : [ 'Keen', 'Head' ]
                    , 'shoes/summer' : [ 'Lotto', 'Asics' ] 
                }

 const dtS = dtbox.init ( data ) // Creates dt-object from 'standard'(std) data-model
 // it's equal to this:  const dtS = dtbox.init ( data, { model:'std' })
 const dtMid = dtbox.init ( midData, { model : 'midFlat' }) // Creates a dt-object from midFlat data.
```



### dtbox.load ()
Create a new dt-object from data that is a DT-model.

```js
const dtData = [
  [
    'root',
    { city: 'Varna', desc: 'Big city on the Black-sea seaside' },
    'root',
    [ 'root/location', 'root/extra' ]
  ],
  [
    'location',
    { continent: 'Europe', country: 'Bulgaria' },
    'root/location',
    []
  ],
  [
    'extra',
    { port: 'Yes', airport: 'Yes' },
    'root/extra',
    [ 'root/extra/nearTo' ]
  ],
  [
    'nearTo',
    [ 'Burgas', 'Shumen', 'Dobrich' ],
    'root/extra/nearTo',
    []
  ]
];

const dtStore = dtbox.load ( dtData );   // Load DT-model data to dt-object
```



### dtbox.flat ()
Convert a data to DT-model without creation of dt-object.

```js
const a = {
    city : 'Varna'
  , desc: 'Big city on the Black-sea seaside'
  , location : {
                    continent: 'Europe'
                  , country : 'Bulgaria'
      
          }
  , extra : {
                port    : 'Yes'
              , airport : 'Yes'
              , 'nearTo' : [ 'Burgas', 'Shumen', 'Dobrich' ]
          }
};

const inFlatModel = dtbox.flat ( a ) // Default data-model is set to 'standard'(std)
// it's equal to: const inFlatModel = dtbox.flat ( a, {model: 'std'})
/**
 *   inFlatModel = [
  [
    'root',
    { city: 'Varna', desc: 'Big city on the Black-sea seaside' },
    'root',
    [ 'root/location', 'root/extra' ]
  ],
  [
    'location',
    { continent: 'Europe', country: 'Bulgaria' },
    'root/location',
    []
  ],
  [
    'extra',
    { port: 'Yes', airport: 'Yes' },
    'root/extra',
    [ 'root/extra/nearTo' ]
  ],
  [
    'nearTo',
    [ 'Burgas', 'Shumen', 'Dobrich' ],
    'root/extra/nearTo',
    []
  ]
]
 */

```



### dtbox.convert ()
Direct convertion from model to model without creation of dt-object.

```js

let result = dtbox.convert ( a, {
                                      model : 'std'         // Model: Source data-model
                                    , as    : 'breadcrumbs' // as: Convert data to this data-model
                                })

/** 
   result = {
              'city': 'Varna'
            , 'desc': 'Big city on the Black-sea seaside'
            , 'location/continent': 'Europe'
            , 'location/country': 'Bulgaria'
            , 'extra/port': 'Yes'
            , 'extra/airport': 'Yes'
            , 'extra/nearTo/0': 'Burgas'
            , 'extra/nearTo/1': 'Shumen'
            , 'extra/nearTo/2': 'Dobrich'
            }
 */
```



### dtbox.getWalk ()
Dt-Toolbox is using "walk" library. If you need to use it directly - get the version used by Dt-Toolbox.

```js
const walk = dtbox.getWalk ();

```





## DT-object API


### dt.insert ()
Extend the dt-object with a new data. Insertion should be provided as dt-object.

```js
const a = [ // it's a 'file' data-model
              'name/Peter'
            , 'familyMembers/Veselina'
            , 'familyMembers/Iskra'
            , 'familyMembers/Maria'
            , 'familyMembers/Vasil'
            , 'familyMembers/Vladimir'
            , 'familyMembers/Petya'
            , 'shoes/winter/Keen'
            , 'shoes/winter/Head'
            , 'shoes/summer/Lotto'
            , 'shoes/summer/Asics'
    ];
const b = { shoes: [ 'Puma', 'UA' ]}
const dt = dtbox.init ( a, { model : 'file' })  // create a dt-object
dt.insert ( 
         'extra' // object name
        , dtbox.init(b) // the extra object
    ) // insert to 'dt' storage extra 

/**
   dt internal interpretation:
[
      [ 
          'root' // -> dt-line name
        , {name:'Peter'} // -> flatData
        , 'root' // -> location. For top element of each data segment breadcrumbs === name
        , [ 'root/familyMembers', 'root/shoes' ] // -> edges
      ]
    , [ 
        'familyMembers' // -> dt-line name
        , [ 'Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ] // -> flatData
        , 'root/familyMembers' // -> location
        , [] // -> edges
      ]
    , [
         'shoes' // -> dt-line name
        , {} // -> flatData
        , 'root/shoes' // -> location
        , [ 'root/shoes/winter', 'root/shoes/summer' ] // -> edges
      ]
    , [
            'winter' // -> dt-line name
            , [ 'Keen', 'Head' ] // -> flatData
            , 'root/shoes/winter' // -> location
            , [] // -> edges
        ]
    , [
            'summer' // -> dt-line name
            , [ 'Lotto', 'Asics' ] // -> flatData
            , 'root/shoes/summer' // -> location
            , [] // -> edges
        ]
     // ---> Here are the elements that are coming from 'insert'   
    , [
            'extra' // -> dt-line name. Object name of insert will become root element for data segment.
            , {} // -> flatData
            ,'extra' // -> location. For top element of each data segment breadcrumbs === name
            , [ 'extra/shoes' ] // -> edges
        ]
    , [
            'shoes' // -> dt-line name
            , [ 'Puma', 'UA'] // -> flatData
            , 'extra/shoes' // -> location
            , [] // -> edges
        ]
]

 */
```



### dt.export ()
Returns DT-model from dt-object.

```js
const all = dt.export ()  // will return all data from the storage
const root = dt.export ( 'root' ) // will return only initial data segment
const extra = dt.export ( 'extra' ) // will return only 'extra' data segment
/**
   extra = [
    , [
            'root' // -> dt-line name was changed to 'root'. Name 'extra' has meaning just inside dt-object
            , {} // -> flatData
            ,'root' // -> location. For top element of each data segment breadcrumbs === name
            , [ 'root/shoes' ] // -> edges
        ]
    , [
            'shoes' // -> dt-line name
            , [ 'Puma', 'UA'] // -> flatData
            , 'root/shoes' // -> location
            , [] // -> edges
        ]
   ]
 */

```


### dt.copy ()
During the initialization process `dt-object` will save a deep copy of original data inside and can provide a deep copy in any time.
Function `copy` can't provide copy of all data segments together because they are not related to each other. By default, when there is no name as argument, function will return the copy of 'root' object.
```js
const 
      b = { shoes: [ 'Puma', 'UA' ]}
    , c = { vitamins : [ 'a', 'b', 'c' ]}
    , dt = dtbox.init ( b )
    ;
dt.insert ( 'extra', c )
const deepCopy = dt.copy ()
// it equal to: const deepCopy = dt.copy ('root')
const onlyExtra = dt.copy ( 'extra' )
// onlyExtra = { vitamins : [ 'a', 'b', 'c' ]}
```



### dt.query ()
Executes a "query" function on the dt-object. If there is something new, will return it. If there are no changes, it will return itself. For more details take a look on `store API` and especially **store.set(), store.save(), store.push(), store.connect()**.
```js
  function queryFn ( store, a, b ) { // optional arguments will come directly after 'store' api
            // ... body of queryFn
    }
  const dtOther = dt.query ( queryFn, a, b ) // queryFn is required arguments. All other arguments are optional
```


### dt.model ()
Executes a "model" function on the dt-object. Returns a data-model. Default choice is DT-model object. Change the response representation by returning an object as in example below: 
```js
function modelFn ( store, a,v,g ) { // optional arguments will come directly after 'store' api
            // ... body of modelFn
            // to convert result in some of predefined and supported models, function should return an object
            return {
                as : 'std' // property 'as' will execute final conversion. Model name should be from supported list of the library.
                }
    }

const result = dt.model ( modelFn, a,v,g ) // modelFn is the only required argument. All other arguments are optional.

```

### dt.setupFilter ()
Evaluate data according "filter" function and create a shorter scan list that can be used by `dt-storage API` during the execution of query or model functions. For more details about filters look at function `store.use()` function. 

```js
function blueFn ({
                      name        // Name of dt-line
                    , flatData     // The flat data
                    , breadcrumbs // Location description
                    , edges       // List of breadcrumbs related to this dt-line
                }) {
            if ( flatData.hasOwnProperty('eyes') && flatData.eyes === 'blue' )   return true   // confirm that dt-line should be in that filter list 
            return false // ignore this dt-line
    // dt-lines that are 
}

dt.setupFilter (
          'blue'   // Name of the filter
        , blueFn   // Provide a filter function
    )
```


### dt.index ()
Provides a copy of specified by breadcrumbs DT-line.
```js
const br = 'root/friends'
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            }
const [ name, flatData, breadcrumbs, edges ] = dt.index ( br )
// name = friends
// flatData = [ 'Ivan', 'Dobroslav', 'Stefan' ]
// breadcrumbs === br
// edges === []
```









## DT-store API

As we already mentioned, store is available in query/model functions and coming as the first argument.

### store.look ()
Function that will be executed on each object key/value from the selection list. 
If selection is not explicitly mentioned, executes function on each dt-line data segments.

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const dt = dtbox.init ( data );

const result = dt.query ( store => {
                            // Direct call of look on store will be executed on each dt-line
                            store.look ( ({ // Named arguments. All available argument-names are listed here:
                                              value 
                                            , key
                                            , name         // dt-line name;
                                            , flatData      // full flatData for specified dt-line;
                                            , breadcrumbs  // breadcrumbs for dt-line;
                                            , links        // List of tuples [[parent, child],...]. Parent and child are the dt-line names;
                                            , empty        // Will present only if object has no properties. Empty flatData for dt-line.
                                            }) => {
                                                        //... body of look function
                                                        // Move fast to next dt-line by returning a string 'next'
                                                        return 'next'
                                                        // unconditional return 'next' will executes the 'look' function once per dt-line
                                            })
                    })
```

### store.from ()
Scan deeper from specified dt-line by location(breadcrumbs). 

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const 
      dt = dtbox.init ( data )
    , res = dt.query ( store => {
                          store
                              .from ( 'root/personal/hobbies' )
                              .look ( ({name}) => {
                                                console.log ( name )
                                                // -> hobbies, music, sport
                                                return 'next' // because we want to iterate once on each dt-line
                                        })
                    });
```


### store.use ()
Use filter to execute `look` on shorter list of dt-lines. Use the predefined or your own filters.
List of predefined filters:
 - 'list'        : Scan only dt-lines where flatData is an array;
 - 'listObject'  : Scan objects that are members of array;
 - 'object'      : Scan just dt-lines where flatData is an object;
 - 'root'        : Scan only root dt-lines of each data insert;

If filter do not exist, look function will be executed on each dt-line.

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const 
      dt = dtbox.init ( data )
    , res = dt.query ( store => {
                            store
                              .use ( 'object' )   // predefined filter 'object'
                              .look ( ({name}) => {
                                                console.log ( name )
                                                // -> root, personal, hobbies
                                                return 'next' // because we want to iterate once on each dt-line
                                        })
                    });
```





### store.get ()
Take a single dt-line with specific breadcrumbs.

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const 
      dt = dtbox.init ( data )
    , res = dt.query ( store => {
                            store
                              .get ( 'root/friends' )
                              .look ( ({flatData}) => {
                                                console.log ( flatData )
                                                // -> [ 'Ivan', 'Dobroslav', 'Stefan' ]
                                                return 'next' // because we want to iterate once on each dt-line
                                        })
                    });
```



### store.find ()
String search for exact object name

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const 
      dt = dtbox.init ( data )
    , res = dt.query ( store => {
                            store
                              .find ( 'music' )
                              .look ( ({flatData}) => {
                                                console.log ( flatData )
                                                // -> [ 'punk', 'ska', 'metal', 'guitar' ]
                                                return 'next' // because we want to iterate once on each dt-line
                                        })
                    });
```



### store.like ()
String search in dt-line name

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const 
      dt = dtbox.init ( data )
    , res = dt.query ( store => {
                            store
                              .like ( 'per' )
                              .look ( ({flatData, breadcrumbs}) => {
                                                console.log ( flatData )
                                                // -> { age: 49, eyes: 'blue' }
                                                console.log ( breadcrumbs )
                                                // -> 'root/personal'
                                                return 'next' // because we want to iterate once on each dt-line
                                        })
                    });
```



// DT-model structure and fields creation:
### store.set ()
Define new dt-line record

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            };
const dt = dtbox.init ( data );

const result = dt
                .query ( store => {
                            store.set ( 'root', [2,4,15])   // new dt-line structure was created
                        })
                .model (  () => ({as:'std'}) )
console.log ( result )
// -> [2,4,15]

const result2 = dt
                 .query ( store => {})   // If there is no new dt-line, query will return itself
                 .model ( () => ({as:'std'})   )
console.log ( result2 )
/**
 {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                              age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            }
 */
```



### store.connect ()
Creates a list of connections between two already existing dt-lines

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            };
const 
      dt = dtbox.init ( data )
    , result = dt
              .query ( store => {
                            store.set ( 'root', { name: Stefan })
                            store.set ( 'friends', [ 'Stefan', 'Tommy', 'Maria'] )
                            store.connect (['root/friends'])
                    })
              .model ( () => ({as:'std'}))
    ;
console.log ( result )
/**
   { 
          name: Stefan
        , friends: ['Stefan', 'Tommy', 'Maria' ]
    }
 */ 
```



### store.save ()
Save a property to flatData object in existing dt-line.

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            };
const 
      dt = dtbox.init ( data )
    , result = dt
              .query ( store => {
                            store.set ( 'root', { name: Stefan })
                            store.set ( 'friends', [ 'Stefan', 'Tommy', 'Maria'] )
                            store.connect (['root/friends'])
                            store.save ( 'root', 'age', 35 )
                    })
              .model ( () => ({as:'std'}))
    ;
console.log ( result )
/**
   { 
          name: Stefan
        , age : 35
        , friends: ['Stefan', 'Tommy', 'Maria' ]
    }
 */ 
```



### store.push ()
Save a value to flatData of existing dt-line. FlatData should be an array.

```js
const data = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            };
const 
      dt = dtbox.init ( data )
    , result = dt
              .query ( store => {
                            store.set ( 'root', { name: Stefan })
                            store.set ( 'friends', [ 'Stefan', 'Tommy', 'Maria'] )
                            store.connect (['root/friends'])
                            store.push ( 'friends', 'Lily' )
                    })
              .model ( () => ({as:'std'}))
    ;
console.log ( result )
/**
   { 
          name: Stefan
        , friends: ['Stefan', 'Tommy', 'Maria', 'Lily' ]
    }
 */ 
```










## Init/Export Data-Models
The library has some predefined data-models and can read and convert data among them. 

### Standard ( std )
Standard data model is a standard deep javascript object.
```js
const data = {
                      name: 'Peter'
                    , familyMembers : [ 'Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ]
                    , shoes : {
                                      winter : [ 'Keen', 'Head']
                                    , summer : [ 'Lotto', 'Asics' ]
                            }
            }
```

### MidFlat
It's a two level deep javascript object. First object properties represent the location of the data, value is a flat object or array:

```js
{
      'root' : { name: 'Peter' }
    , 'familyMembers' :  ['Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ]
    , 'shoes/winter' : [ 'Keen', 'Head' ]
    , 'shoes/summer' : [ 'Lotto', 'Asics' ] 
}
```



### Breadcrumbs
It's a flat interpratation of the data and looks like this:

```js
{
      'name'            : 'Peter'
    , 'familyMembers/0' : 'Veselina'
    , 'familyMembers/1'  : 'Iskra'
    , 'familyMembers/2'  : 'Maria'
    , 'familyMembers/3'  : 'Vasil'
    , 'familyMembers/4'  : 'Vladimir'
    , 'familyMembers/5'  : 'Petya'
    , 'shoes/winter/0'   : 'Keen'
    , 'shoes/winter/1'   : 'Head'
    , 'shoes/summer/0'   : 'Lotto'
    , 'shoes/summer/1'   : 'Asics'
}
```

### Files
Data is interpreted like file/folder description.

```js
[
      'name/Peter'
    , 'familyMembers/Veselina'
    , 'familyMembers/Iskra'
    , 'familyMembers/Maria'
    , 'familyMembers/Vasil'
    , 'familyMembers/Vladimir'
    , 'familyMembers/Petya'
    , 'shoes/winter/Keen'
    , 'shoes/winter/Head'
    , 'shoes/summer/Lotto'
    , 'shoes/summer/Asics'
]
```

### Tuples

Array of tuples. First element represents location + property name, second is the value.

```js
[
      ['name', 'Peter' ]
    , ['familyMembers', 'Veselina']
    , ['familyMembers', 'Iskra']
    , ['familyMembers', 'Maria']
    , ['familyMembers', 'Vasil']
    , ['familyMembers', 'Vladimir']
    , ['familyMembers', 'Petya']
    , ['shoes/winter' , 'Keen']
    , ['shoes/winter' , 'Head']
    , ['shoes/summer' , 'Lotto']
    , ['shoes/summer' , 'Asics']
]
```


## Examples

### Find people under 40

Find a people that are under 40 years old and provide the result as a list.

```js
let data = {
     'school' : [
                      { name: 'Ivan',   age: 14 }
                    , { name: 'Georgy', age: 15 }
                    , { name: 'Adi',    age: 11 }
                    , { name: 'Kati',   age: 11 }
                ]
    , 'sports' : [
                      { name: 'Iva',    age: 28 }
                    , { name: 'Stoyan', age: 36, sport: 'fencing' }
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

const dt = dtbox.init ( data ); // creates a dt-object

const result = dt.query ( store => {
                            let 
                                  i = 0
                                , connectBuffer = []
                                ;
                            store.set ( 'root', [])  // setup a root array element
                            store
                                .use ( 'listObject' ) // use only objects that are members of array
                                .look ( ({ name, flatData }) => {
                                            if ( flatData.age < 40 ) {  
                                                    store.set ( i, flatData )
                                                    connectBuffer.push ( `root/${i}` )
                                                    i++
                                                }
                                            return 'next'
                                        })
                            store.connect ( connectBuffer )
                    })
                  .model ( () => ({ as : 'std'}))
console.log ( result )
/** ->
 [
  { name: 'Ivan', age: 14 },
  { name: 'Georgy', age: 15 },
  { name: 'Adi', age: 11 },
  { name: 'Kati', age: 11 },
  { name: 'Iva', age: 28 },
  { name: 'Stoyan', age: 36, sport: 'fencing' },
  { name: 'Hristo', age: 38 },
  { name: 'Lachezar', age: 33 },
  { name: 'Veselina', age: 35 },
  { name: 'Tzvetan', age: 19 }
] 
*/ 
```
### Provide just a list of names
Use the same data from previous example but return only the list of names.

```js
const result = dt.query ( store => {
                                store.set ( 'root', [])
                                store
                                   .use ( 'listObject' ) // use only objects that are members of array
                                   .look ( ({ flatData }) => {
                                               if ( flatData.age < 40 )   store.push ( 'root', flatData.name )
                                               return 'next'
                                           })
                    })
                 .model ( () => ({as:'std'})   )
console.log ( result )
/** ->
 [
  'Ivan',     'Georgy',
  'Adi',      'Kati',
  'Iva',      'Stoyan',
  'Hristo',   'Lachezar',
  'Veselina', 'Tzvetan'
]
 */
```

### Organize people in two groups
Return an object with two groups
 - 'over40' 
 - 'under40'
 Provide only the names.
 ```js
 const result = dt.query ( store => {
                               store.set ( 'root', {} )
                               store.set ( 'under40', [])
                               store.set ( 'over40' , [])
                               store.connect ([ 'root/under40', 'root/over40' ])
                               store
                                   .use ( 'listObject' ) // use only objects that are members of array
                                   .look ( ({ flatData }) => {
                                               let location = ( flatData.age > 40 ) ? 'over40' : 'under40';
                                               store.push ( location, flatData.name )
                                               return 'next'
                                           })
                       })
                     .model ( () => ({ as : 'std'}))
console.log ( result )
/** ->
 {
  'under40': [
    'Ivan',     'Georgy',
    'Adi',      'Kati',
    'Iva',      'Stoyan',
    'Hristo',   'Lachezar',
    'Veselina', 'Tzvetan'
  ],
  'over40': [ 'Anton', 'Miroslava', 'Iliana' ]
}
*/
```


### Create a deep copy of dt-object

```js
const result = dt.query ( store => {
                               store.look ( ({ name, flatData, breadcrumbs }) => {
                                               store.set ( name, flatData )
                                               if ( breadcrumbs.includes('/') )   store.connect ([breadcrumbs])
                                               return 'next'
                                        })
                        })
                    .model ( () => ({as:'std'}))
console.log ( result )
/** ->
 {
  school: [
    { name: 'Ivan', age: 14 },
    { name: 'Georgy', age: 15 },
    { name: 'Adi', age: 11 },
    { name: 'Kati', age: 11 }
  ],
  sports: [
    { name: 'Iva', age: 28 },
    { name: 'Stoyan', age: 36, sport: 'fencing' }
  ],
  work: [
    { name: 'Hristo', age: 38 },
    { name: 'Lachezar', age: 33 },
    { name: 'Veselina', age: 35 }
  ],
  recent: {
    classmates: [ { name: 'Anton', age: 42 }, { name: 'Miroslava', age: 42 } ],
    social: [ { name: 'Iliana', age: 61 }, { name: 'Tzvetan', age: 19 } ]
  }
}
 */
```




## External Links
- [Migration guide](https://github.com/PeterNaydenov/dt-toolbox/blob/master/Migration.guide.md)
- [History of changes](https://github.com/PeterNaydenov/dt-toolbox/blob/master/Changelog.md)
- [Documentation v.4.x.x](https://github.com/PeterNaydenov/dt-toolbox/blob/master/README_v.4.x.x.md)
- [Documentation v.2.x.x](https://github.com/PeterNaydenov/dt-toolbox/blob/master/README_v.2.x.x.md)



## Credits
'dt-toolbox' was created and supported by Peter Naydenov.



## License
'dt-toolbox' is released under the [MIT License](http://opensource.org/licenses/MIT).


