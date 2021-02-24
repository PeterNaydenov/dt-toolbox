# Migration Guides


## From v.2.x.x. - v.3.x.x

Upgrade to version 3 of the library will require some code changes. 





### [x] Export API was removed
So methods like `assemble` and `build` are no longer available inside of `spread` function.

Old code:
```js
dtbox
    .init(st) // Init data. Converts ST to DT
    .select() // Starting new selection
    .all()    // Select all data
    .spread ( 'dt', dt => friendList = dt.assemble().build() ) // = [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
```

 New code:
 ```js
 dtbox
    .init(st) // Init data. Converts ST to DT
    .select() // Starting new selection
    .all()    // Select all data
    .assemble ()
    .spread ( 'standard', x => friendList = x )   // = [ 'Tisho', 'Dibo', 'Ivo', 'Vasil' ]
```





### [x] Method 'spread'
Method 'spread' has a lot of changes. Instruction 'st' now is available as 'standard' or 'std'. Instruction 'dt' doesn't exists anymore. Instruction 'flat' will return selection in 'shortFlat' data-type.





### [x] Data-type 'dt'
Internal data representation in the library was changed. I have recognized the need of information about data structures and their relations. So data-type `dt` was depricated as main internal representation data-type and we started to use `flat`. If you have build your application around 'dt' data-type, the library will continue to support it (load/spread). Code change required.

Old code:
```js
 // Load "dt" data-type in dt-toolbox
 dtbox.load ( dt )
```

New code:
```js
// Old 'dt' data-type == 'breadcrumbs' data-type
dtbox.init ( dt, { type: 'breadcrumbs'})
```

Old code:
```js
// Spread 'dt' data-type
dtbox
  .init ( data )
  .spreadAll ( 'dt', dt => dtResult = dt )
```

New code:
```js
// Type 'dt' was renamed to 'breadcrumbs'
dtbox
  .init ( data )
  .spreadAll ( 'breadcrumbs', x => dtResult = x )
```





### [x] Select methods 'folder' and 'space' were renamed
Method `folder` was used to search for specific string into keys. Name is not very intuitive and was renamed to `find`. Library has also another problematic method name - `space`. Space can select internal flat structures by breadcrumb representation. Name `folder` is more appropriate here, so `space` was renamed to `folder`. 

 Method `space` still exists but was depricated.


 Old code:
 ```js
    dtbox
      .init ( data )
      .select ()
      .folder ( 'root/s' )
      .spread ( 'dt', x => result = x.build()   )
 ```



 New code:
 ```js
   dtbox
     .init ( data )
     .select ()
     .find ( 'root/s' )
     .spread ( 'std', x => result = x )
 ```





### Methods add/update/overwrite/combine/... will need param if are not in flat data-type
Library expect by default `flat` data-type. All other formats should be mentioned in option object parameter.

Old code:
```js
  const
         a = { link: 'one', m: 'fine' }
       , b = { up: {link:1,two:2}, link: ['check', 'me'] }
       , c = { link: 'three'}
       , d = { link: 'final'}
       , z = { m: 'best' }
       ;
    dtbox
        .init    ( a )  
        .combine ( b )   // Expects 'standard'
        .update ( z )
        .combine ( c )
        .combine ( d )
```


New code:
```js
const
         a = { link: 'one', m: 'fine' }
       , b = { up: {link:1,two:2}, link: ['check', 'me'] }
       , c = { link: 'three'}
       , d = { link: 'final'}
       , z = { m: 'best' }
       ;
    dtbox
        .init ( a )
        .combine ( b, {type:'std'})   // Expect 'flat', but can provide other data-types like 'standard'(std)
        .update  ( z, {type:'std'})
        .combine ( c, {type:'std'})
        .combine ( d, {type:'std'})
        .spreadAll ( 'std', x => response = x )

/**
 *  response = {
 *                 link : [
 *                            'one'
 *                          ,  1
 *                          , 'check'
 *                          , 'me'
 *                          , 'three'
 *                          , 'final'
 *                       ]
 *                , m   : 'best'
 *                , two : 2
 *         }
*/

```