# DT Toolbox v.3.x.x

- [Check documentation for v.2.x.x if you need it]( './README_v.2.x.x.md' )

Execute operations over deep object structures without worries. Compare, modify, reshape or extract data. Immutability is taken as consideration by this library.

What you can do:
  - Library knows some data-types and supports conversion among them;
  - Modify objects: add/update/overwrite/insert/combine/append/prepend;
  - Compare objects: identical/change/same/different/missing;
  - Accumulative data selections: find/parent/folder;
  - Accumulative filter selection: limit/keep/remove/deep;
  - Extract and manipulate data chunks;


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


            Note:
            Library is using 'generator functions'. If support for old browsers 
            is required, add a polyfill for 'generators' or get back to version 2.x.x of 
            the library.



## APIs Reference

Dtbox API methods with a short description:
```js
const API = {
    // DT I/O Operations
		    init       : 'Convert any object to flat data-type'
	      , load       : 'Load a flat data-type'
          , loadFast   : 'Important! Method is depricated. Use load instead'

          , preprocess : 'Apply custom modifier to initial data.
          , add        : 'Add data and keep existing data'
          , update     : 'Updates only existing data fields'
          , overwrite  : 'Add new data to DT object. Overwrite existing fields'
          , insert     : 'Insert data on specified key, when the key represents an array'
          , combine    : 'Combine values for simular keys in arrays'
          , append     : 'Combine values for duplicated keys. main + update'
          , prepend    : 'Combine values for duplicated keys. update + main'
          , log        : 'Executes callback with errors list as argument'
          , empty      : 'Empty object with export methods'

    // Provide Results      
          , replace    : 'Get this._selection.result as a main data'
          , attach     : 'Attach this._selection.result to the main data. Set point of connection'
          , spread     : 'Returns result of selection'
          , spreadAll  : 'Select all and returns it with one command'

    // Compare Operations
         , identical  :  'Value compare. Reduce data to identical key/value pairs'
         , change     :  'Value compare. Reduce to key/value pairs with different values'
         , same       :  'Key compare. Returns key/value pairs where keys are the same'
         , different  :  'Key compare. Returns key/value pairs where key does not exist'
         , missing    :  'Key compare. Returns key/value pairs that are missing'
    
    // Selectors
          , select     : 'Initialize a new selection'
          , parent     : 'Selector. Apply conditions starting from parent level'
          , find        : 'Selector. Fullfil select with list of arguments that contain specific string'
          , all        : "Selector. Same as find ('root')"
          , folder     : "Selector. Fullfil selection with 'midFlat' object props"
          , space      : "Selector. Same as 'folder'"
          , deepObject : "Selector. Fullfil '_select' with deepest object elements"
          , deepArray  : "Selector. Fullfil '_select' with deepest array elements"
          , invert     : 'Selector. Invert existing selection'
          , assemble   : "Converts selection into 'array of objects' or 'single flat object'"
          , purify     : 'Removes all empty structures ( no props ) from the selection'

    // Filters      
          , limit      : 'Filter.   Reduces amount of records in the selection'
          , keep       : 'Filter.   Keeps records in selection if check function returns true'
          , remove     : 'Filter.   Removes records from selection if check function returns true'
          , deep       : "Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members"

    // Modifiers
          , withData      : 'Generate "this._select.result" from the official data. Modifier will work with this data'
          , withSelection : 'Generate "this._select.result" content. Modifier will work with this data'
          , flatten        : 'Mix existing objects in a single object'
          , mix           : 'Mix objects in order. Start with a host and provide guests list []'
          , keyPrefix      : 'Modify key as object name+key. Separator-symbol default: emptySpace. It can be modified'
          , reverse       : 'Change place of keys and values'
}; // API   
```





# How it works?

1. First: Insert data in dt-toolbox. Use `load` for `flat` data-type or `init` for other data-types. Mix with other objects by using 'add/update/overwrite/combine' if you need. Use 'preprocess' to change data-type before assimilate it.

2. Select! Without selection, dt-toolbox will return an empty object. Selection respresents the information that should be extracted from the data. Result of selectors is accumulative. Filters will be applied to already selected data.

3. Spread the result. Create new data structure according selection and provide it in required data-type.

DT Toolbox supports chaining syntax and is that simple. Let's see some examples...










## Examples

Here are some use cases, but if you're interested, test-cases are on your disposal. 
### Basics
Let's have a standard JS object:

```js
let st = {
              name    : { 
                            firstName  : 'Peter' 
                          , surname : 'Naydenov'
                        }
            , friends : [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
         }

```
Put the **st** data into dt-toolbox:

```js
let dt = dtbox.init ( standard )
```

Internal representation of data is based on `flat` data-type. Type `flat` has two elements: value and structure.
**Value** represents primitive values and their location. **Structure** represents existing flat objects and their relations.
Our standard object inside the library will look like:

```js
dt.structure = [
              //   type      i   object descriptors [i, name]
              [ 'object',    0,  [1, name], [2, friends]   ]  // Root object and relation with other objects
            , [ 'object',    1   ]   // st.name object. Object has only primitive values.
            , [ 'array' ,    2   ]   // st.friends array. Array has only primitive values.
        ]

dt.value = {    // Represents a primitive props and their location
              'root/1/firstName'  : 'Peter'
            , 'root/1/surname'   : 'Naydenov'
            , 'root/2/0'         : 'Tisho'
            , 'root/2/1'         : 'Dibo'
            , 'root/2/2'         : 'Ivo'
            , 'root/2/3'         : 'Vasil'
        }
}
```

::: warning
Internal representation is '*LIKE*' flat data-type but not the data-type itself. Type `flat` is array with two elements: structure and value `[structure, value]`. Internal representation has these two elements but they are like props. `dt = { structure, value }`.
:::



Extract a flat information:
```js
 dt.spreadAll ( 'flat', res => { 
                        // Data-type 'Flat': An array with 2 entries: [structure, value] 
                })
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
    .spread ( 'flat', dt => dtResult = dt   ) // Returns as `flat` data-type
    .spread ( 'std', dt => stResult = dt   ) // Convert back to original 'st' object
    .select () // Start new selection. Will remove previous selection.
    .find ( 'friends' ) // select keys that contain 'friends'
    .spread ( 'std', dt => friendList = dt ) //= { friends :[ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ] }
    .assemble ()
    .spread ( 'std' => friendList = dt ) // = [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
    // 'assemble' removes all duplicated elements in the keys and simplifies the result.
    
```

### Convert ST to DT objects

```js
let result; 
dtbox
  .init(st)
  .spreadAll ( 'flat', dt => result = dt );
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
          }, { type: 'std'})
   .update ({
               age  : 50         // Will update
               eyes : 'blue'     // Will ignore this.
          }, { type: 'std'})
  .overwrite ({
                age   : 43         // Will update
              , hobby : 'skating'  // Will add
          }, { type: 'std'})

  // The object (dtbox.value) will look like:
  /*
    {
        'root/0/name'   : 'Peter'
      , 'root/0/age'    : 43
      , 'root/0/gender' : 'male'
      , 'root/0/hobby'  : 'skating'
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
   .assemble ()
   .spread ( 'std' , dt => result = dt   )

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



### Purify

Cleaning empty structures till version 3 of the library was without alternative. Keep empty structures was recognized as a need and it's now a default behaviour. Remove empty structures by using 'purify' function as in this example:

```js
const test = {
                          name : 'Peter'
                        , arr  : [ 1, 15 ]
                        , de   : { me: ['eho', 'ha'] }
                        , se   : { le: {} }
                        , ze   : []
                };
    dtbox
        .init ( test )
        .select ()
        .all ()
        .purify ()
        .spread ( 'std', x => {
                            /** Result after purify will be:
                             *   x = {
                             *             name: Peter
                             *           , arr  : [1,15]
                             *           , de : { me: ['eho','ha']}
                             *       }
                            */
                    })
    }) // it purify
```


## Data-types

The library can spread data-selection as different data-types. Let's see how initial data will be interpreted in available data-types. Here is our initial `standard`(std) data:
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

### Standard ( std )
Standard data-type will look exactly as initial data.
```js
{
      name: 'Peter'
    , familyMembers : [ 'Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya' ]
    , shoes : {
                  winter : [ 'Keen', 'Head']
                , summer : [ 'Lotto', 'Asics' ]
            }
}
```


### Flat ( shortFlat )
It's a flat description of the object. It's an array with two elements. First element describes the structure of the object, second element - the values.
**Structure**: Array of flatDescriptions. FlatDescription is array where first element is the type of the object (object or array), second is the index. If there are  more then 2 elements, we have connection descriptions. ConnectionDescription is array of 2 elements. First is the index of connected other object, second is the property name of the connection. 
 In our example: We have object, that have property `familyMembers` that is array and other property `shoes` that is an object. Object `shoes` have 2 properties (winter,summer) that are arrays.
 **Value**: Key describes the position of the property that have a primitive value. Value is just that primitive value. Key always have 3 elements separated by '/'. First element is always `root`, second is the `id` of the object (from structure description), third is the name of the property. If structure object is 'array' then property name will be a number representing the position into the array.
```js
[
        // the structure description
    [
              [ 'object', 0, [1,'familyMembers'], [2,'shoes'] ]
            , [ 'array' , 1 ]
            , [ 'object', 2 , [3, 'winter'], [4, 'summer'] ]
            , [ 'array' , 3 ]
            , [ 'array' , 4 ]
        ]
        // the value description
    , {
              'root/0/name' : 'Peter'
            , 'root/1/0'   : 'Veselina'
            , 'root/1/0'   : 'Veselina'
            , 'root/1/1'   : 'Iskra'
            , 'root/1/2'   : 'Maria'
            , 'root/1/3'   : 'Vasil'
            , 'root/1/4'   : 'Vladimir'
            , 'root/1/5'   : 'Petya'
            , 'root/3/0'   : 'Keen'
            , 'root/3/1'   : 'Head'
            , 'root/4/0'   : 'Lotto'
            , 'root/4/1'   : 'Asics'
        }
]
```


### MidFlat
Object where keys represents "location" of the flat object. Value is always an object. Props are names. If data-structure is array, props are numbers:

```js
{
      'root' : { name: 'Peter' }
    , 'root/familyMembers' : { 
                                  '0' : 'Veselina'
                                , '1' : 'Iskra'
                                , '2' : 'Maria'
                                , '3' : 'Vasil'
                                , '4' : 'Vladimir'
                                , '5' : 'Petya' 
                        }
    , 'root/shoes/winter' : {
                                      '0' : 'Keen'
                                    , '1' : 'Head'
                                }
    , 'root/shoes/summer' : {
                                    '0' : 'Lotto'
                                    '1' : 'Asics'
                                }
}
```





### Breadcrumbs

It's a flat interpratation of the data and looks like this:
```js
{
      'root/name'            : 'Peter'
    , 'root/familiMembers/0' : 'Veselina'
    , 'root/familyMembers/1'  : 'Iskra'
    , 'root/familyMembers/2'  : 'Maria'
    , 'root/familyMembers/3'  : 'Vasil'
    , 'root/familyMembers/4'  : 'Vladimir'
    , 'root/familyMembers/5'  : 'Petya'
    , 'root/shoes/winter/0'   : 'Keen'
    , 'root/shoes/winter/1'   : 'Head'
    , 'root/shoes/summer/0'   : 'Lotto'
    , 'root/shoes/summer/1'   : 'Asics'
}
```


### Files
Data is interpreted like file/folder description.
```js
[
      'root/name/Peter'
    , 'root/familiMembers/Veselina'
    , 'root/familyMembers/Iskra'
    , 'root/familyMembers/Maria'
    , 'root/familyMembers/Vasil'
    , 'root/familyMembers/Vladimir'
    , 'root/familyMembers/Petya'
    , 'root/shoes/winter/Keen'
    , 'root/shoes/winter/Head'
    , 'root/shoes/summer/Lotto'
    , 'root/shoes/summer/Asics'
]
```



### Tuples

Array of tuples. First element represents location + property name, second is the value.

```js
[
      ['name', 'Peter' ]
    , ['familiMembers', 'Veselina']
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





## External Links

- [Migration guide]( 'Migration.guide.md' )
- [History of changes]( 'Changelog.md' )
- [Documentation v.2.x.x]( 'README_v.2.x.x.md' )




## Credits
'dt-toolbox' was created and supported by Peter Naydenov.





## License
'dt-toolbox' is released under the [MIT License](http://opensource.org/licenses/MIT).


