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





### [x] Data-model 'dt'
Internal data representation in the library was changed. I have recognized the need of information about data structures and their relations. So data-model `dt` was depricated as main internal representation data-model and we started to use `flat`. If you have build your application around 'dt' models, the library will continue to support it (load/spread). Code change required.

Old code:
```js
 // Load dt model in dt-toolbox
 dtbox.load ( dt )
```

New code:
```js
// Old 'dt' model == 'breadcrumbs' model
dtbox.init ( dt, { model: 'breadcrumbs'})
```

Old code:
```js
// Spread 'dt' model
dtbox
  .init ( data )
  .spreadAll ( 'dt', dt => dtResult = dt )
```

New code:
```js
// Model 'dt' was renamed to 'breadcrumbs'
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





### Methods add/update/overwrite/combine/... will need param if are not in flat model
Library expect by default `flat` data-model. All other formats should be mentioned in option object parameter.

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
        .combine ( b, {model:'std'})   // Expect 'flat', but can provide other models like 'standard'
        .update  ( z, {model:'std'})
        .combine ( c, {model:'std'})
        .combine ( d, {model:'std'})
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