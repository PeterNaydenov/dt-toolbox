'use strict'

var		 
		  dtbox = require  ( '../src/dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;



describe ( 'Post Processes', () => {



it ( 'modify', () => {
    // * Modify keys on exported DT object
    const result = dtbox
                       .init ()
                       .preprocess ( sample.test_0, dt => {
                                                            const oldKeys = dt.keyList()
                                                            const newKeys = oldKeys.map ( el => el.replace ( 'array', 'counter')   )
                                                            return dt.modifyKeys( oldKeys, newKeys )
                                           })

    expect ( result.value ).to.have.property ( 'root/counter/0' )

    expect ( result.structure ).to.have.property ( 'root/counter' )
    expect ( result.structure['root/counter'] ).is.equal ( 'array' )

    expect ( result.namespace ).to.have.property ( 'counter' )
    expect ( result.namespace['counter'] ).has.length ( 3 )
}) // it setKeys





it ( 'keepKeys', () => {
    let result;

    dtbox
       .init ( sample.test_0 )
       .select()
       .all()
       .spread ( 'dt', dt => {
                result = dt.keepKeys ( k => k.length > 2 ).keyList()
       })

   expect ( result ).is.an ( 'array' )
   expect ( result ).contains ( 'root/array/0' )
   expect ( result ).contains ( 'root/profile/active' )
   expect ( result ).not.contains ( 'root/name' )
}) // it reduceKeys





it ( 'removeKeys', () => {
    let result;

    dtbox
       .init( sample.test_0 )
       .add ( { listen : 'Spineshank' }  )
       .select()
       .all()
       .spread('dt', dt => {
                result = dt.removeKeys ( k => k.includes('array') || k.includes('listen')  )
       })

    expect ( result ).to.have.property     ( 'root/name'           )
    expect ( result ).to.have.property     ( 'root/profile/active' )
    expect ( result ).to.not.have.property ( 'root/listen'         )
    expect ( result ).to.not.have.property ( 'root/array/0'        )
}) // it removeKeys





it ( 'keepValues', () => {
    let result;

    dtbox
      .init ( sample.test_0 )
      .select()
      .all()
      .spread ( 'dt', dt => {
                    result = dt.keepValues( v => v!=1 && v!=42 )
              })

    expect ( result ).to.not.have.property ( 'root/age' )
    expect ( result ).to.not.have.property ( 'root/array/0' )
    expect ( result ).to.have.property     ( 'root/array/1' )
}) // it keepValues





it ( 'removeValues', () => {
    let result;

    dtbox
      .init ( sample.test_0 )
      .select()
      .all()
      .spread ( 'dt', dt => {
                    result = dt.removeValues( v => v==1 || v==42 )
              })

    expect ( result ).to.not.have.property ( 'root/age' )
    expect ( result ).to.not.have.property ( 'root/array/0' )
    expect ( result ).to.have.property     ( 'root/array/1' )
}) // it removeValues





it ( 'json', () => {
     let 
            result1
          , result2
          ;

     dtbox
        .init ( sample.test_0 )
        .select()
        .all()
        .spread ( 'dt', dt => {
                        result1 = dt.json()
                        result2 = JSON.parse(result1)
                })

     expect ( result1 ).to.be.a.string
     expect ( result1 ).to.contain       ('"root/age":"42"')
     expect ( result2 ).to.have.property ( 'root/age' )
}) // it json





it ( 'build', () => {
    let result;

    dtbox
        .init(['lele'])
        .select ()
        .all()
        .spread ( 'dt', dt => {
                            result = dt.build()
               })

        expect ( result ).is.an( 'array' )
        expect ( result ).contains ( 'lele' )
}) // it build





it ( 'ignoreKeys', () => {
   let result;
   
   dtbox
      .init ( sample.test_8 )
      .select()
      .folder ( 'videos' )
      .spread ( 'dt', dt => {
                              // Convert an object to array by removing keys. Argument -> level of deep.
                              result = dt.assemble().ignoreKeys(0).build()

      })
 
  expect ( result ).to.be.an ( 'array' )
  expect ( result ).to.have.length (4)
}) // it ignoreKeys





it ( 'map', () => {
  let result;

  dtbox
     .init ( sample.test_5 )
     .select ()
     .parent ( 'age', value => value.age > 30   )
     .remove ( value =>  value == 'test' )
     .spread ( 'dt', dt => {
               result = dt
                          .assemble ()
                          .map ( key => key.includes('name') ? key.replace('name','firstName') : key )
                          .build ()
         })

    expect ( result ).to.be.an ( 'array' )
    expect ( result ).to.have.length ( 4 )
    expect ( result[0]).to.have.property ( 'firstName' )
}) // ignoreKeys again





it ( 'map with indexes', () => {
  let result;

  dtbox
    .init ( sample.test_5 )
    .select ()
    .folder ( 'age' )
    .spread ( 'dt', dt => {
                             result = dt
                                       .map ( (el,i) => el.replace(el,`root/${i}`)   )
                                       .build ()
              })

    expect ( result ).to.be.an('array')
}) // it map index




it ( 'map is "root" aware', () => {
  // * same as prev. example but without using 'root' in transformation
  let result;

  dtbox
    .init ( sample.test_5 )
    .select ()
    .folder ( 'age' )
    .spread ( 'dt', dt => {
                             result = dt
                                       .map ( (el,i) => el.replace(el,i)   ) //note: Compare with prev test case.
                                       .build ()
              })

    expect ( result ).to.be.an('array')
}) // it root aware





it ( 'list', () => {
  // * Returns array of objects/arrays
  let result;

  dtbox
    .init ( sample.test_3 )
    .select ()
    .parent ( 'name' )
    .spread ( 'dt', dt => result = dt.list().build()   )

  expect ( result ).to.be.an ( 'array' )
  expect ( result ).to.have.length ( 3 )
  expect ( result[0]).to.be.an ( 'object' )
}) // it list





it ( 'cut', () => {
// * Cut out number of key elements
/* how it works: 
   dt = {
             root/deep/key/example : 55
           , root/other/key/sample : 'Text'
        }
   result = dt.cut(2) 
   result:
   {
         root/example : 55
       , root/sample  : 'Text'
   }
 Notes: 
    - Deep props will overwrite externals if have same name;
    - If cut number is larger then existing key elements - last key elements will stay
    - Result can not be predicted with data like:
       {
            'root/Peter/age' : 43
          , 'root/Vlado/age' : 66
          , 'root/Ivan/age'  : 22
       }
    - use with care;
*/
let cutTwo, cutTen, cutFail;

let data = {
                 'Peter/web/user'        : 'dreamgfx'
               , 'Peter/web/realname'    : 'Peter'
               , 'Peter/web/profile/age' : 43
               , 'age' : 66
}

dtbox
  .load ( data )
  .select()
  .all()
  .spread ( 'dt', dt => { 
                           cutTwo  = dt.cut(2)   // Will remove 'Peter/web'
                           cutTen  = dt.cut(10)  // Will keep only last key element. User, realname, age.
                           cutFail = dt.cut()    // Will ignore cut. Expected argument type - number
          })

  expect ( cutTwo ).to.have.property('root/age')
  expect ( cutTwo['root/age'] ).to.be.equal(66)

  expect ( cutTen ).to.have.property('root/age')
  expect ( cutTen['root/age'] ).to.be.equal(43)

  expect ( cutFail ).to.have.property('root/Peter/web/user')  

}) // it cut





it ( 'file', () => {
// * Returns file format array
let result;
const data = {
                  'root/type/0'      : 'user'
                , 'root/12/username' : 'peter'
                , 'root/1/username'  : 'stefan'
                , 'root/state'       : 'active'
             };


dtbox
  .load(data)
  .spreadAll ( 'dt', dt => {
                    result = dt.file()
        })

  expect ( result ).to.be.an ( 'array' )
  expect ( result ).contains ( 'root/username/peter'  )
  expect ( result ).contains ( 'root/username/stefan' )
  expect ( result ).contains ( 'root/type/user'       )
  expect ( result ).contains ( 'root/state/active'    )
}) // it file





it ( 'keyValue', () => {
  let result;
  const data = {
                     'user'        : 'dreamgfx'
                   , 'realname'    : 'Peter'
                   , 'profile/age' : 43
               }
  dtbox
     .load(data)
     .spreadAll  ( 'dt', dt => result = dt.keyValue()   )

  expect ( result ).to.be.a.string
  expect ( result ).to.be.equal ( 'root/user dreamgfx root/realname Peter root/profile/age 43' )
}) // it keyValue





it ( 'keyValue with custom divider', () => {
  let result;
  const data = {
                     'user'        : 'dreamgfx'
                   , 'realname'    : 'Peter'
                   , 'profile/age' : 43
               }
  dtbox
     .load(data)
     .spreadAll  ( 'dt', dt => result = dt.keyValue(';')   )

  expect ( result ).to.be.a.string
  expect ( result ).to.be.equal ( 'root/user dreamgfx; root/realname Peter; root/profile/age 43;' )
}) // it keyValue



}) // describe








